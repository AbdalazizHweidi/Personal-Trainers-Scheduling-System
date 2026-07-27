import { resend } from "./resend";
import {
  bookingConfirmedEmail,
  bookingRescheduledEmail,
  bookingCancelledEmail,
} from "./templates";

export async function sendBookingConfirmedEmail(
  to: string,
  params: Parameters<typeof bookingConfirmedEmail>[0]
) {
  const { subject, html, text } = bookingConfirmedEmail(params);
  return safeSend(to, subject, html, text);
}

export async function sendBookingRescheduledEmail(
  to: string,
  params: Parameters<typeof bookingRescheduledEmail>[0]
) {
  const { subject, html, text } = bookingRescheduledEmail(params);
  return safeSend(to, subject, html, text);
}

export async function sendBookingCancelledEmail(
  to: string,
  params: Parameters<typeof bookingCancelledEmail>[0]
) {
  const { subject, html, text } = bookingCancelledEmail(params);
  return safeSend(to, subject, html, text);
}

async function safeSend(to: string, subject: string, html: string, text: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    // Never let an email failure break the booking flow itself
    console.error("EMAIL SEND ERROR:", err);
  }
}