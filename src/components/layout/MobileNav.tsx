"use client";

import { useEffect, useRef, type MouseEvent } from "react";

import { Logo } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { CloseIcon, MapPin, MenuIcon, Phone } from "@/components/ui/icons";
import { fullAddress, navItems, openingHours, siteConfig } from "@/data/site";

/**
 * Menu mobilne jako natywny <dialog> otwarty przez showModal():
 * przeglądarka sama zapewnia pułapkę fokusu, zamykanie klawiszem Esc,
 * `inert` dla reszty strony i powrót fokusu na przycisk otwierający.
 */
export function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Po powiększeniu okna do układu desktopowego zamknij otwarte menu.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) dialogRef.current?.close();
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    const target = event.target as HTMLElement;
    // Kliknięcie w link (lub w tło poza treścią) zamyka menu; nawigacja po kotwicy działa dalej.
    if (target === event.currentTarget || target.closest("a")) {
      dialogRef.current?.close();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        aria-label="Otwórz menu nawigacji"
        className="-ml-2.5 inline-flex size-11 shrink-0 items-center justify-center rounded-[3px] text-ink lg:hidden"
      >
        <MenuIcon className="size-6" aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu nawigacji"
        onClick={handleClick}
        className="sheet m-0 h-dvh max-h-none w-screen max-w-none bg-cream p-0 text-ink lg:hidden"
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="container-page flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-ink/10">
            <Logo />
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Zamknij menu"
              className="-mr-2.5 inline-flex size-11 items-center justify-center rounded-[3px] text-ink"
            >
              <CloseIcon className="size-6" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Menu mobilne" className="container-page flex-1 py-6">
            <ul className="divide-y divide-ink/10 border-b border-ink/10">
              {navItems.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`/#${item.id}`}
                    className="flex items-baseline gap-4 py-4 font-serif text-[2rem] leading-none tracking-tight text-ink"
                  >
                    <span aria-hidden="true" className="tabular w-7 font-sans text-xs font-semibold text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="container-page shrink-0 pb-8">
            <ButtonLink
              href={siteConfig.contact.phoneHref}
              size="lg"
              icon={<Phone />}
              aria-label={`Zadzwoń i umów: ${siteConfig.contact.phoneDisplay}`}
              className="w-full"
            >
              Zadzwoń i umów
            </ButtonLink>
            <p className="mt-6 flex items-start gap-2.5 text-sm text-ink-soft">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{fullAddress}</span>
            </p>
            <ul className="mt-3 space-y-1 pl-[1.625rem] text-sm text-mute">
              {openingHours.map((rule) => (
                <li key={rule.id} className="tabular">
                  {rule.label}: {rule.opens}–{rule.closes}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </dialog>
    </>
  );
}
