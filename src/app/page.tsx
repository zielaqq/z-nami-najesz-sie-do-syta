import { About } from "@/components/sections/About";
import { CateringDelivery } from "@/components/sections/CateringDelivery";
import { Contact } from "@/components/sections/Contact";
import { Events } from "@/components/sections/Events";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Menu } from "@/components/sections/Menu";
import { Reviews } from "@/components/sections/Reviews";
import { Social } from "@/components/sections/Social";
import { getUpcomingEvents } from "@/lib/content";

// Strona jest statyczna i odświeża się raz na dobę – dzięki temu miniona data
// wydarzenia automatycznie znika z listy. (Musi być literałem: patrz dokumentacja Next.js.)
export const revalidate = 86400;

export default async function HomePage() {
  const upcomingEvents = await getUpcomingEvents();
  const hasEvents = upcomingEvents.length > 0;

  // Naprzemienne tła sekcji: gdy brak wydarzeń, sekcje poniżej zamieniają się tłem,
  // żeby dwie sąsiednie sekcje nigdy nie miały tego samego koloru.
  return (
    <>
      <Hero />
      <About />
      <Menu />
      <CateringDelivery />
      <Gallery />
      <Reviews />
      <Events events={upcomingEvents} tone="cream" />
      <Social tone={hasEvents ? "paper" : "cream"} />
      <Contact tone={hasEvents ? "cream" : "paper"} />
    </>
  );
}
