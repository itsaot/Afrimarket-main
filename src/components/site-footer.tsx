import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-20 bg-stone-50 pb-32 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <span className="font-mono text-lg font-bold tracking-tighter uppercase mb-6 block">
              Afri<span className="text-primary">Market</span>
            </span>
            <p className="text-sm text-muted-foreground max-w-xs">
              The platform for the next generation of African commerce. High-trust, low-friction,
              global reach.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link to="/products" className="hover:text-primary">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  search={{ mode: "signup", role: "vendor" }}
                  className="hover:text-primary"
                >
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-primary">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Trust</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>Verified Vendor program</li>
              <li>Buyer protection</li>
              <li>Pan-African logistics</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border text-xs font-mono uppercase tracking-widest text-muted-foreground flex justify-between">
          <span>(c) {new Date().getFullYear()} AfriMarket</span>
          <span>Made for Africa</span>
        </div>
      </div>
    </footer>
  );
}
