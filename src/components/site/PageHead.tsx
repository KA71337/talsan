import Link from "next/link";

export function PageHead({
  title,
  lead,
  eyebrow,
  crumbs = [],
}: {
  title: string;
  lead?: string;
  eyebrow?: string;
  crumbs?: { href?: string; label: string }[];
}) {
  const all = [{ href: "/", label: "Ana səhifə" }, ...crumbs];
  return (
    <section className="page-head">
      <div className="container page-head__inner">
        <nav aria-label="Naviqasiya zənciri" className="crumbs">
          <ol>
            {all.map((c, i) => (
              <li key={i}>
                {c.href && i < all.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="h1">{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
    </section>
  );
}
