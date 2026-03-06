"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Store,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/admin/toast";

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-60 bg-foreground text-background flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-background/10">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-sm bg-background/20 flex items-center justify-center">
            <span className="text-background text-[10px] font-bold">A</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase">Atelier</p>
            <p className="text-[9px] text-background/40 tracking-wider">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 h-9 px-3 rounded-md text-[13px] font-medium transition-colors",
                active
                  ? "bg-background/15 text-background"
                  : "text-background/50 hover:text-background hover:bg-background/10"
              )}
            >
              <Icon size={15} className="shrink-0" />
              {label}
              {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-background/10 space-y-0.5">
        <Link
          href="/store"
          className="flex items-center gap-3 h-9 px-3 rounded-md text-[13px] text-background/50 hover:text-background hover:bg-background/10 transition-colors"
        >
          <Store size={15} />
          View storefront
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-3 h-9 px-3 rounded-md text-[13px] text-background/50 hover:text-background hover:bg-background/10 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </Link>
      </div>
    </aside>
  );
}

function AdminTopBar() {
  const pathname = usePathname();
  const page = NAV.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/")
  );

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <h1 className="text-sm font-semibold">{page?.label ?? "Admin"}</h1>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">
          AD
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col ml-60 min-w-0">
          <AdminTopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
