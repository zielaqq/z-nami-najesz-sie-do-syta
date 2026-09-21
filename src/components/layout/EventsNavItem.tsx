"use client";

import { withBase } from "@/lib/base-path";
import { useUpcomingEvents } from "@/lib/events-live";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Link „Wydarzenia” w stopce – tylko gdy są nadchodzące wydarzenia (z bazy albo z pliku, zależnie od trybu).
 * Nie pokazujemy linku do sekcji, której nie ma.
 */
export function EventsNavItem({ staticHasEvents }: { staticHasEvents: boolean }) {
  const live = useUpcomingEvents();
  const visible = isSupabaseConfigured ? (live?.length ?? 0) > 0 : staticHasEvents;
  if (!visible) return null;
  return (
    <li>
      <a href={withBase("/#wydarzenia")} className="link-underline text-cream/90 hover:text-cream">
        Wydarzenia
      </a>
    </li>
  );
}
