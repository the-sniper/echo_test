"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mic, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function JoinPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/join/${token.trim()}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid invite code"); return; }
      router.push(`/join/${token.trim()}`);
    } catch { setError("Failed to join"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center"><Link href="/" className="inline-flex items-center gap-2"><div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center"><Mic className="w-5 h-5 text-primary-foreground" /></div><span className="font-semibold text-xl">Echo Test</span></Link></div>
        <Card><CardHeader className="text-center"><CardTitle>Join Test Session</CardTitle><CardDescription>Enter your invite code</CardDescription></CardHeader><CardContent><form onSubmit={handleJoin} className="space-y-4"><div className="space-y-2"><Label htmlFor="token">Invite Code</Label><Input id="token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Enter your invite code" className="text-center text-lg tracking-wider" />{error && <p className="text-sm text-destructive">{error}</p>}</div><Button type="submit" className="w-full" disabled={loading || !token.trim()}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Join Session<ArrowRight className="w-4 h-4" /></>}</Button></form></CardContent></Card>
        <p className="text-center text-sm text-muted-foreground">Don&apos;t have a code? <Link href="/" className="text-primary hover:underline">Contact your admin</Link></p>
      </div>
    </div>
  );
}
