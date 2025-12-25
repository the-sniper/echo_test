"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TesterHeader } from "@/components/tester-header";

interface MeResponse {
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<MeResponse["user"] | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchUser() {
      try {
        const res = await fetch("/api/users/me", { cache: "no-store" });
        const data: MeResponse = await res.json();
        if (!mounted) return;
        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } catch {
        if (mounted) router.push("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchUser();
    return () => {
      mounted = false;
    };
  }, [router]);

  const fullName = user ? `${user.first_name} ${user.last_name}` : "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh flex flex-col">
      <TesterHeader user={user} />

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg glass border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Welcome{fullName ? `, ${fullName}` : ""}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is your dashboard. We&apos;ll add more here soon.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
