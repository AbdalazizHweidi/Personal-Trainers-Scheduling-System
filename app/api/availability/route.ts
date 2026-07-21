import { NextRequest, NextResponse } from "next/server";
import {
  AvailabilityConflictError,
  createOneOffSlot,
  createRecurringAvailability,
  listOpenSlots,
} from "@/lib/availability";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trainerId = searchParams.get("trainerId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!trainerId || !from || !to) {
    return NextResponse.json(
      { error: "trainerId, from, and to are required." },
      { status: 400 }
    );
  }

  const slots = await listOpenSlots(trainerId, new Date(from), new Date(to));
  return NextResponse.json({ slots });
}

export async function POST(req: NextRequest) {
  // TODO: swap in your real session check, e.g.
  // const session = await auth();
  // if (!session?.user || session.user.trainerId !== body.trainerId) { ... 403 }

  const body = await req.json();

  try {
    if (body.type === "recurring") {
      const result = await createRecurringAvailability({
        trainerId: body.trainerId,
        dayOfWeek: body.dayOfWeek,
        startMinute: body.startMinute,
        endMinute: body.endMinute,
        effectiveFrom: new Date(body.effectiveFrom),
        effectiveUntil: body.effectiveUntil ? new Date(body.effectiveUntil) : null,
        horizonWeeks: body.horizonWeeks,
      });
      return NextResponse.json(result, { status: 201 });
    }

    if (body.type === "one-off") {
      const slot = await createOneOffSlot(
        body.trainerId,
        new Date(body.startTime),
        new Date(body.endTime)
      );
      return NextResponse.json({ slot }, { status: 201 });
    }

    return NextResponse.json(
      { error: "type must be 'recurring' or 'one-off'." },
      { status: 400 }
    );
  } catch (err) {
    if (err instanceof AvailabilityConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}