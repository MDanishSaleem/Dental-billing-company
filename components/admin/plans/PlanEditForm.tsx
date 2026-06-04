"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PlanData = {
  id: number;
  name: string;
  tier: string;
  price: unknown;
  billingCycle: string;
  features: unknown;
  maxGalleryImages: number;
  maxServices: number;
  stripePriceId: string | null;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
};

export function PlanEditForm({ plan }: { plan: PlanData }) {
  const router = useRouter();
  const [name, setName] = useState(plan.name);
  const [tier, setTier] = useState(plan.tier);
  const [price, setPrice] = useState(String(plan.price));
  const [billingCycle, setBillingCycle] = useState(plan.billingCycle);
  const [features, setFeatures] = useState(JSON.stringify(plan.features, null, 2));
  const [maxGalleryImages, setMaxGalleryImages] = useState(String(plan.maxGalleryImages));
  const [maxServices, setMaxServices] = useState(String(plan.maxServices));
  const [stripePriceId, setStripePriceId] = useState(plan.stripePriceId ?? "");
  const [isActive, setIsActive] = useState(plan.isActive);
  const [isPopular, setIsPopular] = useState(plan.isPopular);
  const [sortOrder, setSortOrder] = useState(String(plan.sortOrder));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let parsedFeatures: unknown;
    try {
      parsedFeatures = JSON.parse(features);
    } catch {
      setError("Features must be valid JSON");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tier,
          price: parseFloat(price),
          billingCycle,
          features: parsedFeatures,
          maxGalleryImages: parseInt(maxGalleryImages, 10),
          maxServices: parseInt(maxServices, 10),
          stripePriceId: stripePriceId || null,
          isActive,
          isPopular,
          sortOrder: parseInt(sortOrder, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      router.push("/admin/plans");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-slate-800">Plan Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name <span className="text-red-500">*</span></label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tier</label>
            <select value={tier} onChange={(e) => setTier(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="FREE">FREE</option>
              <option value="BASIC">BASIC</option>
              <option value="PREMIUM">PREMIUM</option>
              <option value="FEATURED">FEATURED</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Price (USD) <span className="text-red-500">*</span></label>
            <input type="number" required min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Billing Cycle</label>
            <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="MONTHLY">Monthly</option>
              <option value="ANNUAL">Annual</option>
              <option value="ONE_TIME">One-time</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Max Gallery Images</label>
            <input type="number" min="0" value={maxGalleryImages} onChange={(e) => setMaxGalleryImages(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Max Services</label>
            <input type="number" min="0" value={maxServices} onChange={(e) => setMaxServices(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Stripe Price ID</label>
            <input type="text" value={stripePriceId} onChange={(e) => setStripePriceId(e.target.value)} className={inputClass} placeholder="price_xxx" />
          </div>
          <div>
            <label className={labelClass}>Sort Order</label>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Features (JSON array)</label>
          <textarea
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y"
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-slate-300 text-teal-500 focus:ring-teal-500" />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="rounded border-slate-300 text-teal-500 focus:ring-teal-500" />
            Popular
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="h-9 px-6 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-60">
          {loading ? "Saving…" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.push("/admin/plans")} className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
