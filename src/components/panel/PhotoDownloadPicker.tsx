"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { NoticeBanner, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { Check, CloseIcon } from "@/components/ui/icons";
import { downloadFiles } from "@/lib/download-file";

export interface DownloadableItem {
  id: string;
  /** Adres zdjęcia (do podglądu i do pobrania). */
  src: string;
  title: string;
  /** Nazwa pliku do pobrania, bez rozszerzenia (dodajemy „.jpg”). */
  filename: string;
}

interface PhotoDownloadPickerProps {
  title: string;
  items: DownloadableItem[];
  onClose: () => void;
}

/**
 * Okno „Pobierz zdjęcia”: wszystkie są domyślnie zaznaczone (można odznaczyć niepotrzebne), a „Pobierz zaznaczone”
 * zapisuje je jedno po drugim na komputerze – w galerii/bazie nic się przy tym nie zmienia.
 */
export function PhotoDownloadPicker({ title, items, onClose }: PhotoDownloadPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set(items.map((item) => item.id)));
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [notice, setNotice] = useState<PanelNotice | null>(null);

  useEffect(() => {
    const element = dialogRef.current;
    if (element && !element.open) element.showModal();
  }, []);

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = items.length > 0 && selected.size === items.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((item) => item.id)));

  const confirm = async () => {
    const picked = items.filter((item) => selected.has(item.id));
    if (picked.length === 0) {
      setNotice({ tone: "error", text: "Zaznacz przynajmniej jedno zdjęcie." });
      return;
    }
    setNotice(null);
    setProgress({ done: 0, total: picked.length });
    const { done, failed } = await downloadFiles(
      picked.map((item) => ({ src: item.src, filename: `${item.filename}.jpg` })),
      (doneCount, total) => setProgress({ done: doneCount, total }),
    );
    setProgress(null);
    if (failed.length > 0) {
      setNotice({
        tone: "error",
        text: `Pobrano ${done} z ${picked.length}. Nie udało się: ${failed.join(", ")}.`,
      });
    } else {
      setNotice({ tone: "ok", text: `Pobrano ${done} ${done === 1 ? "zdjęcie" : "zdjęć"} na Twój komputer.` });
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="download-picker-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-1.5rem)] max-w-2xl overflow-hidden rounded-[3px] bg-cream p-0 text-ink backdrop:bg-ink/60"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-center justify-between border-b border-ink/15 px-5 py-3">
          <h2 id="download-picker-title" className="font-serif text-xl">
            {title}
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
            Zaznaczone zdjęcia zostaną zapisane na Twoim komputerze (jedno po drugim) – nic się przy tym nie zmienia.
          </p>

          {items.length > 0 ? (
            <button
              type="button"
              onClick={toggleAll}
              className="mt-4 text-sm font-semibold text-ink underline underline-offset-2 hover:no-underline"
            >
              {allSelected ? "Odznacz wszystkie" : "Zaznacz wszystkie"}
            </button>
          ) : null}

          <NoticeBanner notice={notice} className="mt-4" />

          {items.length === 0 ? (
            <p className="mt-6 text-mute">Nie ma tu jeszcze żadnych zdjęć.</p>
          ) : (
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item) => {
                const on = selected.has(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(item.id)}
                      className={`group relative block aspect-[4/3] w-full overflow-hidden rounded-[3px] border-2 text-left transition-colors ${
                        on ? "border-accent" : "border-ink/15 hover:border-ink/40"
                      }`}
                    >
                      <Image
                        src={item.src}
                        alt=""
                        fill
                        unoptimized
                        sizes="(min-width: 640px) 220px, 45vw"
                        className="object-cover"
                      />
                      <span
                        aria-hidden="true"
                        className={`absolute right-2 top-2 grid size-7 place-items-center rounded-full border-2 transition-colors ${
                          on ? "border-accent bg-accent text-white" : "border-white/90 bg-ink/35 text-transparent"
                        }`}
                      >
                        <Check className="size-4" />
                      </span>
                      <span className="absolute inset-x-0 bottom-0 truncate bg-ink/70 px-2 py-1.5 text-xs text-cream">
                        {item.title}
                        <span className="sr-only">{on ? " – zaznaczone" : " – niezaznaczone"}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="flex gap-3 border-t border-ink/15 bg-cream px-5 py-4">
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={!!progress}
              className={buttonClasses("primary", "md", "flex-1 disabled:opacity-60")}
            >
              {progress ? `Pobieram… ${Math.min(progress.done + 1, progress.total)}/${progress.total}` : `Pobierz zaznaczone (${selected.size})`}
            </button>
            <button type="button" onClick={() => dialogRef.current?.close()} className={buttonClasses("secondary", "md")}>
              Zamknij
            </button>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
