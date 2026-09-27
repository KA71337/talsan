"use client";

import { useState } from "react";

export function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: fd.get("username"), password: fd.get("password") }),
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Giriş alınmadı");
      window.location.assign(next);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label className="field">
        <span>İstifadəçi adı</span>
        <input className="input" name="username" autoComplete="username" defaultValue="admin" required maxLength={100} />
      </label>
      <label className="field">
        <span>Şifrə</span>
        <input className="input" name="password" type="password" autoComplete="current-password" required maxLength={200} autoFocus />
      </label>
      {error && (
        <p className="adm-alert adm-alert--error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn--accent btn--block" type="submit" disabled={busy}>
        {busy ? "Yoxlanılır…" : "Daxil ol"}
      </button>
    </form>
  );
}
