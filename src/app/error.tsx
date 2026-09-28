"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="container error-state" role="main">
      <span className="eyebrow">Xəta</span>
      <h1 className="h1">Səhifəni göstərmək mümkün olmadı</h1>
      <p className="lead">Müvəqqəti problem yarandı. Yenidən cəhd edin və ya ana səhifəyə qayıdın.</p>
      <div className="error-state__actions">
        <button type="button" className="btn btn--accent" onClick={reset}>
          Yenidən cəhd et
        </button>
        <a className="btn btn--ghost" href="/">
          Ana səhifə
        </a>
      </div>
    </main>
  );
}
