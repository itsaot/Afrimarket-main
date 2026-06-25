import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/app-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AfriMarket - Discover, Buy, and Grow African Businesses" },
      {
        name: "description",
        content:
          "A premium B2B2C marketplace connecting verified African vendors with buyers worldwide. Browse fashion, beauty, food, decor, agriculture, and electronics.",
      },
      { property: "og:title", content: "AfriMarket - Discover, Buy, and Grow African Businesses" },
      {
        property: "og:description",
        content:
          "A premium B2B2C marketplace connecting verified African vendors with buyers worldwide.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, currency, category, image_url, vendor_id")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) return [];
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-white">
      <AppHeader />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-12 pb-16 sm:px-6 lg:pt-20 lg:pb-24">
        <div className="relative mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-reveal order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-primary">
              Connecting African Excellence
            </span>
            <h1 className="mt-6 text-5xl font-extrabold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
              Shop Verified. <br />
              Shop <span className="text-primary italic">African</span>.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-muted-foreground text-pretty leading-relaxed">
              Discover authentic products from trusted vendors across the continent. Real
              entrepreneurs. Real value. One inclusive marketplace.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-primary text-primary-foreground px-8 py-4 text-sm font-bold tracking-wide uppercase hover:bg-primary/90 transition-transform active:scale-95"
              >
                Shop Now
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup", role: "vendor" }}
                className="bg-white border-2 border-foreground px-8 py-4 text-sm font-bold tracking-wide uppercase hover:bg-foreground hover:text-white transition-all"
              >
                Sell on AfriMarket
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <div><span className="text-foreground font-bold text-base block">50k+</span>Merchants</div>
              <div className="h-8 w-px bg-border" />
              <div><span className="text-foreground font-bold text-base block">120k+</span>Products</div>
              <div className="h-8 w-px bg-border" />
              <div><span className="text-foreground font-bold text-base block">54</span>Countries</div>
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-sm hidden lg:block" />
            <div className="absolute -bottom-4 -right-4 w-40 h-40 border-2 border-primary rounded-sm hidden lg:block" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm ring-1 ring-black/10">
              <img
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85"
                alt="African women shopping at a vibrant marketplace"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur p-4 rounded-sm shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 grid place-items-center">
                    <ShieldCheck className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Verified Vendor</p>
                    <p className="text-sm font-bold">Pan-African Trust Network</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <div className="border-y border-border bg-stone-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-8 opacity-60 grayscale">
            <span className="font-mono text-xs font-bold uppercase tracking-widest">
              Verified by Pan-African Trust
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest">
              Secured Transactions
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest">
              50k+ Active Merchants
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest">
              Logistics Integrated
            </span>
          </div>
        </div>
      </div>

      {/* Why AfriMarket */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: ShieldCheck,
              title: "Verified Vendors",
              body: "Every seller is reviewed and ID-verified before going live, so buyers shop with confidence.",
            },
            {
              icon: Truck,
              title: "Pan-African Logistics",
              body: "Integrated shipping partners move goods from Lagos to Nairobi to anywhere globally.",
            },
            {
              icon: Sparkles,
              title: "AI Vendor Tools",
              body: "Smart description writing and category suggestions help vendors launch products in minutes.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="size-6 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-muted-foreground text-pretty">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-border bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Browse by Category</h2>
            <Link
              to="/products"
              className="font-mono text-xs font-bold uppercase border-b-2 border-primary pb-1"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to="/products"
                search={{ category: cat }}
                className="group overflow-hidden rounded-sm border border-border bg-white transition-colors hover:border-primary"
              >
                <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={CATEGORY_META[cat].image}
                    alt={cat}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">
                    {cat}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {CATEGORY_META[cat].blurb}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Exports</h2>
            <p className="text-muted-foreground mt-2">
              Curated quality from verified regional hubs.
            </p>
          </div>
          <Link
            to="/products"
            className="font-mono text-xs font-bold uppercase border-b-2 border-primary pb-1"
          >
            View All
          </Link>
        </div>

        {featured?.length ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={{ ...p, verified: true }} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border bg-stone-50 p-10 text-center">
            <p className="font-semibold">Vendor products will appear here.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create vendor listings from the dashboard to populate the marketplace.
            </p>
          </div>
        )}
      </section>

      {/* Lifestyle gallery */}
      <section className="border-t border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl mb-12">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">In the wild</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Made in Africa. Worn everywhere.</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              "https://images.unsplash.com/photo-1604881991720-f91add269bed?auto=format&fit=crop&w=900&q=85",
              "https://images.unsplash.com/photo-1567361808960-dec9cb578182?auto=format&fit=crop&w=900&q=85",
              "https://images.unsplash.com/photo-1591375275624-c0d486a3933e?auto=format&fit=crop&w=900&q=85",
              "https://images.unsplash.com/photo-1611174340580-30c8a08e0d20?auto=format&fit=crop&w=900&q=85",
            ].map((src, i) => (
              <div
                key={src}
                className={`overflow-hidden rounded-sm bg-stone-100 ${i % 2 === 0 ? "aspect-[3/4]" : "aspect-[3/4] lg:translate-y-8"}`}
              >
                <img src={src} alt="" loading="lazy" className="size-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-foreground text-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-balance">
              Grow your business on the continent's premium marketplace.
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-white/70 text-lg">
              Onboard in minutes. List products with AI-assisted descriptions. Reach buyers across
              Africa and beyond.
            </p>
            <Link
              to="/auth"
              search={{ mode: "signup", role: "vendor" }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-bold uppercase tracking-wide hover:bg-primary/90 transition-all"
            >
              Become a Vendor <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
