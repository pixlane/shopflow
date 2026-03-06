"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  TestTube2,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/admin/toast";
import type { ProviderId, ProviderConfig, ConfigField } from "@/lib/payment";

// ─── Static display data per provider (logos, colors) ─────────────────────────

const PROVIDER_DISPLAY: Record<
  ProviderId,
  { color: string; bg: string; border: string; accent: string }
> = {
  mock: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    accent: "bg-amber-500",
  },
  stripe: {
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    accent: "bg-violet-600",
  },
  iyzico: {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    accent: "bg-blue-600",
  },
  paytr: {
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    accent: "bg-orange-600",
  },
};

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ProviderSnapshot {
  id: ProviderId;
  meta: {
    name: string;
    description: string;
    currencies: string[];
    markets: string[];
    checkoutMode: string;
  };
  config: ProviderConfig;
  configFields: ConfigField[];
  validationError: string | null;
}

interface Snapshot {
  activeProviderId: ProviderId;
  providers: ProviderSnapshot[];
}

interface PaymentSettingsProps {
  initialSnapshot: Snapshot;
}

// ─── Main component ────────────────────────────────────────────────────────────

export function PaymentSettings({ initialSnapshot }: PaymentSettingsProps) {
  const { success, error } = useToast();
  const [snapshot, setSnapshot] = useState<Snapshot>(initialSnapshot);
  const [expandedId, setExpandedId] = useState<ProviderId | null>(null);
  const [pending, startTransition] = useTransition();

  async function setActive(id: ProviderId) {
    try {
      const res = await fetch("/api/payment/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setActive", providerId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSnapshot(data.data);
      success(`${id} set as active payment provider`);
    } catch (e) {
      error(e instanceof Error ? e.message : "Failed to update");
    }
  }

  async function saveConfig(id: ProviderId, credentials: Record<string, string>, options: Record<string, string | number | boolean>, mode: "test" | "live") {
    try {
      const res = await fetch("/api/payment/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateConfig", providerId: id, credentials, options, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSnapshot(data.data);
      success(`${id} configuration saved`);
    } catch (e) {
      error(e instanceof Error ? e.message : "Save failed");
    }
  }

  const active = snapshot.providers.find((p) => p.id === snapshot.activeProviderId);

  return (
    <div className="space-y-5">
      {/* Active provider badge */}
      {active && (
        <div className="rounded-xl border border-border bg-card px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${PROVIDER_DISPLAY[active.id].accent}`} />
            <div>
              <p className="text-xs font-medium">Active provider: <span className="font-semibold">{active.meta.name}</span></p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {active.config.mode === "test" ? "⚠ Test mode — no real charges" : "✓ Live mode"}
                {" · "}{active.meta.checkoutMode} checkout
              </p>
            </div>
          </div>
          {active.config.mode === "test" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-medium text-amber-700">
              <TestTube2 size={10} /> Test Mode
            </span>
          )}
        </div>
      )}

      {/* Provider cards */}
      {snapshot.providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          isActive={provider.id === snapshot.activeProviderId}
          isExpanded={expandedId === provider.id}
          onToggleExpand={() =>
            setExpandedId(expandedId === provider.id ? null : provider.id)
          }
          onSetActive={() => setActive(provider.id)}
          onSave={(creds, opts, mode) => saveConfig(provider.id, creds, opts, mode)}
        />
      ))}

      {/* Info box */}
      <div className="rounded-xl border border-border bg-secondary/30 px-5 py-4 flex items-start gap-3">
        <ShieldCheck size={15} className="text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground mb-1">Security note</p>
          Secret keys are stored server-side only and never exposed to the browser.
          Saved secrets are shown as &quot;••••••&quot; — to update, type a new value.
          In production, use environment variables instead of UI-saved secrets.
        </div>
      </div>
    </div>
  );
}

// ─── Provider card ─────────────────────────────────────────────────────────────

function ProviderCard({
  provider,
  isActive,
  isExpanded,
  onToggleExpand,
  onSetActive,
  onSave,
}: {
  provider: ProviderSnapshot;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSetActive: () => void;
  onSave: (
    credentials: Record<string, string>,
    options: Record<string, string | number | boolean>,
    mode: "test" | "live"
  ) => Promise<void>;
}) {
  const d = PROVIDER_DISPLAY[provider.id];
  const hasError = !!provider.validationError && provider.id !== "mock";

  return (
    <div className={`rounded-xl border bg-card overflow-hidden transition-all ${
      isActive ? `border-foreground/30` : "border-border"
    }`}>
      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Active indicator */}
        <div className={`h-3 w-3 rounded-full shrink-0 border-2 transition-colors ${
          isActive ? `${d.accent} border-transparent` : "border-muted-foreground/30 bg-transparent"
        }`} />

        {/* Provider info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{provider.meta.name}</span>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${d.bg} ${d.border} ${d.color}`}>
              {provider.meta.checkoutMode}
            </span>
            {provider.config.mode === "test" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                <TestTube2 size={9} /> test
              </span>
            )}
            {provider.config.mode === "live" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                <Zap size={9} /> live
              </span>
            )}
            {hasError && !isActive && (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-600">
                <AlertTriangle size={10} /> Not configured
              </span>
            )}
            {!hasError && provider.id !== "mock" && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                <CheckCircle2 size={10} /> Configured
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-md">
            {provider.meta.description}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {provider.meta.currencies.join(", ")} · {provider.meta.markets.join(", ")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isActive && (
            <button
              onClick={onSetActive}
              disabled={hasError && provider.id !== "mock"}
              className="h-8 px-3 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Activate
            </button>
          )}
          {isActive && (
            <span className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 size={11} /> Active
            </span>
          )}
          <button
            onClick={onToggleExpand}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded config form */}
      {isExpanded && (
        <ProviderConfigForm
          provider={provider}
          onSave={onSave}
        />
      )}
    </div>
  );
}

// ─── Config form ───────────────────────────────────────────────────────────────

function ProviderConfigForm({
  provider,
  onSave,
}: {
  provider: ProviderSnapshot;
  onSave: (
    credentials: Record<string, string>,
    options: Record<string, string | number | boolean>,
    mode: "test" | "live"
  ) => Promise<void>;
}) {
  const credentialFields = provider.configFields.filter(
    (f) => !["autoSucceed", "delayMs", "installments", "locale", "lang",
             "maxInstallment", "noInstallment", "captureMethod", "paymentMethods"].includes(f.key)
  );
  const optionFields = provider.configFields.filter(
    (f) => ["autoSucceed", "delayMs", "installments", "locale", "lang",
             "maxInstallment", "noInstallment", "captureMethod", "paymentMethods"].includes(f.key)
  );

  const [credentials, setCredentials] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        credentialFields.map((f) => [f.key, String(provider.config.credentials[f.key] ?? "")])
      )
  );
  const [options, setOptions] = useState<Record<string, string | number | boolean>>(
    () => ({ ...provider.config.options })
  );
  const [mode, setMode] = useState<"test" | "live">(provider.config.mode);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(credentials, options, mode);
    setSaving(false);
  }

  return (
    <div className="border-t border-border bg-secondary/20 p-5 space-y-5">
      {/* Mode toggle */}
      <div className="flex items-center gap-4 pb-4 border-b border-border/60">
        <span className="text-xs font-medium">Mode</span>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["test", "live"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-colors ${
                mode === m
                  ? m === "live"
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-500 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              }`}
            >
              {m === "test" ? <TestTube2 size={11} /> : <Zap size={11} />}
              {m === "test" ? "Test" : "Live"}
            </button>
          ))}
        </div>
        {mode === "live" && (
          <span className="text-[11px] text-red-600 flex items-center gap-1">
            <AlertTriangle size={10} /> Live mode charges real money
          </span>
        )}
      </div>

      {/* Credentials */}
      {credentialFields.length > 0 && (
        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Credentials
          </p>
          {credentialFields.map((field) => (
            <ConfigFieldInput
              key={field.key}
              field={field}
              value={String(credentials[field.key] ?? "")}
              onChange={(v) => setCredentials((c) => ({ ...c, [field.key]: v }))}
            />
          ))}
        </div>
      )}

      {/* Options */}
      {optionFields.length > 0 && (
        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Options
          </p>
          {optionFields.map((field) => (
            <ConfigFieldInput
              key={field.key}
              field={field}
              value={String(options[field.key] ?? "")}
              onChange={(v) => {
                const parsed =
                  field.type === "toggle"
                    ? v === "true"
                    : field.type === "number"
                    ? Number(v)
                    : v;
                setOptions((o) => ({ ...o, [field.key]: parsed }));
              }}
            />
          ))}
        </div>
      )}

      {/* Validation error */}
      {provider.validationError && provider.id !== "mock" && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">{provider.validationError}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-5 rounded-md bg-foreground text-background text-xs font-medium flex items-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : null}
          Save configuration
        </button>
      </div>
    </div>
  );
}

// ─── Individual field renderer ────────────────────────────────────────────────

function ConfigFieldInput({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: string;
  onChange: (v: string) => void;
}) {
  const [shown, setShown] = useState(false);
  const isMasked = value === "••••••";

  return (
    <div className="grid grid-cols-[200px_1fr] gap-4 items-start">
      <div>
        <label className="text-xs font-medium">
          {field.label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        {field.hint && (
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
            {field.hint}
          </p>
        )}
      </div>

      <div>
        {field.type === "toggle" ? (
          <label className="flex items-center gap-2 cursor-pointer">
            <button
              type="button"
              role="switch"
              aria-checked={value === "true"}
              onClick={() => onChange(value === "true" ? "false" : "true")}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                value === "true" ? "bg-foreground" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${
                  value === "true" ? "translate-x-4" : ""
                }`}
              />
            </button>
            <span className="text-xs text-muted-foreground">
              {value === "true" ? "Enabled" : "Disabled"}
            </span>
          </label>
        ) : field.type === "select" ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseCls}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : field.type === "password" ? (
          <div className="relative">
            <input
              type={shown ? "text" : "password"}
              value={isMasked ? "" : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={isMasked ? "••••••  (unchanged)" : field.placeholder}
              className={`${baseCls} pr-9`}
            />
            <button
              type="button"
              onClick={() => setShown(!shown)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {shown ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        ) : field.type === "number" ? (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={baseCls}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={baseCls}
          />
        )}
      </div>
    </div>
  );
}

const baseCls =
  "w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";
