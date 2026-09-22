import { About } from "@/components/sections/About";
import { CateringDelivery } from "@/components/sections/CateringDelivery";
import { Contact } from "@/components/sections/Contact";
import { Events } from "@/components/sections/Events";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { LiveEvents } from "@/components/sections/LiveEvents";
import { Menu } from "@/components/sections/Menu";
import { Reviews } from "@/components/sections/Reviews";
import { Social } from "@/components/sections/Social";
import type { RestaurantEvent } from "@/data/events";
import { getUpcomingEvents } from "@/lib/content";
import { fetchUpcomingEvents } from "@/lib/events-live";
import { todayInWarsaw } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Strona jest statyczna i odświeża się raz na dobę (tryb bez bazy: miniona data wydarzenia z pliku znika sama).
// (Musi być literałem: patrz dokumentacja Next.js.)
export const revalidate = 86400;

export default async function HomePage() {
  let upcomingEvents: RestaurantEvent[] = [];
  let initialLiveEvents: RestaurantEvent[] | undefined;

  if (isSupabaseConfigured) {
    // Wstępne pobranie na serwerze – żeby wydarzenia były widoczne w wygenerowanym HTML od razu (m.in. dla
    // Google), zanim `LiveEvents` doładuje najświeższą wersję w przeglądarce. Błąd tutaj nie psuje strony –
    // bez tego `LiveEvents` i tak pobiera dane sam, tak jak dotychczas.
    try {
      initialLiveEvents = await fetchUpcomingEvents(todayInWarsaw());
    } catch {
      initialLiveEvents = undefined;
    }
  } else {
    // Bez bazy: wydarzenia z pliku src/data/events.ts.
    upcomingEvents = await getUpcomingEvents();
  }

  // Tła sekcji naprzemiennie: opinie (paper) → wydarzenia (sand, opcjonalne) → social (cream) → kontakt (paper).
  // „Sand” odcina się od sąsiadów, więc kolory pozostałych sekcji nie zależą od tego, czy wydarzenia są.
  return (
    <>
      <Hero />
      <About />
      <Menu />
      <CateringDelivery />
      <Gallery />
      <Reviews />
      {isSupabaseConfigured ? (
        <LiveEvents initialEvents={initialLiveEvents} />
      ) : (
        <Events events={upcomingEvents} />
      )}
      <Social tone="cream" />
      <Contact tone="paper" />
    </>
  );
}
