"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __revealReady?: boolean;
  }
}

/**
 * Odsłania elementy z atrybutem `data-reveal`, gdy wchodzą w widok.
 * Ukrywanie robi CSS (globals.css) i tylko gdy JS działa oraz użytkownik nie
 * ma włączonego `prefers-reduced-motion`. Komponent nic nie renderuje.
 */
export function ScrollReveal() {
  useEffect(() => {
    // Sygnał dla bezpiecznika z <head> (layout.tsx): hydracja się powiodła.
    window.__revealReady = true;

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"),
    );

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.setAttribute("data-revealed", ""));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}
