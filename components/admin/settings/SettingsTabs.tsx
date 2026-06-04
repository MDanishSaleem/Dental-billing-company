"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ─── Tab config ───────────────────────────────────────────────────────────────

type SettingField = {
  key: string;
  label: string;
  type?: "text" | "email" | "number" | "color" | "textarea" | "url";
  placeholder?: string;
  hint?: string;
};

type Tab = {
  id: string;
  label: string;
  fields: SettingField[];
};

const TABS: Tab[] = [
  {
    id: "general",
    label: "General",
    fields: [
      { key: "site_name", label: "Site Name", type: "text", placeholder: "DentalBilling Directory" },
      { key: "site_tagline", label: "Tagline", type: "text", placeholder: "Find the best dental billing companies" },
      { key: "contact_email", label: "Contact Email", type: "email", placeholder: "hello@example.com" },
    ],
  },
  {
    id: "email",
    label: "Email",
    fields: [
      { key: "smtp_host", label: "SMTP Host", type: "text", placeholder: "smtp.sendgrid.net" },
      { key: "smtp_port", label: "SMTP Port", type: "number", placeholder: "587" },
      { key: "smtp_user", label: "SMTP Username", type: "text", placeholder: "apikey" },
      { key: "smtp_from_name", label: "From Name", type: "text", placeholder: "DentalBilling Directory" },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    fields: [
      { key: "stripe_publishable_key", label: "Stripe Publishable Key", type: "text", placeholder: "pk_live_…" },
      {
        key: "payoneer_instructions",
        label: "Payoneer Instructions",
        type: "textarea",
        placeholder: "Instructions shown to users paying via Payoneer…",
      },
    ],
  },
  {
    id: "seo",
    label: "SEO",
    fields: [
      { key: "google_analytics_id", label: "Google Analytics ID", type: "text", placeholder: "G-XXXXXXXXXX" },
      { key: "meta_title_suffix", label: "Meta Title Suffix", type: "text", placeholder: " | DentalBilling Directory" },
      { key: "robots_txt", label: "robots.txt Content", type: "textarea", placeholder: "User-agent: *\nAllow: /" },
    ],
  },
  {
    id: "appearance",
    label: "Appearance",
    fields: [
      { key: "primary_color", label: "Primary Color", type: "color" },
      { key: "custom_css", label: "Custom CSS", type: "textarea", placeholder: "/* custom CSS here */" },
    ],
  },
];

// ─── Tab component ─────────────────────────────────────────────────────────────

interface TabPanelProps {
  tab: Tab;
  values: Record<string, string>;
}

function TabPanel({ tab, values }: TabPanelProps) {
  const [fields, setFields] = useState<Record<string, string>>(
    Object.fromEntries(tab.fields.map((f) => [f.key, values[f.key] ?? ""]))
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const settings = Object.entries(fields).map(([key, value]) => ({ key, value }));
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg">Settings saved successfully.</div>}

      {tab.fields.map((field) => (
        <div key={field.key}>
          <label className={labelClass}>{field.label}</label>
          {field.type === "textarea" ? (
            <textarea
              value={fields[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              rows={5}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y font-mono"
            />
          ) : field.type === "color" ? (
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={fields[field.key] || "#0d9488"}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={fields[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder="#0d9488"
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm w-32 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          ) : (
            <input
              type={field.type ?? "text"}
              value={fields[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={inputClass}
            />
          )}
          {field.hint && <p className="text-xs text-slate-400 mt-1">{field.hint}</p>}
        </div>
      ))}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="h-9 px-6 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsTabs({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <div className="space-y-4">
      {/* Tab nav */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              activeTab === tab.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <TabPanel key={activeTab} tab={currentTab} values={initialSettings} />
      </div>
    </div>
  );
}
