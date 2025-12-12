import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST add member to team
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: team_id } = await params;
    const { first_name, last_name, email } = await request.json();
    
    if (!first_name?.trim() || !last_name?.trim()) {
      return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("team_members")
      .insert({
        team_id,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email?.trim()?.toLowerCase() || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json({ error: "Failed to add team member" }, { status: 500 });
  }
}
