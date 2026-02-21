import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslate } from "@/contexts/TranslateContext";
import { supabase, setCurrentUser } from "@/lib/supabase";
import { ConsumptionProfile, ConsumptionLog } from "@/types";
import LanguageSelector from "@/components/LanguageSelector";
import SetupModal from "@/components/SetupModal";
import DailyCounter from "@/components/DailyCounter";
import LifetimeImpact from "@/components/LifetimeImpact";
import WeeklyChart from "@/components/WeeklyChart";
import CrossInsights from "@/components/CrossInsights";
import ExpertBooking from "@/components/ExpertBooking";
import HistorySheet from "@/components/HistorySheet";
import { Wind } from "lucide-react";
import { startOfDay, subDays } from "date-fns";

export default function Index() {
  const { userId } = useAuth();
  const { t } = useTranslate();

  const [profile, setProfile] = useState<ConsumptionProfile | null>(null);
  const [logs, setLogs] = useState<ConsumptionLog[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load profile and logs
  useEffect(() => {
    if (!userId) return;

    async function load() {
      try {
        await setCurrentUser(userId!);

        const { data: prof } = await supabase
          .from("consumption_profiles")
          .select("*")
          .eq("user_id", userId!)
          .maybeSingle();

        if (prof) {
          setProfile(prof);
        } else {
          setShowSetup(true);
        }

        // Load recent logs (last 30 days for chart + history)
        const since = subDays(new Date(), 30).toISOString();
        const { data: logData } = await supabase
          .from("consumption_logs")
          .select("*")
          .eq("user_id", userId!)
          .gte("timestamp", since)
          .order("timestamp", { ascending: false });

        if (logData) setLogs(logData);
      } catch (e) {
        console.error("Load error:", e);
      }
      setLoaded(true);
    }

    load();
  }, [userId]);

  // Today's count
  const todayCount = useMemo(() => {
    const todayStart = startOfDay(new Date()).toISOString();
    return logs
      .filter((l) => l.timestamp >= todayStart)
      .reduce((sum, l) => sum + l.count, 0);
  }, [logs]);

  // Check if expert booking should show
  const showExpert = useMemo(() => {
    if (!profile || logs.length < 7) return false;
    const recentAvg = todayCount;
    return recentAvg > (profile.avg_per_day || 10) * 1.3;
  }, [profile, todayCount, logs]);

  const handleAdd = useCallback(async () => {
    if (!userId) return;
    const entry: ConsumptionLog = {
      user_id: userId,
      timestamp: new Date().toISOString(),
      count: 1,
    };

    try {
      await setCurrentUser(userId);
      const { data } = await supabase
        .from("consumption_logs")
        .insert(entry)
        .select()
        .single();

      if (data) {
        setLogs((prev) => [data, ...prev]);
      }
    } catch (e) {
      console.error("Add error:", e);
    }
  }, [userId]);

  const handleRemove = useCallback(async () => {
    if (!userId) return;
    const todayStart = startOfDay(new Date()).toISOString();
    const todayLogs = logs.filter((l) => l.timestamp >= todayStart);
    const lastEntry = todayLogs[0];
    if (!lastEntry?.id) return;

    try {
      await setCurrentUser(userId);
      await supabase
        .from("consumption_logs")
        .delete()
        .eq("id", lastEntry.id)
        .eq("user_id", userId);

      setLogs((prev) => prev.filter((l) => l.id !== lastEntry.id));
    } catch (e) {
      console.error("Remove error:", e);
    }
  }, [userId, logs]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!userId) return;
      try {
        await setCurrentUser(userId);
        await supabase
          .from("consumption_logs")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

        setLogs((prev) => prev.filter((l) => l.id !== id));
      } catch (e) {
        console.error("Delete error:", e);
      }
    },
    [userId]
  );

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-card border-b border-border/50 px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">BreatheFree</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg space-y-6 p-4 pb-20">
        <DailyCounter count={todayCount} onAdd={handleAdd} onRemove={handleRemove} />
        <LifetimeImpact profile={profile} todayCount={todayCount} />
        <WeeklyChart logs={logs} />
        <CrossInsights logs={logs} />
        <ExpertBooking show={showExpert} />
        <HistorySheet logs={logs} onDelete={handleDelete} />
      </main>

      {/* Setup modal */}
      <SetupModal
        open={showSetup}
        onComplete={(p) => {
          setProfile(p);
          setShowSetup(false);
        }}
      />
    </div>
  );
}
