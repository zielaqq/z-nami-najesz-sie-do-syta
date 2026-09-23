import { menuCategories, type MenuCategoryId } from "@/data/menu";
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

const DEFAULT_CATEGORY_ORDER: MenuCategoryId[] = menuCategories.map((category) => category.id);

/** Kolejność kategorii menu, w jakiej pojawiają się na stronie i w panelu. */
export async function getMenuCategoryOrder(): Promise<MenuCategoryId[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("site_settings").select("menu_category_order").eq("id", 1).single();
  if (error) throw error;
  const order = data?.menu_category_order as string[] | null | undefined;
  return order && order.length > 0 ? (order as MenuCategoryId[]) : DEFAULT_CATEGORY_ORDER;
}

/** Zapisuje nową kolejność kategorii menu. */
export async function setMenuCategoryOrder(order: MenuCategoryId[]): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("site_settings").update({ menu_category_order: order }).eq("id", 1);
  if (error) throw error;
}
