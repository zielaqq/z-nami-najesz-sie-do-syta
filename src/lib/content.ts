import { events, type RestaurantEvent } from "@/data/events";
import { menuCategories, menuItems, menuMeta, type MenuCategoryId, type MenuItem } from "@/data/menu";
import { todayInWarsaw } from "@/lib/format";

/** Menu i wydarzenia z plików `src/data/` – wersja zapasowa, gdy strona działa bez bazy. */

export interface MenuGroup {
  id: MenuCategoryId;
  label: string;
  items: MenuItem[];
}

export async function getMenu(): Promise<{ isSample: boolean; groups: MenuGroup[] }> {
  const groups = menuCategories
    .map((category) => ({
      id: category.id,
      label: category.label,
      items: menuItems.filter((item) => item.category === category.id),
    }))
    // Puste kategorie nie są wyświetlane
    .filter((group) => group.items.length > 0);

  return { isSample: menuMeta.isSample, groups };
}

/** Tylko przyszłe (lub trwające) wydarzenia, od najbliższego. */
export async function getUpcomingEvents(now: Date = new Date()): Promise<RestaurantEvent[]> {
  const today = todayInWarsaw(now);
  return events
    .filter((event) => (event.endDate ?? event.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}
