/**
 * Prepares the client-supplied TalSan logo for the web.
 *
 * Source: assets/brand/talsan-logo-source.jpg — the original logo delivered by the client
 * (a JPEG with the logo placed on a solid near-black background).
 *
 * The logo itself is NOT redrawn or modified. The script only:
 *   1. removes the black background ("colour to alpha" against black, so anti-aliased
 *      edges stay smooth and the logo looks identical on a dark surface);
 *   2. trims the empty background around the logo (with a small transparent margin —
 *      no part of the logo is cut off), keeping the original pixel size and proportions.
 *
 * Outputs:
 *   public/brand/talsan-logo.png   — full logo, transparent background (header, footer, admin)
 *   public/brand/talsan-og.png     — 1200×630 Open Graph image (logo on the brand's dark background)
 *   src/app/icon.png               — favicon (the logo's mark on a dark tile)
 *   src/app/apple-icon.png         — Apple touch icon
 *
 * Run: node scripts/prepare-logo.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "assets/brand/talsan-logo-source.jpg";
const BG = { r: 14, g: 16, b: 18 }; // --ink-950, matches the site's dark surfaces

// Background noise in the source JPEG peaks at 18 (measured), so everything ≤ FLOOR is background.
const FLOOR = 22;
// Brightness from which a pixel is treated as fully opaque logo colour.
const SOLID = 225;
const PAD = 8;

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

// 1) colour → alpha
const rgba = Buffer.alloc(W * H * 4);
for (let i = 0, j = 0; i < W * H * 3; i += 3, j += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const m = Math.max(r, g, b);
  const a = Math.min(1, Math.max(0, (m - FLOOR) / (SOLID - FLOOR)));
  if (a <= 0) continue; // fully transparent
  // Un-premultiply against black with a uniform factor (keeps the hue of coloured edges).
  const k = Math.min(1 / a, 255 / m);
  rgba[j] = Math.round(r * k);
  rgba[j + 1] = Math.round(g * k);
  rgba[j + 2] = Math.round(b * k);
  rgba[j + 3] = Math.round(a * 255);
}

// 2) bounding box of the logo (any non-transparent pixel)
let x0 = W, y0 = H, x1 = -1, y1 = -1;
const rowHas = new Array(H).fill(false);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (rgba[(y * W + x) * 4 + 3] > 0) {
      rowHas[y] = true;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
}
const left = Math.max(0, x0 - PAD);
const top = Math.max(0, y0 - PAD);
const cropW = Math.min(W, x1 + PAD + 1) - left;
const cropH = Math.min(H, y1 + PAD + 1) - top;

const full = sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).extract({ left, top, width: cropW, height: cropH });

mkdirSync("public/brand", { recursive: true });
const logoPng = await full.clone().png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
await sharp(logoPng).toFile("public/brand/talsan-logo.png");
console.log(`logo: ${cropW}×${cropH} (source bbox ${x0},${y0} → ${x1},${y1})`);

// 3) The mark (monogram) = first block of rows before the first fully empty gap under it.
let markEnd = y0;
for (let y = y0; y <= y1; y++) {
  if (rowHas[y]) markEnd = y;
  else if (y - markEnd > 12) break;
}
let mx0 = W, mx1 = -1;
for (let y = y0; y <= markEnd; y++) {
  for (let x = 0; x < W; x++) {
    if (rgba[(y * W + x) * 4 + 3] > 0) {
      if (x < mx0) mx0 = x;
      if (x > mx1) mx1 = x;
    }
  }
}
const markW = mx1 - mx0 + 1;
const markH = markEnd - y0 + 1;
const mark = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left: mx0, top: y0, width: markW, height: markH })
  .png()
  .toBuffer();
console.log(`mark: ${markW}×${markH}`);

async function tile(size, { radius, scale }) {
  const inner = Math.round(size * scale);
  const m = await sharp(mark).resize(inner, inner, { fit: "inside" }).toBuffer();
  const bg = radius
    ? Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="rgb(${BG.r},${BG.g},${BG.b})"/></svg>`,
      )
    : { create: { width: size, height: size, channels: 4, background: { ...BG, alpha: 1 } } };
  return sharp(bg).composite([{ input: m, gravity: "center" }]).png({ compressionLevel: 9 }).toBuffer();
}

await sharp(await tile(512, { radius: 96, scale: 0.74 })).toFile("src/app/icon.png");
await sharp(await tile(180, { radius: 0, scale: 0.7 })).toFile("src/app/apple-icon.png");

// 4) Open Graph 1200×630 — full logo centred on the dark brand background.
const ogLogo = await sharp(logoPng).resize({ height: 400, fit: "inside" }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: { ...BG, alpha: 1 } } })
  .composite([{ input: ogLogo, gravity: "center" }])
  .png({ compressionLevel: 9 })
  .toFile("public/brand/talsan-og.png");

console.log("done");
