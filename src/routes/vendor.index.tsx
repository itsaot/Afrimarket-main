import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, Eye, MessageSquare, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/vendor/")({
  component: VendorDashboard,
});

function VendorDashboard() {
  const { user } = useAuth();
  const vendorId = user?.id;

  const { data } = useQuery({
    enabled: !!vendorId,
    queryKey: ["vendor-overview", vendorId],
    queryFn: async () => {
      const [productsResult, inquiriesResult, itemsResult] = await Promise.allSettled([
        supabase
          .from("products")
          .select("id, name, price, currency, created_at, views", { count: "exact" })
          .eq("vendor_id", vendorId!),
        supabase
          .from("inquiries")
          .select("id, buyer_name, message, created_at, product_id", { count: "exact" })
          .eq("vendor_id", vendorId!)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("order_items")
          .select("id, product_name, quantity, unit_price, created_at", { count: "exact" })
          .eq("vendor_id", vendorId!)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const products =
        productsResult.status === "fulfilled" ? productsResult.value : { data: [], count: 0 };
      const inquiries =
        inquiriesResult.status === "fulfilled" ? inquiriesResult.value : { data: [], count: 0 };
      const items = itemsResult.status === "fulfilled" ? itemsResult.value : { data: [], count: 0 };

      return {
        products: products.data ?? [],
        productCount: products.count ?? 0,
        inquiries: inquiries.data ?? [],
        inquiryCount: inquiries.count ?? 0,
        orderItems: items.data ?? [],
        orderCount: items.count ?? 0,
      };
    },
  });

  const totalViews = data?.products.reduce((sum, p) => sum + (p.views ?? 0), 0) ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
            Overview
          </span>
          <h1 className="text-3xl font-extrabold tracking-tighter mt-2">Dashboard</h1>
        </div>
        <Link
          to="/vendor/products"
          className="bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-primary/90"
        >
          Manage products
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard icon={Package} label="Products" value={data?.productCount ?? 0} />
        <StatCard icon={Eye} label="Total views" value={totalViews} />
        <StatCard icon={MessageSquare} label="Inquiries" value={data?.inquiryCount ?? 0} />
        <StatCard icon={ShoppingBag} label="Order items" value={data?.orderCount ?? 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Recent inquiries">
          {data?.inquiries.length === 0 ? (
            <Empty msg="No inquiries yet." />
          ) : (
            <ul className="divide-y divide-border">
              {data?.inquiries.map((i) => (
                <li key={i.id} className="py-3">
                  <p className="font-semibold text-sm">{i.buyer_name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{i.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Recent orders">
          {data?.orderItems.length === 0 ? (
            <Empty msg="No orders yet." />
          ) : (
            <ul className="divide-y divide-border">
              {data?.orderItems.map((o) => (
                <li key={o.id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-semibold text-sm">{o.product_name}</p>
                    <p className="text-xs text-muted-foreground">Qty {o.quantity}</p>
                  </div>
                  <span className="font-mono text-primary text-sm">
                    {formatPrice(Number(o.unit_price) * o.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="border border-border p-5 bg-white">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tighter font-mono">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border p-5 bg-white">
      <h3 className="text-xs font-mono uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p className="text-sm text-muted-foreground py-6 text-center">{msg}</p>;
}
