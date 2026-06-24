import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { useCart, cartCount } from "@/lib/cart-store";

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = useCart((s) => s.items);
  const count = cartCount(items);

  const link = (active: boolean) =>
    `flex flex-col items-center gap-1 px-2 ${active ? "text-primary" : "text-white/60"}`;

  return (
    <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-6 bg-foreground/95 text-white px-6 py-3 rounded-full shadow-2xl backdrop-blur-lg border border-white/10">
        <Link to="/" className={link(pathname === "/")}>
          <Home className="size-5" />
          <span className="text-[9px] uppercase font-bold tracking-tighter">Home</span>
        </Link>
        <Link to="/products" className={link(pathname.startsWith("/products"))}>
          <Search className="size-5" />
          <span className="text-[9px] uppercase font-bold tracking-tighter">Shop</span>
        </Link>
        <Link to="/cart" className={`relative ${link(pathname === "/cart")}`}>
          <ShoppingBag className="size-5" />
          {count > 0 ? (
            <span className="absolute -top-1 right-2 bg-primary text-[8px] font-bold size-3.5 grid place-items-center rounded-full font-mono">
              {count}
            </span>
          ) : null}
          <span className="text-[9px] uppercase font-bold tracking-tighter">Cart</span>
        </Link>
        <Link
          to="/auth"
          className={link(pathname.startsWith("/auth") || pathname.startsWith("/vendor"))}
        >
          <User className="size-5" />
          <span className="text-[9px] uppercase font-bold tracking-tighter">Me</span>
        </Link>
      </div>
    </div>
  );
}
