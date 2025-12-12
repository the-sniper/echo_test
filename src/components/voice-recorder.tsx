"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Pause, Play, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDuration, getCategoryLabel } from "@/lib/utils";
import type { Note, NoteCategory } from "@/types";

interface Props { sessionId: string; sceneId: string; testerId: string; sceneName: string; onNoteCreated: (note: Note) => void; }
type State = "idle" | "recording" | "paused" | "processing";

export function VoiceRecorder({ sessionId, sceneId, testerId, sceneName, onNoteCreated }: Props) {
  const [state, setState] = useState<State>("idle");
  const [duration, setDuration] = useState(0);
  const [category, setCategory] = useState<NoteCategory | "auto">("auto");
  const [step, setStep] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingSceneIdRef = useRef<string>(sceneId);

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); }; }, []);
  const startTimer = useCallback(() => { timerRef.current = setInterval(() => setDuration(d => d + 1), 1000); }, []);
  const stopTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);

  async function startRecording() {
    try {
      // Capture the current sceneId at the start of recording
      recordingSceneIdRef.current = sceneId;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.start(1000);
      setState("recording");
      setDuration(0);
      startTimer();
    } catch { alert("Could not access microphone."); }
  }

  function pauseRecording() { if (mediaRecorderRef.current?.state === "recording") { mediaRecorderRef.current.pause(); setState("paused"); stopTimer(); } }
  function resumeRecording() { if (mediaRecorderRef.current?.state === "paused") { mediaRecorderRef.current.resume(); setState("recording"); startTimer(); } }
  function stopRecording() { if (mediaRecorderRef.current) { mediaRecorderRef.current.stop(); stopTimer(); if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); setState("processing"); processRecording(); } }
  function cancelRecording() { if (mediaRecorderRef.current) mediaRecorderRef.current.stop(); stopTimer(); if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); setState("idle"); setDuration(0); }

  async function processRecording() {
    try {
      await new Promise(r => setTimeout(r, 100));
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setStep("Transcribing...");
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      const transcribeRes = await fetch("/api/transcribe", { method: "POST", body: formData });
      const { text: transcript } = await transcribeRes.json();
      let finalCategory: NoteCategory = "other";
      let autoClassified = false;
      if (category === "auto" && transcript) {
        setStep("Classifying...");
        const classifyRes = await fetch("/api/classify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: transcript }) });
        const { category: cat } = await classifyRes.json();
        finalCategory = cat || "other";
        autoClassified = true;
      } else if (category !== "auto") finalCategory = category;
      setStep("Saving...");
      const noteRes = await fetch(`/api/sessions/${sessionId}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scene_id: recordingSceneIdRef.current, tester_id: testerId, raw_transcript: transcript, category: finalCategory, auto_classified: autoClassified }) });
      const note = await noteRes.json();
      const uploadFormData = new FormData();
      uploadFormData.append("audio", blob, "recording.webm");
      uploadFormData.append("sessionId", sessionId);
      uploadFormData.append("noteId", note.id);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadFormData });
      if (uploadRes.ok) { const { url } = await uploadRes.json(); await fetch(`/api/sessions/${sessionId}/notes/${note.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audio_url: url }) }); note.audio_url = url; }
      onNoteCreated(note);
      setState("idle");
      setDuration(0);
      setStep("");
    } catch { setState("idle"); setStep(""); alert("Failed to process recording."); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Category:</span><Select value={category} onValueChange={(v) => setCategory(v as NoteCategory | "auto")} disabled={state !== "idle"}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="auto">Auto-detect</SelectItem><SelectItem value="bug">{getCategoryLabel("bug")}</SelectItem><SelectItem value="feature">{getCategoryLabel("feature")}</SelectItem><SelectItem value="ux">{getCategoryLabel("ux")}</SelectItem><SelectItem value="performance">{getCategoryLabel("performance")}</SelectItem><SelectItem value="other">{getCategoryLabel("other")}</SelectItem></SelectContent></Select></div>
        {state !== "idle" && state !== "processing" && <span className="text-sm font-mono text-muted-foreground">{formatDuration(duration)}</span>}
      </div>
      <div className="relative h-24 bg-secondary/30 rounded-lg flex items-center justify-center overflow-hidden">{state === "idle" && <p className="text-sm text-muted-foreground">Recording for: {sceneName}</p>}{state === "recording" && <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <div key={i} className="w-1 bg-primary rounded-full waveform-bar" style={{ height: "4px" }} />)}</div>}{state === "paused" && <div className="flex items-center gap-2 text-yellow-500"><Pause className="w-5 h-5" /><span className="text-sm">Paused</span></div>}{state === "processing" && <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin text-primary" /><span className="text-sm text-muted-foreground">{step}</span></div>}{state === "recording" && <div className="absolute top-3 right-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 recording-indicator" /><span className="text-xs text-red-500">REC</span></div>}</div>
      <div className="flex items-center justify-center gap-3">{state === "idle" && <Button onClick={startRecording} size="lg" className="rounded-full h-14 w-14"><Mic className="w-6 h-6" /></Button>}{state === "recording" && <><Button onClick={pauseRecording} variant="secondary" size="lg" className="rounded-full h-12 w-12"><Pause className="w-5 h-5" /></Button><Button onClick={stopRecording} variant="destructive" size="lg" className="rounded-full h-14 w-14"><Square className="w-6 h-6" /></Button></>}{state === "paused" && <><Button onClick={resumeRecording} variant="secondary" size="lg" className="rounded-full h-12 w-12"><Play className="w-5 h-5" /></Button><Button onClick={stopRecording} size="lg" className="rounded-full h-14 w-14"><Send className="w-6 h-6" /></Button><Button onClick={cancelRecording} variant="ghost" size="sm">Cancel</Button></>}{state === "processing" && <Button disabled size="lg" className="rounded-full h-14 w-14"><Loader2 className="w-6 h-6 animate-spin" /></Button>}</div>
      <p className="text-xs text-center text-muted-foreground">{state === "idle" && "Tap the microphone to start"}{state === "recording" && "Speak your feedback"}{state === "paused" && "Resume or submit"}{state === "processing" && "Processing..."}</p>
    </div>
  );
}
