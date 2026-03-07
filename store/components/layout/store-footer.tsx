import Link from "next/link";

export function StoreFooter() {
  return (
    <footer style={{ backgroundColor: "hsl(220, 35%, 14%)", color: "hsl(36, 28%, 90%)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <div className="flex items-center gap-2.5">
              <div
                style={{ borderColor: "hsl(38, 65%, 52%)", color: "hsl(38, 65%, 52%)" }}
                className="h-8 w-8 rounded-sm border flex items-center justify-center"
              >
                <span className="font-display text-sm font-semibold">A</span>
              </div>
              <span className="font-display text-lg font-normal tracking-[0.08em]">Atelier</span>
            </div>
            <p className="text-[13px] leading-relaxed max-w-[220px]" style={{ color: "rgba(230,220,200,0.5)" }}>
              A curated collection of handcrafted objects made by independent artisans worldwide.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              {["IG", "PT", "TW"].map((s) => (
                <a key={s} href="#"
                  className="h-8 w-8 rounded-sm flex items-center justify-center text-[11px] font-medium transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.2em] uppercase font-sans" style={{ color: "hsl(38, 65%, 52%)" }}>Shop</h4>
            <ul className="space-y-3">
              {[
                { label: "All Products", href: "/store/products" },
                { label: "Ceramic", href: "/store/products?category=ceramic" },
                { label: "Glass", href: "/store/products?category=glass" },
                { label: "Wood", href: "/store/products?category=wood" },
                { label: "Textile", href: "/store/products?category=textile" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[13px] transition-colors" style={{ color: "rgba(230,220,200,0.5)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(230,220,200,0.9)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(230,220,200,0.5)")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.2em] uppercase font-sans" style={{ color: "hsl(38, 65%, 52%)" }}>Info</h4>
            <ul className="space-y-3">
              {["About", "Sustainability", "Shipping", "Returns", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[13px] transition-colors" style={{ color: "rgba(230,220,200,0.5)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(230,220,200,0.9)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(230,220,200,0.5)")}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter mini */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h4 className="text-[10px] tracking-[0.2em] uppercase font-sans" style={{ color: "hsl(38, 65%, 52%)" }}>Newsletter</h4>
            <p className="text-[13px]" style={{ color: "rgba(230,220,200,0.5)" }}>New pieces, artisan stories and exclusives.</p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email address"
                className="w-full h-9 px-3 rounded-sm text-sm bg-white/8 focus:outline-none focus:bg-white/12 transition-colors placeholder:text-white/25"
                style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(230,220,200,0.9)", backgroundColor: "rgba(255,255,255,0.05)" }}
              />
              <button
                type="submit"
                className="h-9 px-4 rounded-sm text-[12px] font-medium transition-opacity hover:opacity-80"
                style={{ backgroundColor: "hsl(38, 65%, 52%)", color: "hsl(220, 35%, 14%)" }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mb-8" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px]" style={{ color: "rgba(230,220,200,0.3)" }}>
            © {new Date().getFullYear()} Atelier. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
              <Link key={item} href="#" className="text-[11px] transition-colors" style={{ color: "rgba(230,220,200,0.3)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(230,220,200,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(230,220,200,0.3)")}
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
