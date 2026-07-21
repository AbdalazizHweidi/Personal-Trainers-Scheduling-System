import { prisma } from "@/lib/db";
import { Prisma, SlotSource, SlotStatus } from "@prisma/client";

export class AvailabilityConflictError extends Error {
  constructor(message = "This time overlaps an existing slot.") {
    super(message);
    this.name = "AvailabilityConflictError";
  }
}

export class SlotUnavailableError extends Error {
  constructor(message = "This slot is no longer available.") {
    super(message);
    this.name = "SlotUnavailableError";
  }
}

const MINUTE = 60 * 1000;

function combineDateAndMinutes(date: Date, minutes: number): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() + minutes * MINUTE);
}

/**
 * True if [aStart, aEnd) overlaps [bStart, bEnd). Half-open intervals, so a
 * slot ending at 9:00 does NOT conflict with one starting at 9:00.
 */
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Throws AvailabilityConflictError if the given trainer already has an
 * OPEN, BOOKED, or BLOCKED slot overlapping [start, end).
 */
async function assertNoConflict(
  tx: Prisma.TransactionClient,
  trainerId: string,
  start: Date,
  end: Date,
  excludeSlotId?: string
) {
  const conflict = await tx.availabilitySlot.findFirst({
    where: {
      trainerId,
      id: excludeSlotId ? { not: excludeSlotId } : undefined,
      status: { in: [SlotStatus.OPEN, SlotStatus.BOOKED, SlotStatus.BLOCKED] },
      // overlap test done via two comparisons rather than a raw query
      startTime: { lt: end },
      endTime: { gt: start },
    },
    select: { id: true },
  });

  if (conflict) throw new AvailabilityConflictError();
}

// ---------------------------------------------------------------------------
// One-off slots
// ---------------------------------------------------------------------------

export async function createOneOffSlot(
  trainerId: string,
  start: Date,
  end: Date
) {
  if (start >= end) throw new Error("Slot start must be before end.");

  return prisma.$transaction(async (tx) => {
    await assertNoConflict(tx, trainerId, start, end);

    return tx.availabilitySlot.create({
      data: {
        trainerId,
        startTime: start,
        endTime: end,
        source: SlotSource.ONE_OFF,
        status: SlotStatus.OPEN,
      },
    });
  });
}

// ---------------------------------------------------------------------------
// Recurring availability
// ---------------------------------------------------------------------------

export type RecurringInput = {
  trainerId: string;
  dayOfWeek: number; // 0-6
  startMinute: number; // minutes since midnight
  endMinute: number;
  effectiveFrom: Date;
  effectiveUntil?: Date | null;
  /** how many weeks ahead to materialize concrete slots for, default 8 */
  horizonWeeks?: number;
};

export type MaterializeResult = {
  created: number;
  skippedConflicts: { startTime: Date; endTime: Date }[];
};

/**
 * Creates the recurring rule, then materializes concrete AvailabilitySlot
 * rows for every matching weekday within the horizon. Individual instances
 * that conflict with something already on the calendar are skipped (not
 * thrown) so one bad week doesn't block the whole recurring pattern —
 * callers get the skipped list back to show the trainer.
 */
export async function createRecurringAvailability(input: RecurringInput) {
  const {
    trainerId,
    dayOfWeek,
    startMinute,
    endMinute,
    effectiveFrom,
    effectiveUntil = null,
    horizonWeeks = 8,
  } = input;

  if (dayOfWeek < 0 || dayOfWeek > 6) throw new Error("dayOfWeek must be 0-6.");
  if (startMinute < 0 || endMinute <= startMinute || endMinute > 24 * 60) {
    throw new Error("Invalid start/end minute range.");
  }

  const rule = await prisma.availabilityRule.create({
    data: {
      trainerId,
      dayOfWeek,
      startMinute,
      endMinute,
      effectiveFrom,
      effectiveUntil,
    },
  });

  const horizonEnd = new Date(
    Date.now() + horizonWeeks * 7 * 24 * 60 * MINUTE
  );
  const materializeUntil = effectiveUntil
    ? new Date(Math.min(effectiveUntil.getTime(), horizonEnd.getTime()))
    : horizonEnd;

  const result = await materializeRuleSlots(rule.id, materializeUntil);

  return { rule, ...result };
}

/**
 * Generates concrete AvailabilitySlot rows for a rule, from the rule's
 * effectiveFrom up to `until`. Safe to re-run: it skips dates that already
 * have a slot tied to this rule, and skips (without throwing) dates that
 * conflict with a different, unrelated slot.
 */
export async function materializeRuleSlots(
  ruleId: string,
  until: Date
): Promise<MaterializeResult> {
  const rule = await prisma.availabilityRule.findUniqueOrThrow({
    where: { id: ruleId },
  });
  if (!rule.isActive) return { created: 0, skippedConflicts: [] };

  const rangeEnd = rule.effectiveUntil
    ? new Date(Math.min(rule.effectiveUntil.getTime(), until.getTime()))
    : until;

  // walk from effectiveFrom to the first matching weekday
  const cursor = new Date(rule.effectiveFrom);
  cursor.setHours(0, 0, 0, 0);
  while (cursor.getDay() !== rule.dayOfWeek) {
    cursor.setDate(cursor.getDate() + 1);
  }

  const skippedConflicts: MaterializeResult["skippedConflicts"] = [];
  let created = 0;

  while (cursor <= rangeEnd) {
    const start = combineDateAndMinutes(cursor, rule.startMinute);
    const end = combineDateAndMinutes(cursor, rule.endMinute);

    try {
      await prisma.$transaction(async (tx) => {
        const alreadyExists = await tx.availabilitySlot.findFirst({
          where: { ruleId: rule.id, startTime: start, endTime: end },
          select: { id: true },
        });
        if (alreadyExists) return;

        await assertNoConflict(tx, rule.trainerId, start, end);

        await tx.availabilitySlot.create({
          data: {
            trainerId: rule.trainerId,
            ruleId: rule.id,
            startTime: start,
            endTime: end,
            source: SlotSource.RECURRING,
            status: SlotStatus.OPEN,
          },
        });
        created += 1;
      });
    } catch (err) {
      if (err instanceof AvailabilityConflictError) {
        skippedConflicts.push({ startTime: start, endTime: end });
      } else {
        throw err;
      }
    }

    cursor.setDate(cursor.getDate() + 7); // next week, same weekday
  }

  return { created, skippedConflicts };
}

// ---------------------------------------------------------------------------
// Reading availability
// ---------------------------------------------------------------------------

export async function listOpenSlots(trainerId: string, from: Date, to: Date) {
  return prisma.availabilitySlot.findMany({
    where: {
      trainerId,
      status: SlotStatus.OPEN,
      startTime: { gte: from, lt: to },
    },
    orderBy: { startTime: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Booking <-> availability integration
// ---------------------------------------------------------------------------

/**
 * Books a slot atomically. Uses a conditional update (status: OPEN -> BOOKED)
 * instead of read-then-write, so two clients racing for the same slot can't
 * both succeed — whichever transaction commits first wins, the loser gets
 * SlotUnavailableError.
 */
export async function bookSlot(slotId: string, clientId: string) {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.availabilitySlot.updateMany({
      where: { id: slotId, status: SlotStatus.OPEN },
      data: { status: SlotStatus.BOOKED },
    });

    if (count === 0) throw new SlotUnavailableError();

    return tx.booking.create({
      data: { slotId, clientId, status: "CONFIRMED" },
      include: { slot: true },
    });
  });
}

/**
 * Cancels a booking and frees the slot back up (unless the trainer manually
 * blocked it in the meantime — BLOCKED slots don't get reopened here).
 */
export async function cancelBooking(bookingId: string) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
      include: { slot: true },
    });

    await tx.availabilitySlot.update({
      where: { id: booking.slotId },
      data: { status: SlotStatus.OPEN },
    });

    return booking;
  });
}