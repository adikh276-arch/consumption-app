import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function setCurrentUser(userId: number) {
  await supabase.rpc("set_config", {
    setting_name: "app.current_user_id",
    setting_value: String(userId),
    is_local: true,
  });
}

export async function upsertUser(userId: number) {
  await supabase.from("users").upsert({ id: userId }, { onConflict: "id" });
}
