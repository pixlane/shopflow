"use client";

import Link from "next/link";
import { ShoppingBag, Heart, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/hooks/use-cart";

const NAV = [
  { label: "Home", href: "/store" },
  { label: "Shop", href: "/store/products" },
  { label: "Ceramic", href: "/store/products?category=ceramic" },
  { label: "Glass", href: "/store/products?category=glass" },
  { label: "Wood", href: "/store/products?category=wood" },
  { label: "Textile", href: "/store/products?category=textile" },
];

export function StoreHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : "border-b border-border"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[70px] items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/store" className="flex items-center gap-2 shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 24L14 4L24 24" stroke="#bb976d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 18H21" stroke="#bb976d" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-xl font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--body-text)" }}>
              Atelier
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href}
                className="text-[13px] font-medium tracking-[0.08em] uppercase text-muted-foreground hover:text-gold transition-colors"
                style={{ "--tw-text-opacity": "1" } as React.CSSProperties}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-gold transition-colors">
              <Search size={18} />
            </button>
            <button className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-gold transition-colors">
              <Heart size={18} />
            </button>
            <Link href="/store/cart" className="relative h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-gold transition-colors">
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "var(--red-sale)" }}>
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setOpen(!open)}
              className="lg:hidden h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-gold transition-colors ml-1">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-0">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="block py-3 text-[13px] font-medium tracking-[0.08em] uppercase text-muted-foreground hover:text-gold transition-colors border-b border-border last:border-0">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
