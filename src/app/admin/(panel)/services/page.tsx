import type { Metadata } from "next";
import Link from "next/link";
import { ServicesTable } from "@/components/admin/ServicesTable";
import { loadServices } from "@/lib/content";

export const metadata: Metadata = { title: "Xidmətlər" };

export default async function ServicesAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [services, sp] = await Promise.all([loadServices({ fresh: true }), searchParams]);
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Xidmətlər</h1>
          <p>Ana səhifədə və “Xidmətlər” səhifəsində göstərilir. Sıranı oxlarla dəyişin.</p>
        </div>
        <Link href="/admin/services/new" className="btn btn--accent">
          Xidmət əlavə et
        </Link>
      </div>
      {sp.saved && (
        <p className="adm-alert adm-alert--ok" style={{ marginBottom: 16 }}>
          Yadda saxlanıldı.
        </p>
      )}
      <ServicesTable services={services} />
    </>
  );
}
