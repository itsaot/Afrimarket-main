import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Package, LogOut } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/vendor")({
  head: () => ({ meta: [{ title: "Vendor Console - AfriMarket" }] }),
  component: VendorLayout,
});

function VendorLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user)
      navigate({ to: "/auth", search: { redirect: "/vendor" }, replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center text-xs font-mono uppercase tracking-widest text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-7xl grid lg:grid-cols-[240px_1fr] gap-0 px-4 sm:px-6">
        <aside className="lg:border-r border-border lg:py-12 lg:pr-6">
          <div className="lg:sticky lg:top-24">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Console
            </span>
            <h2 className="text-xl font-bold mt-1 mb-6">Vendor</h2>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
              <NavItem
                to="/vendor"
                active={path === "/vendor"}
                icon={LayoutDashboard}
                label="Dashboard"
              />
              <NavItem
                to="/vendor/products"
                active={path.startsWith("/vendor/products")}
                icon={Package}
                label="Products"
              />
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate({ to: "/", replace: true });
                }}
                className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-stone-100 text-left"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </nav>
          </div>
        </aside>
        <main className="py-12 lg:pl-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

function NavItem({
  to,
  active,
  icon: Icon,
  label,
}: {
  to: string;
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 text-sm whitespace-nowrap border-l-2 ${
        active
          ? "border-primary bg-primary/5 text-primary font-semibold"
          : "border-transparent hover:bg-stone-100"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
