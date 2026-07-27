type BookingEmailParams = {
  clientName: string;
  trainerName: string;
  serviceName: string;
  sessionDate: string;
  startTime: string;
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime12h(time: string) {
  const [hStr, m] = time.split(":");
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
}

export function bookingConfirmedEmail(params: BookingEmailParams) {
  const { clientName, trainerName, serviceName, sessionDate, startTime } = params;
  const dateStr = formatDate(sessionDate);
  const timeStr = formatTime12h(startTime);

  return {
    subject: `Booking confirmed — ${serviceName} with ${trainerName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #171b1f;">Your session is booked, ${clientName}.</h2>
        <p style="color: #5b6670;">Here are the details:</p>
        <table style="width: 100%; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #5b6670;">Trainer</td><td style="padding: 6px 0; font-weight: 600;">${trainerName}</td></tr>
          <tr><td style="padding: 6px 0; color: #5b6670;">Service</td><td style="padding: 6px 0; font-weight: 600;">${serviceName}</td></tr>
          <tr><td style="padding: 6px 0; color: #5b6670;">Date</td><td style="padding: 6px 0; font-weight: 600;">${dateStr}</td></tr>
          <tr><td style="padding: 6px 0; color: #5b6670;">Time</td><td style="padding: 6px 0; font-weight: 600;">${timeStr}</td></tr>
        </table>
        <p style="color: #5b6670; font-size: 13px;">You can reschedule this booking once, or cancel up to 24 hours before for a full refund, from your FitConnect dashboard.</p>
      </div>
    `,
    text: `Your session is booked, ${clientName}.\n\nTrainer: ${trainerName}\nService: ${serviceName}\nDate: ${dateStr}\nTime: ${timeStr}\n\nYou can reschedule this booking once, or cancel up to 24 hours before for a full refund, from your FitConnect dashboard.`,
  };
}

export function bookingRescheduledEmail(
  params: BookingEmailParams & { oldDate: string; oldTime: string }
) {
  const { clientName, trainerName, serviceName, sessionDate, startTime, oldDate, oldTime } = params;

  return {
    subject: `Session rescheduled — ${serviceName} with ${trainerName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #171b1f;">Your session has been rescheduled, ${clientName}.</h2>
        <p style="color: #5b6670;">Moved from <s>${formatDate(oldDate)} at ${formatTime12h(oldTime)}</s> to:</p>
        <table style="width: 100%; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #5b6670;">Trainer</td><td style="padding: 6px 0; font-weight: 600;">${trainerName}</td></tr>
          <tr><td style="padding: 6px 0; color: #5b6670;">Service</td><td style="padding: 6px 0; font-weight: 600;">${serviceName}</td></tr>
          <tr><td style="padding: 6px 0; color: #5b6670;">New date</td><td style="padding: 6px 0; font-weight: 600;">${formatDate(sessionDate)}</td></tr>
          <tr><td style="padding: 6px 0; color: #5b6670;">New time</td><td style="padding: 6px 0; font-weight: 600;">${formatTime12h(startTime)}</td></tr>
        </table>
        <p style="color: #5b6670; font-size: 13px;">This booking has now used its one allowed reschedule. Further changes require cancelling and creating a new booking.</p>
      </div>
    `,
    text: `Your session has been rescheduled, ${clientName}.\n\nMoved from ${formatDate(oldDate)} at ${formatTime12h(oldTime)} to:\nTrainer: ${trainerName}\nService: ${serviceName}\nNew date: ${formatDate(sessionDate)}\nNew time: ${formatTime12h(startTime)}\n\nThis booking has now used its one allowed reschedule.`,
  };
}

export function bookingCancelledEmail(
  params: BookingEmailParams & { refunded: boolean; price: number }
) {
  const { clientName, trainerName, serviceName, sessionDate, startTime, refunded, price } = params;

  return {
    subject: `Booking cancelled — ${serviceName} with ${trainerName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #171b1f;">Your session has been cancelled, ${clientName}.</h2>
        <table style="width: 100%; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #5b6670;">Trainer</td><td style="padding: 6px 0; font-weight: 600;">${trainerName}</td></tr>
          <tr><td style="padding: 6px 0; color: #5b6670;">Service</td><td style="padding: 6px 0; font-weight: 600;">${serviceName}</td></tr>
          <tr><td style="padding: 6px 0; color: #5b6670;">Was scheduled for</td><td style="padding: 6px 0; font-weight: 600;">${formatDate(sessionDate)} at ${formatTime12h(startTime)}</td></tr>
        </table>
        <p style="color: ${refunded ? "#3f6b48" : "#d94714"}; font-weight: 600;">
          ${
            refunded
              ? `$${price} has been refunded to your original payment method.`
              : `Since this was cancelled within 24 hours of the session, $${price} is non-refundable per our cancellation policy.`
          }
        </p>
      </div>
    `,
    text: `Your session has been cancelled, ${clientName}.\n\nTrainer: ${trainerName}\nService: ${serviceName}\nWas scheduled for: ${formatDate(sessionDate)} at ${formatTime12h(startTime)}\n\n${
      refunded
        ? `$${price} has been refunded to your original payment method.`
        : `Since this was cancelled within 24 hours of the session, $${price} is non-refundable per our cancellation policy.`
    }`,
  };
}