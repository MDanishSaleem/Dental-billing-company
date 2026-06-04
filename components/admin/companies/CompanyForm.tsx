"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ServiceCategory = {
  id: number;
  name: string;
  slug: string;
};

type State = {
  id: number;
  name: string;
  abbreviation: string;
};

type CompanyData = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  status: string;
  tier: string;
  isFeatured: boolean;
  isVerified: boolean;
  isClaimed: boolean;
  email: string | null;
  phone: string | null;
  website: string | null;
  contactName: string | null;
  address: string | null;
  cityId: number | null;
  stateId: number | null;
  zipCode: string | null;
  logo: string | null;
  coverImage: string | null;
  yearFounded: number | null;
  employeeCount: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  linkedIn: string | null;
  twitter: string | null;
  facebook: string | null;
  serviceArea: string | null;
  services: { category: { id: number; name: string } }[];
};

type Props = {
  mode: "new" | "edit";
  company?: CompanyData;
  states: State[];
  serviceCategories: ServiceCategory[];
};

type Tab = "basic" | "contact" | "media" | "services" | "seo";

const TABS: { id: Tab; label: string }[] = [
  { id: "basic", label: "Basic Info" },
  { id: "contact", label: "Contact" },
  { id: "media", label: "Media" },
  { id: "services", label: "Services" },
  { id: "seo", label: "SEO" },
];

const EMPLOYEE_COUNTS = ["1-5", "6-10", "11-25", "26-50", "51-100", "100+"];
const STATUSES = ["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"];
const TIERS = ["FREE", "BASIC", "PREMIUM", "FEATURED"];

function createSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export function CompanyForm({ mode, company, states, serviceCategories }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic Info
  const [name, setName] = useState(company?.name ?? "");
  const [slug, setSlug] = useState(company?.slug ?? "");
  const [tagline, setTagline] = useState(company?.tagline ?? "");
  const [description, setDescription] = useState(company?.description ?? "");
  const [yearFounded, setYearFounded] = useState(company?.yearFounded?.toString() ?? "");
  const [employeeCount, setEmployeeCount] = useState(company?.employeeCount ?? "");
  const [status, setStatus] = useState(company?.status ?? "PENDING");
  const [tier, setTier] = useState(company?.tier ?? "FREE");
  const [isFeatured, setIsFeatured] = useState(company?.isFeatured ?? false);
  const [isVerified, setIsVerified] = useState(company?.isVerified ?? false);

  // Contact
  const [email, setEmail] = useState(company?.email ?? "");
  const [phone, setPhone] = useState(company?.phone ?? "");
  const [website, setWebsite] = useState(company?.website ?? "");
  const [contactName, setContactName] = useState(company?.contactName ?? "");
  const [address, setAddress] = useState(company?.address ?? "");
  const [stateId, setStateId] = useState(company?.stateId?.toString() ?? "");
  const [cityName, setCityName] = useState(company?.cityId ? "" : "");
  const [zipCode, setZipCode] = useState(company?.zipCode ?? "");
  const [linkedIn, setLinkedIn] = useState(company?.linkedIn ?? "");
  const [twitter, setTwitter] = useState(company?.twitter ?? "");
  const [facebook, setFacebook] = useState(company?.facebook ?? "");
  const [serviceArea, setServiceArea] = useState(company?.serviceArea ?? "");

  // Media
  const [logo, setLogo] = useState(company?.logo ?? "");
  const [coverImage, setCoverImage] = useState(company?.coverImage ?? "");

  // Services
  const [selectedServices, setSelectedServices] = useState<Set<number>>(
    new Set(company?.services.map((s) => s.category.id) ?? [])
  );

  // SEO
  const [metaTitle, setMetaTitle] = useState(company?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(company?.metaDescription ?? "");

  function handleNameChange(val: string) {
    setName(val);
    if (mode === "new") {
      setSlug(createSlugFromName(val));
    }
  }

  function toggleService(id: number) {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name,
      slug,
      tagline: tagline || null,
      description: description || null,
      yearFounded: yearFounded ? parseInt(yearFounded, 10) : null,
      employeeCount: employeeCount || null,
      status,
      tier,
      isFeatured,
      isVerified,
      email: email || null,
      phone: phone || null,
      website: website || null,
      contactName: contactName || null,
      address: address || null,
      stateId: stateId ? parseInt(stateId, 10) : null,
      cityName: cityName || null,
      zipCode: zipCode || null,
      linkedIn: linkedIn || null,
      twitter: twitter || null,
      facebook: facebook || null,
      serviceArea: serviceArea || null,
      logo: logo || null,
      coverImage: coverImage || null,
      serviceIds: Array.from(selectedServices),
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    };

    try {
      const url =
        mode === "new"
          ? "/api/admin/companies"
          : `/api/admin/companies/${company!.id}`;
      const method = mode === "new" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save company");
      }

      router.push("/admin/companies");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab Nav */}
      <div className="flex gap-1 flex-wrap border-b border-slate-200 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors -mb-px",
              activeTab === tab.id
                ? "border-teal-500 text-teal-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* ── Basic Info Tab ─────────────────────────────────── */}
      {activeTab === "basic" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 text-base">Basic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className={inputClass}
                placeholder="e.g. Acme Dental Billing"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={inputClass}
                placeholder="auto-generated-from-name"
              />
              <p className="text-xs text-slate-400 mt-1">
                URL: /companies/{slug || "your-slug"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className={inputClass}
                placeholder="Short description shown in listings"
                maxLength={300}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className={inputClass}
                placeholder="Full company description..."
              />
            </div>

            <div>
              <label className={labelClass}>Year Founded</label>
              <input
                type="number"
                value={yearFounded}
                onChange={(e) => setYearFounded(e.target.value)}
                className={inputClass}
                placeholder="2010"
                min={1900}
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label className={labelClass}>Employee Count</label>
              <select
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                className={inputClass}
              >
                <option value="">Select range</option>
                {EMPLOYEE_COUNTS.map((ec) => (
                  <option key={ec} value={ec}>
                    {ec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className={inputClass}
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-teal-500"
                />
                <span className="text-sm font-medium text-slate-700">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="w-4 h-4 accent-teal-500"
                />
                <span className="text-sm font-medium text-slate-700">Verified</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── Contact Tab ────────────────────────────────────── */}
      {activeTab === "contact" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 text-base">Contact Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="billing@company.com"
              />
            </div>

            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="(800) 000-0000"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={inputClass}
                placeholder="https://example.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className={inputClass}
                placeholder="Primary contact person"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClass}
                placeholder="123 Main St"
              />
            </div>

            <div>
              <label className={labelClass}>State</label>
              <select
                value={stateId}
                onChange={(e) => setStateId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.abbreviation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                className={inputClass}
                placeholder="City name"
              />
            </div>

            <div>
              <label className={labelClass}>Zip Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className={inputClass}
                placeholder="12345"
                maxLength={10}
              />
            </div>

            <div className="sm:col-span-2 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Social Media</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>LinkedIn</label>
                  <input
                    type="url"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    className={inputClass}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Twitter / X</label>
                  <input
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className={inputClass}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Facebook</label>
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className={inputClass}
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Service Area</label>
              <textarea
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="Describe geographic areas served (e.g. All 50 US states, Northeast US, Texas, Florida)..."
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Media Tab ──────────────────────────────────────── */}
      {activeTab === "media" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          <h2 className="font-semibold text-slate-800 text-base">Media</h2>

          <div className="space-y-6">
            <div>
              <label className={labelClass}>Logo URL</label>
              <input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className={inputClass}
                placeholder="https://example.com/logo.png"
              />
              {logo && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-2">Preview:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo}
                    alt="Logo preview"
                    className="w-24 h-24 object-contain border border-slate-200 rounded-xl p-2 bg-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Cover Image URL</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className={inputClass}
                placeholder="https://example.com/cover.jpg"
              />
              {coverImage && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-2">Preview:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt="Cover image preview"
                    className="w-full max-w-md h-40 object-cover border border-slate-200 rounded-xl bg-slate-50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Services Tab ───────────────────────────────────── */}
      {activeTab === "services" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-base">Services</h2>
            <span className="text-xs text-slate-500">
              {selectedServices.size} selected
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Select all service categories this company offers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {serviceCategories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedServices.has(cat.id)}
                  onChange={() => toggleService(cat.id)}
                  className="w-4 h-4 accent-teal-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── SEO Tab ────────────────────────────────────────── */}
      {activeTab === "seo" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 text-base">SEO Settings</h2>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Meta Title
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({metaTitle.length}/60 chars)
                </span>
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className={inputClass}
                placeholder="Company Name | Dental Billing Services"
                maxLength={160}
              />
              {metaTitle.length > 60 && (
                <p className="text-xs text-amber-600 mt-1">
                  Recommended: under 60 characters for best display in search results.
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Meta Description
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({metaDescription.length}/160 chars)
                </span>
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="Brief description for search engine results..."
                maxLength={320}
              />
              {metaDescription.length > 160 && (
                <p className="text-xs text-amber-600 mt-1">
                  Recommended: under 160 characters for best display in search results.
                </p>
              )}
            </div>

            {/* Preview */}
            {(metaTitle || metaDescription) && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Search Preview
                </p>
                <div className="space-y-1">
                  <p className="text-blue-700 text-base font-medium leading-tight">
                    {metaTitle || name || "Company Name"}
                  </p>
                  <p className="text-green-700 text-xs">
                    dentalbillingcompany.us/companies/{slug || "your-slug"}
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {metaDescription
                      ? metaDescription.slice(0, 160)
                      : "No meta description provided."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Saving..." : mode === "new" ? "Create Company" : "Save Changes"}
        </button>
        <a
          href="/admin/companies"
          className="h-10 px-4 rounded-lg border border-slate-200 text-sm text-slate-600 font-medium hover:bg-slate-50 inline-flex items-center transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
