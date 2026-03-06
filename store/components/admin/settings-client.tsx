"use client";

import { useState } from "react";
import { Store, CreditCard } from "lucide-react";
import { PaymentSettings } from "@/components/admin/payment-settings";

type Tab = "general" | "payment";

const TABS: { id: Tab; label: string; icon: typeof Store }[] = [
  { id: "general", label: "General", icon: Store },
  { id: "payment", label: "Payment", icon: CreditCard },
];

interface SettingsClientProps {
  paymentSnapshot: Parameters<typeof PaymentSettings>[0]["initialSnapshot"];
}

export function SettingsClient({ paymentSnapshot }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your store preferences and integrations
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === id
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* General tab */}
      {activeTab === "general" && (
        <div className="space-y-5">
          {[
            {
              title: "Store Information",
              fields: [
                { label: "Store Name", value: "Atelier" },
                { label: "Contact Email", value: "hello@atelier.com" },
                { label: "Currency", value: "USD" },
                { label: "Timezone", value: "Europe/Istanbul" },
              ],
            },
            {
              title: "Shipping",
              fields: [
                { label: "Free Shipping Threshold", value: "$150" },
                { label: "Default Shipping Cost", value: "$15" },
                { label: "Shipping Origin", value: "Istanbul, TR" },
              ],
            },
            {
              title: "Admin Account",
              fields: [
                { label: "Name", value: "Admin User" },
                { label: "Email", value: "admin@atelier.com" },
                { label: "Role", value: "Administrator" },
              ],
            },
          ].map((section) => (
            <div key={section.title} className="rounded-xl border border-border bg-card">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold">{section.title}</h2>
              </div>
              <div className="p-5 space-y-4">
                {section.fields.map((field) => (
                  <div
                    key={field.label}
                    className="grid grid-cols-[160px_1fr] gap-4 items-center"
                  >
                    <label className="text-xs font-medium text-muted-foreground">
                      {field.label}
                    </label>
                    <input
                      defaultValue={field.value}
                      className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div className="px-5 py-3.5 border-t border-border flex justify-end">
                <button className="h-8 px-4 rounded-md bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors">
                  Save changes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment tab */}
      {activeTab === "payment" && (
        <PaymentSettings initialSnapshot={paymentSnapshot} />
      )}
    </div>
  );
}
