import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { getOrders, getProducts } from "@/lib/store";
import { formatPrice, formatDateTime, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const orders = getOrders();
  const products = getProducts();

  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(orders.reduce((s, o) => s + o.total, 0)),
      change: +12.5,
      icon: TrendingUp,
    },
    {
      label: "Orders",
      value: orders.length.toString(),
      change: +8.2,
      icon: ShoppingBag,
    },
    {
      label: "Products",
      value: products.length.toString(),
      change: 0,
      icon: Package,
    },
    {
      label: "Customers",
      value: new Set(orders.map((o) => o.customer.email)).size.toString(),
      change: +5.1,
      icon: Users,
    },
  ];

  const recent = orders.slice(0, 5);
  const lowStock = products.filter((p) => p.stock <= 6);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const positive = stat.change >= 0;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon size={16} className="text-muted-foreground" />
                </div>
                {stat.change !== 0 && (
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${positive ? "text-emerald-700" : "text-red-600"}`}>
                    <ArrowUpRight size={12} />
                    {Math.abs(stat.change)}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Recent orders */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Order", "Customer", "Date", "Total", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-medium text-muted-foreground tracking-wider uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      <Link href={`/admin/orders/${order.id}`} className="hover:text-foreground transition-colors">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-xs">{order.customer.name}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                    <td className="px-5 py-3.5 text-xs font-medium">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Low Stock</h2>
            <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Manage →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {lowStock.length === 0 && (
              <p className="px-5 py-4 text-xs text-muted-foreground">All products are well-stocked.</p>
            )}
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="relative h-10 w-10 rounded-md overflow-hidden bg-secondary shrink-0">
                  {p.images[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{p.sku}</p>
                </div>
                <span className={`text-[11px] font-semibold shrink-0 ${p.stock <= 2 ? "text-red-600" : "text-amber-600"}`}>
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
