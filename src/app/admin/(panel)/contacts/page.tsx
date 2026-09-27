import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { loadSettings } from "@/lib/content";

export const metadata: Metadata = { title: "Əlaqə məlumatları" };

export default async function ContactsAdminPage() {
  const settings = await loadSettings({ fresh: true });
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Əlaqə məlumatları</h1>
          <p>Telefon, WhatsApp, e-poçt, ünvan və sosial şəbəkələr.</p>
        </div>
      </div>
      <SettingsForm initial={settings} section="contact" />
    </>
  );
}
