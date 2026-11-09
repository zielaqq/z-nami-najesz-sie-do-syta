import { GalleryGrid } from "@/components/sections/GalleryGrid";
import { LiveGallery } from "@/components/sections/LiveGallery";
import { Section, SectionHeading } from "@/components/ui/Section";
import { galleryImages } from "@/data/gallery";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function Gallery() {
  return (
    <Section id="galeria" labelledBy="gallery-title" tone="cream">
      <SectionHeading
        id="gallery-title"
        eyebrow="Galeria"
        title="Zajrzyj do nas"
        lead="Wnętrze, ogródek i dania z naszej restauracji w Lesznie. Kliknij zdjęcie, aby je powiększyć."
      />
      {isSupabaseConfigured ? <LiveGallery fallback={galleryImages} /> : <GalleryGrid images={galleryImages} />}
    </Section>
  );
}
