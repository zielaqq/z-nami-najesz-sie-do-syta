"use client";

import { useState, type FormEvent } from "react";

import { NoticeBanner, fieldClass, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase/client";

/** Logowanie klientki (e-mail + hasło). Konto zakłada administrator strony – patrz docs/PANEL-MENU.md. */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<PanelNotice | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        const text = /invalid login credentials/i.test(error.message)
          ? "Nieprawidłowy e-mail lub hasło. Wpisz oba ręcznie, bez spacji na końcu."
          : /email not confirmed/i.test(error.message)
            ? "Ten adres e-mail nie został jeszcze potwierdzony (potwierdź konto w Supabase)."
            : `Nie udało się zalogować (kod: ${error.code ?? error.status ?? "nieznany"}: ${error.message}).`;
        setNotice({ tone: "error", text });
      }
      // Po udanym logowaniu panel sam przechodzi dalej (zmiana stanu sesji).
    } catch {
      setNotice({ tone: "error", text: "Brak połączenia z bazą. Spróbuj ponownie za chwilę." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm border border-ink/15 bg-white p-6 sm:p-8">
      <h2 className="font-serif text-2xl leading-snug">Zaloguj się</h2>
      <p className="mt-2 text-sm text-ink-soft">Panel do codziennego ustawiania menu restauracji.</p>

      <label className="mt-6 block text-sm font-semibold">
        E-mail
        <input
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="mt-4 block text-sm font-semibold">
        Hasło
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClass}
        />
      </label>

      <NoticeBanner notice={notice} className="mt-4" />

      <button type="submit" disabled={busy} className={buttonClasses("primary", "lg", "mt-6 w-full disabled:opacity-60")}>
        {busy ? "Loguję…" : "Zaloguj się"}
      </button>
    </form>
  );
}
