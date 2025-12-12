import Link from "next/link";
import { Mic, BarChart3, Users, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen gradient-mesh">
      <header className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Mic className="w-4 h-4 text-primary-foreground" /></div><span className="font-semibold text-lg">Echo Test</span></div>
          <nav className="flex items-center gap-4"><Link href="/admin"><Button variant="ghost" size="sm">Admin</Button></Link><Link href="/join"><Button size="sm">Join Session<ArrowRight className="w-4 h-4" /></Button></Link></nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4"><h1 className="text-5xl md:text-6xl font-bold tracking-tight">Voice-First<br /><span className="text-primary">Testing Notes</span></h1><p className="text-xl text-muted-foreground max-w-2xl mx-auto">Capture unbiased tester feedback with voice notes, automatic transcription, and actionable reports.</p></div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center"><Link href="/admin/sessions/new"><Button size="lg">Create Session<ArrowRight className="w-4 h-4" /></Button></Link><Link href="/join"><Button variant="outline" size="lg">Join as Tester</Button></Link></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
          {[{ icon: Mic, title: "Voice Recording", desc: "Record notes hands-free with controls." }, { icon: BarChart3, title: "Auto Transcription", desc: "Whisper-powered transcription." }, { icon: Users, title: "Multi-Tester", desc: "Multiple testers simultaneously." }, { icon: Shield, title: "Bias Prevention", desc: "Isolated feedback during sessions." }].map((f) => (
            <div key={f.title} className="group p-6 rounded-xl border border-border bg-card/50 hover:bg-card transition-all"><div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"><f.icon className="w-6 h-6 text-primary" /></div><h3 className="font-semibold mb-2">{f.title}</h3><p className="text-sm text-muted-foreground">{f.desc}</p></div>
          ))}
        </div>
      </main>
      <footer className="border-t border-border mt-32 py-8"><div className="container mx-auto px-4 text-center text-sm text-muted-foreground">Echo Test — Voice-Based Testing Notes Platform</div></footer>
    </div>
  );
}
