import { getOrders } from "@/lib/store";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function AdminCustomersPage() {
  const orders = getOrders();

  const customers = Array.from(
    new Map(
      orders.map((o) => [
        o.customer.email,
        {
          ...o.customer,
          orderCount: orders.filter((x) => x.customer.email === o.customer.email).length,
          totalSpent: orders
            .filter((x) => x.customer.email === o.customer.email)
            .reduce((s, x) => s + x.total, 0),
          lastOrder: orders
            .filter((x) => x.customer.email === o.customer.email)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
            .createdAt,
        },
      ])
    ).values()
  );

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-lg font-semibold">Customers</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{customers.length} total customers</p>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["Name", "Email", "Phone", "City", "Orders", "Total Spent", "Last Order"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground tracking-wider uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.email} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3.5 text-xs font-medium">{c.name}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{c.phone || "—"}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{c.address.city}</td>
                  <td className="px-4 py-3.5 text-xs font-medium">{c.orderCount}</td>
                  <td className="px-4 py-3.5 text-xs font-medium">{formatPrice(c.totalSpent)}</td>
                  <td className="px-4 py-3.5 text-[11px] text-muted-foreground whitespace-nowrap">{formatDate(c.lastOrder)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
