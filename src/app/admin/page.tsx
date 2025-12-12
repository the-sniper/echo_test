"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, Users, FileText, Play, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate, getStatusLabel } from "@/lib/utils";
import type { Session } from "@/types";

interface SessionWithCounts extends Session { scenes: { count: number }[]; testers: { count: number }[]; notes: { count: number }[]; }

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<SessionWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; session: SessionWithCounts | null }>({ open: false, session: null });

  useEffect(() => { fetchSessions(); }, []);
  async function fetchSessions() { try { const res = await fetch("/api/sessions"); if (res.ok) setSessions(await res.json()); } finally { setLoading(false); } }
  async function handleStartSession(id: string) { await fetch(`/api/sessions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start" }) }); fetchSessions(); }
  async function handleEndSession(id: string) { await fetch(`/api/sessions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "end" }) }); fetchSessions(); }
  async function handleDeleteSession() { if (!deleteDialog.session) return; await fetch(`/api/sessions/${deleteDialog.session.id}`, { method: "DELETE" }); setDeleteDialog({ open: false, session: null }); fetchSessions(); }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-secondary rounded" /><div className="grid gap-4 md:grid-cols-3">{[1,2,3].map(i => <div key={i} className="h-48 bg-secondary rounded-xl" />)}</div></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Test Sessions</h1><p className="text-muted-foreground">Manage your testing sessions</p></div><Link href="/admin/sessions/new"><Button><Plus className="w-4 h-4" />New Session</Button></Link></div>
      {sessions.length === 0 ? <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-16 text-center"><FileText className="w-16 h-16 mb-4 text-muted-foreground opacity-50" /><h3 className="font-semibold mb-2">No sessions yet</h3><Link href="/admin/sessions/new"><Button><Plus className="w-4 h-4" />Create Session</Button></Link></CardContent></Card> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <Card key={s.id} className="group hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3"><div className="flex items-start justify-between"><div><CardTitle className="text-lg">{s.name}</CardTitle>{s.build_version && <p className="text-xs text-muted-foreground font-mono">{s.build_version}</p>}</div><Badge variant={s.status as "draft" | "active" | "completed"}>{getStatusLabel(s.status)}</Badge></div></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground"><Calendar className="w-4 h-4" />{formatDate(s.created_at)}</div>
                <div className="flex items-center gap-4 text-sm"><span className="flex items-center gap-1"><Users className="w-4 h-4 text-muted-foreground" />{s.testers?.[0]?.count || 0}</span><span className="flex items-center gap-1"><FileText className="w-4 h-4 text-muted-foreground" />{s.notes?.[0]?.count || 0}</span></div>
                <div className="flex items-center gap-2 pt-2">
                  <Link href={`/admin/sessions/${s.id}`} className="flex-1"><Button variant="secondary" className="w-full" size="sm">Manage</Button></Link>
                  {s.status === "draft" && <Button size="sm" onClick={() => handleStartSession(s.id)}><Play className="w-4 h-4" />Start</Button>}
                  {s.status === "active" && <Button variant="destructive" size="sm" onClick={() => handleEndSession(s.id)}><Square className="w-4 h-4" />End</Button>}
                  {s.status === "completed" && <Link href={`/admin/sessions/${s.id}/report`}><Button variant="outline" size="sm">Report</Button></Link>}
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setDeleteDialog({ open: true, session: s })}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={deleteDialog.open} onOpenChange={(o) => setDeleteDialog({ open: o, session: null })}><DialogContent><DialogHeader><DialogTitle>Delete Session</DialogTitle><DialogDescription>Delete &quot;{deleteDialog.session?.name}&quot;?</DialogDescription></DialogHeader><DialogFooter><Button variant="ghost" onClick={() => setDeleteDialog({ open: false, session: null })}>Cancel</Button><Button variant="destructive" onClick={handleDeleteSession}>Delete</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
