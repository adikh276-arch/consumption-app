import { motion } from "framer-motion";
import { useTranslate } from "@/contexts/TranslateContext";
import { Clock, Banknote, Package } from "lucide-react";
import { ConsumptionProfile } from "@/types";

interface Props {
  profile: ConsumptionProfile | null;
  todayCount: number;
}

export default function LifetimeImpact({ profile, todayCount }: Props) {
  const { t } = useTranslate();

  if (!profile) return null;

  const totalCigs = (profile.total_cigarettes || 0) + todayCount;
  const daysAffected = parseFloat(((totalCigs * 11) / 1440).toFixed(1));
  const moneySpent = parseFloat((totalCigs * profile.cost_per_cig).toFixed(0));
  const totalPacks = Math.round(totalCigs / profile.per_pack);

  const stats = [
    {
      icon: Clock,
      label: t("Days of Life Affected"),
      value: daysAffected.toLocaleString(),
      color: "text-impact",
      bg: "bg-impact/10",
    },
    {
      icon: Banknote,
      label: t("Money Spent"),
      value: moneySpent.toLocaleString(),
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      icon: Package,
      label: t("Total Packs"),
      value: totalPacks.toLocaleString(),
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {t("Lifetime Impact")}
      </h2>
      <div className="grid gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 rounded-2xl bg-card p-4 stat-card-shadow"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
