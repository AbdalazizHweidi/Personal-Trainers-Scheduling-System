import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTodaysBoard } from "@/lib/queries/schedule";

export async function GET() {
  const supabase = await createClient();
  try {
    const board = await getTodaysBoard(supabase);
    return NextResponse.json({ board });
  } catch {
    return NextResponse.json({ error: "Failed to load schedule" }, { status: 500 });
  }
}