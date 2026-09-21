"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { DishForm } from "@/components/panel/DishForm";
import { NoticeBanner, fieldClass, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { Eye, EyeOff, Pencil, Plus, Search, Utensils } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { dishCountLabel, dishPhotoUrl, groupDishes, type Dish } from "@/lib/daily-menu";
import { formatPrice } from "@/lib/format";
import { describeError, listDishes, setArchived } from "@/lib/panel-data";

/**
 * Baza dań: dodawanie (ze zdjęciem z telefonu), zmiana, ukrywanie i przywracanie dań.
 * Ukryte danie znika ze strony i z listy wyboru na dziś, ale zostaje w bazie – można je przywrócić.
 */
export function DishLibrary() {
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Dish | "new" | null>(null);
  const [notice, setNotice] = useState<PanelNotice | null>(null);

  useEffect(() => {
    let active = true;
    listDishes(true)
      .then((list) => {
        if (active) setDishes(list);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const upsert = (saved: Dish) =>
    setDishes((current) => {
      const list = current ?? [];
      return list.some((dish) => dish.id === saved.id)
        ? list.map((dish) => (dish.id === saved.id ? saved : dish))
        : [...list, saved];
    });

  const onSaved = (saved: Dish) => {
    upsert(saved);
    setEditing(null);
    setNotice({ tone: "ok", text: `Zapisano: ${saved.name}.` });
  };

  const toggleArchived = async (dish: Dish) => {
    setNotice(null);
    try {
      const saved = await setArchived(dish.id, !dish.archived);
      upsert(saved);
      setNotice({
        tone: "ok",
        text: saved.archived ? `Ukryto: ${saved.name}. Możesz je przywrócić w każdej chwili.` : `Przywrócono: ${saved.name}.`,
      });
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
    }
  };

  const needle = query.trim().toLocaleLowerCase("pl");
  const visible = (dishes ?? []).filter(
    (dish) => (showArchived || !dish.archived) && (!needle || dish.name.toLocaleLowerCase("pl").includes(needle)),
  );
  const groups = groupDishes(visible);
  const activeCount = (dishes ?? []).filter((dish) => !dish.archived).length;
  const hiddenCount = (dishes ?? []).length - activeCount;

  return (
    <section aria-labelledby="library-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="library-title" className="font-serif text-2xl leading-tight sm:text-3xl">
            Baza dań
          </h2>
          <p className="text-sm text-mute">{dishes ? `W bazie: ${dishCountLabel(activeCount)}` : " "}</p>
        </div>
        <button type="button" onClick={() => setEditing("new")} className={buttonClasses("primary", "md")}>
          <Plus className="size-4" aria-hidden="true" />
          Dodaj danie
        </button>
      </div>

      <NoticeBanner notice={notice} className="mt-4" />

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <label className="relative block min-w-0 flex-1 basis-64">
          <span className="sr-only">Szukaj dania</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-mute" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj dania…"
            className={cx(fieldClass, "mt-0 pl-11")}
          />
        </label>
        {hiddenCount > 0 ? (
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(event) => setShowArchived(event.target.checked)}
              className="size-5 accent-[var(--color-accent)]"
            />
            Pokaż ukryte ({hiddenCount})
          </label>
        ) : null}
      </div>

      {loadError ? (
        <p role="alert" className="mt-8 text-accent-deep">
          Nie udało się wczytać bazy dań. Odśwież stronę.
        </p>
      ) : !dishes ? (
        <p role="status" className="mt-8 text-mute">
          Wczytuję dania…
        </p>
      ) : groups.length === 0 ? (
        <p className="mt-8 text-mute">
          {dishes.length === 0
            ? "Baza jest pusta. Kliknij „Dodaj danie”, żeby dodać pierwsze."
            : !needle && !showArchived && hiddenCount > 0
              ? "Wszystkie dania są ukryte. Zaznacz „Pokaż ukryte”, żeby je zobaczyć i przywrócić."
              : "Brak dań pasujących do wyszukiwania."}
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.id} className="mt-10" aria-labelledby={`lib-${group.id}`}>
            <h3 id={`lib-${group.id}`} className="border-b border-ink/25 pb-2 font-serif text-xl">
              {group.label}
            </h3>
            <ul className="divide-y divide-ink/10">
              {group.dishes.map((dish) => (
                <DishRow key={dish.id} dish={dish} onEdit={() => setEditing(dish)} onToggleArchived={() => void toggleArchived(dish)} />
              ))}
            </ul>
          </section>
        ))
      )}

      {editing ? (
        <DishForm
          key={editing === "new" ? "new" : editing.id}
          dish={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      ) : null}
    </section>
  );
}

function DishRow({ dish, onEdit, onToggleArchived }: { dish: Dish; onEdit: () => void; onToggleArchived: () => void }) {
  const photo = dishPhotoUrl(dish.photo_path);
  return (
    <li className={cx("flex items-center gap-4 py-3", dish.archived && "opacity-60")}>
      <div className="relative size-16 shrink-0 overflow-hidden bg-sand sm:size-20">
        {photo ? (
          <Image src={photo} alt="" fill unoptimized sizes="80px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-mute" aria-hidden="true">
            <Utensils className="size-6 opacity-50" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-serif text-lg leading-snug">
          {dish.name}
          {dish.archived ? <span className="ml-2 text-xs font-sans font-semibold uppercase tracking-wide text-mute">ukryte</span> : null}
        </p>
        <p className="text-sm text-mute">
          {dish.price != null ? formatPrice(dish.price) : "bez ceny"}
          {dish.description ? ` · ${dish.description}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edytuj: ${dish.name}`}
          className="inline-flex size-11 items-center justify-center rounded-[3px] border border-ink/25 hover:border-ink hover:bg-ink/5"
        >
          <Pencil className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onToggleArchived}
          aria-label={dish.archived ? `Przywróć: ${dish.name}` : `Ukryj: ${dish.name}`}
          title={dish.archived ? "Przywróć" : "Ukryj"}
          className="inline-flex size-11 items-center justify-center rounded-[3px] border border-ink/25 hover:border-ink hover:bg-ink/5"
        >
          {dish.archived ? <Eye className="size-5" aria-hidden="true" /> : <EyeOff className="size-5" aria-hidden="true" />}
        </button>
      </div>
    </li>
  );
}
