import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Search, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/app-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES } from "@/lib/categories";
import { useServerFn } from "@tanstack/react-start";
import { suggestSimilarProducts } from "@/lib/ai.functions";

const SearchSchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/products/")({
  validateSearch: SearchSchema,
  head: () => ({
    meta: [
      { title: "Marketplace - AfriMarket" },
      {
        name: "description",
        content:
          "Browse verified African products across fashion, beauty, food, decor, agriculture, and electronics.",
      },
      { property: "og:title", content: "Marketplace - AfriMarket" },
      {
        property: "og:description",
        content: "Browse verified African products across six categories from vetted vendors.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { category, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [search, setSearch] = useState(q ?? "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [smartLoading, setSmartLoading] = useState(false);
  const callSuggest = useServerFn(suggestSimilarProducts);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", category ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("id, name, price, currency, category, image_url, vendor_id")
        .order("created_at", { ascending: false });
      if (category) query = query.eq("category", category);
      const { data, error } = await query;
      if (error) return [];
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    if (!products) return [];
    const term = (q ?? "").trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, q]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({
      search: (prev: z.infer<typeof SearchSchema>) => ({ ...prev, q: search || undefined }),
    });
  }

  async function runSmartSuggest() {
    if (!products?.length || !q) return;
    setSmartLoading(true);
    try {
      const result = await callSuggest({
        data: { query: q, available: products.map((p) => p.name).slice(0, 30) },
      });
      setSuggestions(result.suggestions);
    } catch {
      setSuggestions([]);
    } finally {
      setSmartLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tighter">Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Verified vendors. Real craftsmanship. Continental reach.
          </p>
        </div>

        <form onSubmit={submitSearch} className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full border border-border bg-white pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-primary"
              maxLength={200}
            />
          </div>
          <button
            type="submit"
            className="bg-foreground text-white px-6 text-xs font-bold uppercase tracking-widest hover:bg-foreground/90"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-12">
          <FilterChip
            active={!category}
            to="/products"
            search={{ category: undefined, q }}
            label="All"
          />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              active={category === c}
              to="/products"
              search={{ category: c, q }}
              label={c}
            />
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-stone-100 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-border p-12 text-center">
            <p className="font-semibold mb-2">
              {q || category ? "No products match this view." : "No vendor products yet."}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {q || category
                ? "Try a different search or category."
                : "Products created by vendors will appear here once they are listed."}
            </p>
            {q && products?.length ? (
              <button
                type="button"
                onClick={runSmartSuggest}
                disabled={smartLoading}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50"
              >
                <Sparkles className="size-4" />
                {smartLoading ? "Thinking..." : "Suggest similar products"}
              </button>
            ) : null}
            {suggestions.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  AI suggestions
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSearch(s);
                        navigate({ search: () => ({ q: s }) });
                      }}
                      className="border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={{ ...p, verified: true }} />
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}

function FilterChip({
  active,
  to,
  search,
  label,
}: {
  active: boolean;
  to: string;
  search: Record<string, unknown>;
  label: string;
}) {
  return (
    <Link
      to={to}
      search={search}
      className={`px-4 py-2 text-xs font-mono uppercase tracking-widest border transition-colors ${
        active
          ? "bg-foreground text-white border-foreground"
          : "bg-white border-border hover:border-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
