"use client";
import { useState } from "react";
import { FileText, Edit2, Check, X, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, getCategoryLabel } from "@/lib/utils";
import type { Note, NoteWithDetails } from "@/types";

interface Props { notes: (Note | NoteWithDetails)[]; sessionId: string; onNoteUpdated: (note: Note) => void; }

export function NotesList({ notes, sessionId, onNoteUpdated }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  function startEditing(note: Note | NoteWithDetails) { setEditingId(note.id); setEditText(note.edited_transcript || note.raw_transcript || ""); }
  function cancelEditing() { setEditingId(null); setEditText(""); }
  async function saveEdit(noteId: string) { try { const res = await fetch(`/api/sessions/${sessionId}/notes/${noteId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ edited_transcript: editText }) }); if (res.ok) { onNoteUpdated(await res.json()); setEditingId(null); setEditText(""); } } catch {} }
  function toggleAudio(noteId: string) { const audio = document.getElementById(`audio-${noteId}`) as HTMLAudioElement; if (audio) { if (playingId === noteId) { audio.pause(); setPlayingId(null); } else { if (playingId) (document.getElementById(`audio-${playingId}`) as HTMLAudioElement)?.pause(); audio.play(); setPlayingId(noteId); audio.onended = () => setPlayingId(null); } } }

  if (notes.length === 0) return <Card><CardContent className="py-12 text-center"><FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground">No notes yet</p></CardContent></Card>;

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg flex items-center justify-between"><span>Your Notes</span><span className="text-sm font-normal text-muted-foreground">{notes.length} notes</span></CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="p-4 rounded-lg border border-border bg-card/50 space-y-3 animate-fade-in">
            <div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2 flex-wrap"><Badge variant={note.category as "bug" | "feature" | "ux" | "performance" | "secondary"}>{getCategoryLabel(note.category)}</Badge>{note.auto_classified && <span className="text-xs text-muted-foreground">(auto)</span>}{"scene" in note && note.scene && <span className="text-xs text-muted-foreground">{note.scene.name}</span>}</div><span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(note.created_at)}</span></div>
            {editingId === note.id ? <div className="space-y-2"><Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="min-h-[100px]" /><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={cancelEditing}><X className="w-4 h-4" />Cancel</Button><Button size="sm" onClick={() => saveEdit(note.id)}><Check className="w-4 h-4" />Save</Button></div></div> : <div className="group relative"><p className="text-sm pr-8">{note.edited_transcript || note.raw_transcript || <span className="text-muted-foreground italic">No transcript</span>}</p>{(note.edited_transcript || note.raw_transcript) && <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => startEditing(note)}><Edit2 className="w-3 h-3" /></Button>}</div>}
            {note.edited_transcript && note.raw_transcript && note.edited_transcript !== note.raw_transcript && <details className="text-xs"><summary className="text-muted-foreground cursor-pointer hover:text-foreground">Show original</summary><p className="mt-2 p-2 bg-secondary/30 rounded text-muted-foreground">{note.raw_transcript}</p></details>}
            {note.audio_url && <div className="flex items-center gap-2"><Button variant="ghost" size="sm" className="h-8" onClick={() => toggleAudio(note.id)}>{playingId === note.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}{playingId === note.id ? "Pause" : "Play"}</Button><audio id={`audio-${note.id}`} src={note.audio_url} className="hidden" /></div>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
