import Link from "next/link";

const navyBg = "hsl(220, 35%, 14%)";
const gold = "hsl(38, 65%, 52%)";
const textDim = "rgba(230,220,200,0.5)";
const textFaint = "rgba(230,220,200,0.3)";

export function StoreFooter() {
  return (
    <footer style={{ backgroundColor: navyBg, color: "hsl(36, 28%, 90%)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <div className="flex items-center gap-2.5">
              <div style={{ borderColor: gold, color: gold }} className="h-8 w-8 rounded-sm border flex items-center justify-center">
                <span className="font-display text-sm font-semibold">A</span>
              </div>
              <span className="font-display text-lg font-normal tracking-[0.08em]">Atelier</span>
            </div>
            <p className="text-[13px] leading-relaxed max-w-[220px]" style={{ color: textDim }}>
              A curated collection of handcrafted objects made by independent artisans worldwide.
            </p>
            <div className="flex items-center gap-3">
              {["IG", "PT", "TW"].map((s) => (
                <a key={s} href="#"
                  className="h-8 w-8 rounded-sm flex items-center justify-center text-[11px] font-medium transition-colors hover:border-white/40 hover:text-white/70"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)" }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.2em] uppercase font-sans" style={{ color: gold }}>Shop</h4>
            <ul className="space-y-3">
              {[
                { label: "All Products", href: "/store/products" },
                { label: "Ceramic", href: "/store/products?category=ceramic" },
                { label: "Glass", href: "/store/products?category=glass" },
                { label: "Wood", href: "/store/products?category=wood" },
                { label: "Textile", href: "/store/products?category=textile" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[13px] transition-colors hover:text-white/90" style={{ color: textDim }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.2em] uppercase font-sans" style={{ color: gold }}>Info</h4>
            <ul className="space-y-3">
              {["About", "Sustainability", "Shipping", "Returns", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[13px] transition-colors hover:text-white/90" style={{ color: textDim }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h4 className="text-[10px] tracking-[0.2em] uppercase font-sans" style={{ color: gold }}>Newsletter</h4>
            <p className="text-[13px]" style={{ color: textDim }}>New pieces, artisan stories and exclusives.</p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full h-9 px-3 rounded-sm text-sm focus:outline-none transition-colors placeholder:text-white/25"
                style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(230,220,200,0.9)", backgroundColor: "rgba(255,255,255,0.05)" }}
              />
              <button
                type="submit"
                className="h-9 px-4 rounded-sm text-[12px] font-medium transition-opacity hover:opacity-80"
                style={{ backgroundColor: gold, color: navyBg }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t mb-8" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px]" style={{ color: textFaint }}>
            © {new Date().getFullYear()} Atelier. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
              <Link key={item} href="#" className="text-[11px] transition-colors hover:text-white/60" style={{ color: textFaint }}>
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
