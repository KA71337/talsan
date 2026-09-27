"use client";

import { useState } from "react";
import { SafeImage } from "@/components/SafeImage";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  return (
    <div className="gallery">
      <div className="gallery__main">
        <SafeImage
          key={current}
          src={current}
          alt={title}
          fill
          sizes="(max-width: 900px) 100vw, 700px"
          preload={active === 0}
          quality={85}
        />
      </div>
      {images.length > 1 && (
        <div className="gallery__thumbs" role="list">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="listitem"
              className="gallery__thumb"
              aria-current={i === active}
              aria-label={`Şəkil ${i + 1}`}
              onClick={() => setActive(i)}
            >
              <SafeImage src={src} alt="" fill sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
