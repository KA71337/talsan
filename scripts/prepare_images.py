"""
Prepare the client's original photos (project root) for the web.

- Originals stay untouched in the project root.
- Output: public/images/client/<name>.webp (max 1600px, EXIF stripped)
- Output: src/config/client-images.json (manifest used by the site + admin library)

Classification below was made from automated pixel analysis (colour, background,
composition), NOT from visual review. Verify labels and replace via the admin panel.

Run: python scripts/prepare_images.py   (requires Pillow)
"""
import json
import os
from PIL import Image, ImageChops, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "images", "client")
MANIFEST = os.path.join(ROOT, "src", "config", "client-images.json")
P = "WhatsApp Image 2026-09-15 at "

# (source, output name, mode, group)
#   mode "product": crop/pad around the object to 4:3 (product cards & galleries)
#   mode "photo":   keep composition, only resize
IMAGES = [
    # Light background product shots (yellow/orange equipment, likely generators)
    (P + "21.50.38.jpeg", "generator-01", "product", "generator"),
    (P + "21.50.39.jpeg", "generator-02", "product", "generator"),
    (P + "21.50.41.jpeg", "generator-03", "product", "generator"),
    (P + "21.50.41 (1).jpeg", "generator-04", "product", "generator"),
    (P + "21.50.43 (3).jpeg", "generator-05", "product", "generator"),
    (P + "21.50.43 (4).jpeg", "generator-06", "product", "generator"),
    (P + "21.50.43 (2).jpeg", "generator-07", "product", "generator"),
    (P + "21.50.40.jpeg", "generator-08", "product", "generator"),
    (P + "21.50.41 (4).jpeg", "generator-09", "crop", "generator"),
    # Grey studio background shots
    (P + "21.50.44.jpeg", "equipment-studio-01", "crop", "equipment"),
    (P + "21.50.44 (1).jpeg", "equipment-studio-02", "crop", "equipment"),
    (P + "21.50.44 (2).jpeg", "equipment-studio-03", "crop", "equipment"),
    (P + "21.50.44 (6).jpeg", "equipment-studio-04", "crop", "equipment"),
    (P + "21.50.43.jpeg", "equipment-studio-05", "crop", "equipment"),
    # Box-shaped units on dark background (likely stabilizers)
    (P + "22.10.19.jpeg", "stabilizer-01", "photo", "stabilizer"),
    (P + "22.10.20.jpeg", "stabilizer-02", "photo", "stabilizer"),
    (P + "22.10.20 (1).jpeg", "stabilizer-03", "photo", "stabilizer"),
    (P + "22.10.20 (2).jpeg", "stabilizer-04", "photo", "stabilizer"),
    (P + "22.10.21.jpeg", "stabilizer-05", "photo", "stabilizer"),
    (P + "22.10.21 (1).jpeg", "stabilizer-06", "photo", "stabilizer"),
    # Darker, busier real-environment photos
    (P + "21.50.40 (1).jpeg", "onsite-01", "photo", "onsite"),
    (P + "21.50.40 (2).jpeg", "onsite-02", "photo", "onsite"),
    (P + "21.50.42.jpeg", "onsite-03", "photo", "onsite"),
    (P + "21.50.42 (1).jpeg", "onsite-04", "photo", "onsite"),
    (P + "21.50.43 (5).jpeg", "onsite-05", "photo", "onsite"),
    # Portrait shots
    (P + "21.50.41 (2).jpeg", "portrait-01", "photo", "portrait"),
    (P + "21.50.41 (3).jpeg", "portrait-02", "product", "portrait"),
    (P + "21.50.41 (5).jpeg", "portrait-03", "photo", "portrait"),
    (P + "21.50.43 (1).jpeg", "portrait-04", "photo", "portrait"),
    (P + "21.50.44 (3).jpeg", "portrait-05", "photo", "portrait"),
    (P + "21.50.44 (4).jpeg", "portrait-06", "photo", "portrait"),
    (P + "21.50.44 (5).jpeg", "portrait-07", "photo", "portrait"),
]

GROUP_LABEL = {
    "generator": "Generator (açıq fon)",
    "equipment": "Avadanlıq (boz fon)",
    "stabilizer": "Stabilizator",
    "onsite": "Real mühit",
    "portrait": "Şaquli foto",
}

MAX_SIDE = 1600


def content_bbox(im):
    """Bounding box of the object, ignoring the top-right corner (small overlay mark)."""
    w, h = im.size
    bg = im.getpixel((4, h // 2))
    diff = ImageChops.difference(im, Image.new("RGB", im.size, bg)).convert("L")
    mask = diff.point(lambda v: 255 if v > 30 else 0)
    # ignore top-right corner area when locating the object
    mask.paste(0, (int(w * 0.80), 0, w, int(h * 0.26)))
    return mask.getbbox() or (0, 0, w, h), bg


def to_product(im, ratio=4 / 3, margin=0.08):
    w, h = im.size
    (x0, y0, x1, y1), bg = content_bbox(im)
    bw, bh = x1 - x0, y1 - y0
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    bw, bh = bw * (1 + 2 * margin), bh * (1 + 2 * margin)
    if bw / bh > ratio:
        bh = bw / ratio
    else:
        bw = bh * ratio
    left, top = int(round(cx - bw / 2)), int(round(cy - bh / 2))
    right, bottom = int(round(cx + bw / 2)), int(round(cy + bh / 2))
    canvas = Image.new("RGB", (right - left, bottom - top), bg)
    src = im.crop((max(left, 0), max(top, 0), min(right, w), min(bottom, h)))
    canvas.paste(src, (max(0, -left), max(0, -top)))
    return canvas


def center_crop(im, ratio=4 / 3):
    """Crop to ratio without padding (for gradient/studio backgrounds)."""
    w, h = im.size
    if w / h > ratio:
        nw = int(h * ratio)
        left = (w - nw) // 2
        return im.crop((left, 0, left + nw, h))
    nh = int(w / ratio)
    top = (h - nh) // 2
    return im.crop((0, top, w, top + nh))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    manifest = []
    for src, name, mode, group in IMAGES:
        path = os.path.join(ROOT, src)
        im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        if mode == "product":
            out = to_product(im)
        elif mode == "crop":
            out = center_crop(im)
        else:
            out = im
        out.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
        dest = os.path.join(OUT_DIR, name + ".webp")
        out.save(dest, "WEBP", quality=82, method=6)
        manifest.append({
            "src": f"/images/client/{name}.webp",
            "width": out.size[0],
            "height": out.size[1],
            "group": group,
            "label": GROUP_LABEL[group],
            "original": src,
        })
        print(f"{src} -> {name}.webp {out.size} {os.path.getsize(dest) // 1024}KB")
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
