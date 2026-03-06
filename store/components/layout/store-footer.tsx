import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="border-t border-border bg-background mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-sm bg-foreground flex items-center justify-center">
                <span className="text-background text-[10px] font-bold tracking-widest">A</span>
              </div>
              <span className="text-xs font-semibold tracking-[0.15em] uppercase">Atelier</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
              A curated collection of handcrafted objects made by independent artisans.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.1em] uppercase mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {["All Products", "Ceramic", "Glass", "Wood", "Textile"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/store/products${item !== "All Products" ? `?category=${item.toLowerCase()}` : ""}`}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.1em] uppercase mb-4">Info</h4>
            <ul className="space-y-2.5">
              {["About", "Shipping", "Returns", "Care Guide", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.1em] uppercase mb-4">Connect</h4>
            <ul className="space-y-2.5">
              {["Instagram", "Pinterest", "Newsletter"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Atelier. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
