import Image from "next/image";
import { BRAND_NAME, LOGO } from "@/config/site";

/**
 * TalSan logo (client-supplied artwork, transparent background).
 * Size is controlled by CSS height only (width: auto) so the original proportions are always kept.
 */
export function Logo({ className, priority = false, sizes = "160px" }: { className?: string; priority?: boolean; sizes?: string }) {
  return (
    <Image
      src={LOGO.src}
      width={LOGO.width}
      height={LOGO.height}
      alt={BRAND_NAME}
      className={className ? `logo ${className}` : "logo"}
      sizes={sizes}
      preload={priority}
      quality={85}
    />
  );
}
