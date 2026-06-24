import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useCart, cartSubtotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { AppHeader } from "@/components/app-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart - AfriMarket" },
      { name: "description", content: "Review your AfriMarket cart." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);

  const subtotal = cartSubtotal(items);
  const shipping = items.length ? 150 : 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-4xl font-extrabold tracking-tighter mb-10">Cart</h1>
        {items.length === 0 ? (
          <div className="border border-dashed border-border p-16 text-center">
            <p className="text-muted-foreground mb-6">Your cart is empty.</p>
            <Link
              to="/products"
              className="bg-foreground text-white px-6 py-3 text-xs font-bold uppercase tracking-widest"
            >
              Browse marketplace
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-12">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 border-b border-border pb-4">
                  <div className="size-24 bg-stone-100 shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between">
                      <h3 className="font-bold">{item.name}</h3>
                      <button
                        onClick={() => remove(item.productId)}
                        aria-label="Remove"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <p className="font-mono text-primary mt-1">
                      {formatPrice(item.price, item.currency)}
                    </p>
                    <div className="mt-auto flex items-center gap-2">
                      <button
                        onClick={() => setQty(item.productId, item.quantity - 1)}
                        className="border border-border p-1.5 hover:border-foreground"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
                      <button
                        onClick={() => setQty(item.productId, item.quantity + 1)}
                        className="border border-border p-1.5 hover:border-foreground"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="border border-border p-6 bg-stone-50 h-fit">
              <h2 className="text-xs font-mono uppercase tracking-widest mb-6">Order summary</h2>
              <div className="space-y-3 text-sm">
                <Row label="Subtotal" value={formatPrice(subtotal, items[0]?.currency ?? "ZAR")} />
                <Row
                  label="Delivery estimate"
                  value={formatPrice(shipping, items[0]?.currency ?? "ZAR")}
                />
                <div className="border-t border-border pt-3 mt-3">
                  <Row
                    label="Total"
                    value={formatPrice(subtotal + shipping, items[0]?.currency ?? "ZAR")}
                    bold
                  />
                </div>
              </div>
              <Link
                to="/checkout"
                className="mt-6 w-full bg-primary text-primary-foreground py-3 text-xs font-bold uppercase tracking-widest text-center hover:bg-primary/90 block"
              >
                Checkout
              </Link>
            </aside>
          </div>
        )}
      </section>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-mono" : "font-mono text-muted-foreground"}>{value}</span>
    </div>
  );
}
