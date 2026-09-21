/**
 * Zmniejsza zdjęcie z telefonu przed wysłaniem (najdłuższy bok max `maxSide` px, JPEG).
 * Lekkie pliki = szybka strona i mały transfer (darmowy plan bazy ma limit pobrań).
 * `imageOrientation: "from-image"` uwzględnia obrót zapisany przez aparat, więc zdjęcia nie są „na boku”.
 */
export async function resizeImage(file: File, maxSide = 900, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Przeglądarka nie obsługuje przetwarzania zdjęć");
  // Przezroczyste tło (np. PNG) zamieniamy na białe, bo JPEG nie ma przezroczystości.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("Nie udało się przetworzyć zdjęcia");
  return blob;
}
