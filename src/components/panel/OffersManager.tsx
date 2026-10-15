"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { IconButton } from "@/components/panel/IconButton";
import { NoticeBanner, type PanelNotice } from "@/components/panel/NoticeBanner";
import { OfferForm } from "@/components/panel/OfferForm";
import { OfferPhotoForm } from "@/components/panel/OfferPhotoForm";
import { buttonClasses } from "@/components/ui/Button";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ImagePlus, Pencil, Plus, Trash2 } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { todayInWarsaw } from "@/lib/format";
import { describeError } from "@/lib/panel-data";
import {
  deleteOffer,
  deleteOfferPhoto,
  listOffers,
  saveOfferOrder,
  saveOfferPhotoOrder,
  type OfferPhotoRecord,
  type OfferRecord,
} from "@/lib/panel-offers";
import { offerPhotoUrl } from "@/lib/special-offers-live";

/** „2026-12-24” → „24.12.2026” */
function shortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

/** Czy oferta jest dziś na stronie i co o tym napisać w panelu. */
function offerStatus(offer: OfferRecord, today: string): { text: string; live: boolean } {
  if (!offer.visible) return { text: "Ukryta", live: false };
  if (offer.show_from && today < offer.show_from) return { text: `Pojawi się ${shortDate(offer.show_from)}`, live: false };
  if (offer.show_until && today > offer.show_until) {
    return { text: `Zakończona ${shortDate(offer.show_until)}`, live: false };
  }
  if (offer.show_until) return { text: `Na stronie do ${shortDate(offer.show_until)}`, live: true };
  return { text: "Na stronie – cały czas", live: true };
}

/**
 * Oferty specjalne (np. Komunia, Święta) – osobne sekcje na stronie pod menu, z opisem, zdjęciami i (jeśli klientka
 * chce) linkiem w nawigacji. Kolejność ofert i zdjęć ustawia się strzałkami; wszystko zapisuje się od razu.
 */
export function OffersManager() {
  const [offers, setOffers] = useState<OfferRecord[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<OfferRecord | "new" | null>(null);
  const [photoForm, setPhotoForm] = useState<{ offer: OfferRecord; photo: OfferPhotoRecord | null } | null>(null);
  const [notice, setNotice] = useState<PanelNotice | null>(null);
  const [announcement, setAnnouncement] = useState("");
  // Zapisy kolejności idą jeden po drugim, żeby wolniejsza odpowiedź nie nadpisała nowszej zmiany.
  const writeQueue = useRef<Promise<unknown>>(Promise.resolve());
  const pendingFocus = useRef<{ prefix: string; direction: -1 | 1 } | null>(null);
  const today = todayInWarsaw();

  useEffect(() => {
    let active = true;
    listOffers()
      .then((list) => {
        if (active) setOffers(list);
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
    const wanted = document.getElementById(`${target.prefix}-${target.direction}`) as HTMLButtonElement | null;
    const other = document.getElementById(`${target.prefix}-${-target.direction}`) as HTMLButtonElement | null;
    (wanted && !wanted.disabled ? wanted : other)?.focus();
  }, [offers]);

  const enqueueWrite = (write: () => Promise<void>) => {
    writeQueue.current = writeQueue.current.then(write).catch(async (error) => {
      setNotice({ tone: "error", text: describeError(error) });
      try {
        setOffers(await listOffers());
      } catch {
        /* zostaje widok lokalny; komunikat o błędzie już jest */
      }
    });
  };

  const setPhotosOf = (offerId: string, update: (photos: OfferPhotoRecord[]) => OfferPhotoRecord[]) => {
    setOffers((current) =>
      (current ?? []).map((offer) =>
        offer.id === offerId ? { ...offer, special_offer_photos: update(offer.special_offer_photos) } : offer,
      ),
    );
  };

  const moveOffer = (offer: OfferRecord, direction: -1 | 1) => {
    if (!offers) return;
    const from = offers.findIndex((item) => item.id === offer.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= offers.length) return;
    const next = [...offers];
    [next[from], next[to]] = [next[to], next[from]];
    const renumbered = next.map((item, sort_order) => ({ ...item, sort_order }));
    setNotice(null);
    setAnnouncement(`Oferta „${offer.title}”: miejsce ${to + 1} z ${offers.length}`);
    pendingFocus.current = { prefix: `offer-${offer.id}`, direction };
    setOffers(renumbered);
    enqueueWrite(() => saveOfferOrder(renumbered));
  };

  const movePhoto = (offer: OfferRecord, photo: OfferPhotoRecord, direction: -1 | 1) => {
    const photos = offer.special_offer_photos;
    const from = photos.findIndex((item) => item.id === photo.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= photos.length) return;
    const next = [...photos];
    [next[from], next[to]] = [next[to], next[from]];
    const renumbered = next.map((item, sort_order) => ({ ...item, sort_order }));
    setNotice(null);
    setAnnouncement(`Zdjęcie ${to + 1} z ${photos.length}`);
    pendingFocus.current = { prefix: `offer-photo-${photo.id}`, direction };
    setPhotosOf(offer.id, () => renumbered);
    enqueueWrite(() => saveOfferPhotoOrder(renumbered));
  };

  const removeOffer = async (offer: OfferRecord) => {
    const count = offer.special_offer_photos.length;
    const question = `Usunąć ofertę „${offer.title}”${count > 0 ? ` razem ze zdjęciami (${count})` : ""}? Tego nie da się cofnąć – jeśli chcesz ją tylko zdjąć ze strony, ustaw w edycji „Ukryta”.`;
    if (!window.confirm(question)) return;
    setNotice(null);
    try {
      await deleteOffer(offer);
      setOffers((current) => (current ?? []).filter((item) => item.id !== offer.id));
      setNotice({ tone: "ok", text: `Oferta „${offer.title}” została usunięta.` });
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
    }
  };

  const removePhoto = async (offer: OfferRecord, photo: OfferPhotoRecord) => {
    if (!window.confirm("Usunąć to zdjęcie z oferty?")) return;
    setNotice(null);
    try {
      await deleteOfferPhoto(photo);
      setPhotosOf(offer.id, (photos) => photos.filter((item) => item.id !== photo.id));
      setNotice({ tone: "ok", text: "Zdjęcie usunięto." });
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
    }
  };

  return (
    <section aria-labelledby="offers-manager-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="offers-manager-title" className="font-serif text-2xl leading-tight sm:text-3xl">
            Oferty specjalne
          </h2>
          <p className="max-w-[60ch] text-sm text-mute">
            Osobne sekcje na stronie, zaraz pod menu – np. Komunia albo Święta – z opisem i zdjęciami (np. plakatami z
            wariantami menu). Każda może mieć link w menu na górze strony i pokazywać się cały czas albo tylko w
            wybranych dniach.
          </p>
        </div>
        <button type="button" onClick={() => setEditing("new")} className={buttonClasses("primary", "md")}>
          <Plus className="size-4" aria-hidden="true" />
          Dodaj ofertę
        </button>
      </div>

      <NoticeBanner notice={notice} className="mt-4" />
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {loadError ? (
        <p role="alert" className="mt-8 text-accent-deep">
          Nie udało się wczytać ofert. {loadError}
        </p>
      ) : !offers ? (
        <p role="status" className="mt-8 text-mute">
          Wczytuję oferty…
        </p>
      ) : offers.length === 0 ? (
        <div className="mt-8 border border-ink/15 bg-white p-6">
          <p className="font-serif text-xl">Nie ma jeszcze żadnej oferty specjalnej</p>
          <p className="mt-2 max-w-[56ch] text-ink-soft">
            Dodaj np. „Komunia” – z opisem i zdjęciami wariantów menu. Pojawi się na stronie pod menu i w menu na górze
            strony.
          </p>
          <button type="button" onClick={() => setEditing("new")} className={buttonClasses("primary", "md", "mt-5")}>
            Dodaj ofertę
          </button>
        </div>
      ) : (
        <ul className="mt-6 space-y-6">
          {offers.map((offer, index) => (
            <li key={offer.id}>
              <OfferCard
                offer={offer}
                status={offerStatus(offer, today)}
                position={index + 1}
                total={offers.length}
                onMove={(direction) => moveOffer(offer, direction)}
                onEdit={() => setEditing(offer)}
                onDelete={() => void removeOffer(offer)}
                onAddPhotos={() => setPhotoForm({ offer, photo: null })}
                onEditPhoto={(photo) => setPhotoForm({ offer, photo })}
                onMovePhoto={(photo, direction) => movePhoto(offer, photo, direction)}
                onDeletePhoto={(photo) => void removePhoto(offer, photo)}
              />
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <OfferForm
          offer={editing === "new" ? null : editing}
          sortOrder={offers ? offers.reduce((max, item) => Math.max(max, item.sort_order + 1), 0) : 0}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setOffers((current) => {
              const list = current ?? [];
              return list.some((item) => item.id === saved.id)
                ? list.map((item) => (item.id === saved.id ? saved : item))
                : [...list, saved];
            });
            setNotice({
              tone: "ok",
              text:
                editing === "new"
                  ? `Dodano ofertę „${saved.title}”. Teraz dodaj do niej zdjęcia.`
                  : "Zapisano zmiany.",
            });
            setEditing(null);
          }}
        />
      ) : null}

      {photoForm ? (
        <OfferPhotoForm
          offerId={photoForm.offer.id}
          offerTitle={photoForm.offer.title}
          photo={photoForm.photo}
          startOrder={photoForm.offer.special_offer_photos.reduce((max, item) => Math.max(max, item.sort_order + 1), 0)}
          onClose={() => setPhotoForm(null)}
          onAdded={(added) => {
            setPhotosOf(photoForm.offer.id, (photos) => [...photos, ...added]);
            setNotice({
              tone: "ok",
              text: `Dodano ${added.length} ${added.length === 1 ? "zdjęcie" : added.length < 5 ? "zdjęcia" : "zdjęć"}.`,
            });
            setPhotoForm(null);
          }}
          onSaved={(saved) => {
            setPhotosOf(photoForm.offer.id, (photos) => photos.map((item) => (item.id === saved.id ? saved : item)));
            setNotice({ tone: "ok", text: "Zapisano podpis." });
            setPhotoForm(null);
          }}
        />
      ) : null}
    </section>
  );
}

function OfferCard({
  offer,
  status,
  position,
  total,
  onMove,
  onEdit,
  onDelete,
  onAddPhotos,
  onEditPhoto,
  onMovePhoto,
  onDeletePhoto,
}: {
  offer: OfferRecord;
  status: { text: string; live: boolean };
  position: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddPhotos: () => void;
  onEditPhoto: (photo: OfferPhotoRecord) => void;
  onMovePhoto: (photo: OfferPhotoRecord, direction: -1 | 1) => void;
  onDeletePhoto: (photo: OfferPhotoRecord) => void;
}) {
  const photos = offer.special_offer_photos;
  return (
    <article aria-label={`Oferta „${offer.title}”`} className="rounded-[3px] border-2 border-ink/15 bg-white">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            {offer.eyebrow?.trim() || "Oferta specjalna"}
          </p>
          <h3 className="mt-1 font-serif text-2xl leading-tight">{offer.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span
              className={cx(
                "rounded-full border px-2.5 py-1",
                status.live ? "border-accent/50 bg-accent/10 text-accent-deep" : "border-ink/20 text-ink-soft",
              )}
            >
              {status.text}
            </span>
            <span className="rounded-full border border-ink/20 px-2.5 py-1 text-ink-soft">
              {offer.in_nav ? "Link w menu strony" : "Bez linku w menu"}
            </span>
          </div>
          {offer.description ? (
            <p className="mt-3 line-clamp-2 max-w-[60ch] text-sm text-ink-soft">{offer.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <IconButton
            id={`offer-${offer.id}--1`}
            label={`Przesuń ofertę „${offer.title}” wyżej`}
            disabled={position === 1}
            onClick={() => onMove(-1)}
          >
            <ChevronUp className="size-6" aria-hidden="true" />
          </IconButton>
          <IconButton
            id={`offer-${offer.id}-1`}
            label={`Przesuń ofertę „${offer.title}” niżej`}
            disabled={position === total}
            onClick={() => onMove(1)}
          >
            <ChevronDown className="size-6" aria-hidden="true" />
          </IconButton>
          <IconButton label={`Edytuj ofertę „${offer.title}”`} onClick={onEdit}>
            <Pencil className="size-5" aria-hidden="true" />
          </IconButton>
          <IconButton label={`Usuń ofertę „${offer.title}”`} onClick={onDelete} danger>
            <Trash2 className="size-5" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <div className="border-t border-ink/10 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">Zdjęcia ({photos.length})</p>
          <button type="button" onClick={onAddPhotos} className={buttonClasses("secondary", "sm")}>
            <ImagePlus className="size-4" aria-hidden="true" />
            Dodaj zdjęcia
          </button>
        </div>
        {photos.length === 0 ? (
          <p className="mt-2 text-sm text-mute">Brak zdjęć – na stronie będzie sam opis.</p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {photos.map((photo, index) => {
              const title = photo.caption?.trim() || `Zdjęcie ${index + 1}`;
              return (
                <li key={photo.id}>
                  <div className="flex h-full flex-col overflow-hidden rounded-[3px] border border-ink/15 bg-white">
                    <div className="relative aspect-[3/4] bg-sand">
                      <Image
                        src={offerPhotoUrl(photo.photo_path)}
                        alt=""
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 160px, (min-width: 640px) 22vw, 45vw"
                        className="object-contain"
                      />
                      <span
                        aria-hidden="true"
                        className="tabular absolute left-1.5 top-1.5 inline-grid size-7 place-items-center rounded-full bg-ink text-xs font-semibold text-cream"
                      >
                        {index + 1}
                      </span>
                    </div>
                    <p className={cx("line-clamp-2 px-2 pt-2 text-sm", photo.caption ? "text-ink" : "text-mute")}>
                      {photo.caption?.trim() || "Bez podpisu"}
                    </p>
                    <div className="mt-auto grid grid-cols-2 gap-1.5 p-2">
                      <IconButton
                        id={`offer-photo-${photo.id}--1`}
                        label={`Przesuń zdjęcie „${title}” w lewo`}
                        disabled={index === 0}
                        onClick={() => onMovePhoto(photo, -1)}
                      >
                        <ChevronLeft className="size-5" aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        id={`offer-photo-${photo.id}-1`}
                        label={`Przesuń zdjęcie „${title}” w prawo`}
                        disabled={index === photos.length - 1}
                        onClick={() => onMovePhoto(photo, 1)}
                      >
                        <ChevronRight className="size-5" aria-hidden="true" />
                      </IconButton>
                      <IconButton label={`Zmień podpis zdjęcia „${title}”`} onClick={() => onEditPhoto(photo)}>
                        <Pencil className="size-4" aria-hidden="true" />
                      </IconButton>
                      <IconButton label={`Usuń zdjęcie „${title}”`} onClick={() => onDeletePhoto(photo)} danger>
                        <Trash2 className="size-4" aria-hidden="true" />
                      </IconButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </article>
  );
}
