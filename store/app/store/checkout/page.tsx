"use client";

export const dynamic = "force-dynamic";


import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Lock } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { PaymentWidget } from "@/components/store/payment-widget";

type Step = "info" | "payment";

interface CustomerForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

const EMPTY_FORM: CustomerForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "TR",
};

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const [step, setStep] = useState<Step>("info");
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<CustomerForm>>({});

  // Generate a stable order ID for this checkout session
  const [orderId] = useState(
    () => `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  );

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-light">Your cart is empty</p>
          <Link
            href="/store/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  function validate(): boolean {
    const e: Partial<CustomerForm> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function set(k: keyof CustomerForm, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) setStep("payment");
  }

  const customer = {
    name: `${form.firstName} ${form.lastName}`.trim(),
    email: form.email,
    phone: form.phone,
    address: {
      line1: form.address,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country,
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/store/cart"
          className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
        >
          <ChevronLeft size={15} />
        </Link>
        <div>
          <h1 className="text-xl font-light tracking-tight">Checkout</h1>
          <div className="flex items-center gap-3 mt-1">
            {(["info", "payment"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <span className="text-border text-xs">—</span>}
                <span
                  className={`text-xs font-medium ${
                    step === s
                      ? "text-foreground"
                      : i < (["info", "payment"] as Step[]).indexOf(step)
                      ? "text-muted-foreground"
                      : "text-muted-foreground/40"
                  }`}
                >
                  {s === "info" ? "1. Shipping info" : "2. Payment"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Left — step content */}
        <div>
          {step === "info" && (
            <form onSubmit={handleInfoSubmit} className="space-y-5">
              <Section title="Contact">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="First name" error={errors.firstName}>
                    <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputCls(errors.firstName)} />
                  </Field>
                  <Field label="Last name" error={errors.lastName}>
                    <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputCls(errors.lastName)} />
                  </Field>
                </div>
                <Field label="Email" error={errors.email}>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls(errors.email)} />
                </Field>
                <Field label="Phone" hint="Optional">
                  <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls()} />
                </Field>
              </Section>

              <Section title="Shipping address">
                <Field label="Street address" error={errors.address}>
                  <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls(errors.address)} />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="City" error={errors.city}>
                    <input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls(errors.city)} />
                  </Field>
                  <Field label="Postal code">
                    <input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <Field label="Country">
                  <select value={form.country} onChange={(e) => set("country", e.target.value)} className={inputCls()}>
                    <option value="TR">Turkey</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="NL">Netherlands</option>
                  </select>
                </Field>
              </Section>

              <button type="submit" className="w-full h-12 rounded-md bg-foreground text-background font-medium hover:bg-foreground/90 active:scale-[0.99] transition-all">
                Continue to Payment
              </button>
            </form>
          )}

          {step === "payment" && (
            <div className="space-y-4">
              {/* Summary of info */}
              <div className="rounded-xl border border-border bg-secondary/30 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">{customer.email}</p>
                  <p className="text-xs text-muted-foreground">{form.address}, {form.city}</p>
                </div>
                <button onClick={() => setStep("info")} className="text-xs text-muted-foreground hover:text-foreground underline">
                  Edit
                </button>
              </div>

              <PaymentWidget
                orderId={orderId}
                cartItems={items}
                customer={customer}
                onSuccess={() => {
                  clearCart();
                  window.location.href = `/store/checkout/success?orderId=${orderId}`;
                }}
                onError={(msg) => {
                  window.location.href = `/store/checkout/failed?reason=${encodeURIComponent(msg)}`;
                }}
              />
            </div>
          )}
        </div>

        {/* Right — order summary */}
        <div className="rounded-xl border border-border bg-card sticky top-24">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Order summary</h2>
          </div>

          {/* Items */}
          <div className="px-5 py-4 space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-md overflow-hidden bg-secondary shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {item.product.images[0] && (
                    <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                  )}
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-foreground text-background text-[9px] flex items-center justify-center font-medium">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.product.name}</p>
                  <p className="text-[11px] text-muted-foreground">{item.product.categories?.name ?? ""}</p>
                </div>
                <p className="text-xs font-medium shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-5 py-4 border-t border-border space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Shipping</span>
              <span className={shipping() === 0 ? "text-emerald-700" : ""}>
                {shipping() === 0 ? "Free" : formatPrice(shipping())}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border mt-1">
              <span>Total</span>
              <span>{formatPrice(total())}</span>
            </div>
          </div>

          {/* Trust signals */}
          <div className="px-5 pb-4 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock size={11} /> SSL secured
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck size={11} /> 30-day returns
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="px-5 py-3.5 border-b border-border">
        <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label, hint, error, children,
}: {
  label?: string; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {(label || hint) && (
        <div className="flex items-center justify-between">
          {label && <label className="text-xs font-medium">{label}</label>}
          {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
        </div>
      )}
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function inputCls(error?: string) {
  return `w-full h-9 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors bg-background ${
    error ? "border-destructive" : "border-input"
  }`;
}

