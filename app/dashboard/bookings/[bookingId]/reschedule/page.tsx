import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBookingForOwner } from "@/lib/queries/bookings";
import { getWeekAvailability } from "@/lib/queries/availability";
import { isCancelled } from "@/lib/queries/client-data";
import { RescheduleFlow } from "@/components/reschedule-flow";

export default async function ReschedulePage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId: rawId } = await params;
  const bookingId = Number(rawId);
  if (Number.isNaN(bookingId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/dashboard/bookings/${bookingId}/reschedule`);

  const booking = await getBookingForOwner(supabase, bookingId, user.id);
  if (!booking) notFound();

  const hoursLeft =
    (new Date(`${booking.session_date}T${booking.start_time}`).getTime() - Date.now()) / (1000 * 60 * 60);

  if (isCancelled(booking.status) || booking.status === "completed" || hoursLeft <= 0) {
    redirect("/dashboard/bookings");
  }
  if ((booking.reschedule_count ?? 0) >= 1) {
    redirect("/dashboard/bookings");
  }

  const availability = await getWeekAvailability(supabase, booking.trainer_id);
  const durationMinutes = (booking.services as any)?.duration_minutes ?? 60;

  return (
    <RescheduleFlow
      bookingId={bookingId}
      currentDate={booking.session_date}
      currentTime={booking.start_time}
      durationMinutes={durationMinutes}
      availability={availability}
    />
  );
}