"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatTime } from "@/lib/utils";

type Client = { id: string; fullName: string; email: string };
type Trainer = {
  id: number;
  full_name: string;
  specialties: string[];
  photo_url: string | null;
};
type Service = {
  id: number;
  name: string;
  duration_minutes: number;
  price: number;
};
type OpenSlot = {
  id: number;
  date: string;
  time: string;
};

export function AdminBookingForm({
  clients,
  trainers,
}: {
  clients: Client[];
  trainers: Trainer[];
}) {
  const router = useRouter();

  const [clientQuery, setClientQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<OpenSlot[]>([]);
  const [loadingTrainerData, setLoadingTrainerData] = useState(false);

  const [selectedServiceId, setSelectedServiceId] = useState<number | "">("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | "">("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !!selectedClient &&
    !!selectedTrainer &&
    !!selectedServiceId &&
    !!selectedSlotId;

  const filteredClients = useMemo(() => {
    if (!clientQuery.trim()) return [];

    const q = clientQuery.toLowerCase();

    return clients
      .filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [clientQuery, clients]);

  async function chooseTrainer(trainer: Trainer) {
    setSelectedTrainer(trainer);
    setSelectedServiceId("");
    setSelectedSlotId("");
    setLoadingTrainerData(true);
    setError(null);

    try {
      const [svcRes, slotRes] = await Promise.all([
        fetch(`/api/admin/trainers/${trainer.id}/services`),
        fetch(`/api/admin/trainers/${trainer.id}/open-slots`),
      ]);

      setServices((await svcRes.json()).services ?? []);
      setSlots((await slotRes.json()).slots ?? []);
    } catch {
      setError("Couldn't load this trainer's services and availability.");
    } finally {
      setLoadingTrainerData(false);
    }
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: selectedClient!.id,
          trainer_id: selectedTrainer!.id,
          service_id: selectedServiceId,
          slot_id: selectedSlotId,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      router.push("/admin/bookings");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't create booking."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* CLIENT */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Client
        </label>

        {selectedClient ? (
          <div className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2.5">
            <div>
              <div className="text-sm font-medium text-card-foreground">
                {selectedClient.fullName}
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedClient.email}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedClient(null);
                setSelectedTrainer(null);
                setSelectedServiceId("");
                setSelectedSlotId("");
                setServices([]);
                setSlots([]);
              }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              value={clientQuery}
              onChange={(e) => setClientQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground"
            />

            {filteredClients.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card shadow-sm">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedClient(c);
                      setClientQuery("");
                    }}
                    className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-secondary"
                  >
                    <span className="font-medium text-card-foreground">
                      {c.fullName}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {c.email}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* TRAINER */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Trainer
        </label>

        {!selectedClient && (
          <p className="mb-3 text-sm text-muted-foreground">
            Select a client first.
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {trainers.map((t) => (
            <button
              key={t.id}
              disabled={!selectedClient}
              onClick={() => chooseTrainer(t)}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                selectedTrainer?.id === t.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-secondary"
              } ${
                !selectedClient
                  ? "cursor-not-allowed opacity-50 hover:bg-card"
                  : ""
              }`}
            >
              {t.photo_url ? (
                <img
                  src={t.photo_url}
                  alt={t.full_name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-sm text-primary-foreground">
                  {t.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              )}

              <div>
                <div className="text-sm font-semibold text-card-foreground">
                  {t.full_name}
                </div>

                <div className="text-xs text-muted-foreground">
                  {t.specialties.slice(0, 2).join(", ")}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Service
        </label>

        {!selectedTrainer ? (
          <p className="text-sm text-muted-foreground">
            Choose a trainer to see available services.
          </p>
        ) : loadingTrainerData ? (
          <p className="text-sm text-muted-foreground">
            Loading services...
          </p>
        ) : services.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This trainer has no active services.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedServiceId(s.id)}
                className={`flex items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm ${
                  selectedServiceId === s.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-secondary"
                }`}
              >
                <span>
                  {s.name}
                  <span className="text-muted-foreground">
                    {" "}
                    · {s.duration_minutes} min
                  </span>
                </span>

                <span className="font-mono">${s.price}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AVAILABLE TIME */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Available time
        </label>

        {!selectedTrainer ? (
          <p className="text-sm text-muted-foreground">
            Choose a trainer to see available time slots.
          </p>
        ) : loadingTrainerData ? (
          <p className="text-sm text-muted-foreground">
            Loading availability...
          </p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No open slots for this trainer.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSlotId(s.id)}
                className={`rounded-md border px-2 py-2 text-center font-mono text-xs ${
                  selectedSlotId === s.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card hover:bg-secondary"
                }`}
              >
                <div>{s.date}</div>
                <div>{formatTime(s.time)}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="inline-flex self-start items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Creating booking..." : "Create booking (unpaid)"}
      </button>
    </div>
  );
}