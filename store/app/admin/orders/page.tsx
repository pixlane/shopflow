import Link from "next/link";
import { Eye } from "lucide-react";
import { getOrders } from "@/lib/store";
import { formatPrice, formatDateTime, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

const STATUS_TABS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const allOrders = getOrders();
  const activeStatus = (searchParams.status as OrderStatus) || "all";
  const sorted = activeStatus === "all"
    ? allOrders
    : allOrders.filter((o) => o.status === activeStatus);

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Orders</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{allOrders.length} total orders</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-lg font-semibold">{formatPrice(allOrders.reduce((s, o) => s + o.total, 0))}</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === "all" ? allOrders.length : allOrders.filter((o) => o.status === tab.value).length;
          const active = activeStatus === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/admin/orders${tab.value !== "all" ? `?status=${tab.value}` : ""}`}
              className={`relative inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${
                active
                  ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["Order", "Customer", "Items", "Payment", "Date", "Total", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground tracking-wider uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{order.orderNumber}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-medium">{order.customer.name}</p>
                    <p className="text-[11px] text-muted-foreground">{order.customer.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} items
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      order.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      order.paymentStatus === "unpaid" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {order.paymentStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[11px] text-muted-foreground whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                  <td className="px-4 py-3.5 text-xs font-semibold whitespace-nowrap">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium whitespace-nowrap ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/orders/${order.id}`} className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Eye size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && (
          <div className="py-12 text-center text-xs text-muted-foreground">No orders found.</div>
        )}
      </div>
    </div>
  );
}
