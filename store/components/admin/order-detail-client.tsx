"use client";
import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "./toast";
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const ORDER_STATUSES: OrderStatus[] = [
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded",
];

export function OrderDetailClient({ order: initial }: { order: Order }) {
  const { success, error } = useToast();
  const [order, setOrder] = useState(initial);
  const [status, setStatus] = useState<OrderStatus>(initial.status as OrderStatus);
  const [saving, setSaving] = useState(false);

  const dirty = status !== order.status;

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrder(data.data ?? { ...order, status });
      success("Order updated");
    } catch (e) {
      error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const items = (order as any).order_items ?? [];
  const shippingAddr = order.shipping_address as Record<string, string> | null ?? {};

  return (
    <div className="grid md:grid-cols-[1fr_300px] gap-5">
      {/* Left */}
      <div className="space-y-5">
        {/* Items */}
        <div className="rounded-xl border border-border bg-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Items</h2>
          </div>
          <div className="divide-y divide-border">
            {items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="relative h-14 w-14 rounded-md overflow-hidden bg-secondary shrink-0">
                  {item.product_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{item.product_name}</p>
                  <p className="text-[11px] text-muted-foreground">qty: {item.quantity}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium">{formatPrice(item.subtotal)}</p>
                  <p className="text-[11px] text-muted-foreground">{formatPrice(item.price)} × {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-border space-y-2">
            {[
              { label: "Subtotal", value: formatPrice(order.subtotal) },
              { label: "Shipping", value: order.shipping_cost === 0 ? "Free" : formatPrice(order.shipping_cost) },
              ...(order.discount > 0 ? [{ label: "Discount", value: `−${formatPrice(order.discount)}` }] : []),
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span>{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="space-y-4">
        {/* Status panel */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider">Order Status</h2>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Status</label>
              <div className="mb-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${ORDER_STATUS_COLORS[status] ?? ""}`}>
                  {ORDER_STATUS_LABELS[status] ?? status}
                </span>
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className={selCls}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
          {dirty && (
            <button
              onClick={save}
              disabled={saving}
              className="w-full h-9 rounded-md bg-foreground text-background text-xs font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save changes
            </button>
          )}
        </div>

        {/* Payment method */}
        {order.payment_method && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider">Payment</h2>
            <p className="text-xs text-muted-foreground capitalize">{order.payment_method.replace(/_/g, " ")}</p>
          </div>
        )}

        {/* Shipping address */}
        {Object.keys(shippingAddr).length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider">Ship To</h2>
            <address className="not-italic text-xs text-muted-foreground space-y-0.5 leading-relaxed">
              {shippingAddr.name && <p className="font-medium text-foreground">{shippingAddr.name}</p>}
              {shippingAddr.line1 && <p>{shippingAddr.line1}</p>}
              {shippingAddr.line2 && <p>{shippingAddr.line2}</p>}
              {shippingAddr.city && <p>{shippingAddr.city}{shippingAddr.postal_code ? `, ${shippingAddr.postal_code}` : ""}</p>}
              {shippingAddr.country && <p>{shippingAddr.country}</p>}
              {shippingAddr.phone && <p>{shippingAddr.phone}</p>}
            </address>
          </div>
        )}

        {/* Customer */}
        {order.guest_email && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider">Customer</h2>
            <p className="text-xs text-muted-foreground">{order.guest_email}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const selCls = "w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring";
