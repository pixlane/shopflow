import { getAllOrders } from "@/lib/store";
import { getCustomers } from "@/lib/store";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const [orders, profiles] = await Promise.all([
    await getAllOrders(),
    await getCustomers(),
  ]);

  // Build customer summary from orders + profiles
  const customerMap = new Map<string, {
    id: string
    name: string
    email: string
    phone: string | null
    city: string
    orderCount: number
    totalSpent: number
    lastOrder: string
  }>();

  // Add from orders (includes guest checkouts)
  for (const order of orders) {
    const addr = order.shipping_address as Record<string, string> | null;
    const email = (order as any).profiles?.email ?? order.guest_email ?? "unknown";
    const name = (order as any).profiles?.full_name ?? addr?.full_name ?? "Guest";
    const city = addr?.city ?? "—";
    const phone = addr?.phone ?? null;

    if (!customerMap.has(email)) {
      customerMap.set(email, {
        id: order.user_id ?? email,
        name,
        email,
        phone,
        city,
        orderCount: 0,
        totalSpent: 0,
        lastOrder: order.created_at });
    }

    const c = customerMap.get(email)!;
    c.orderCount += 1;
    c.totalSpent += Number(Number(order.total));
    if (new Date(order.created_at) > new Date(c.lastOrder)) {
      c.lastOrder = order.created_at;
    }
  }

  // Also add registered customers with no orders
  for (const profile of profiles) {
    if (!customerMap.has(profile.email ?? "")) {
      customerMap.set(profile.email ?? profile.id, {
        id: profile.id,
        name: profile.full_name ?? "—",
        email: profile.email ?? "—",
        phone: profile.phone ?? null,
        city: "—",
        orderCount: 0,
        totalSpent: 0,
        lastOrder: profile.created_at });
    }
  }

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime()
  );

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-lg font-semibold">Customers</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {customers.length} total customers
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["Name", "Email", "Phone", "City", "Orders", "Total Spent", "Last Order"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground tracking-wider uppercase whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No customers yet
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.email} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-medium">{c.name}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{c.city}</td>
                    <td className="px-4 py-3.5 text-xs font-medium">{c.orderCount}</td>
                    <td className="px-4 py-3.5 text-xs font-medium">{formatPrice(c.totalSpent)}</td>
                    <td className="px-4 py-3.5 text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatDate(c.lastOrder)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
