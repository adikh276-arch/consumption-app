import { useMemo } from "react";
import { useTranslate } from "@/contexts/TranslateContext";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { ConsumptionLog } from "@/types";
import { format, subDays, startOfDay, isSameDay } from "date-fns";

interface Props {
  logs: ConsumptionLog[];
}

export default function WeeklyChart({ logs }: Props) {
  const { t } = useTranslate();

  const data = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayCount = logs
        .filter((l) => isSameDay(new Date(l.timestamp), dayStart))
        .reduce((sum, l) => sum + l.count, 0);
      days.push({
        day: format(date, "EEE"),
        count: dayCount,
        isToday: i === 0,
      });
    }
    return days;
  }, [logs]);

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {t("This Week")}
      </h2>
      <div className="rounded-2xl bg-card p-4 stat-card-shadow">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} barCategoryGap="20%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis hide domain={[0, maxCount + 2]} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.isToday ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.3)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
