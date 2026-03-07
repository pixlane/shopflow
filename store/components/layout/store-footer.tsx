import Link from "next/link";

export function StoreFooter() {
  return (
    <footer style={{ backgroundColor: "#1e2330", color: "rgba(255,255,255,0.75)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1.5fr] gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <div className="flex items-center gap-2">
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <path d="M4 24L14 4L24 24" stroke="#bb976d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 18H21" stroke="#bb976d" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-lg font-semibold tracking-[0.12em] uppercase text-white">Atelier</span>
            </div>
            <p className="text-[13px] leading-relaxed max-w-[220px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              A curated collection of handcrafted objects made by independent artisans worldwide.
            </p>
            <div className="flex gap-3">
              {[
                { label: "IG", icon: "◉" },
                { label: "PT", icon: "◈" },
                { label: "TW", icon: "◆" },
              ].map((s) => (
                <a key={s.label} href="#"
                  className="h-9 w-9 border flex items-center justify-center text-[11px] transition-colors hover:border-gold hover:text-gold"
                  style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)" }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="text-[11px] tracking-[0.25em] uppercase font-semibold" style={{ color: "#bb976d" }}>Shop</h4>
            <ul className="space-y-2.5">
              {[
                { label: "All Products", href: "/store/products" },
                { label: "Ceramic", href: "/store/products?category=ceramic" },
                { label: "Glass", href: "/store/products?category=glass" },
                { label: "Wood", href: "/store/products?category=wood" },
                { label: "Textile", href: "/store/products?category=textile" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[13px] transition-colors hover:text-gold" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h4 className="text-[11px] tracking-[0.25em] uppercase font-semibold" style={{ color: "#bb976d" }}>Info</h4>
            <ul className="space-y-2.5">
              {["About", "Sustainability", "Shipping", "Returns", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[13px] transition-colors hover:text-gold" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h4 className="text-[11px] tracking-[0.25em] uppercase font-semibold" style={{ color: "#bb976d" }}>Newsletter</h4>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              New pieces, artisan stories and exclusives — first.
            </p>
            <div className="flex gap-0">
              <input type="email" placeholder="Email address"
                className="flex-1 h-10 px-3 text-[13px] bg-white/5 border focus:outline-none focus:border-gold transition-colors placeholder:text-white/20"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }} />
              <button className="h-10 px-4 text-[11px] font-semibold tracking-[0.1em] uppercase shrink-0 transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#bb976d", color: "#1e2330" }}>
                Go
              </button>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} Atelier. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
              <Link key={item} href="#" className="text-[11px] transition-colors hover:text-gold" style={{ color: "rgba(255,255,255,0.25)" }}>
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
