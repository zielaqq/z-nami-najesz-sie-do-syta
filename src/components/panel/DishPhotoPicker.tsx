"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { NoticeBanner, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { Check, CloseIcon } from "@/components/ui/icons";
import { dishPhotoUrl, type Dish } from "@/lib/daily-menu";
import { copiedDishNames, listDishesWithPhotos } from "@/lib/panel-gallery";

interface DishPhotoPickerProps {
  onClose: () => void;
  /** Wybrane dania (te, których zdjęcia mają trafić do galerii). */
  onConfirm: (dishes: Dish[]) => void;
}

/**
 * Okno „Skopiuj zdjęcia dań” – lista dań z wgranym zdjęciem, z zaznaczaniem. Dania, których nazwa nie jest jeszcze
 * podpisem żadnego zdjęcia w galerii (kategoria „Dania”), są zaznaczone od razu; resztę można dobrać albo odznaczyć.
 */
export function DishPhotoPicker({ onClose, onConfirm }: DishPhotoPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<PanelNotice | null>(null);

  useEffect(() => {
    const element = dialogRef.current;
    if (element && !element.open) element.showModal();
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([listDishesWithPhotos(), copiedDishNames()])
      .then(([list, copied]) => {
        if (!active) return;
        setDishes(list);
        setSelected(new Set(list.filter((dish) => !copied.has(dish.name.trim().toLocaleLowerCase("pl"))).map((dish) => dish.id)));
      })
      .catch(() => {
        if (active) setLoadError("Nie udało się wczytać bazy dań.");
      });
    return () => {
      active = false;
    };
  }, []);

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const confirm = () => {
    if (!dishes) return;
    const picked = dishes.filter((dish) => selected.has(dish.id));
    if (picked.length === 0) {
      setNotice({ tone: "error", text: "Zaznacz przynajmniej jedno danie." });
      return;
    }
    onConfirm(picked);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="dish-picker-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-1.5rem)] max-w-2xl overflow-hidden rounded-[3px] bg-cream p-0 text-ink backdrop:bg-ink/60"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-center justify-between border-b border-ink/15 px-5 py-3">
          <h2 id="dish-picker-title" className="font-serif text-xl">
            Skopiuj zdjęcia dań
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Zamknij"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-[3px] hover:bg-ink/5"
          >
            <CloseIcon className="size-6" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <p className="text-sm text-ink-soft">
            Zaznaczone dania trafią do galerii (kategoria „Dania”, podpis = nazwa dania). Dania, które już tam są,
            zostały odznaczone – zaznacz je ponownie, żeby dodać zdjęcie jeszcze raz.
          </p>
          <NoticeBanner notice={notice} className="mt-4" />

          {loadError ? (
            <p role="alert" className="mt-6 text-accent-deep">
              {loadError}
            </p>
          ) : !dishes ? (
            <p role="status" className="mt-6 text-mute">
              Wczytuję dania…
            </p>
          ) : dishes.length === 0 ? (
            <p className="mt-6 text-mute">Żadne danie w bazie nie ma jeszcze zdjęcia.</p>
          ) : (
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {dishes.map((dish) => {
                const on = selected.has(dish.id);
                const photo = dishPhotoUrl(dish.photo_path);
                return (
                  <li key={dish.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(dish.id)}
                      className={`group relative block aspect-[4/3] w-full overflow-hidden rounded-[3px] border-2 text-left transition-colors ${
                        on ? "border-accent" : "border-ink/15 hover:border-ink/40"
                      }`}
                    >
                      {photo ? (
                        <Image src={photo} alt="" fill unoptimized sizes="(min-width: 640px) 220px, 45vw" className="object-cover" />
                      ) : null}
                      <span
                        aria-hidden="true"
                        className={`absolute right-2 top-2 grid size-7 place-items-center rounded-full border-2 transition-colors ${
                          on ? "border-accent bg-accent text-white" : "border-white/90 bg-ink/35 text-transparent"
                        }`}
                      >
                        <Check className="size-4" />
                      </span>
                      <span className="absolute inset-x-0 bottom-0 truncate bg-ink/70 px-2 py-1.5 text-xs text-cream">
                        {dish.name}
                        <span className="sr-only">{on ? " – zaznaczone" : " – niezaznaczone"}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {dishes && dishes.length > 0 ? (
          <div className="flex gap-3 border-t border-ink/15 bg-cream px-5 py-4">
            <button type="button" onClick={confirm} className={buttonClasses("primary", "md", "flex-1")}>
              Skopiuj zaznaczone ({selected.size})
            </button>
            <button type="button" onClick={() => dialogRef.current?.close()} className={buttonClasses("secondary", "md")}>
              Anuluj
            </button>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
