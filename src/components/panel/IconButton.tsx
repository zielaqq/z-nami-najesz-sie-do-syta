import type { ReactNode } from "react";

/** Kwadratowy przycisk z ikoną w panelu (strzałki kolejności, edycja, usuwanie). `label` czytają czytniki ekranu. */
export function IconButton({
  id,
  label,
  disabled,
  danger,
  onClick,
  children,
}: {
  id?: string;
  label: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-11 min-w-11 items-center justify-center rounded-[3px] border transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "border-accent/40 text-accent-deep hover:border-accent hover:bg-accent/5"
          : "border-ink/25 text-ink hover:border-ink hover:bg-ink/5 disabled:hover:border-ink/25 disabled:hover:bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}
