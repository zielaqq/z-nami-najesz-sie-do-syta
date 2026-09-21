import { cx } from "@/lib/cx";

export interface PanelNotice {
  tone: "ok" | "error";
  text: string;
}

/** Komunikat w panelu (odczytywany przez czytniki ekranu). */
export function NoticeBanner({ notice, className }: { notice: PanelNotice | null; className?: string }) {
  return (
    <div aria-live="polite" className={className}>
      {notice ? (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={cx(
            "border px-4 py-3 text-[0.9375rem]",
            notice.tone === "error"
              ? "border-accent/40 bg-accent/5 text-accent-deep"
              : "border-ink/20 bg-white text-ink",
          )}
        >
          {notice.text}
        </p>
      ) : null}
    </div>
  );
}

/** Wspólny wygląd pól formularza (16 px, żeby telefon nie powiększał strony przy wpisywaniu). */
export const fieldClass =
  "mt-1.5 block w-full rounded-[3px] border border-ink/30 bg-white px-3.5 py-3 text-base text-ink placeholder:text-mute";
