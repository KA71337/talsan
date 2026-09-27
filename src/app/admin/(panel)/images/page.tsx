import type { Metadata } from "next";
import { ImageLibrary } from "@/components/admin/ImageLibrary";

export const metadata: Metadata = { title: "Şəkillər" };

export default function ImagesPage() {
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Şəkillər</h1>
          <p>
            Yüklənən şəkillər avtomatik WEBP formatına çevrilir və ölçüsü optimallaşdırılır. İstifadə olunan şəkli silmək
            olmaz — əvvəlcə məhsuldan/xidmətdən çıxarın.
          </p>
        </div>
      </div>
      <ImageLibrary />
    </>
  );
}
