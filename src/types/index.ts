export interface ConsumptionProfile {
  user_id: number;
  start_month: number;
  start_year: number;
  avg_per_day: number;
  per_pack: number;
  cost_per_cig: number;
  total_cigarettes?: number;
  days_affected?: number;
  total_money_spent?: number;
  total_packs?: number;
}

export interface ConsumptionLog {
  id?: number;
  user_id: number;
  timestamp: string;
  count: number;
  location?: string;
  trigger?: string;
  mood?: string;
  notes?: string;
}

export interface Language {
  code: string;
  label: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "mr", label: "मराठी" },
];
