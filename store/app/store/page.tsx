import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { getProducts } from "@/lib/store";
import { ProductCard } from "@/components/store/product-card";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allProducts = await getProducts();
  const featured = allProducts.filter((p) => p.is_featured).slice(0, 4);
  const newArrivals = allProducts.slice(0, 8);
  const hero = allProducts[0];

  return (
    <div>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#f5f0eb] min-h-[88vh] flex items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-0 min-h-[88vh]">
            <div className="space-y-7 initial-hidden animate-fade-up">
              <div>
                <p className="text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: "var(--gold)" }}>
                  New Collection 2024
                </p>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.05] tracking-tight" style={{ color: "var(--body-text)" }}>
                  Objects Made<br />
                  <span className="font-semibold" style={{ color: "var(--gold)" }}>To Last</span>
                </h1>
              </div>
              <p className="text-base leading-relaxed text-muted-foreground max-w-md font-light">
                Handcrafted ceramics, glass, wood and textiles from independent artisans.
                Each piece is made with intention, built to endure.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Link href="/store/products"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 text-[13px] font-semibold tracking-[0.1em] uppercase text-white transition-opacity hover:opacity-85"
                  style={{ backgroundColor: "var(--gold)" }}>
                  Shop Now <ArrowRight size={15} />
                </Link>
                <Link href="/store/products"
                  className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] uppercase border-b pb-0.5 transition-colors hover:text-gold"
                  style={{ borderColor: "var(--body-text)", color: "var(--body-text)" }}>
                  Explore All
                </Link>
              </div>
              {/* Trust badges */}
              <div className="flex items-center gap-6 pt-2">
                {["Free Shipping", "30-Day Returns", "Certified Artisans"].map(t => (
                  <div key={t} className="flex items-center gap-1.5">
                    <span style={{ color: "var(--gold)" }}>✓</span>
                    <span className="text-[12px] text-muted-foreground tracking-wide">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image grid */}
            <div className="relative grid grid-cols-2 gap-3 h-[500px] lg:h-[640px] initial-hidden animate-fade-up delay-200">
              <div className="relative rounded-sm overflow-hidden row-span-2">
                <Image src="https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Ceramic" fill className="object-cover" sizes="30vw" priority />
              </div>
              <div className="relative rounded-sm overflow-hidden">
                <Image src="https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Glass" fill className="object-cover" sizes="20vw" />
              </div>
              <div className="relative rounded-sm overflow-hidden">
                <Image src="https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Wood" fill className="object-cover" sizes="20vw" />
              </div>
              {/* floating card */}
              {hero && (
                <div className="absolute -bottom-4 left-4 bg-white shadow-xl p-4 max-w-[180px] rounded-sm">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{hero.categories?.name ?? ""}</p>
                  <p className="text-[13px] font-semibold leading-tight mb-1" style={{ color: "var(--body-text)" }}>{hero.name}</p>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--gold)" }}>{formatPrice(hero.price)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        {/* Section header */}
        <div className="text-center mb-12">
          <svg className="section-icon mx-auto mb-3" viewBox="0 0 48 48" fill="none" stroke="#bb976d" strokeWidth="1.5">
            <rect x="4" y="4" width="18" height="18" rx="2"/><rect x="26" y="4" width="18" height="18" rx="2"/>
            <rect x="4" y="26" width="18" height="18" rx="2"/><rect x="26" y="26" width="18" height="18" rx="2"/>
          </svg>
          <p className="text-[11px] tracking-[0.25em] uppercase mb-2" style={{ color: "var(--gold)" }}>Browse by Material</p>
          <h2 className="text-3xl lg:text-4xl font-light" style={{ color: "var(--body-text)" }}>Shop the Collection</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { slug: "ceramic", label: "Ceramic", img: "https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=600", count: 24 },
            { slug: "glass",   label: "Glass",   img: "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=600", count: 18 },
            { slug: "wood",    label: "Wood",    img: "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=600", count: 15 },
            { slug: "textile", label: "Textile", img: "https://images.pexels.com/photos/6045028/pexels-photo-6045028.jpeg?auto=compress&cs=tinysrgb&w=600", count: 31 },
          ].map((cat) => (
            <Link key={cat.slug} href={`/store/products?category=${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden bg-gray-100">
              <Image src={cat.img} alt={cat.label} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="25vw" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-[11px] tracking-[0.2em] uppercase opacity-70 mb-1">{cat.count} pieces</p>
                <p className="text-xl font-semibold tracking-wide">{cat.label}</p>
                <div className="flex items-center gap-1 mt-2 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--gold-light, #d4b08a)" }}>
                  Shop now <ChevronRight size={13} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-20 bg-[#faf8f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <svg className="section-icon mx-auto mb-3" viewBox="0 0 48 48" fill="none" stroke="#bb976d" strokeWidth="1.5">
              <path d="M24 4l5.09 10.26L40 15.27l-8 7.79 1.89 10.99L24 29.01l-9.89 5.04L16 23.06 8 15.27l10.91-1.01z"/>
            </svg>
            <p className="text-[11px] tracking-[0.25em] uppercase mb-2" style={{ color: "var(--gold)" }}>Editor&apos;s Picks</p>
            <h2 className="text-3xl lg:text-4xl font-light" style={{ color: "var(--body-text)" }}>Featured Pieces</h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
              Explore our featured products, showcasing the best in style and quality handpicked just for you.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link href="/store/products" className="atelier-btn-gold inline-flex items-center gap-2 px-8 py-3 text-[13px] font-semibold tracking-[0.1em] uppercase border transition-all duration-300">
              View All Products <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <svg className="section-icon mx-auto mb-3" viewBox="0 0 48 48" fill="none" stroke="#bb976d" strokeWidth="1.5">
            <path d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4z"/>
            <path d="M16 24l6 6 10-12"/>
          </svg>
          <p className="text-[11px] tracking-[0.25em] uppercase mb-2" style={{ color: "var(--gold)" }}>Our Promise</p>
          <h2 className="text-3xl lg:text-4xl font-light" style={{ color: "var(--body-text)" }}>Why Choose Us</h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
            We prioritize your satisfaction by offering premium products and a seamless shopping experience.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: (
                <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 40 C8 36 14 34 22 36 L38 38 C46 40 52 38 58 32" stroke="#bb976d" strokeWidth="2.5"/>
                  <ellipse cx="18" cy="48" rx="7" ry="7" stroke="#bb976d" strokeWidth="2"/>
                  <ellipse cx="46" cy="48" rx="7" ry="7" stroke="#bb976d" strokeWidth="2"/>
                  <path d="M4 40 L8 20 L28 18 L36 30" stroke="#bb976d" strokeWidth="2"/>
                  <path d="M28 18 L38 38" stroke="#bb976d" strokeWidth="1.5" strokeDasharray="2 2"/>
                  <path d="M44 18 C50 16 56 18 58 24 L58 32" stroke="#bb976d" strokeWidth="2"/>
                </svg>
              ),
              title: "Free Shipping", desc: "Enjoy free shipping on all orders over $150, delivered to your door."
            },
            {
              icon: (
                <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M32 8 C18 8 8 18 8 32 C8 46 18 56 32 56" stroke="#bb976d" strokeWidth="2.5"/>
                  <path d="M32 8 C46 8 56 18 56 32 C56 40 52 47 46 51" stroke="#bb976d" strokeWidth="2.5"/>
                  <path d="M32 56 L22 46 M32 56 L42 46" stroke="#bb976d" strokeWidth="2"/>
                  <path d="M20 32 L28 40 L44 24" stroke="#bb976d" strokeWidth="2.5"/>
                </svg>
              ),
              title: "Easy to Return", desc: "Hassle-free returns within 30 days. Your satisfaction is guaranteed."
            },
            {
              icon: (
                <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="14" y="28" width="36" height="26" rx="3" stroke="#bb976d" strokeWidth="2.5"/>
                  <path d="M22 28 L22 20 C22 13 42 13 42 20 L42 28" stroke="#bb976d" strokeWidth="2.5"/>
                  <circle cx="32" cy="40" r="4" stroke="#bb976d" strokeWidth="2"/>
                  <path d="M32 44 L32 48" stroke="#bb976d" strokeWidth="2"/>
                </svg>
              ),
              title: "Secure Payment", desc: "Shop safely with our encrypted, secure payment systems."
            },
            {
              icon: (
                <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16 C12 12 16 10 20 10 L44 10 C48 10 52 12 52 16 L52 38 C52 42 48 44 44 44 L36 44 L28 54 L28 44 L20 44 C16 44 12 42 12 38 Z" stroke="#bb976d" strokeWidth="2.5"/>
                  <path d="M22 26 L28 26 M34 26 L42 26" stroke="#bb976d" strokeWidth="2"/>
                  <path d="M22 33 L36 33" stroke="#bb976d" strokeWidth="2"/>
                </svg>
              ),
              title: "Customer Support", desc: "Our dedicated team is here to assist you every step of the way."
            },
          ].map((item) => (
            <div key={item.title} className="border border-border p-7 hover:border-[var(--gold)] hover:shadow-sm transition-all duration-300 group">
              <div className="mb-5 opacity-80 group-hover:opacity-100 transition-opacity">{item.icon}</div>
              <h3 className="text-[15px] font-semibold mb-2 tracking-wide group-hover:text-[var(--gold)] transition-colors" style={{ color: "var(--body-text)" }}>
                {item.title}
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BANNER ── */}
      <section className="relative overflow-hidden py-24" style={{ backgroundColor: "#2c3341" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #bb976d 0%, transparent 60%), radial-gradient(circle at 80% 50%, #bb976d 0%, transparent 60%)" }} />
        <div className="relative mx-auto max-w-4xl px-4 text-center space-y-6">
          <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--gold)" }}>Limited Time</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight">
            Slow Design.<br />
            <span className="font-semibold" style={{ color: "var(--gold)" }}>Lasting Quality.</span>
          </h2>
          <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
            We work exclusively with artisans who take their time. No mass production, no shortcuts.
          </p>
          <Link href="/store/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-[13px] font-semibold tracking-[0.1em] uppercase text-white border border-white/30 hover:border-gold hover:text-gold transition-colors mt-4">
            Discover Now <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <svg className="section-icon mx-auto mb-3" viewBox="0 0 48 48" fill="none" stroke="#bb976d" strokeWidth="1.5">
            <circle cx="24" cy="24" r="20"/><path d="M24 14v10l7 4"/>
          </svg>
          <p className="text-[11px] tracking-[0.25em] uppercase mb-2" style={{ color: "var(--gold)" }}>Just Arrived</p>
          <h2 className="text-3xl lg:text-4xl font-light" style={{ color: "var(--body-text)" }}>New Arrivals</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="text-center mt-10">
          <Link href="/store/products"
            className="inline-flex items-center gap-2 px-8 py-3 text-[13px] font-semibold tracking-[0.1em] uppercase text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: "var(--gold)" }}>
            Shop All <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-16 bg-[#faf8f5] border-t border-border">
        <div className="mx-auto max-w-xl px-4 text-center space-y-5">
          <p className="text-[11px] tracking-[0.25em] uppercase" style={{ color: "var(--gold)" }}>Stay Connected</p>
          <h2 className="text-3xl font-light" style={{ color: "var(--body-text)" }}>New Pieces, First.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Join our community of collectors. Get first access to new arrivals, artisan stories and exclusives.
          </p>
          <div className="flex gap-0 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email address"
              className="flex-1 h-12 px-4 border border-border text-[13px] focus:outline-none focus:border-gold bg-white transition-colors" />
            <button className="h-12 px-6 text-[12px] font-semibold tracking-[0.1em] uppercase text-white shrink-0 transition-opacity hover:opacity-85"
              style={{ backgroundColor: "var(--gold)" }}>
              Subscribe
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

    </div>
  );
}
