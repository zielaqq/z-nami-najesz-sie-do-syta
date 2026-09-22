/** Pobiera jeden plik spod adresu na komputer odwiedzającego, pod wskazaną nazwą. */
async function downloadOne(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

/**
 * Pobiera kilka plików jeden po drugim (z małym odstępem, żeby przeglądarka nie zablokowała wielu pobrań naraz).
 * Nic nie zmienia w bazie ani w magazynie – to tylko zapis kopii na komputerze odwiedzającego.
 */
export async function downloadFiles(
  items: Array<{ src: string; filename: string }>,
  onProgress?: (done: number, total: number) => void,
): Promise<{ done: number; failed: string[] }> {
  const failed: string[] = [];
  for (const [index, item] of items.entries()) {
    onProgress?.(index, items.length);
    try {
      await downloadOne(item.src, item.filename);
    } catch {
      failed.push(item.filename);
    }
    if (index < items.length - 1) await new Promise((resolve) => setTimeout(resolve, 300));
  }
  onProgress?.(items.length, items.length);
  return { done: items.length - failed.length, failed };
}

/** Nazwa pliku bez znaków niedozwolonych w systemie plików. */
export function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "").trim() || "zdjecie";
}
