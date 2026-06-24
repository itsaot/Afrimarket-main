import { Link } from "@tanstack/react-router";
import { formatPrice, vendorTag } from "@/lib/format";

export interface ProductCardData {
  id: string;
  name: string;
  price: number | string;
  currency: string;
  category: string;
  image_url: string | null;
  vendor_id: string;
  vendor_name?: string | null;
  verified?: boolean;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      to="/products/$productId"
      params={{ productId: product.id }}
      className="group relative block"
    >
      <div className="aspect-[4/5] bg-stone-100 ring-1 ring-black/5 rounded-sm overflow-hidden transition-all group-hover:ring-primary/20">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full grid place-items-center">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">
              {product.category}
            </span>
          </div>
        )}
      </div>
      <div className="mt-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {product.verified ? (
              <span className="bg-foreground text-white px-2 py-0.5 text-[10px] font-mono font-bold tracking-tighter">
                VERIFIED
              </span>
            ) : null}
            <span className="text-[10px] text-muted-foreground font-mono">
              {vendorTag(product.vendor_id)}
            </span>
          </div>
          <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {product.vendor_name || product.category}
          </p>
        </div>
        <p className="font-mono font-bold text-primary whitespace-nowrap">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  );
}
