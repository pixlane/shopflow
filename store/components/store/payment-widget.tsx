"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { CartItem } from "@/types";
import type { PaymentSession, ProviderId } from "@/lib/payment";

interface PaymentWidgetProps {
  orderId: string;
  cartItems: CartItem[];
  customer: {
    name: string;
    email: string;
    phone?: string;
    address: { line1: string; city: string; postalCode?: string; country: string };
  };
  onSuccess: () => void;
  onError: (message: string) => void;
}

type WidgetState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "ready"; session: PaymentSession }
  | { phase: "processing" }
  | { phase: "succeeded" }
  | { phase: "failed"; message: string };

export function PaymentWidget({
  orderId, cartItems, customer, onSuccess, onError,
}: PaymentWidgetProps) {
  const [state, setState] = useState<WidgetState>({ phase: "idle" });

  // Initialize payment session on mount
  useEffect(() => {
    let cancelled = false;
    setState({ phase: "loading" });

    fetch("/api/payment/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, cartItems, customer }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) {
          setState({ phase: "failed", message: j.error });
          return;
        }
        setState({ phase: "ready", session: j.data as PaymentSession });
      })
      .catch((e) => {
        if (!cancelled)
          setState({ phase: "failed", message: e.message ?? "Network error" });
      });

    return () => { cancelled = true; };
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.phase === "loading") {
    return (
      <LoadingState message="Preparing payment…" />
    );
  }

  if (state.phase === "failed") {
    return (
      <ErrorState
        message={state.message}
        onRetry={() => setState({ phase: "idle" })}
      />
    );
  }

  if (state.phase === "processing") {
    return <LoadingState message="Processing payment…" />;
  }

  if (state.phase === "succeeded") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 flex flex-col items-center gap-4 text-center">
        <CheckCircle2 size={40} className="text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-900">Payment successful!</p>
          <p className="text-sm text-emerald-700 mt-1">Redirecting you now…</p>
        </div>
      </div>
    );
  }

  if (state.phase !== "ready") return null;

  const { session } = state;

  async function handleMockConfirm(succeed: boolean) {
    setState({ phase: "processing" });

    // Simulate the callback
    const clientData = JSON.parse(session.clientToken ?? "{}");
    try {
      const res = await fetch(`/api/payment/callback?provider=mock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...clientData,
          trigger: succeed ? "succeed" : "fail",
          sessionId: session.sessionId,
          orderId,
        }),
      });
      const data = await res.json();
      if (data?.data?.status === "succeeded") {
        setState({ phase: "succeeded" });
        setTimeout(onSuccess, 1200);
      } else {
        const msg = "Payment was declined (simulated failure).";
        setState({ phase: "failed", message: msg });
        onError(msg);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Processing error";
      setState({ phase: "failed", message: msg });
      onError(msg);
    }
  }

  // ── Route to the right widget ────────────────────────────────────────────

  switch (session.providerId) {
    case "mock":
      return (
        <MockPaymentWidget
          session={session}
          onSucceed={() => handleMockConfirm(true)}
          onFail={() => handleMockConfirm(false)}
        />
      );
    case "stripe":
      return (
        <StripeWidget
          session={session}
          onSuccess={() => { setState({ phase: "succeeded" }); setTimeout(onSuccess, 1200); }}
          onError={(m) => { setState({ phase: "failed", message: m }); onError(m); }}
        />
      );
    case "iyzico":
      return (
        <IyzicoWidget
          session={session}
          onSuccess={() => { setState({ phase: "succeeded" }); setTimeout(onSuccess, 1200); }}
          onError={(m) => { setState({ phase: "failed", message: m }); onError(m); }}
        />
      );
    case "paytr":
      return (
        <PayTRWidget
          session={session}
          onSuccess={() => { setState({ phase: "succeeded" }); setTimeout(onSuccess, 1200); }}
          onError={(m) => { setState({ phase: "failed", message: m }); onError(m); }}
        />
      );
    default:
      return <ErrorState message={`Unknown provider: ${session.providerId}`} />;
  }
}

// ─── Provider-specific widgets ────────────────────────────────────────────────

function MockPaymentWidget({
  session, onSucceed, onFail,
}: {
  session: PaymentSession;
  onSucceed: () => void;
  onFail: () => void;
}) {
  const [cardNum, setCardNum] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [name, setName] = useState("Test User");

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Card Payment</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Mock / test mode — no real charges</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-medium text-amber-700">
          <AlertTriangle size={10} /> Test Mode
        </span>
      </div>

      <div className="p-5 space-y-4">
        <Field label="Card number">
          <input
            value={cardNum}
            onChange={(e) => setCardNum(e.target.value)}
            className={baseCls}
            placeholder="1234 5678 9012 3456"
          />
        </Field>
        <Field label="Name on card">
          <input value={name} onChange={(e) => setName(e.target.value)} className={baseCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Expiry">
            <input value={expiry} onChange={(e) => setExpiry(e.target.value)} className={baseCls} placeholder="MM/YY" />
          </Field>
          <Field label="CVV">
            <input value={cvv} onChange={(e) => setCvv(e.target.value)} className={baseCls} placeholder="123" maxLength={4} />
          </Field>
        </div>

        {/* Test triggers */}
        <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-[11px] text-amber-800 space-y-1">
          <p className="font-medium">Test cards:</p>
          <p>4242 4242 4242 4242 → <span className="text-emerald-700 font-medium">Success</span></p>
          <p>4000 0000 0000 0002 → <span className="text-red-600 font-medium">Decline</span></p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSucceed}
            className="flex-1 h-11 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 active:scale-[0.99] transition-all"
          >
            Pay now (succeed)
          </button>
          <button
            onClick={onFail}
            className="h-11 px-4 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Test failure
          </button>
        </div>
      </div>
    </div>
  );
}

function StripeWidget({
  session, onSuccess, onError,
}: {
  session: PaymentSession;
  onSuccess: () => void;
  onError: (m: string) => void;
}) {
  // In production: mount Stripe Elements using session.clientToken (client_secret)
  // import { loadStripe } from "@stripe/stripe-js"
  // const stripe = await loadStripe(publishableKey)
  // const elements = stripe.elements({ clientSecret: session.clientToken })
  return (
    <ProviderFrame
      name="Stripe"
      badge="Stripe Elements"
      badgeColor="blue"
      hint={`Client secret: ${session.clientToken?.slice(0, 24)}…`}
      description="In production, mount Stripe's Payment Element here using the client secret above."
      docs="https://stripe.com/docs/payments/payment-element"
      onSimulateSuccess={onSuccess}
      onSimulateFailure={() => onError("Simulated Stripe failure")}
    />
  );
}

function IyzicoWidget({
  session, onSuccess, onError,
}: {
  session: PaymentSession;
  onSuccess: () => void;
  onError: (m: string) => void;
}) {
  // In production: render session.clientToken as innerHTML (it's an HTML snippet)
  // It contains an iframe from Iyzico's CDN that handles card input.
  return (
    <ProviderFrame
      name="Iyzico"
      badge="Checkout Form"
      badgeColor="purple"
      hint={`Token: ${session.providerReference?.slice(0, 32)}…`}
      description="In production, inject session.clientToken as innerHTML. Iyzico's JS SDK renders the checkout iframe automatically."
      docs="https://dev.iyzipay.com/tr/odeme-formu"
      onSimulateSuccess={onSuccess}
      onSimulateFailure={() => onError("Simulated Iyzico failure")}
    />
  );
}

function PayTRWidget({
  session, onSuccess, onError,
}: {
  session: PaymentSession;
  onSuccess: () => void;
  onError: (m: string) => void;
}) {
  // In production: render an iframe pointing to session.redirectUrl
  // <iframe src={`https://www.paytr.com/odeme/guvenli/${session.formToken}`} .../>
  return (
    <ProviderFrame
      name="PayTR"
      badge="iFrame"
      badgeColor="orange"
      hint={`Token: ${session.formToken?.slice(0, 32)}…`}
      description="In production, embed the PayTR iframe using the token above. PayTR handles everything inside the iframe."
      docs="https://dev.paytr.com/iframe-api"
      onSimulateSuccess={onSuccess}
      onSimulateFailure={() => onError("Simulated PayTR failure")}
    />
  );
}

// ─── Generic provider placeholder frame ───────────────────────────────────────

type BadgeColor = "blue" | "purple" | "orange" | "green";

const badgeStyles: Record<BadgeColor, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  purple: "bg-violet-50 border-violet-200 text-violet-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
  green: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

function ProviderFrame({
  name, badge, badgeColor, hint, description, docs,
  onSimulateSuccess, onSimulateFailure,
}: {
  name: string;
  badge: string;
  badgeColor: BadgeColor;
  hint: string;
  description: string;
  docs: string;
  onSimulateSuccess: () => void;
  onSimulateFailure: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">{name}</h3>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${badgeStyles[badgeColor]}`}>
          {badge}
        </span>
      </div>
      <div className="p-5 space-y-4">
        {/* Simulated iframe */}
        <div className="rounded-lg border-2 border-dashed border-border bg-secondary/40 h-48 flex flex-col items-center justify-center gap-3 text-center px-6">
          <div className={`rounded-full border px-3 py-1 text-xs font-medium ${badgeStyles[badgeColor]}`}>
            {name} Widget
          </div>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            {description}
          </p>
          <a
            href={docs}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-muted-foreground hover:text-foreground underline"
          >
            {docs}
          </a>
        </div>

        <p className="text-[11px] text-muted-foreground font-mono break-all">{hint}</p>

        <div className="flex gap-3">
          <button
            onClick={onSimulateSuccess}
            className="flex-1 h-11 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 active:scale-[0.99] transition-all"
          >
            Simulate success
          </button>
          <button
            onClick={onSimulateFailure}
            className="h-11 px-4 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Simulate failure
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Utility states ───────────────────────────────────────────────────────────

function LoadingState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-10 flex flex-col items-center gap-4">
      <Loader2 size={28} className="animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function ErrorState({
  message, onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 flex flex-col items-center gap-4 text-center">
      <XCircle size={32} className="text-destructive" />
      <div>
        <p className="font-medium text-sm">Payment unavailable</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="h-9 px-5 rounded-md border border-border text-sm hover:bg-secondary transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium">{label}</label>
      {children}
    </div>
  );
}

const baseCls =
  "w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";
