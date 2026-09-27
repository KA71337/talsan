import type { Metadata } from "next";
import Link from "next/link";
import { ServiceForm } from "@/components/admin/ServiceForm";

export const metadata: Metadata = { title: "Xidmət əlavə et" };

export default function NewServicePage() {
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Xidmət əlavə et</h1>
          <p>
            <Link href="/admin/services">← Xidmətlər</Link>
          </p>
        </div>
      </div>
      <ServiceForm />
    </>
  );
}
