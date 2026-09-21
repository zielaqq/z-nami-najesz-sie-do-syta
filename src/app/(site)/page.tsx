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
import { getUpcomingEvents } from "@/lib/content";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Strona jest statyczna i odświeża się raz na dobę (tryb bez bazy: miniona data wydarzenia z pliku znika sama).
// (Musi być literałem: patrz dokumentacja Next.js.)
export const revalidate = 86400;

export default async function HomePage() {
  // Z bazą (panel klientki): wydarzenia wczytuje przeglądarka na żywo. Bez bazy: z pliku src/data/events.ts.
  const upcomingEvents = isSupabaseConfigured ? [] : await getUpcomingEvents();

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
      {isSupabaseConfigured ? <LiveEvents /> : <Events events={upcomingEvents} />}
      <Social tone="cream" />
      <Contact tone="paper" />
    </>
  );
}
