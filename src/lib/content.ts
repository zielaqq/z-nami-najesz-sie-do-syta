import { events, type RestaurantEvent } from "@/data/events";
import { galleryImages, galleryMeta } from "@/data/gallery";
import { menuCategories, menuItems, menuMeta, type MenuCategoryId, type MenuItem } from "@/data/menu";
import { todayInWarsaw } from "@/lib/format";

/**
 * ============================================================================
 *  WARSTWA DOSTĘPU DO TREŚCI („szew” pod przyszły CMS / panel administracyjny)
 *
 *  Komponenty pobierają dane WYŁĄCZNIE przez te funkcje. Dziś czytają pliki
 *  z `src/data/`. Aby podłączyć CMS (Sanity, Strapi, Contentful, baza…),
 *  wystarczy zmienić wnętrze tych funkcji – zwracany kształt danych zostaje
 *  ten sam, więc żaden komponent nie wymaga poprawek.
 *  Funkcje są asynchroniczne właśnie po to, by już teraz pasowały do CMS.
 * ============================================================================
 */

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

export async function getGallery() {
  return { isPlaceholder: galleryMeta.isPlaceholder, images: galleryImages };
}

/** Tylko przyszłe (lub trwające) wydarzenia, od najbliższego. */
export async function getUpcomingEvents(now: Date = new Date()): Promise<RestaurantEvent[]> {
  const today = todayInWarsaw(now);
  return events
    .filter((event) => (event.endDate ?? event.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}
