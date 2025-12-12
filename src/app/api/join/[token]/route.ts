import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: tester, error: testerError } = await supabase.from("testers").select("*").eq("invite_token", token).single();
  if (testerError || !tester) return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  const { data: session, error: sessionError } = await supabase.from("sessions").select("*, scenes (*)").eq("id", tester.session_id).order("order_index", { referencedTable: "scenes", ascending: true }).single();
  if (sessionError || !session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.status === "completed") return NextResponse.json({ error: "Session has ended" }, { status: 410 });
  if (session.status === "draft") return NextResponse.json({ error: "Session not started" }, { status: 425 });
  return NextResponse.json({ tester, session });
}
