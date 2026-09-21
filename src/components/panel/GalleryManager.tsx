"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { GalleryPhotoForm } from "@/components/panel/GalleryPhotoForm";
import { NoticeBanner, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "@/components/ui/icons";
import { defaultGalleryAlt, galleryCategories } from "@/data/gallery";
import { galleryPhotoUrl } from "@/lib/gallery-live";
import { describeError } from "@/lib/panel-data";
import {
  deletePhoto,
  importDefaultPhotos,
  listGallery,
  saveGalleryOrder,
  type GalleryRecord,
} from "@/lib/panel-gallery";

/**
 * Galeria widoczna na stronie: dodawanie zdjęć, usuwanie, zmiana podpisu i kategorii oraz kolejność (strzałki w lewo
 * i w prawo). Zmiany zapisują się od razu. Dopóki w bazie nie ma żadnego zdjęcia, strona pokazuje zdjęcia domyślne.
 */
export function GalleryManager() {
  const [photos, setPhotos] = useState<GalleryRecord[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<GalleryRecord | "new" | null>(null);
  const [notice, setNotice] = useState<PanelNotice | null>(null);
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  // Zapisy kolejności idą jeden po drugim, żeby wolniejsza odpowiedź nie nadpisała nowszej zmiany.
  const writeQueue = useRef<Promise<unknown>>(Promise.resolve());
  const pendingFocus = useRef<{ id: string; direction: -1 | 1 } | null>(null);

  useEffect(() => {
    let active = true;
    listGallery()
      .then((list) => {
        if (active) setPhotos(list);
      })
      .catch((error) => {
        if (active) setLoadError(describeError(error));
      });
    return () => {
      active = false;
    };
  }, []);

  // Po przesunięciu przeglądarka potrafi zgubić fokus (element zmienia miejsce w drzewie) – przywracamy go.
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const wanted = document.getElementById(`gallery-${target.id}-${target.direction}`) as HTMLButtonElement | null;
    const other = document.getElementById(`gallery-${target.id}-${-target.direction}`) as HTMLButtonElement | null;
    (wanted && !wanted.disabled ? wanted : other)?.focus();
  }, [photos]);

  const move = (photo: GalleryRecord, direction: -1 | 1) => {
    if (!photos) return;
    const from = photos.findIndex((item) => item.id === photo.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= photos.length) return;
    const next = [...photos];
    [next[from], next[to]] = [next[to], next[from]];
    const renumbered = next.map((item, sort_order) => ({ ...item, sort_order }));

    setNotice(null);
    setAnnouncement(`Zdjęcie ${to + 1} z ${photos.length}`);
    pendingFocus.current = { id: photo.id, direction };
    setPhotos(renumbered);

    writeQueue.current = writeQueue.current
      .then(() => saveGalleryOrder(renumbered))
      .catch(async (error) => {
        setNotice({ tone: "error", text: describeError(error) });
        try {
          setPhotos(await listGallery());
        } catch {
          /* zostaje widok lokalny; komunikat o błędzie już jest */
        }
      });
  };

  const remove = async (photo: GalleryRecord) => {
    if (!window.confirm("Usunąć to zdjęcie z galerii?")) return;
    setNotice(null);
    try {
      await deletePhoto(photo);
      setPhotos((current) => (current ?? []).filter((item) => item.id !== photo.id));
      setNotice({ tone: "ok", text: "Zdjęcie usunięto z galerii." });
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
    }
  };

  const importDefaults = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const list = await importDefaultPhotos();
      setPhotos(list);
      setNotice({ tone: "ok", text: `Przeniesiono ${list.length} zdjęć. Możesz je teraz układać, podpisywać i usuwać.` });
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="gallery-manager-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="gallery-manager-title" className="font-serif text-2xl leading-tight sm:text-3xl">
            Galeria
          </h2>
          <p className="max-w-[52ch] text-sm text-mute">
            Zdjęcia układają się na stronie od lewej do prawej, rząd po rzędzie. Strzałkami zmieniasz kolejność, a filtry
            „Wnętrze / Ogródek / Dania” nad galerią pojawiają się same.
          </p>
        </div>
        <button type="button" onClick={() => setEditing("new")} className={buttonClasses("primary", "md")}>
          <Plus className="size-4" aria-hidden="true" />
          Dodaj zdjęcia
        </button>
      </div>

      <NoticeBanner notice={notice} className="mt-4" />
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {loadError ? (
        <p role="alert" className="mt-8 text-accent-deep">
          Nie udało się wczytać galerii. {loadError}
        </p>
      ) : !photos ? (
        <p role="status" className="mt-8 text-mute">
          Wczytuję galerię…
        </p>
      ) : photos.length === 0 ? (
        <div className="mt-8 border border-ink/15 bg-white p-6">
          <p className="font-serif text-xl">Galeria w bazie jest jeszcze pusta</p>
          <p className="mt-2 max-w-[56ch] text-ink-soft">
            Do czasu dodania zdjęć strona pokazuje zdjęcia domyślne. Możesz przenieść je tutaj (i wtedy układać, podpisywać
            albo usuwać) albo od razu dodać własne.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void importDefaults()}
              disabled={busy}
              className={buttonClasses("primary", "md", "disabled:opacity-60")}
            >
              {busy ? "Przenoszę…" : "Przenieś obecne zdjęcia do panelu"}
            </button>
            <button type="button" onClick={() => setEditing("new")} className={buttonClasses("secondary", "md")}>
              Dodaj własne zdjęcia
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-ink-soft">
            {photos.length} {photos.length === 1 ? "zdjęcie" : photos.length < 5 ? "zdjęcia" : "zdjęć"} w galerii
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {photos.map((photo, index) => (
              <li key={photo.id}>
                <PhotoTile
                  photo={photo}
                  position={index + 1}
                  total={photos.length}
                  onMove={(direction) => move(photo, direction)}
                  onEdit={() => setEditing(photo)}
                  onDelete={() => void remove(photo)}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {editing ? (
        <GalleryPhotoForm
          photo={editing === "new" ? null : editing}
          startOrder={photos ? photos.reduce((max, item) => Math.max(max, item.sort_order + 1), 0) : 0}
          onClose={() => setEditing(null)}
          onAdded={(added) => {
            setPhotos((current) => [...(current ?? []), ...added]);
            setNotice({
              tone: "ok",
              text: `Dodano ${added.length} ${added.length === 1 ? "zdjęcie" : "zdjęć"} do galerii.`,
            });
            setEditing(null);
          }}
          onSaved={(saved) => {
            setPhotos((current) => (current ?? []).map((item) => (item.id === saved.id ? saved : item)));
            setNotice({ tone: "ok", text: "Zapisano zmiany." });
            setEditing(null);
          }}
        />
      ) : null}
    </section>
  );
}

function PhotoTile({
  photo,
  position,
  total,
  onMove,
  onEdit,
  onDelete,
}: {
  photo: GalleryRecord;
  position: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const categoryLabel = galleryCategories.find((category) => category.id === photo.category)?.label ?? photo.category;
  const title = photo.caption ?? defaultGalleryAlt(photo.category);
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[3px] border-2 border-ink/15 bg-white">
      <div className="relative aspect-[4/5] bg-sand">
        <Image
          src={galleryPhotoUrl(photo.photo_path)}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw"
          className="object-cover"
          style={{ objectPosition: photo.focus ?? undefined }}
        />
        <span
          aria-hidden="true"
          className="tabular absolute left-2 top-2 inline-grid size-7 place-items-center rounded-full bg-ink text-xs font-semibold text-cream"
        >
          {position}
        </span>
      </div>
      <div className="px-3 pb-2 pt-2.5">
        <p className="line-clamp-2 font-serif text-[1.0625rem] leading-snug">{title}</p>
        <p className="mt-0.5 text-xs text-mute">{categoryLabel}</p>
      </div>
      <div className="mt-auto space-y-2 p-3 pt-1">
        <div className="grid grid-cols-2 gap-2">
          <IconButton
            id={`gallery-${photo.id}--1`}
            label={`Przesuń zdjęcie „${title}” w lewo`}
            disabled={position === 1}
            onClick={() => onMove(-1)}
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </IconButton>
          <IconButton
            id={`gallery-${photo.id}-1`}
            label={`Przesuń zdjęcie „${title}” w prawo`}
            disabled={position === total}
            onClick={() => onMove(1)}
          >
            <ChevronRight className="size-6" aria-hidden="true" />
          </IconButton>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <IconButton label={`Edytuj zdjęcie „${title}”`} onClick={onEdit}>
            <Pencil className="size-5" aria-hidden="true" />
          </IconButton>
          <IconButton label={`Usuń zdjęcie „${title}”`} onClick={onDelete} danger>
            <Trash2 className="size-5" aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  id,
  label,
  disabled,
  danger,
  onClick,
  children,
}: {
  id?: string;
  label: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center rounded-[3px] border transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "border-accent/40 text-accent-deep hover:border-accent hover:bg-accent/5"
          : "border-ink/25 text-ink hover:border-ink hover:bg-ink/5 disabled:hover:border-ink/25 disabled:hover:bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}
