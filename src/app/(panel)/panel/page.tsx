import type { Metadata } from "next";

import { PanelApp } from "@/components/panel/PanelApp";

// Panel klientki: ukryty przed wyszukiwarkami, nie jest nigdzie linkowany na stronie publicznej.
export const metadata: Metadata = {
  title: "Panel menu",
  robots: { index: false, follow: false },
};

export default function PanelPage() {
  return <PanelApp />;
}
