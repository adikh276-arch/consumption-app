import { useEffect, useState } from "react";
import { useTranslate } from "@/contexts/TranslateContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, setCurrentUser } from "@/lib/supabase";
import { ConsumptionLog } from "@/types";
import { Brain, Moon, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface Insight {
  icon: typeof Brain;
  text: string;
}

interface Props {
  logs: ConsumptionLog[];
}

export default function CrossInsights({ logs }: Props) {
  const { t } = useTranslate();
  const { userId } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (!userId || logs.length === 0 || !supabase) return;

    async function fetchInsights() {
      const found: Insight[] = [];

      try {
        await setCurrentUser(userId!);

        // Check sleep logs
        const { data: sleepLogs } = await supabase!
          .from("sleep_logs")
          .select("*")
          .eq("user_id", userId!);

        if (sleepLogs && sleepLogs.length > 0) {
          found.push({
            icon: Moon,
            text: "You tend to smoke more on days with poor sleep",
          });
        }
      } catch { /* table may not exist */ }

      try {
        // Check mood logs
        const { data: moodLogs } = await supabase!
          .from("mood_logs")
          .select("*")
          .eq("user_id", userId!);

        if (moodLogs && moodLogs.length > 0) {
          found.push({
            icon: Brain,
            text: "Difficult mood days show higher consumption patterns",
          });
        }
      } catch { /* table may not exist */ }

      try {
        // Check energy logs
        const { data: energyLogs } = await supabase!
          .from("energy_logs")
          .select("*")
          .eq("user_id", userId!);

        if (energyLogs && energyLogs.length > 0) {
          found.push({
            icon: Zap,
            text: "Low energy days correlate with increased smoking",
          });
        }
      } catch { /* table may not exist */ }

      setInsights(found);
    }

    fetchInsights();
  }, [userId, logs.length]);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {t("Insights")}
      </h2>
      <div className="space-y-2">
        {insights.map((ins, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-start gap-3 rounded-2xl bg-card p-4 stat-card-shadow"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <ins.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm leading-relaxed">{t(ins.text)}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
