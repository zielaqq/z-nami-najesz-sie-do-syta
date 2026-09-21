/** Dane strukturalne JSON-LD. Znak `<` jest zamieniany, aby treść nie mogła zamknąć znacznika <script>. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
