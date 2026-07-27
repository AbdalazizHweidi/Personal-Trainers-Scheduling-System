"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { luhnCheck, formatCardNumber, formatExpiry, isExpiryValid } from "@/lib/luhn";
import { formatTime } from "@/lib/utils";
import { submitBooking } from "@/app/booking/[trainerId]/actions";

type Service = { id: number; name: string; duration_minutes: number; price: number };
type Slot = { id: number; time: string; status: "open" | "blocked" | "booked" };
type Day = { date: string; dayLabel: string; slots: Slot[] };
type Trainer = { id: number; full_name: string; specialties: string[] };

function isSlotInPast(date: string, time: string): boolean {
  const slotDateTime = new Date(`${date}T${time}`);
  return slotDateTime.getTime() <= Date.now();
}

export function BookingFlow({
  trainer,
  services,
  availability,
}: {
  trainer: Trainer;
  services: Service[];
  availability: Day[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [selectedService, setSelectedService] = useState<Service | null>(services[0] ?? null);
  const [selectedDay, setSelectedDay] = useState<Day | null>(
    availability.find((d) => d.slots.some((s) => s.status === "open" && !isSlotInPast(d.date, s.time))) ?? null
  );
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cardDigits = cardNumber.replace(/\D/g, "");
  const cardIsValid = cardDigits.length >= 13 && luhnCheck(cardNumber);
  const cardTouched = cardDigits.length > 0;

  const expiryTouched = expiry.length > 0;
  const expiryIsValid = isExpiryValid(expiry);

  const canPay =
    cardIsValid &&
    cardholderName.trim().length > 1 &&
    expiryIsValid &&
    /^\d{3,4}$/.test(cvc);

  function handlePay() {
    if (!selectedService || !selectedDay || !selectedSlot) return;
    setError(null);

    const [h, m] = selectedSlot.time.split(":");
    const startTime = `${h.padStart(2, "0")}:${m}`;
    const endHour = (parseInt(h, 10) + Math.ceil(selectedService.duration_minutes / 60)) % 24;
    const endTime = `${String(endHour).padStart(2, "0")}:${m}`;

    startTransition(async () => {
      const result = await submitBooking({
        trainerId: trainer.id,
        serviceId: selectedService.id,
        slotId: selectedSlot.id,
        sessionDate: selectedDay.date,
        startTime,
        endTime,
        amount: selectedService.price,
        cardholderName,
        cardNumber,
        expiry,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }
      setStep(4);
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-3 text-sm">
        {["Service", "Time", "Confirm"].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 ${
                step === i + 1 ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  step > i + 1
                    ? "bg-primary text-primary-foreground"
                    : step === i + 1
                    ? "border border-primary text-primary"
                    : "border border-border"
                }`}
              >
                {step > i + 1 ? "✓" : i + 1}
              </span>
              {label}
            </div>
            {i < 2 && <span className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {/* STEP 1 — Choose service */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground">Choose a service</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Booking with {trainer.full_name} · {trainer.specialties[0]}
          </p>
          <div className="mt-5 flex flex-col gap-2.5">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => setSelectedService(svc)}
                className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                  selectedService?.id === svc.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                <div>
                  <div className="font-medium text-card-foreground">{svc.name}</div>
                  <div className="text-xs text-muted-foreground">{svc.duration_minutes} minutes</div>
                </div>
                <div className="font-mono text-base text-foreground">${svc.price}</div>
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-end">
            <button
              disabled={!selectedService}
              onClick={() => setStep(2)}
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Pick date & time */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground">Pick a date & time</h2>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {availability.map((day) => (
              <button
                key={day.date}
                onClick={() => {
                  setSelectedDay(day);
                  setSelectedSlot(null);
                }}
                className={`flex min-w-[64px] flex-col items-center rounded-lg border p-3 ${
                  selectedDay?.date === day.date
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <span className="font-mono text-[11px] text-muted-foreground">{day.dayLabel}</span>
                <span className="mt-1 text-base font-semibold text-foreground">
                  {day.date.slice(-2)}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            {(selectedDay?.slots ?? []).map((slot) => {
              const isPast = isSlotInPast(selectedDay!.date, slot.time);
              const disabled = slot.status !== "open" || isPast;

              return (
                <button
                  key={slot.id}
                  disabled={disabled}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-md border px-2 py-2.5 text-sm ${
                    disabled
                      ? "cursor-not-allowed border-border bg-muted text-muted-foreground/50"
                      : selectedSlot?.id === slot.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-card-foreground hover:border-muted-foreground"
                  }`}
                >
                  {formatTime(slot.time)}
                </button>
              );
            })}
            {selectedDay && selectedDay.slots.length === 0 && (
              <p className="col-span-4 text-sm text-muted-foreground">No slots this day.</p>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground"
            >
              ← Back
            </button>
            <button
              disabled={!selectedSlot}
              onClick={() => setStep(3)}
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Review & pay */}
      {step === 3 && selectedService && selectedDay && selectedSlot && (
        <div>
          <h2 className="text-xl font-semibold text-foreground">Review & confirm</h2>

          <div className="mt-5 rounded-lg border border-border bg-card p-5">
            <div className="flex justify-between border-b border-border pb-3 text-sm">
              <span className="text-muted-foreground">Trainer</span>
              <b className="text-card-foreground">{trainer.full_name}</b>
            </div>
            <div className="flex justify-between border-b border-border py-3 text-sm">
              <span className="text-muted-foreground">Service</span>
              <b className="text-card-foreground">{selectedService.name}</b>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="text-muted-foreground">When</span>
              <b className="text-card-foreground">
                {selectedDay.dayLabel} {selectedDay.date.slice(-2)} · {formatTime(selectedSlot.time)}
              </b>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span className="text-foreground">Total due</span>
              <span className="text-foreground">${selectedService.price}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Card number
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className={`w-full rounded-md border bg-card px-3 py-2.5 text-sm text-card-foreground outline-none ${
                  cardTouched
                    ? cardIsValid
                      ? "border-success"
                      : "border-destructive"
                    : "border-border"
                }`}
              />
              {cardTouched && !cardIsValid && (
                <p className="mt-1 text-xs text-destructive">
                  That card number doesn&apos;t look valid.
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Name on card
                </label>
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-card-foreground outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Expiry
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM / YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  className={`w-full rounded-md border bg-card px-3 py-2.5 text-sm text-card-foreground outline-none ${
                    expiryTouched
                      ? expiryIsValid
                        ? "border-success"
                        : "border-destructive"
                      : "border-border"
                  }`}
                />
                {expiryTouched && !expiryIsValid && (
                  <p className="mt-1 text-xs text-destructive">Expired or invalid date.</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  CVC
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-card-foreground outline-none"
                />
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground"
            >
              ← Back
            </button>
            <button
              disabled={!canPay || isPending}
              onClick={handlePay}
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {isPending ? "Processing…" : "Confirm & pay →"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 — Success */}
      {step === 4 && selectedDay && selectedSlot && (
        <div className="flex flex-col items-center rounded-lg border border-border bg-card p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-2xl text-success">
            ✓
          </div>
          <h2 className="mt-4 font-display text-3xl text-foreground">Booked.</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Your session with {trainer.full_name} is confirmed for {selectedDay.dayLabel}{" "}
            {selectedDay.date.slice(-2)} at {formatTime(selectedSlot.time)}. A confirmation was sent
            to your email.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground"
            >
              Back to home
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              View in dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}