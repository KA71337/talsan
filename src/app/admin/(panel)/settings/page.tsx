import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { loadSettings } from "@/lib/content";
import { storageInfo } from "@/lib/storage";

export const metadata: Metadata = { title: "Parametrlər" };

export default async function SettingsAdminPage() {
  const settings = await loadSettings({ fresh: true });
  const st = storageInfo();
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Parametrlər</h1>
          <p>Brend, SEO və məlumat anbarı.</p>
        </div>
      </div>
      <SettingsForm initial={settings} section="general" />
      <div className="adm-card" style={{ marginTop: 16 }}>
        <h2>Məlumat anbarı</h2>
        {st.kind === "github" ? (
          <p className="adm-alert adm-alert--ok">
            GitHub qoşulub: {st.owner}/{st.repo} · {st.branch}
          </p>
        ) : (
          <p className="adm-alert adm-alert--info">
            Lokal rejim (GitHub qoşulmayıb). Vercel-də dəyişiklikləri yadda saxlamaq üçün GITHUB_TOKEN, GITHUB_OWNER,
            GITHUB_REPO dəyişənlərini təyin edin.
          </p>
        )}
        <table className="adm-table" style={{ marginTop: 12 }}>
          <tbody>
            <tr>
              <td>Məhsullar</td>
              <td className="mono">{st.productsPath}</td>
            </tr>
            <tr>
              <td>Xidmətlər</td>
              <td className="mono">{st.servicesPath}</td>
            </tr>
            <tr>
              <td>Kateqoriyalar</td>
              <td className="mono">{st.categoriesPath}</td>
            </tr>
            <tr>
              <td>Parametrlər</td>
              <td className="mono">{st.settingsPath}</td>
            </tr>
            <tr>
              <td>Şəkillər</td>
              <td className="mono">{st.uploadsDir}/</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
