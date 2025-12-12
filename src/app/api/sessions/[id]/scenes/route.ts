import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();
  const { name } = body;
  if (!name) return NextResponse.json({ error: "Scene name required" }, { status: 400 });
  
  const supabase = createAdminClient();
  
  // Get the current max order_index for this session
  const { data: existingScenes } = await supabase
    .from("scenes")
    .select("order_index")
    .eq("session_id", id)
    .order("order_index", { ascending: false })
    .limit(1);
  
  const nextOrderIndex = existingScenes && existingScenes.length > 0 ? existingScenes[0].order_index + 1 : 0;
  
  const { data, error } = await supabase
    .from("scenes")
    .insert({ session_id: id, name, order_index: nextOrderIndex })
    .select()
    .single();
  
  if (error) return NextResponse.json({ error: "Failed to add scene" }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const sceneId = new URL(req.url).searchParams.get("sceneId");
  if (!sceneId) return NextResponse.json({ error: "Scene ID required" }, { status: 400 });
  
  const supabase = createAdminClient();
  await supabase.from("scenes").delete().eq("id", sceneId).eq("session_id", params.id);
  return NextResponse.json({ success: true });
}
