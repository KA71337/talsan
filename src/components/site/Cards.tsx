import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SafeImage } from "@/components/SafeImage";
import { contextualInquiryMessage } from "@/config/contact";
import { formatPrice, whatsappHref } from "@/lib/format";
import type { Category, Product, Service } from "@/lib/types";

export function ServiceCard({ service, index, whatsapp }: { service: Service; index: number; whatsapp: string }) {
  const inquiryHref = whatsappHref(whatsapp, contextualInquiryMessage(service.title));
  return (
    <article className="service-card">
      <div className="service-card__top">
        <span className="service-card__icon">
          <Icon name={service.icon} />
        </span>
        <span className="service-card__num">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="h3">{service.title}</h3>
      {service.summary && <p>{service.summary}</p>}
      <div className="service-card__actions">
        {inquiryHref && (
          <a href={inquiryHref} className="link-arrow" target="_blank" rel="noopener noreferrer">
            Sorğu göndər <Icon name="arrow" />
          </a>
        )}
        <Link href={`/services#${service.slug}`} className="link-muted">
          Ətraflı
        </Link>
      </div>
    </article>
  );
}

export function ProductCard({
  product,
  category,
  priority = false,
}: {
  product: Product;
  category?: Category;
  priority?: boolean;
}) {
  const price = formatPrice(product.price);
  return (
    <article className="product-card">
      <div className="product-card__media">
        {category && <span className="product-card__badge">{category.name}</span>}
        <SafeImage
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          preload={priority}
        />
      </div>
      <div className="product-card__body">
        <h3 className="h3 product-card__title">
          <Link href={`/product/${product.slug}`}>{product.title}</Link>
        </h3>
        {product.description && <p className="product-card__desc">{product.description}</p>}
        <div className="product-card__foot">
          {price ? <span className="price">{price}</span> : <span className="price--ask">Qiymət üçün əlaqə saxlayın</span>}
          <span className="product-card__more" aria-hidden="true">
            <Icon name="arrow" />
          </span>
        </div>
      </div>
    </article>
  );
}
