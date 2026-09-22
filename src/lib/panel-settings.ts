import { getSupabase } from "@/lib/supabase/client";

export interface SiteSettings {
  weeklyMenuVisible: boolean;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("site_settings").select("weekly_menu_visible").eq("id", 1).single();
  if (error) throw error;
  return { weeklyMenuVisible: Boolean(data?.weekly_menu_visible) };
}

/** Włącza/wyłącza przycisk „Cały tydzień” przy menu na stronie publicznej. */
export async function setWeeklyMenuVisible(visible: boolean): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("site_settings").update({ weekly_menu_visible: visible }).eq("id", 1);
  if (error) throw error;
}
