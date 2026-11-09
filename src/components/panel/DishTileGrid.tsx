"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";

import { Check, GripVertical, Utensils } from "@/components/ui/icons";
import { isTextOnlyCategory } from "@/data/menu";
import { cx } from "@/lib/cx";
import { dishPhotoUrl, type Dish } from "@/lib/daily-menu";
import { formatPrice } from "@/lib/format";

const screenReaderInstructions = {
  draggable:
    "Żeby przesunąć danie, naciśnij spację. Strzałkami zmień jego miejsce, spacją je upuść, klawiszem Escape anuluj.",
};

interface DishTileGridProps {
  /** Stabilny identyfikator tej siatki (jedna na kategorię) */
  contextId: string;
  /** Dania zaznaczone na ten dzień, w kolejności na stronie – tylko je można przeciągać */
  selected: Dish[];
  /** Pozostałe dania kategorii */
  others: Dish[];
  /** false = bez przeciągania (np. podczas wyszukiwania, gdy część dań jest odfiltrowana) */
  canReorder: boolean;
  onToggle: (dish: Dish) => void;
  /** Zaznaczone dania tej kategorii w nowej kolejności */
  onReorder: (orderedIds: string[]) => void;
}

/**
 * Kafelki dań jednej kategorii. Dotknięcie = „jest dziś” / „nie ma”. Zaznaczone stoją na początku i można je przeciągać:
 * myszką od razu, palcem po chwili przytrzymania (dzięki temu zwykłe przesunięcie palcem dalej przewija stronę),
 * z klawiatury przez uchwyt w rogu kafelka. Każda kategoria ma osobny kontekst, więc danie nie przejdzie do innej.
 */
export function DishTileGrid({ contextId, selected, others, canReorder, onToggle, onReorder }: DishTileGridProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = selected.map((dish) => dish.id);
  const showGrip = canReorder && selected.length > 1;

  const nameOf = (id: UniqueIdentifier) => selected.find((dish) => dish.id === id)?.name ?? "";
  const placeOf = (id: UniqueIdentifier) => ids.indexOf(String(id)) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Przesuwasz: ${nameOf(active.id)}. Miejsce ${placeOf(active.id)} z ${ids.length}.`,
    onDragOver: ({ active, over }) => (over ? `${nameOf(active.id)}: miejsce ${placeOf(over.id)} z ${ids.length}.` : undefined),
    onDragEnd: ({ active, over }) =>
      over ? `Upuszczono: ${nameOf(active.id)}, miejsce ${placeOf(over.id)} z ${ids.length}.` : `Anulowano: ${nameOf(active.id)}.`,
    onDragCancel: ({ active }) => `Anulowano: ${nameOf(active.id)}.`,
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onReorder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
  };

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{ announcements, screenReaderInstructions }}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy} disabled={!canReorder}>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {selected.map((dish) => (
            <SortableDishTile key={dish.id} dish={dish} showGrip={showGrip} onToggle={() => onToggle(dish)} />
          ))}
          {others.map((dish) => (
            <li key={dish.id}>
              <DishTile dish={dish} on={false} onToggle={() => onToggle(dish)} />
            </li>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableDishTile({ dish, showGrip, onToggle }: { dish: Dish; showGrip: boolean; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: dish.id,
    attributes: { roleDescription: "kafelek do przesuwania" },
  });
  const textOnly = isTextOnlyCategory(dish.category);

  return (
    // Myszka i palec działają na całym kafelku; klawiatura tylko na uchwycie (biblioteka sprawdza „activator”), więc
    // spacja na samym kafelku dalej go zaznacza i odznacza.
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cx(
        "relative touch-manipulation select-none [-webkit-touch-callout:none]",
        isDragging && "z-20 shadow-[0_14px_30px_-12px_rgb(24_21_18/0.5)]",
      )}
      {...listeners}
    >
      <DishTile dish={dish} on onToggle={onToggle} gripSpace={showGrip} />
      {showGrip ? (
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label={`Zmień kolejność: ${dish.name}`}
          className={cx(
            "absolute inline-flex cursor-grab items-center justify-center rounded-[3px] active:cursor-grabbing",
            textOnly ? "bottom-0.5 right-0.5 size-9 text-mute hover:text-ink" : "left-2 top-2 size-9 bg-ink/60 text-white",
          )}
          {...attributes}
        >
          <GripVertical className="size-5" aria-hidden="true" />
        </button>
      ) : null}
    </li>
  );
}

function DishTile({
  dish,
  on,
  onToggle,
  gripSpace = false,
}: {
  dish: Dish;
  on: boolean;
  onToggle: () => void;
  /** Kafelek ma uchwyt do przeciągania, więc potrzebuje na niego miejsca */
  gripSpace?: boolean;
}) {
  const showsPhoto = !isTextOnlyCategory(dish.category);
  const photo = showsPhoto ? dishPhotoUrl(dish.photo_path) : null;
  const tileId = `tile-${dish.id}`;

  // Kategorie bez zdjęć (patrz `textOnlyCategories` w src/data/menu.ts): zwarty wiersz z „ptaszkiem” zamiast
  // dużego pustego kafelka.
  if (!showsPhoto) {
    return (
      <button
        id={tileId}
        type="button"
        aria-pressed={on}
        onClick={onToggle}
        className={cx(
          "flex h-full w-full items-start gap-3 rounded-[3px] border-2 bg-white p-3.5 text-left transition-colors",
          on ? "border-accent" : "border-ink/15 hover:border-ink/40",
          // Uchwyt stoi w prawym dolnym rogu, obok ceny; bez ceny ostatnia linijka nazwy weszłaby pod niego.
          gripSpace && dish.price == null && "pb-9",
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors",
            on ? "border-accent bg-accent text-white" : "border-ink/30 text-transparent",
          )}
        >
          <Check className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-[1.0625rem] leading-snug">{dish.name}</span>
          {dish.price != null ? <span className="tabular mt-0.5 block text-sm font-semibold text-accent">{formatPrice(dish.price)}</span> : null}
          <span className="sr-only">{on ? " – jest w menu na ten dzień" : " – nie ma w menu na ten dzień"}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      id={tileId}
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={cx(
        "group relative block h-full w-full overflow-hidden rounded-[3px] border-2 bg-white text-left transition-colors",
        on ? "border-accent" : "border-ink/15 hover:border-ink/40",
      )}
    >
      <span className="relative block aspect-[4/3] bg-sand">
        {photo ? (
          <Image src={photo} alt="" fill unoptimized sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw" className="object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-mute" aria-hidden="true">
            <Utensils className="size-8 opacity-50" />
          </span>
        )}
        <span
          aria-hidden="true"
          className={cx(
            "absolute right-2 top-2 grid size-8 place-items-center rounded-full border-2 transition-colors",
            on ? "border-accent bg-accent text-white" : "border-white/90 bg-ink/35 text-transparent",
          )}
        >
          <Check className="size-5" />
        </span>
      </span>
      <span className="block px-3 pb-3 pt-2.5">
        <span className="block font-serif text-[1.0625rem] leading-snug">{dish.name}</span>
        {dish.price != null ? <span className="tabular mt-0.5 block text-sm font-semibold text-accent">{formatPrice(dish.price)}</span> : null}
        <span className="sr-only">{on ? " – jest w menu na ten dzień" : " – nie ma w menu na ten dzień"}</span>
      </span>
    </button>
  );
}
