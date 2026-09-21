"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { DishLibrary } from "@/components/panel/DishLibrary";
import { EventsManager } from "@/components/panel/EventsManager";
import { GalleryManager } from "@/components/panel/GalleryManager";
import { LoginForm } from "@/components/panel/LoginForm";
import { TodayEditor } from "@/components/panel/TodayEditor";
import { buttonClasses } from "@/components/ui/Button";
import { LogOut } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { isAdmin } from "@/lib/panel-data";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Auth =
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "forbidden"; email: string }
  | { status: "error" }
  | { status: "ready"; email: string };

type Tab = "today" | "dishes" | "events" | "gallery";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "today", label: "Menu na dziś" },
  { id: "dishes", label: "Baza dań" },
  { id: "events", label: "Wydarzenia" },
  { id: "gallery", label: "Galeria" },
];

/**
 * Panel klientki (/panel): logowanie → wybór dań na dziś (kafelki ze zdjęciami), baza dań i wydarzenia.
 * Wszystko działa w przeglądarce; dostępu do zapisu pilnują reguły w bazie (supabase/schema.sql).
 */
export function PanelApp() {
  if (!isSupabaseConfigured) {
    return (
      <PanelShell>
        <Message title="Panel nie jest jeszcze połączony z bazą danych">
          Ustaw zmienne NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY (patrz docs/PANEL-MENU.md) i zbuduj
          stronę ponownie.
        </Message>
      </PanelShell>
    );
  }
  return <ConfiguredPanel />;
}

function ConfiguredPanel() {
  const [auth, setAuth] = useState<Auth>({ status: "loading" });
  const [tab, setTab] = useState<Tab>("today");

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    const resolve = async (session: { user: { id: string; email?: string } } | null) => {
      if (!active) return;
      if (!session) {
        setAuth({ status: "signedOut" });
        return;
      }
      const email = session.user.email ?? "";
      try {
        const admin = await isAdmin(session.user.id);
        if (active) setAuth(admin ? { status: "ready", email } : { status: "forbidden", email });
      } catch {
        if (active) setAuth({ status: "error" });
      }
    };

    getSupabase()
      .then((supabase) => {
        if (!active) return;
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "TOKEN_REFRESHED") return;
          // Wywołania Supabase wprost w tym callbacku mogą się zakleszczyć – odkładamy je na później.
          setTimeout(() => void resolve(session), 0);
        });
        unsubscribe = () => data.subscription.unsubscribe();
      })
      .catch(() => {
        if (active) setAuth({ status: "error" });
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
  };

  const signedIn = auth.status === "ready" || auth.status === "forbidden";

  return (
    <PanelShell
      email={auth.status === "ready" || auth.status === "forbidden" ? auth.email : undefined}
      onSignOut={signedIn ? signOut : undefined}
    >
      {auth.status === "loading" ? (
        <p role="status" className="text-mute">
          Wczytuję…
        </p>
      ) : null}

      {auth.status === "signedOut" ? <LoginForm /> : null}

      {auth.status === "forbidden" ? (
        <Message title="To konto nie ma uprawnień do edycji menu">
          Zalogowano jako {auth.email}. Poproś administratora strony o dodanie tego konta do listy osób, które mogą
          edytować menu, albo wyloguj się i zaloguj na inne konto.
        </Message>
      ) : null}

      {auth.status === "error" ? (
        <Message title="Nie udało się połączyć z bazą">
          Sprawdź połączenie z internetem i odśwież stronę. Jeśli problem wraca, skontaktuj się z administratorem
          strony.
        </Message>
      ) : null}

      {auth.status === "ready" ? (
        <>
          <nav aria-label="Sekcje panelu" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-ink/15 sm:gap-2">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={tab === item.id ? "page" : undefined}
                onClick={() => setTab(item.id)}
                className={cx(
                  "min-h-12 shrink-0 whitespace-nowrap border-b-[3px] px-3 text-[0.9375rem] font-semibold transition-colors sm:px-4",
                  tab === item.id
                    ? "border-accent text-ink"
                    : "border-transparent text-mute hover:text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-8">
            {tab === "today" ? <TodayEditor onOpenLibrary={() => setTab("dishes")} /> : null}
            {tab === "dishes" ? <DishLibrary /> : null}
            {tab === "events" ? <EventsManager /> : null}
            {tab === "gallery" ? <GalleryManager /> : null}
          </div>
        </>
      ) : null}
    </PanelShell>
  );
}

function PanelShell({
  children,
  email,
  onSignOut,
}: {
  children: ReactNode;
  email?: string;
  onSignOut?: () => void;
}) {
  return (
    <div className="min-h-dvh bg-cream text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-serif text-xl leading-tight">Panel menu</h1>
            {email ? <p className="truncate text-xs text-mute">{email}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/" className={buttonClasses("secondary", "sm")}>
              Strona
            </Link>
            {onSignOut ? (
              <button type="button" onClick={onSignOut} className={buttonClasses("secondary", "sm")}>
                <LogOut className="size-4" aria-hidden="true" />
                Wyloguj
              </button>
            ) : null}
          </div>
        </div>
      </header>
      <main className="container-page pb-32 pt-8">{children}</main>
    </div>
  );
}

function Message({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-lg border border-ink/15 bg-white p-6 sm:p-8" role="status">
      <h2 className="font-serif text-2xl leading-snug">{title}</h2>
      <p className="mt-3 text-ink-soft">{children}</p>
    </div>
  );
}
