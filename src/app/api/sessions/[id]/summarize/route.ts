import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Fetch session with notes
    const supabase = createAdminClient();
    const { data: session, error } = await supabase
      .from("sessions")
      .select(
        "*, scenes (*), testers (*), notes (*, scene:scenes (*), tester:testers (*))"
      )
      .eq("id", id)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!session.notes || session.notes.length === 0) {
      return NextResponse.json(
        { error: "No notes to summarize" },
        { status: 400 }
      );
    }

    // Get unique testers and scenes for context
    const testerNames = Array.from(new Set(session.notes.map((note: { tester?: { first_name: string; last_name: string } | null }) => 
      note.tester ? `${note.tester.first_name} ${note.tester.last_name}` : "Unknown"
    )));
    const sceneNames = Array.from(new Set(session.notes.map((note: { scene?: { name: string } | null }) => 
      note.scene?.name || "Unknown"
    )));

    // Format notes for the AI prompt
    const notesText = session.notes
      .map((note: {
        category: string;
        scene?: { name: string } | null;
        tester?: { first_name: string; last_name: string } | null;
        edited_transcript: string | null;
        raw_transcript: string | null;
      }) => {
        const transcript = note.edited_transcript || note.raw_transcript || "";
        const sceneName = note.scene?.name || "Unknown Scene";
        const testerName = note.tester
          ? `${note.tester.first_name} ${note.tester.last_name}`
          : "Unknown Tester";
        return `[Category: ${note.category.toUpperCase()}] [Scene: ${sceneName}] [Tester: ${testerName}]\n"${transcript}"`;
      })
      .join("\n\n");

    const prompt = `You are an expert at analyzing user feedback and testing notes. Based on the following testing session notes, create a list of actionable items that the development team can work on.

Session: ${session.name}
${session.description ? `Description: ${session.description}` : ""}

Testers: ${testerNames.join(", ")}
Scenes: ${sceneNames.join(", ")}

Testing Notes (voice transcriptions):
${notesText}

Please analyze these notes and provide a structured summary with actionable items.

IMPORTANT - HANDLING TRANSCRIPTION QUALITY:
1. These are voice transcriptions which may contain:
   - Unclear or garbled text from transcription errors
   - Very short or vague feedback that lacks detail
   - Incomplete sentences or filler words
   - Gibberish that doesn't make sense

2. For notes with CLEAR, actionable feedback:
   - Include them in the actionable items list
   - Use first-person language (e.g., "I noticed...", "I found...")

3. For notes that are UNCLEAR or problematic:
   - List them in a separate "⚠️ Notes Requiring Review" section
   - Be transparent about what the issue is
   - Include the tester name so they can be asked to clarify
   - Do NOT try to guess or fabricate meaning from gibberish

FORMATTING REQUIREMENTS:
1. For each actionable item, ALWAYS include:
   - The tester name who provided the feedback
   - The scene/area it relates to
   - The category (Bug, Feature, UX, Performance, Other)

2. Group similar issues together but maintain attribution.

Format your response as:

**Summary Overview:**
Brief 2-3 sentence overview of the key findings. If many notes are unclear, mention this.

**Actionable Items:**

- **[Category]** - [Scene]: Description of the actionable item
  - *Reported by: [Tester Name]*

**⚠️ Notes Requiring Review:** (only include this section if there are problematic notes)

- [Scene] - [Tester Name]: "[Brief quote or description of the unclear note]"
  - *Issue: [Explain why - e.g., "Transcription appears garbled/incomplete/too vague to action"]*

Be honest about transcription quality. It's better to flag unclear notes for review than to create confusing or incorrect action items.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that specializes in analyzing user testing feedback and creating actionable development tasks. Be concise but thorough.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const summary = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      summary,
      notesCount: session.notes.length,
      sessionName: session.name,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: "Invalid OpenAI API key. Please check your configuration." },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
