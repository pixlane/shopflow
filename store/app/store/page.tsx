import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getProducts, getCategories } from "@/lib/store";
import { ProductCard } from "@/components/store/product-card";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const allProducts = getProducts({ published: true });
  const featured = allProducts.filter((p) => p.featured).slice(0, 4);
  const hero = allProducts.find((p) => p.slug === "walnut-serving-board") ?? allProducts[0];
  const categories = getCategories();

  return (
    <div className="overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center" style={{ backgroundColor: "hsl(36, 28%, 94%)" }}>
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(220,20%,12%) 1px, transparent 0)", backgroundSize: "40px 40px" }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-0">
          <div className="grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_560px] gap-12 xl:gap-20 items-center min-h-[92vh]">

            {/* Text */}
            <div className="space-y-8 py-16 lg:py-24">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-border px-4 py-1.5 initial-hidden animate-fade-up">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(38, 65%, 52%)" }} />
                <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-sans">New collection — Spring 2024</span>
              </div>

              <div className="initial-hidden animate-fade-up delay-100">
                <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-normal leading-[0.95] tracking-tight">
                  Objects<br />
                  <em className="italic" style={{ color: "hsl(220, 35%, 14%)" }}>crafted</em><br />
                  <span className="relative">
                    to last
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" aria-hidden>
                      <path d="M2 9 C50 3, 150 3, 298 9" stroke="hsl(38, 65%, 52%)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    </svg>
                  </span>
                </h1>
              </div>

              <p className="text-base text-muted-foreground max-w-sm leading-relaxed font-light initial-hidden animate-fade-up delay-200">
                Handcrafted ceramics, glass, wood and textiles from independent artisans. Each piece is made with intention, built to endure.
              </p>

              <div className="flex items-center gap-4 initial-hidden animate-fade-up delay-300">
                <Link
                  href="/store/products"
                  style={{ backgroundColor: "hsl(220, 35%, 14%)", color: "hsl(36, 28%, 96%)" }}
                  className="inline-flex items-center gap-2.5 h-13 px-7 py-3.5 rounded-sm text-sm font-medium tracking-wide hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Explore collection <ArrowRight size={15} />
                </Link>
                <Link
                  href="/store/products?category=ceramic"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors border-b border-foreground/20 hover:border-foreground pb-0.5"
                >
                  Shop ceramics
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-4 initial-hidden animate-fade-up delay-400">
                {[
                  { num: "200+", label: "Artisan pieces" },
                  { num: "40+", label: "Independent makers" },
                  { num: "4.9★", label: "Average rating" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-xl font-medium">{s.num}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="relative h-[520px] lg:h-screen lg:max-h-[820px] initial-hidden animate-fade-in delay-200">
              {/* Main image */}
              <div className="absolute inset-0 lg:inset-y-8 rounded-xl overflow-hidden shadow-2xl shadow-black/15">
                <Image
                  src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1200&q=90"
                  alt="Handcrafted ceramic vase"
                  fill priority className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(34,42,62,0.4) 0%, transparent 50%)" }} />
              </div>

              {/* Product card float */}
              {hero && (
                <div className="absolute bottom-12 left-5 right-5 sm:left-6 sm:right-auto sm:w-[200px] bg-white/95 backdrop-blur rounded-lg p-4 shadow-xl shadow-black/10">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-1">{hero.category.name}</p>
                  <p className="text-sm font-display font-medium leading-tight mb-1">{hero.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{formatPrice(hero.price)}</p>
                    <Link href={`/store/products/${hero.slug}`} className="text-[10px] flex items-center gap-1 hover:underline">
                      View <ArrowUpRight size={10} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Tag float */}
              <div className="absolute top-10 right-5 sm:-right-5 bg-white rounded-full px-4 py-2 shadow-lg text-[11px] font-medium tracking-wide">
                ✦ Handmade
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ─────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "hsl(220, 35%, 14%)", color: "hsl(36, 28%, 90%)" }} className="py-3.5 overflow-hidden">
        <div className="flex items-center gap-0 whitespace-nowrap" style={{ animation: "marquee 30s linear infinite" }}>
          {Array.from({ length: 6 }).flatMap((_, i) =>
            ["Free shipping over $150", "Handmade by artisans", "30-day returns", "Certified authentic", "New pieces every week"].map((t) => (
              <span key={`${i}-${t}`} className="text-[11px] tracking-[0.15em] uppercase opacity-60 mx-8">{t}  ✦</span>
            ))
          )}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </div>

      {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 font-sans">Browse by material</p>
            <h2 className="font-display text-3xl lg:text-4xl font-normal">Shop the collection</h2>
          </div>
          <Link href="/store/products" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { slug: "ceramic", label: "Ceramic", img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80", count: "24 pieces" },
            { slug: "glass", label: "Glass", img: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=600&q=80", count: "18 pieces" },
            { slug: "wood", label: "Wood", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", count: "15 pieces" },
            { slug: "textile", label: "Textile", img: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80", count: "31 pieces" },
          ].map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/store/products?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-lg"
              style={{ aspectRatio: i === 0 || i === 3 ? "3/4" : "3/4" }}
            >
              <Image src={cat.img} alt={cat.label} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="25vw" />
              <div className="absolute inset-0 transition-opacity duration-300" style={{ background: "linear-gradient(to top, rgba(20,26,46,0.75) 0%, rgba(20,26,46,0.1) 55%)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <p className="text-[10px] text-white/60 uppercase tracking-[0.15em] mb-1">{cat.count}</p>
                <p className="font-display text-lg sm:text-xl text-white font-normal">{cat.label}</p>
              </div>
              <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/0 group-hover:bg-white/15 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <ArrowUpRight size={13} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "hsl(36, 22%, 92%)" }} className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 font-sans">Editor's picks</p>
              <h2 className="font-display text-3xl lg:text-4xl font-normal">Featured pieces</h2>
            </div>
            <Link href="/store/products" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Browse all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      {/* ── EDITORIAL BANNER ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 lg:py-32" style={{ backgroundColor: "hsl(220, 35%, 14%)" }}>
        {/* Decorative circle */}
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-5 border-2 border-white" />
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-5 border border-white" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-7">
              <p className="text-[11px] tracking-[0.2em] uppercase font-sans" style={{ color: "hsl(38, 65%, 52%)" }}>Our philosophy</p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.05] text-white">
                Slow design.<br />
                <em className="italic text-white/50">Lasting quality.</em>
              </h2>
              <p className="text-sm text-white/50 max-w-sm leading-relaxed font-light">
                We work exclusively with artisans who take their time. No mass production. No shortcuts. Every object that reaches you has been made with purpose.
              </p>
              <Link
                href="/store/products"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors border-b border-white/20 hover:border-white pb-0.5"
              >
                Discover the full collection <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { src: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=600&q=80", label: "Glasswork" },
                { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", label: "Woodcraft" },
                { src: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80", label: "Textiles" },
                { src: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600&q=80", label: "Objects" },
              ].map((item, i) => (
                <div key={item.label} className={`relative overflow-hidden rounded-lg ${i === 0 ? "row-span-1" : ""}`} style={{ aspectRatio: "1" }}>
                  <Image src={item.src} alt={item.label} fill className="object-cover brightness-[0.6] hover:brightness-75 transition-all duration-500 hover:scale-105" sizes="20vw" />
                  <span className="absolute bottom-3 left-3.5 text-[10px] text-white/60 tracking-[0.15em] uppercase">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ALL PRODUCTS ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 font-sans">The full range</p>
            <h2 className="font-display text-3xl lg:text-4xl font-normal">All pieces</h2>
          </div>
          <Link href="/store/products" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {allProducts.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────────────────── */}
      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "✦", title: "Handmade", desc: "Every piece crafted by hand" },
              { icon: "◈", title: "Free shipping", desc: "On all orders over $150" },
              { icon: "◉", title: "Easy returns", desc: "Hassle-free 30-day returns" },
              { icon: "◆", title: "Certified", desc: "Authenticated by artisans" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <span className="text-lg mt-0.5" style={{ color: "hsl(38, 65%, 52%)" }}>{item.icon}</span>
                <div>
                  <p className="text-sm font-display font-medium mb-0.5">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "hsl(36, 22%, 92%)" }} className="py-16 lg:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center space-y-6">
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-sans">Stay in the loop</p>
          <h2 className="font-display text-3xl lg:text-4xl font-normal">New pieces, first.</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Join our community of collectors and be the first to know about new arrivals, artisan stories and limited editions.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 h-11 px-4 rounded-sm border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
            />
            <button
              type="submit"
              style={{ backgroundColor: "hsl(220, 35%, 14%)", color: "hsl(36, 28%, 96%)" }}
              className="h-11 px-6 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          <p className="text-[11px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

    </div>
  );
}
