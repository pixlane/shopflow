"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/hooks/use-cart";

const NAV_LINKS = [
  { label: "Shop All", href: "/store/products" },
  { label: "Ceramic", href: "/store/products?category=ceramic" },
  { label: "Glass", href: "/store/products?category=glass" },
  { label: "Wood", href: "/store/products?category=wood" },
  { label: "Textile", href: "/store/products?category=textile" },
];

export function StoreHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        style={{ backgroundColor: "hsl(220, 35%, 14%)" }}
        className={`sticky top-0 z-50 transition-shadow duration-300 ${
          scrolled ? "shadow-lg shadow-black/20" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[68px] items-center justify-between">

            {/* Logo */}
            <Link href="/store" className="flex items-center gap-3 group">
              <div
                style={{ borderColor: "hsl(38, 65%, 52%)", color: "hsl(38, 65%, 52%)" }}
                className="h-8 w-8 rounded-sm border flex items-center justify-center transition-colors group-hover:bg-yellow-600/10"
              >
                <span className="font-display text-sm font-semibold">A</span>
              </div>
              <span
                style={{ color: "hsl(36, 28%, 96%)" }}
                className="font-display text-lg font-normal tracking-[0.08em]"
              >
                Atelier
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ color: "hsl(36, 28%, 96%, 0.65)" }}
                  className="text-[13px] font-sans tracking-wide transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right */}
            <div className="flex items-center gap-1">
              <button
                style={{ color: "hsl(36, 28%, 96%, 0.65)" }}
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md hover:text-white hover:bg-white/10 transition-colors"
              >
                <Search size={17} />
              </button>

              <Link
                href="/store/cart"
                style={{ color: "hsl(36, 28%, 96%, 0.65)" }}
                className="relative flex h-9 w-9 items-center justify-center rounded-md hover:text-white hover:bg-white/10 transition-colors"
              >
                <ShoppingBag size={17} />
                {itemCount > 0 && (
                  <span
                    style={{ backgroundColor: "hsl(38, 65%, 52%)", color: "hsl(220, 35%, 14%)" }}
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ color: "hsl(36, 28%, 96%, 0.65)" }}
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md hover:text-white hover:bg-white/10 transition-colors ml-1"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            style={{ backgroundColor: "hsl(220, 30%, 11%)", borderTopColor: "rgba(255,255,255,0.08)" }}
            className="lg:hidden border-t"
          >
            <nav className="mx-auto max-w-7xl px-4 py-6 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ color: "rgba(255,255,255,0.75)" }}
                  className="block py-3 text-sm tracking-wide border-b border-white/5 hover:text-white transition-colors last:border-0"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

