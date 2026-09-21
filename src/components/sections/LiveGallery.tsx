"use client";

import { useEffect, useState } from "react";

import { GalleryGrid } from "@/components/sections/GalleryGrid";
import type { GalleryImage } from "@/data/gallery";
import { fetchGalleryImages } from "@/lib/gallery-live";

/**
 * Galeria ustawiana w panelu (/panel → Galeria). Do czasu wczytania (albo gdy w bazie nie ma jeszcze zdjęć, albo baza
 * nie odpowiada) wyświetla zdjęcia domyślne z kodu (`src/data/gallery.ts`), więc sekcja nigdy nie jest pusta.
 */
export function LiveGallery({ fallback }: { fallback: GalleryImage[] }) {
  const [images, setImages] = useState(fallback);

  useEffect(() => {
    const controller = new AbortController();
    fetchGalleryImages(controller.signal)
      .then((list) => {
        if (list.length > 0) setImages(list);
      })
      .catch(() => {
        /* zostają zdjęcia domyślne */
      });
    return () => controller.abort();
  }, []);

  return <GalleryGrid images={images} />;
}
