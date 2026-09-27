"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/** next/image with a neutral fallback, so a missing file never shows a broken image. */
export function SafeImage({ src, alt, ...rest }: Omit<ImageProps, "src"> & { src: string | null | undefined }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className="img-fallback" role="img" aria-label={alt}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="1" />
          <circle cx="9" cy="9.5" r="1.8" />
          <path d="m3.5 17.5 5-5 4 4 3-3 5 5" />
        </svg>
      </span>
    );
  }
  return <Image src={src} alt={alt} onError={() => setFailed(true)} {...rest} />;
}
