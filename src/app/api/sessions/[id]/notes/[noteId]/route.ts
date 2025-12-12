import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await params;
  const body = await req.json();
  const supabase = await createClient();
  const { data } = await supabase.from("notes").update(body).eq("id", noteId).select("*, scene:scenes (*), tester:testers (*)").single();
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await params;
  const supabase = await createClient();
  await supabase.from("notes").delete().eq("id", noteId);
  return NextResponse.json({ success: true });
}
