import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container not-found">
      <span className="eyebrow">404</span>
      <h1 className="h1">Səhifə tapılmadı</h1>
      <p className="lead">Axtardığınız səhifə mövcud deyil və ya silinib.</p>
      <Link href="/" className="btn">
        Ana səhifəyə qayıt
      </Link>
    </section>
  );
}
