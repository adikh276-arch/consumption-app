import { useState } from "react";
import { useTranslate } from "@/contexts/TranslateContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, setCurrentUser } from "@/lib/supabase";
import { ConsumptionProfile } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  open: boolean;
  onComplete: (profile: ConsumptionProfile) => void;
}

export default function SetupModal({ open, onComplete }: Props) {
  const { t } = useTranslate();
  const { userId } = useAuth();
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(currentYear - 5);
  const [avgPerDay, setAvgPerDay] = useState(10);
  const [perPack, setPerPack] = useState(20);
  const [costPerCig, setCostPerCig] = useState(0.5);
  const [saving, setSaving] = useState(false);

  const years = Array.from({ length: 60 }, (_, i) => currentYear - i);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);

    const now = new Date();
    const startDate = new Date(year, month - 1, 1);
    const yearsSmoked = (now.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const totalCigarettes = Math.round(yearsSmoked * 365 * avgPerDay);
    const daysAffected = parseFloat(((totalCigarettes * 11) / 1440).toFixed(1));
    const totalMoneySpent = parseFloat((totalCigarettes * costPerCig).toFixed(2));
    const totalPacks = Math.round(totalCigarettes / perPack);

    const profile: ConsumptionProfile = {
      user_id: userId,
      start_month: month,
      start_year: year,
      avg_per_day: avgPerDay,
      per_pack: perPack,
      cost_per_cig: costPerCig,
      total_cigarettes: totalCigarettes,
      days_affected: daysAffected,
      total_money_spent: totalMoneySpent,
      total_packs: totalPacks,
    };

    try {
      await setCurrentUser(userId);
      await supabase.from("consumption_profiles").upsert(profile, { onConflict: "user_id" });
    } catch (e) {
      console.error("Failed to save profile:", e);
    }

    setSaving(false);
    onComplete(profile);
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm rounded-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("Let's get to know you")}</DialogTitle>
          <DialogDescription>{t("This helps us calculate your impact and progress")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Since when */}
          <div>
            <Label className="text-sm font-semibold">{t("I've smoked since")}</Label>
            <div className="mt-2 flex gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{t(m)}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-24 rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Average per day */}
          <div>
            <Label className="text-sm font-semibold">{t("Average cigarettes per day")}</Label>
            <div className="mt-2 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setAvgPerDay(Math.max(1, avgPerDay - 1))}
              >
                −
              </Button>
              <span className="w-12 text-center text-xl font-bold">{avgPerDay}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setAvgPerDay(avgPerDay + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Per pack */}
          <div>
            <Label className="text-sm font-semibold">{t("Cigarettes per pack")}</Label>
            <div className="mt-2 flex gap-2">
              {[10, 20].map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={perPack === n ? "default" : "outline"}
                  className="flex-1 rounded-xl"
                  onClick={() => setPerPack(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>

          {/* Cost */}
          <div>
            <Label className="text-sm font-semibold">{t("Cost per cigarette")}</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={costPerCig}
              onChange={(e) => setCostPerCig(parseFloat(e.target.value) || 0)}
              className="mt-2 rounded-xl"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl py-6 text-base font-semibold"
          >
            {saving ? t("Saving...") : t("Start Tracking")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
