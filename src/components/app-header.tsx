import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart, cartCount } from "@/lib/cart-store";
import { useAuth, isVendor } from "@/lib/use-auth";

export function AppHeader() {
  const items = useCart((s) => s.items);
  const count = cartCount(items);
  const { user, roles } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-mono text-lg font-bold tracking-tighter uppercase">
            Afri<span className="text-primary">Market</span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link
              to="/products"
              className="text-sm font-medium hover:text-primary transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              Marketplace
            </Link>
            <Link
              to="/products"
              search={{ category: undefined }}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Categories
            </Link>
            {user && isVendor(roles) ? (
              <Link
                to="/vendor"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            ) : null}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/cart"
            className="relative p-2 hover:text-primary transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="size-5" />
            {count > 0 ? (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold size-4 grid place-items-center rounded-full font-mono">
                {count}
              </span>
            ) : null}
          </Link>
          {user ? (
            <Link
              to="/vendor"
              className="bg-foreground text-white px-5 py-2 text-sm font-semibold rounded-full hover:bg-foreground/90 transition-all"
            >
              Account
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-sm font-semibold text-primary px-4 py-2 hover:bg-primary/5 transition-colors rounded-full"
              >
                Log in
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup", role: "vendor" }}
                className="bg-foreground text-white px-5 py-2 text-sm font-semibold rounded-full hover:bg-foreground/90 transition-all"
              >
                Become a Vendor
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden p-2 -mr-2"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-3">
          <Link to="/products" onClick={() => setOpen(false)} className="text-sm font-medium py-2">
            Marketplace
          </Link>
          <Link to="/cart" onClick={() => setOpen(false)} className="text-sm font-medium py-2">
            Cart ({count})
          </Link>
          {user ? (
            <Link to="/vendor" onClick={() => setOpen(false)} className="text-sm font-medium py-2">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth" onClick={() => setOpen(false)} className="text-sm font-medium py-2">
                Log in
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup", role: "vendor" }}
                onClick={() => setOpen(false)}
                className="bg-foreground text-white px-5 py-2.5 text-sm font-semibold rounded-full text-center"
              >
                Become a Vendor
              </Link>
            </>
          )}
        </div>
      ) : null}
    </nav>
  );
}
