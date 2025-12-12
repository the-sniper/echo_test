import Link from "next/link";
import { Mic, LayoutDashboard, Users } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-border bg-card/50 hidden md:block">
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center gap-2 px-6 border-b border-border"><div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Mic className="w-4 h-4 text-primary-foreground" /></div><span className="font-semibold">Echo Test</span></div>
          <nav className="flex-1 p-4 space-y-1"><Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary"><LayoutDashboard className="w-4 h-4" />Sessions</Link><Link href="/admin/teams" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary"><Users className="w-4 h-4" />Teams</Link></nav>
          <div className="p-4 border-t border-border"><p className="text-xs text-muted-foreground">Admin Dashboard</p></div>
        </div>
      </aside>
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card/50 glass z-50"><div className="flex items-center justify-between h-full px-4"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Mic className="w-4 h-4 text-primary-foreground" /></div><span className="font-semibold">Echo Test</span></div></div></header>
      <main className="md:pl-64 pt-16 md:pt-0 min-h-screen"><div className="p-6 md:p-8">{children}</div></main>
    </div>
  );
}
