import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { loadSettings } from "@/lib/content";

export const metadata: Metadata = { title: "Mətnlər" };

export default async function TextsAdminPage() {
  const settings = await loadSettings({ fresh: true });
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Mətnlər</h1>
          <p>Saytdakı başlıqlar, təsvirlər və bölmə şəkilləri.</p>
        </div>
      </div>
      <SettingsForm initial={settings} section="texts" />
    </>
  );
}
