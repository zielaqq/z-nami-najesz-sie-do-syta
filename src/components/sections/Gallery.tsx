import { GalleryGrid } from "@/components/sections/GalleryGrid";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getGallery } from "@/lib/content";

export async function Gallery() {
  const { images, isPlaceholder } = await getGallery();

  return (
    <Section id="galeria" labelledBy="gallery-title" tone="cream">
      <SectionHeading
        id="gallery-title"
        eyebrow="Galeria"
        title="Zajrzyj do nas"
        lead="Wnętrze, ogródek i dania z naszej restauracji w Lesznie. Kliknij zdjęcie, aby je powiększyć."
      />
      <GalleryGrid images={images} />
      {isPlaceholder ? (
        <p className="mt-8 text-sm text-mute">Część zdjęć jest poglądowa – wkrótce zastąpimy je własnymi.</p>
      ) : null}
    </Section>
  );
}
