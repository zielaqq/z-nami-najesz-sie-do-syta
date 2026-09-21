import type { AnchorHTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "inverse" | "inverse-outline" | "accent";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-[3px] border font-semibold uppercase leading-tight tracking-[0.07em] text-center transition-colors duration-300 select-none";

const variants: Record<Variant, string> = {
  primary: "border-ink bg-ink text-cream hover:border-accent hover:bg-accent",
  secondary: "border-ink/70 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-cream",
  inverse: "border-cream bg-cream text-ink hover:border-white hover:bg-white",
  "inverse-outline":
    "border-cream/45 bg-transparent text-cream hover:border-cream hover:bg-cream hover:text-ink",
  accent: "border-accent bg-accent text-white hover:border-accent-deep hover:bg-accent-deep",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-4 py-2.5 text-[0.75rem]",
  md: "min-h-[3.25rem] px-6 py-3.5 text-[0.8125rem]",
  lg: "min-h-14 px-6 py-4 text-[0.8125rem] sm:px-8 sm:text-[0.875rem]",
};

/** Klasy przycisku – dla elementów <button>, które mają wyglądać jak przyciski-linki. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string): string {
  return cx(base, variants[variant], sizes[size], className);
}

interface ButtonLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  /** Link zewnętrzny – otwiera się w nowej karcie i informuje o tym czytniki ekranu */
  external?: boolean;
  children: ReactNode;
}

/**
 * Przycisk-link. Wszystkie akcje na stronie to linki (tel:, kotwice, adresy zewnętrzne),
 * dlatego jest to <a>, nie <button>.
 */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  icon,
  external = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a
      href={href}
      className={buttonClasses(variant, size, className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {icon ? <span className="shrink-0 [&>svg]:size-[1.15em]" aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
      {external ? <span className="sr-only"> (otwiera się w nowej karcie)</span> : null}
    </a>
  );
}
