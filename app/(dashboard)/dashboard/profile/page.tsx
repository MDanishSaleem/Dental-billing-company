"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type CompanyProfile = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  zipCode: string | null;
  yearFounded: number | null;
  employeeCount: string | null;
  coverImage: string | null;
};

const EMPLOYEE_OPTIONS = [
  "1-5",
  "6-10",
  "11-25",
  "26-50",
  "51-100",
  "100+",
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [form, setForm] = useState<CompanyProfile>({
    id: "",
    name: "",
    tagline: "",
    description: "",
    phone: "",
    website: "",
    address: "",
    zipCode: "",
    yearFounded: null,
    employeeCount: "",
    coverImage: "",
  });

  useEffect(() => {
    fetch("/api/dashboard/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.company) {
          setForm({
            id: data.company.id ?? "",
            name: data.company.name ?? "",
            tagline: data.company.tagline ?? "",
            description: data.company.description ?? "",
            phone: data.company.phone ?? "",
            website: data.company.website ?? "",
            address: data.company.address ?? "",
            zipCode: data.company.zipCode ?? "",
            yearFounded: data.company.yearFounded ?? null,
            employeeCount: data.company.employeeCount ?? "",
            coverImage: data.company.coverImage ?? "",
          });
        }
      })
      .catch(() => {
        setToast({ type: "error", message: "Failed to load profile." });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          tagline: form.tagline,
          description: form.description,
          phone: form.phone,
          website: form.website,
          address: form.address,
          zipCode: form.zipCode,
          yearFounded: form.yearFounded ? Number(form.yearFounded) : null,
          employeeCount: form.employeeCount,
          coverImage: form.coverImage,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save changes.");
      }

      setToast({ type: "success", message: "Profile updated successfully." });
      router.refresh();
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save changes.",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-bold text-2xl text-[#0F1F3D]">Edit Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          Update your company information visible on the directory.
        </p>
      </div>

      {toast && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5"
      >
        {/* Company Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors"
            placeholder="Your company name"
          />
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Tagline
          </label>
          <input
            type="text"
            name="tagline"
            value={form.tagline ?? ""}
            onChange={handleChange}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors"
            placeholder="A short tagline for your company"
            maxLength={300}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={form.description ?? ""}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors resize-none"
            placeholder="Describe your services, expertise, and what sets you apart..."
          />
        </div>

        {/* Phone + Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone ?? ""}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors"
              placeholder="(555) 000-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={form.website ?? ""}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors"
              placeholder="https://yourcompany.com"
            />
          </div>
        </div>

        {/* Address + Zip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={form.address ?? ""}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors"
              placeholder="123 Main Street"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              ZIP Code
            </label>
            <input
              type="text"
              name="zipCode"
              value={form.zipCode ?? ""}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors"
              placeholder="90210"
              maxLength={10}
            />
          </div>
        </div>

        {/* Year Founded + Employee Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Year Founded
            </label>
            <input
              type="number"
              name="yearFounded"
              value={form.yearFounded ?? ""}
              onChange={handleChange}
              min={1900}
              max={new Date().getFullYear()}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors"
              placeholder="2010"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Number of Employees
            </label>
            <select
              name="employeeCount"
              value={form.employeeCount ?? ""}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors"
            >
              <option value="">Select range</option>
              {EMPLOYEE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} employees
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Cover Image URL
          </label>
          <input
            type="url"
            name="coverImage"
            value={form.coverImage ?? ""}
            onChange={handleChange}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors"
            placeholder="https://example.com/cover.jpg"
          />
          {form.coverImage && (
            <div className="mt-2 rounded-xl overflow-hidden h-32 bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.coverImage}
                alt="Cover preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="teal"
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
