import Link from "next/link";
import { Eye } from "lucide-react";
import { getAllOrders } from "@/lib/store";
import { formatPrice, formatDateTime, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const allOrders = await getAllOrders();
  const activeStatus = searchParams.status || "all";
  const sorted = activeStatus === "all" ? allOrders : allOrders.filter((o) => o.status === activeStatus);
  const statusColors = ORDER_STATUS_COLORS as Record<string, string>;
  const statusLabels = ORDER_STATUS_LABELS as Record<string, string>;

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Orders</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{allOrders.length} total orders</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-lg font-semibold">{formatPrice(allOrders.reduce((s, o) => s + Number(Number(o.total)), 0))}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 border-b border-border">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === "all" ? allOrders.length : allOrders.filter((o) => o.status === tab.value).length;
          const active = activeStatus === tab.value;
          return (
            <Link key={tab.value} href={`/admin/orders${tab.value !== "all" ? `?status=${tab.value}` : ""}`}
              className={`relative inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${active ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {tab.label}
              {count > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>{count}</span>}
            </Link>
          );
        })}
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["Order", "Customer", "Items", "Date", "Total", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground tracking-wider uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((order) => {
                const profile = (order as any).profiles;
                const customerName = profile?.full_name ?? order.guest_email ?? "Guest";
                const customerEmail = profile?.email ?? order.guest_email ?? "—";
                const itemCount = (order as any).order_items?.reduce((s: number, i: any) => s + i.quantity, 0) ?? 0;
                return (
                  <tr key={order.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{order.order_number}</td>
                    <td className="px-4 py-3.5"><p className="text-xs font-medium">{customerName}</p><p className="text-[11px] text-muted-foreground">{customerEmail}</p></td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{itemCount} items</td>
                    <td className="px-4 py-3.5 text-[11px] text-muted-foreground whitespace-nowrap">{formatDateTime(order.created_at)}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold whitespace-nowrap">{formatPrice(Number(Number(order.total)))}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium whitespace-nowrap ${statusColors[order.status] ?? ""}`}>
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/admin/orders/${order.id}`} className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Eye size={13} /></Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && <div className="py-12 text-center text-xs text-muted-foreground">No orders found.</div>}
      </div>
    </div>
  );
}