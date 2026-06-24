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
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 lg:pt-24 lg:pb-32">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 hidden w-1/2 opacity-15 md:block"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=1400&q=85')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background to-background/80" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl animate-reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-primary">
              Connecting African Excellence
            </span>
            <h1 className="mt-6 text-5xl font-extrabold tracking-tighter text-balance sm:text-7xl">
              Discover, Buy, and Grow <span className="text-primary italic">African</span>{" "}
              Businesses.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-muted-foreground text-pretty leading-relaxed">
              A premium digital infrastructure connecting world-class entrepreneurs across Africa
              with buyers through a trusted, high-performance marketplace.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-primary text-primary-foreground px-8 py-4 text-sm font-bold tracking-wide uppercase hover:bg-primary/90 transition-transform active:scale-95"
              >
                Browse Products
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup", role: "vendor" }}
                className="bg-white border-2 border-foreground px-8 py-4 text-sm font-bold tracking-wide uppercase hover:bg-foreground hover:text-white transition-all"
              >
                Sell on AfriMarket
              </Link>
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
