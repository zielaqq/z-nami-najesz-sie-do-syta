"use client";

import { useState } from "react";

import { NoticeBanner, type PanelNotice } from "@/components/panel/NoticeBanner";
import { ChevronDown, ChevronUp } from "@/components/ui/icons";
import { menuCategories, type MenuCategoryId } from "@/data/menu";
import { describeError } from "@/lib/panel-data";
import { setMenuCategoryOrder } from "@/lib/panel-settings";

interface CategoryOrderManagerProps {
  order: MenuCategoryId[];
  onSaved: (order: MenuCategoryId[]) => void;
}

const labelFor = (id: MenuCategoryId) => menuCategories.find((category) => category.id === id)?.label ?? id;

/**
 * Kolejność kategorii menu (strzałki w górę/w dół) – ta sama kolejność pokazuje się na stronie i w całym panelu.
 * Zmiana zapisuje się od razu, tak jak kolejność zdjęć w galerii.
 */
export function CategoryOrderManager({ order, onSaved }: CategoryOrderManagerProps) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<PanelNotice | null>(null);

  const move = async (index: number, direction: -1 | 1) => {
    const to = index + direction;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[index], next[to]] = [next[to], next[index]];
    setBusy(true);
    setNotice(null);
    try {
      await setMenuCategoryOrder(next);
      onSaved(next);
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 border border-ink/15 bg-white p-5">
      <h3 className="font-serif text-xl">Kolejność kategorii</h3>
      <p className="max-w-[52ch] text-sm text-mute">
        W tej kolejności kategorie pojawiają się na stronie i w panelu (Baza dań, Menu na dziś).
      </p>
      <NoticeBanner notice={notice} className="mt-3" />
      <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
        {order.map((id, index) => (
          <li key={id} className="flex items-center justify-between gap-4 py-2.5">
            <span className="font-medium">{labelFor(id)}</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy || index === 0}
                onClick={() => void move(index, -1)}
                aria-label={`Przesuń kategorię „${labelFor(id)}” w górę`}
                className="inline-flex size-11 items-center justify-center rounded-[3px] border border-ink/25 hover:border-ink hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/25 disabled:hover:bg-transparent"
              >
                <ChevronUp className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={busy || index === order.length - 1}
                onClick={() => void move(index, 1)}
                aria-label={`Przesuń kategorię „${labelFor(id)}” w dół`}
                className="inline-flex size-11 items-center justify-center rounded-[3px] border border-ink/25 hover:border-ink hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/25 disabled:hover:bg-transparent"
              >
                <ChevronDown className="size-5" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
