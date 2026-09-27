import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Proxy already protects /admin/*; this is a second, server-side check.
  if (!(await verifySession((await cookies()).get(SESSION_COOKIE)?.value))) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
