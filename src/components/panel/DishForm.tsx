"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { NoticeBanner, fieldClass, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon, ImagePlus, Utensils } from "@/components/ui/icons";
import { isTextOnlyCategory, menuCategories, type MenuCategoryId } from "@/data/menu";
import { dishPhotoUrl, type Dish } from "@/lib/daily-menu";
import { describeError, saveDish } from "@/lib/panel-data";

/** Cena z pola tekstowego: pusta → null („bez ceny”), błędna → undefined. Przecinek i kropka są dozwolone. */
function parsePrice(text: string): number | null | undefined {
  const value = text.trim().replace(",", ".");
  if (value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number < 10000 ? Math.round(number * 100) / 100 : undefined;
}

interface DishFormProps {
  /** null = nowe danie */
  dish: Dish | null;
  onClose: () => void;
  onSaved: (dish: Dish) => void;
}

/** Formularz dania w oknie dialogowym: nazwa, kategoria, cena, opis i zdjęcie (z aparatu lub galerii). */
export function DishForm({ dish, onClose, onSaved }: DishFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(dish?.name ?? "");
  const [category, setCategory] = useState<MenuCategoryId>(dish?.category ?? "drugie-dania");
  const [price, setPrice] = useState(dish?.price != null ? String(dish.price).replace(".", ",") : "");
  const [description, setDescription] = useState(dish?.description ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<PanelNotice | null>(null);

  // Okno otwiera się razem z formularzem; po odmontowaniu znika z DOM (nie wywołujemy close() w sprzątaniu,
  // bo w trybie deweloperskim React montuje komponenty dwa razy).
  useEffect(() => {
    const element = dialogRef.current;
    if (element && !element.open) element.showModal();
  }, []);

  // Zwalniamy adres podglądu zdjęcia, gdy zostanie zastąpiony albo formularz się zamknie.
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNotice({ tone: "error", text: "Wpisz nazwę dania." });
      return;
    }
    const parsed = parsePrice(price);
    if (parsed === undefined) {
      setNotice({ tone: "error", text: "Podaj cenę liczbą, np. 18 albo 18,50 (albo zostaw puste)." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const saved = await saveDish(
        { name: trimmed, category, price: parsed, description: description.trim() || null },
        photo,
        dish,
      );
      onSaved(saved);
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
      setBusy(false);
    }
  };

  const shownPhoto = preview ?? dishPhotoUrl(dish?.photo_path);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="dish-form-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-[3px] bg-cream p-0 text-ink backdrop:bg-ink/60"
    >
      <form onSubmit={submit} className="flex max-h-[92dvh] flex-col">
        <div className="flex items-center justify-between border-b border-ink/15 px-5 py-3">
          <h2 id="dish-form-title" className="font-serif text-xl">
            {dish ? "Edytuj danie" : "Nowe danie"}
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

        <div className="space-y-5 overflow-y-auto px-5 py-5">
          <label className="block text-sm font-semibold">
            Nazwa dania
            <input
              type="text"
              required
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={fieldClass}
              placeholder="np. Kotlet schabowy z ziemniakami"
            />
          </label>

          <label className="block text-sm font-semibold">
            Kategoria
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as MenuCategoryId)}
              className={fieldClass}
            >
              {menuCategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold">
            Cena w zł <span className="font-normal text-mute">(nieobowiązkowa)</span>
            <input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className={fieldClass}
              placeholder="np. 32 albo 32,50"
            />
          </label>

          <label className="block text-sm font-semibold">
            Krótki opis <span className="font-normal text-mute">(nieobowiązkowy)</span>
            <textarea
              rows={2}
              maxLength={300}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={fieldClass}
            />
          </label>

          {isTextOnlyCategory(category) ? (
            <p className="text-xs text-mute">
              Napoje i piwo są na stronie zwykłą listą z cenami – zdjęcie nie jest potrzebne.
            </p>
          ) : (
            <div>
              <span className="text-sm font-semibold">Zdjęcie</span>
              <div className="mt-1.5 flex items-center gap-4">
                <div className="relative size-24 shrink-0 overflow-hidden bg-sand">
                  {shownPhoto ? (
                    <Image src={shownPhoto} alt="Podgląd zdjęcia dania" fill unoptimized sizes="96px" className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center text-mute" aria-hidden="true">
                      <Utensils className="size-8 opacity-50" />
                    </span>
                  )}
                </div>
                <label
                  className={buttonClasses(
                    "secondary",
                    "md",
                    "cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                  )}
                >
                  <ImagePlus className="size-4" aria-hidden="true" />
                  {shownPhoto ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
                  <input type="file" accept="image/*" onChange={onPick} className="sr-only" />
                </label>
              </div>
              <p className="mt-2 text-xs text-mute">
                Zdjęcie z telefonu zmniejszymy automatycznie. Najlepiej danie z góry, przy dobrym świetle.
              </p>
            </div>
          )}

          <NoticeBanner notice={notice} />
        </div>

        <div className="flex gap-3 border-t border-ink/15 bg-cream px-5 py-4">
          <button type="submit" disabled={busy} className={buttonClasses("primary", "md", "flex-1 disabled:opacity-60")}>
            {busy ? "Zapisuję…" : "Zapisz"}
          </button>
          <button type="button" onClick={() => dialogRef.current?.close()} className={buttonClasses("secondary", "md")}>
            Anuluj
          </button>
        </div>
      </form>
    </dialog>
  );
}
