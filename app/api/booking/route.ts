import { NextRequest, NextResponse } from "next/server";
import { bookSlot, SlotUnavailableError } from "@/lib/availability";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: replace with the real signed-in client id from your session
  const clientId = body.clientId;

  try {
    const booking = await bookSlot(body.slotId, clientId);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    if (err instanceof SlotUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}