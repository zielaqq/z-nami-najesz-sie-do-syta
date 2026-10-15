"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { HeroPhotoForm } from "@/components/panel/HeroPhotoForm";
import { NoticeBanner, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { Check, Pencil, Plus, Trash2 } from "@/components/ui/icons";
import { withBase } from "@/lib/base-path";
import { cx } from "@/lib/cx";
import { heroPhotoUrl, type HeroFit, type HeroPhotoRow } from "@/lib/hero-photo-live";
import { describeError } from "@/lib/panel-data";
import { deleteHeroPhoto, loadHeroPhotos, setActiveHeroPhoto } from "@/lib/panel-hero";

/** Zdjęcie sali z kodu – jest zawsze do wyboru i nie da się go usunąć. */
const DEFAULT_PHOTO = "/images/gallery/sala-1.jpg";

const fitLabels: Record<HeroFit, string> = {
  contain: "Pokazywane w całości",
  cover: "Na całą ramkę",
};

/**
 * Zdjęcie główne – duże zdjęcie na górze strony, obok nazwy restauracji. Klientka wgrywa własne zdjęcia (np. plakat
 * z aktualną ofertą) i wybiera, które z nich jest na stronie; zdjęcie sali z kodu zawsze można przywrócić. Zmiany
 * zapisują się od razu.
 */
export function HeroPhotoManager() {
  const [photos, setPhotos] = useState<HeroPhotoRow[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<HeroPhotoRow | "new" | null>(null);
  const [notice, setNotice] = useState<PanelNotice | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    loadHeroPhotos()
      .then((result) => {
        if (!active) return;
        setPhotos(result.photos);
        setActiveId(result.activeId);
      })
      .catch((error) => {
        if (active) setLoadError(describeError(error));
      });
    return () => {
      active = false;
    };
  }, []);

  const show = async (id: string | null) => {
    setBusy(true);
    setNotice(null);
    try {
      await setActiveHeroPhoto(id);
      setActiveId(id);
      setNotice({
        tone: "ok",
        text: id ? "Gotowe – to zdjęcie jest teraz na stronie." : "Gotowe – na stronie jest znowu zdjęcie sali.",
      });
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (photo: HeroPhotoRow) => {
    const isActive = photo.id === activeId;
    const question = isActive
      ? "To zdjęcie jest teraz na stronie. Usunąć je? Na stronie wróci zdjęcie sali."
      : "Usunąć to zdjęcie?";
    if (!window.confirm(question)) return;
    setBusy(true);
    setNotice(null);
    try {
      await deleteHeroPhoto(photo);
      setPhotos((current) => (current ?? []).filter((item) => item.id !== photo.id));
      if (isActive) setActiveId(null);
      setNotice({
        tone: "ok",
        text: isActive ? "Zdjęcie usunięto – na stronie jest znowu zdjęcie sali." : "Zdjęcie usunięto.",
      });
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="hero-manager-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="hero-manager-title" className="font-serif text-2xl leading-tight sm:text-3xl">
            Zdjęcie główne
          </h2>
          <p className="max-w-[56ch] text-sm text-mute">
            Duże zdjęcie na samej górze strony, obok nazwy restauracji. Możesz wstawić tu np. plakat z aktualną ofertą,
            a potem jednym kliknięciem wrócić do zdjęcia sali. Zmiana jest widoczna od razu po odświeżeniu strony.
          </p>
        </div>
        <button type="button" onClick={() => setEditing("new")} className={buttonClasses("primary", "md")}>
          <Plus className="size-4" aria-hidden="true" />
          Dodaj zdjęcie
        </button>
      </div>

      <NoticeBanner notice={notice} className="mt-4" />

      {loadError ? (
        <p role="alert" className="mt-8 text-accent-deep">
          Nie udało się wczytać zdjęć. {loadError}
        </p>
      ) : !photos ? (
        <p role="status" className="mt-8 text-mute">
          Wczytuję zdjęcia…
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          <li>
            <HeroTile
              src={withBase(DEFAULT_PHOTO)}
              title="Zdjęcie sali"
              detail="Domyślne – zawsze do wyboru"
              fit="cover"
              active={activeId === null}
              busy={busy}
              onShow={() => void show(null)}
            />
          </li>
          {photos.map((photo) => (
            <li key={photo.id}>
              <HeroTile
                src={heroPhotoUrl(photo.photo_path)}
                title={photo.alt}
                detail={fitLabels[photo.fit]}
                fit={photo.fit}
                active={activeId === photo.id}
                busy={busy}
                onShow={() => void show(photo.id)}
                onEdit={() => setEditing(photo)}
                onDelete={() => void remove(photo)}
              />
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <HeroPhotoForm
          photo={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onAdded={(added, showNow) => {
            setPhotos((current) => [added, ...(current ?? [])]);
            setEditing(null);
            if (showNow) void show(added.id);
            else setNotice({ tone: "ok", text: "Dodano zdjęcie. Kliknij „Pokaż na stronie”, gdy zechcesz je wstawić." });
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

function HeroTile({
  src,
  title,
  detail,
  fit,
  active,
  busy,
  onShow,
  onEdit,
  onDelete,
}: {
  src: string;
  title: string;
  detail: string;
  fit: HeroFit;
  active: boolean;
  busy: boolean;
  onShow: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={cx(
        "flex h-full flex-col overflow-hidden rounded-[3px] border-2 bg-white",
        active ? "border-accent" : "border-ink/15",
      )}
    >
      <div className="relative aspect-[4/5] bg-sand">
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw"
          className={fit === "contain" ? "object-contain" : "object-cover"}
        />
        {active ? (
          <span
            aria-hidden="true"
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white"
          >
            <Check className="size-3.5" aria-hidden="true" />
            Na stronie
          </span>
        ) : null}
      </div>
      <div className="px-3 pb-2 pt-2.5">
        <p className="line-clamp-2 font-serif text-[1.0625rem] leading-snug">{title}</p>
        <p className="mt-0.5 text-xs text-mute">{detail}</p>
      </div>
      <div className="mt-auto space-y-2 p-3 pt-1">
        {active ? (
          <p className="flex min-h-11 items-center justify-center gap-1.5 text-sm font-semibold text-accent-deep">
            <Check className="size-4" aria-hidden="true" />
            Teraz na stronie
          </p>
        ) : (
          <button
            type="button"
            onClick={onShow}
            disabled={busy}
            aria-label={`Pokaż na stronie: ${title}`}
            className={buttonClasses("primary", "sm", "w-full disabled:opacity-60")}
          >
            Pokaż na stronie
          </button>
        )}
        {onEdit && onDelete ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onEdit}
              disabled={busy}
              aria-label={`Edytuj zdjęcie: ${title}`}
              className="inline-flex h-11 items-center justify-center rounded-[3px] border border-ink/25 text-ink transition-colors hover:border-ink hover:bg-ink/5 disabled:opacity-30"
            >
              <Pencil className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              aria-label={`Usuń zdjęcie: ${title}`}
              className="inline-flex h-11 items-center justify-center rounded-[3px] border border-accent/40 text-accent-deep transition-colors hover:border-accent hover:bg-accent/5 disabled:opacity-30"
            >
              <Trash2 className="size-5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
