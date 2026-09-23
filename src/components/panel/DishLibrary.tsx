"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { CategoryOrderManager } from "@/components/panel/CategoryOrderManager";
import { DishForm } from "@/components/panel/DishForm";
import { NoticeBanner, fieldClass, type PanelNotice } from "@/components/panel/NoticeBanner";
import { PhotoDownloadPicker } from "@/components/panel/PhotoDownloadPicker";
import { PhotoLightbox } from "@/components/panel/PhotoLightbox";
import { buttonClasses } from "@/components/ui/Button";
import { Download, Eye, EyeOff, Pencil, Plus, Search, Trash2, Utensils } from "@/components/ui/icons";
import { menuCategories, type MenuCategoryId } from "@/data/menu";
import { cx } from "@/lib/cx";
import { dishCountLabel, dishPhotoUrl, groupDishes, type Dish } from "@/lib/daily-menu";
import { safeFileName } from "@/lib/download-file";
import { formatPrice } from "@/lib/format";
import { deleteDish, describeError, listDishes, setArchived } from "@/lib/panel-data";
import { getMenuCategoryOrder } from "@/lib/panel-settings";

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
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null);
  const [downloadPickerOpen, setDownloadPickerOpen] = useState(false);
  const [categoryOrder, setCategoryOrder] = useState<MenuCategoryId[]>(menuCategories.map((c) => c.id));
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

  useEffect(() => {
    let active = true;
    getMenuCategoryOrder()
      .then((order) => {
        if (active) setCategoryOrder(order);
      })
      .catch(() => {
        /* zostaje domyślna kolejność z kodu */
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

  const remove = async (dish: Dish) => {
    if (
      !window.confirm(
        `Na pewno usunąć „${dish.name}” na stałe z bazy dań? Zniknie też z menu na dni, w których było wybrane. Tej operacji nie da się cofnąć.`,
      )
    )
      return;
    setNotice(null);
    try {
      await deleteDish(dish);
      setDishes((current) => (current ?? []).filter((item) => item.id !== dish.id));
      setNotice({ tone: "ok", text: `Usunięto na stałe: ${dish.name}.` });
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
    }
  };

  const needle = query.trim().toLocaleLowerCase("pl");
  const visible = (dishes ?? []).filter(
    (dish) => (showArchived || !dish.archived) && (!needle || dish.name.toLocaleLowerCase("pl").includes(needle)),
  );
  const groups = groupDishes(visible, "alphabetical", categoryOrder);
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
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setDownloadPickerOpen(true)}
            disabled={!dishes || dishes.every((dish) => !dish.photo_path)}
            className={buttonClasses("secondary", "md", "disabled:opacity-60")}
          >
            <Download className="size-4" aria-hidden="true" />
            Pobierz zdjęcia
          </button>
          <button type="button" onClick={() => setEditing("new")} className={buttonClasses("primary", "md")}>
            <Plus className="size-4" aria-hidden="true" />
            Dodaj danie
          </button>
        </div>
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

      <CategoryOrderManager order={categoryOrder} onSaved={setCategoryOrder} />

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
                <DishRow
                  key={dish.id}
                  dish={dish}
                  onEdit={() => setEditing(dish)}
                  onToggleArchived={() => void toggleArchived(dish)}
                  onDelete={() => void remove(dish)}
                  onPreview={(photo) => setLightbox({ src: photo, title: dish.name })}
                />
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
      {downloadPickerOpen ? (
        <PhotoDownloadPicker
          title="Pobierz zdjęcia dań"
          items={(dishes ?? [])
            .filter((dish) => dish.photo_path)
            .map((dish) => ({
              id: dish.id,
              src: dishPhotoUrl(dish.photo_path)!,
              title: dish.name,
              filename: safeFileName(dish.name),
            }))}
          onClose={() => setDownloadPickerOpen(false)}
        />
      ) : null}
      <PhotoLightbox photo={lightbox} onClose={() => setLightbox(null)} />
    </section>
  );
}

function DishRow({
  dish,
  onEdit,
  onToggleArchived,
  onDelete,
  onPreview,
}: {
  dish: Dish;
  onEdit: () => void;
  onToggleArchived: () => void;
  onDelete: () => void;
  onPreview: (photoUrl: string) => void;
}) {
  const photo = dishPhotoUrl(dish.photo_path);
  return (
    <li className={cx("flex items-center gap-4 py-3", dish.archived && "opacity-60")}>
      <button
        type="button"
        onClick={() => photo && onPreview(photo)}
        disabled={!photo}
        aria-label={photo ? `Powiększ zdjęcie: ${dish.name}` : "Brak zdjęcia"}
        className="relative size-16 shrink-0 overflow-hidden bg-sand disabled:cursor-default sm:size-20"
      >
        {photo ? (
          <Image src={photo} alt="" fill unoptimized sizes="80px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-mute" aria-hidden="true">
            <Utensils className="size-6 opacity-50" />
          </span>
        )}
      </button>
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
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Usuń na stałe: ${dish.name}`}
          title="Usuń na stałe"
          className="inline-flex size-11 items-center justify-center rounded-[3px] border border-ink/25 hover:border-accent hover:bg-accent/5 hover:text-accent-deep"
        >
          <Trash2 className="size-5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
