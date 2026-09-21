import type { SVGProps } from "react";

/**
 * Ikony: z biblioteki lucide-react (spójny styl kreski) + kilka własnych,
 * których w lucide nie ma (znaki marek).
 */
export {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Menu as MenuIcon,
  Navigation,
  Phone,
  X as CloseIcon,
} from "lucide-react";

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 21v-7.5h2.53l.47-3H13.5V8.6c0-.87.3-1.6 1.6-1.6h1.5V4.3c-.27-.04-1.2-.12-2.27-.12-2.25 0-3.83 1.37-3.83 3.9v2.42H8V13.5h2.5V21h3Z" />
    </svg>
  );
}

/** Talerz – tymczasowy znak graficzny logotypu tekstowego. */
export function PlateMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <circle cx="16" cy="16" r="14.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="2.6" fill="var(--color-accent)" />
    </svg>
  );
}
