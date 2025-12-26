"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users2,
  FileText,
  Play,
  LayoutDashboard,
  Bug,
  Sparkles,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DashboardStats } from "@/lib/admin-analytics";
import {
  StatCard,
  SessionStatusChart,
  NotesCategoryChart,
  SessionsOverTimeChart,
  RecentActivity,
  TesterLeaderboard,
  ActiveSessionsBanner,
} from "@/components/admin/dashboard";

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "all">("30d");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/dashboard?timeFilter=${timeFilter}`);
      if (res.ok) {
        setDashboardStats(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setDashboardLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  async function handleRefresh() {
    setRefreshing(true);
    setDashboardLoading(true);
    await fetchDashboard();
    setRefreshing(false);
  }

  // Dashboard skeleton
  const DashboardSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-secondary/30" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-72 rounded-xl bg-secondary/30" />
        <div className="h-72 rounded-xl bg-secondary/30" />
        <div className="h-72 rounded-xl bg-secondary/30" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 h-80 rounded-xl bg-secondary/30" />
        <div className="h-80 rounded-xl bg-secondary/30" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of your testing activity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Filter Tabs */}
          <Tabs
            value={timeFilter}
            onValueChange={(v) => setTimeFilter(v as typeof timeFilter)}
            className="w-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="7d" className="text-xs px-3">7 days</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs px-3">30 days</TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-3">All time</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="shrink-0 h-9 w-9"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      {dashboardLoading ? (
        <DashboardSkeleton />
      ) : dashboardStats ? (
        <div className="space-y-6">
          {/* Active Sessions Banner */}
          {dashboardStats.activeSessionsList.length > 0 && (
            <ActiveSessionsBanner sessions={dashboardStats.activeSessionsList} />
          )}

          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Total Sessions"
              value={dashboardStats.totalSessions}
              icon={<FileText className="h-5 w-5" />}
              variant="primary"
            />
            <StatCard
              title="Active Sessions"
              value={dashboardStats.activeSessions}
              icon={<Play className="h-5 w-5" />}
              variant="success"
            />
            <StatCard
              title="Completed"
              value={dashboardStats.completedSessions}
              icon={<Sparkles className="h-5 w-5" />}
              variant="default"
            />
            <StatCard
              title="Total Testers"
              value={dashboardStats.totalTesters}
              icon={<Users2 className="h-5 w-5" />}
              variant="default"
            />
            <StatCard
              title="Total Notes"
              value={dashboardStats.totalNotes}
              icon={<MessageSquare className="h-5 w-5" />}
              variant="default"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SessionStatusChart data={dashboardStats.sessionsByStatus} />
            <NotesCategoryChart data={dashboardStats.notesByCategory} />
            <TesterLeaderboard data={dashboardStats.testerLeaderboard} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid gap-4 lg:grid-cols-3">
            <SessionsOverTimeChart data={dashboardStats.sessionsOverTime} />
            <RecentActivity notes={dashboardStats.recentNotes} />
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <LayoutDashboard className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No data to display yet</p>
            <p className="text-sm text-muted-foreground/70">
              Create your first session to see dashboard statistics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
