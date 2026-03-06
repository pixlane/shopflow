import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/store";
import { ProductCard } from "@/components/store/product-card";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const allProducts = getProducts({ published: true });
  const featured = allProducts.filter((p) => p.featured).slice(0, 4);
  const hero = allProducts.find((p) => p.slug === "walnut-serving-board") ?? allProducts[0];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 min-h-[80vh] items-center gap-12 py-20">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">New collection — Spring 2024</p>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.05] tracking-tight text-foreground">
                  Objects made<br />
                  <em className="font-normal italic text-muted-foreground">to last</em>
                </h1>
              </div>
              <p className="text-base text-muted-foreground max-w-md leading-relaxed">
                Handcrafted ceramics, glass, wood and textiles from independent artisans. Each piece is made with intention.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/store/products" className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
                  Shop all <ArrowRight size={15} />
                </Link>
                <Link href="/store/products?category=ceramic" className="inline-flex items-center gap-2 h-12 px-6 rounded-md border border-border text-sm font-medium hover:bg-background transition-colors">
                  Explore ceramics
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/5] lg:aspect-auto lg:h-[600px] rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1200&q=85"
                alt="Handcrafted ceramic vase"
                fill priority className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {hero && (
                <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-[220px] bg-background/95 backdrop-blur rounded-lg p-4 shadow-lg">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{hero.category.name}</p>
                  <p className="text-sm font-medium mb-0.5">{hero.name}</p>
                  <p className="text-sm text-muted-foreground">{formatPrice(hero.price)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground mb-2">Curated selection</p>
            <h2 className="text-2xl font-light tracking-tight">Featured pieces</h2>
          </div>
          <Link href="/store/products" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* Editorial banner */}
      <section className="relative overflow-hidden bg-foreground text-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-[11px] tracking-[0.2em] uppercase text-background/50">Our philosophy</p>
              <h2 className="text-4xl sm:text-5xl font-light leading-tight tracking-tight">
                Slow design.<br />
                <em className="italic text-background/60">Lasting quality.</em>
              </h2>
              <p className="text-sm text-background/60 max-w-sm leading-relaxed">
                We work exclusively with artisans who take their time. No mass production. No shortcuts.
              </p>
              <Link href="/store/products" className="inline-flex items-center gap-2 text-sm text-background/80 hover:text-background transition-colors border-b border-background/20 hover:border-background pb-0.5">
                Discover the collection <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { src: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=600&q=80", label: "Glasswork" },
                { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", label: "Woodcraft" },
                { src: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80", label: "Textiles" },
                { src: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600&q=80", label: "Objects" },
              ].map((item) => (
                <div key={item.label} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image src={item.src} alt={item.label} fill className="object-cover brightness-75" sizes="25vw" />
                  <span className="absolute bottom-2.5 left-3 text-[10px] text-white/70 tracking-wider uppercase">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section className="border-y border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Handmade", desc: "Every piece made by hand" },
              { title: "Free shipping", desc: "On orders over $150" },
              { title: "Easy returns", desc: "30-day hassle-free returns" },
              { title: "Certified", desc: "Authenticated by artisans" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <p className="text-sm font-medium mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-2xl font-light tracking-tight">All pieces</h2>
          <Link href="/store/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Browse all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {allProducts.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
}
