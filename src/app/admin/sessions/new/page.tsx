"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function NewSessionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [buildVersion, setBuildVersion] = useState("");
  const [scenes, setScenes] = useState<string[]>([]);
  const [newScene, setNewScene] = useState("");

  function addScene() { if (newScene.trim()) { setScenes([...scenes, newScene.trim()]); setNewScene(""); } }
  function removeScene(i: number) { setScenes(scenes.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || scenes.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), description: description.trim() || null, build_version: buildVersion.trim() || null, scenes }) });
      if (res.ok) { const session = await res.json(); router.push(`/admin/sessions/${session.id}`); }
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4"><Link href="/admin"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link><div><h1 className="text-2xl font-bold">Create Session</h1><p className="text-muted-foreground">Set up a new test session</p></div></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card><CardHeader><CardTitle>Session Details</CardTitle><CardDescription>Basic information</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="name">Session Name *</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sprint 24" required /></div><div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of what's being tested..." className="min-h-[80px] resize-none" /></div><div className="space-y-2"><Label htmlFor="buildVersion">Build / Version</Label><Input id="buildVersion" value={buildVersion} onChange={(e) => setBuildVersion(e.target.value)} placeholder="e.g., v2.1.0" /></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Scenes</CardTitle><CardDescription>Areas being tested</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2">{scenes.map((s, i) => <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 group"><span className="flex-1 text-sm">{s}</span><Button type="button" variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => removeScene(i)}><X className="w-4 h-4" /></Button></div>)}</div><div className="flex gap-2"><Input value={newScene} onChange={(e) => setNewScene(e.target.value)} placeholder="Add a scene..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addScene(); } }} /><Button type="button" variant="secondary" onClick={addScene}><Plus className="w-4 h-4" />Add</Button></div></CardContent></Card>
        <div className="flex justify-end gap-4"><Link href="/admin"><Button type="button" variant="ghost">Cancel</Button></Link><Button type="submit" disabled={loading || !name.trim() || scenes.length === 0}>{loading && <Loader2 className="w-4 h-4 animate-spin" />}Create Session</Button></div>
      </form>
    </div>
  );
}
