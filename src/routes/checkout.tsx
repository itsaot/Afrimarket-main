import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart, cartSubtotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout - AfriMarket" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const subtotal = cartSubtotal(items);
  const total = subtotal + (items.length ? 150 : 0);
  const currency = items[0]?.currency ?? "ZAR";

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const orderId = crypto.randomUUID();
      const { error: orderErr } = await supabase.from("orders").insert({
        id: orderId,
        buyer_id: userData.user?.id ?? null,
        buyer_name: form.name,
        buyer_email: form.email,
        buyer_phone: form.phone,
        shipping_address: form.address,
        total,
      });
      if (orderErr) throw orderErr;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: orderId,
          product_id: i.productId,
          vendor_id: i.vendorId,
          product_name: i.name,
          unit_price: i.price,
          quantity: i.quantity,
        })),
      );
      if (itemsErr) throw itemsErr;
    } catch {
      toast.error("We could not submit your order request. Please try again.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    clear();
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <CheckCircle2 className="size-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-extrabold tracking-tighter mb-4">
            Order Request Submitted Successfully
          </h1>
          <p className="text-muted-foreground mb-10">
            Vendors have been notified and will reach out to confirm delivery and payment terms.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/products"
              className="bg-foreground text-white px-6 py-3 text-xs font-bold uppercase tracking-widest"
            >
              Keep shopping
            </Link>
            <Link
              to="/"
              className="border border-border px-6 py-3 text-xs font-bold uppercase tracking-widest"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    navigate({ to: "/cart", replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-4xl font-extrabold tracking-tighter mb-10">Checkout</h1>
        <form onSubmit={submit} className="grid lg:grid-cols-[1fr_360px] gap-12">
          <div className="space-y-4">
            <Input
              label="Full name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              required
              maxLength={100}
            />
            <Input
              label="Phone number"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              required
              maxLength={30}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
              maxLength={255}
            />
            <Input
              label="Delivery address"
              value={form.address}
              onChange={(v) => setForm({ ...form, address: v })}
              required
              maxLength={500}
            />
          </div>
          <aside className="border border-border p-6 bg-stone-50 h-fit">
            <h2 className="text-xs font-mono uppercase tracking-widest mb-6">Order summary</h2>
            <div className="space-y-2 text-sm mb-6">
              {items.map((i) => (
                <div key={i.productId} className="flex justify-between">
                  <span className="text-muted-foreground truncate pr-2">
                    {i.name} x {i.quantity}
                  </span>
                  <span className="font-mono">{formatPrice(i.price * i.quantity, i.currency)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="font-mono text-primary">{formatPrice(total, currency)}</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full bg-primary text-primary-foreground py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit order request"}
            </button>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-4 text-center">
              No payment required - vendors confirm directly
            </p>
          </aside>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        className="mt-2 w-full border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
      />
    </label>
  );
}
