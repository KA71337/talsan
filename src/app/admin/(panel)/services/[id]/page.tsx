import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { loadServices } from "@/lib/content";

export const metadata: Metadata = { title: "Redaktə et" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = (await loadServices({ fresh: true })).find((s) => s.id === id);
  if (!service) notFound();
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Redaktə et: {service.title}</h1>
          <p>
            <Link href="/admin/services">← Xidmətlər</Link>
          </p>
        </div>
      </div>
      <ServiceForm service={service} />
    </>
  );
}
