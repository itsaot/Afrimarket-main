import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/app-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { formatPrice, vendorTag } from "@/lib/format";
import { useCart } from "@/lib/cart-store";

export const Route = createFileRoute("/products/$productId")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, price, currency, category, image_url, vendor_id")
      .eq("id", params.productId)
      .maybeSingle();
    if (error || !data) {
      if (error) throw error;
      throw notFound();
    }
    const { data: vendor } = await supabase
      .from("profiles")
      .select("business_name, full_name, country, verified, bio")
      .eq("id", data.vendor_id)
      .maybeSingle();
    return { product: data, vendor };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} - AfriMarket` },
          {
            name: "description",
            content:
              loaderData.product.description.slice(0, 160) ||
              `${loaderData.product.name} on AfriMarket.`,
          },
          { property: "og:title", content: `${loaderData.product.name} - AfriMarket` },
          {
            property: "og:description",
            content:
              loaderData.product.description.slice(0, 160) ||
              `${loaderData.product.name} on AfriMarket.`,
          },
          ...(loaderData.product.image_url
            ? [{ property: "og:image", content: loaderData.product.image_url }]
            : []),
        ]
      : [{ title: "Product - AfriMarket" }],
  }),
  errorComponent: () => <ProductError />,
  notFoundComponent: () => <ProductError />,
  component: ProductDetail,
});

function ProductError() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-extrabold tracking-tighter mb-4">Product unavailable</h1>
        <p className="text-muted-foreground mb-8">
          This product may have been removed or never existed.
        </p>
        <Link
          to="/products"
          className="bg-foreground text-white px-6 py-3 text-xs font-bold uppercase tracking-widest"
        >
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}

function ProductDetail() {
  const { product, vendor } = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const { data: related } = useQuery({
    queryKey: ["related", product.category, product.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, currency, category, image_url, vendor_id")
        .eq("category", product.category)
        .neq("id", product.id)
        .limit(3);
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="size-3" /> Back to marketplace
        </Link>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-stone-100 ring-1 ring-black/5 overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full grid place-items-center">
                <span className="text-xs font-mono uppercase tracking-widest text-stone-400">
                  {product.category}
                </span>
              </div>
            )}
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
              {product.category}
            </span>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tighter">{product.name}</h1>
            <p className="mt-4 font-mono text-2xl font-bold text-primary">
              {formatPrice(product.price, product.currency)}
            </p>

            <div className="mt-8 prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "No description provided."}
              </p>
            </div>

            <div className="mt-8 border border-border p-5 bg-stone-50 rounded-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">
                    {vendor?.business_name || vendor?.full_name || "Verified Vendor"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {vendorTag(product.vendor_id)}
                  </p>
                  {vendor?.bio ? (
                    <p className="text-xs text-muted-foreground mt-2">{vendor.bio}</p>
                  ) : null}
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary mt-3">
                    Trusted African Business
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  add({
                    productId: product.id,
                    vendorId: product.vendor_id,
                    name: product.name,
                    price: Number(product.price),
                    currency: product.currency,
                    imageUrl: product.image_url,
                  });
                  toast.success("Added to cart");
                }}
                className="bg-primary text-primary-foreground px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-transform active:scale-95"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => setInquiryOpen(true)}
                className="border-2 border-foreground px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors"
              >
                Contact Vendor
              </button>
            </div>
          </div>
        </div>

        {related && related.length > 0 ? (
          <div className="mt-24">
            <h2 className="text-2xl font-bold mb-8">Related products</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={{ ...p, verified: true }} />
              ))}
            </div>
          </div>
        ) : null}
      </section>
      {inquiryOpen ? (
        <InquiryDialog
          productId={product.id}
          vendorId={product.vendor_id}
          onClose={() => setInquiryOpen(false)}
        />
      ) : null}
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}

function InquiryDialog({
  productId,
  vendorId,
  onClose,
}: {
  productId: string;
  vendorId: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert({
      product_id: productId,
      vendor_id: vendorId,
      buyer_name: name,
      buyer_email: email,
      message,
    });
    setSubmitting(false);
    if (error) {
      toast.error("We could not send your inquiry. Please try again.");
      return;
    }
    toast.success("Inquiry sent. The vendor will reach out.");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="bg-white max-w-md w-full p-8 rounded-sm border border-border"
      >
        <h3 className="text-2xl font-extrabold tracking-tighter mb-1">Contact vendor</h3>
        <p className="text-sm text-muted-foreground mb-6">We'll send your message directly.</p>
        <div className="space-y-4">
          <input
            required
            maxLength={100}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
          <input
            required
            type="email"
            maxLength={255}
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
          <textarea
            required
            maxLength={1000}
            placeholder="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-primary-foreground px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send inquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}
