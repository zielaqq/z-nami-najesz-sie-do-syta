import type { ReactNode } from "react";

import { cx } from "@/lib/cx";

export type SectionTone = "cream" | "paper" | "sand" | "ink";

const tones: Record<SectionTone, string> = {
  cream: "bg-cream",
  paper: "bg-paper",
  // Cieplejszy beż: sekcja opcjonalna (np. „Wydarzenia”) zawsze odcina się od sąsiadów, niezależnie od tego, czy jest.
  sand: "bg-sand",
  ink: "on-dark bg-ink text-cream",
};

interface SectionProps {
  id: string;
  /** `id` nagłówka opisującego sekcję (aria-labelledby) */
  labelledBy: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
}

/** Sekcja strony: jednolite odstępy, kotwica i semantyczne powiązanie z nagłówkiem. */
export function Section({ id, labelledBy, tone = "cream", className, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cx("relative py-20 sm:py-28 lg:py-32", tones[tone], className)}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: SectionTone;
  className?: string;
  /** Maksymalna szerokość tytułu (klasa Tailwind) */
  titleWidth?: string;
  /**
   * Animacja wejścia przy przewijaniu. Wyłącz (`false`) w treściach doładowywanych po wczytaniu strony
   * (np. wydarzenia z bazy) – skrypt animacji nie obejmuje elementów, które pojawiły się później.
   */
  reveal?: boolean;
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  tone = "cream",
  className,
  titleWidth = "max-w-[20ch]",
  reveal = true,
}: SectionHeadingProps) {
  const onDark = tone === "ink";
  return (
    <div className={cx("max-w-3xl", className)} {...(reveal ? { "data-reveal": "" } : {})}>
      <p className={cx("eyebrow flex items-center gap-3", onDark && "!text-accent-on-dark")}>
        <span aria-hidden="true" className="h-px w-8 bg-current" />
        {eyebrow}
      </p>
      <h2 id={id} className={cx("text-h2 mt-5", titleWidth, onDark && "!text-cream")}>
        {title}
      </h2>
      {lead ? (
        <p className={cx("text-lead mt-6 max-w-[58ch]", onDark ? "text-on-dark-mute" : "text-ink-soft")}>{lead}</p>
      ) : null}
    </div>
  );
}
