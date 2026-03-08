"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "./toast";
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const ORDER_STATUSES: OrderStatus[] = [
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded",
];

const PAYMENT_STATUSES: string[] = [
  "unpaid", "paid", "partially_paid", "refunded", "voided",
];

const FULFILLMENT_STATUSES: string[] = [
  "unfulfilled", "partial", "fulfilled", "returned",
];

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  unpaid: "bg-red-50 text-red-700 border-red-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  partially_paid: "bg-amber-50 text-amber-700 border-amber-200",
  refunded: "bg-violet-50 text-violet-700 border-violet-200",
  voided: "bg-gray-50 text-gray-600 border-gray-200",
};

const FULFILLMENT_COLORS: Record<FulfillmentStatus, string> = {
  unfulfilled: "bg-amber-50 text-amber-700 border-amber-200",
  partial: "bg-blue-50 text-blue-700 border-blue-200",
  fulfilled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  returned: "bg-violet-50 text-violet-700 border-violet-200",
};

export function OrderDetailClient({ order: initial }: { order: Order }) {
  const { success, error } = useToast();
  const [order, setOrder] = useState(initial);
  const [status, setStatus] = useState(initial.status);
  const [paymentStatus, setPaymentStatus] = useState(initial.paymentStatus);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(initial.fulfillmentStatus);
  const [trackingNumber, setTrackingNumber] = useState(initial.trackingNumber ?? "");
  const [shippingCarrier, setShippingCarrier] = useState(initial.shippingCarrier ?? "");
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [tags, setTags] = useState(initial.tags.join(", "));
  const [saving, setSaving] = useState(false);

  const dirty =
    status !== order.status ||
    paymentStatus !== order.paymentStatus ||
    fulfillmentStatus !== order.fulfillmentStatus ||
    trackingNumber !== (order.trackingNumber ?? "") ||
    shippingCarrier !== (order.shippingCarrier ?? "") ||
    notes !== (order.notes ?? "") ||
    tags !== order.tags.join(", ");

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          paymentStatus,
          fulfillmentStatus,
          trackingNumber: trackingNumber || undefined,
          shippingCarrier: shippingCarrier || undefined,
          notes: notes || undefined,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrder(data.data);
      success("Order updated");
    } catch (e) {
      error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

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
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 px-5 py-4">
                <div className="relative h-14 w-14 rounded-md overflow-hidden bg-secondary shrink-0">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                      No img
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{item.productName}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{(item as any).sku ?? ""}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium">{formatPrice(item.price * item.quantity)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-border space-y-2">
            {[
              { label: "Subtotal", value: formatPrice(order.subtotal) },
              { label: "Shipping", value: order.shipping === 0 ? "Free" : formatPrice(order.shipping) },
              ...(order.discount > 0 ? [{ label: "Discount", value: `−${formatPrice(order.discount)}` }] : []),
              ...(order.tax > 0 ? [{ label: "Tax", value: formatPrice(order.tax) }] : []),
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

        {/* Notes */}
        <div className="rounded-xl border border-border bg-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Internal Notes</h2>
          </div>
          <div className="p-5">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add a note about this order…"
              className="w-full text-xs px-3 py-2 rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="space-y-4">
        {/* Status panel */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider">Order Status</h2>

          <div className="space-y-3">
            <Field label="Fulfillment">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${FULFILLMENT_COLORS[fulfillmentStatus]}`}>
                  {fulfillmentStatus.replace("_", " ")}
                </span>
              </div>
              <select value={fulfillmentStatus} onChange={(e) => setFulfillmentStatus(e.target.value as FulfillmentStatus)} className={selCls}>
                {FULFILLMENT_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </Field>

            <Field label="Payment">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${PAYMENT_COLORS[paymentStatus]}`}>
                  {paymentStatus.replace("_", " ")}
                </span>
              </div>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)} className={selCls}>
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </Field>

            <Field label="Order status">
              <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className={selCls}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
              </select>
            </Field>
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

        {/* Tracking */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider">Shipping</h2>
          <Field label="Carrier">
            <input value={shippingCarrier} onChange={(e) => setShippingCarrier(e.target.value)} placeholder="e.g. PTT Kargo" className={inCls} />
          </Field>
          <Field label="Tracking number">
            <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. TK-0000000001" className={`${inCls} font-mono`} />
          </Field>
        </div>

        {/* Tags */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider">Tags</h2>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="gift, priority, …"
            className={inCls}
          />
          {tags && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                <span key={tag} className="h-5 px-2 inline-flex items-center rounded-full border border-border text-[11px] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Customer */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider">Customer</h2>
          <div>
            <p className="text-sm font-medium">{order.customer.name}</p>
            <p className="text-xs text-muted-foreground">{order.customer.email}</p>
            {order.customer.phone && <p className="text-xs text-muted-foreground">{order.customer.phone}</p>}
          </div>
          <div className="h-px bg-border" />
          <address className="not-italic text-xs text-muted-foreground space-y-0.5 leading-relaxed">
            <p>{order.customer.address.line1}</p>
            {order.customer.address.line2 && <p>{order.customer.address.line2}</p>}
            <p>{order.customer.address.city}, {order.customer.address.postalCode}</p>
            <p>{order.customer.address.country}</p>
          </address>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      {label && <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</label>}
      {children}
    </div>
  );
}

const inCls = "w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring";
const selCls = "w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring";
