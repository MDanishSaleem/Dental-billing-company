"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, CheckCircle2, Loader2 } from "lucide-react";

type CompanyResult = {
  id: string;
  name: string;
  slug: string;
  city?: { name: string } | null;
  state?: { abbreviation: string } | null;
  website?: string | null;
};

type SearchResponse = {
  companies: CompanyResult[];
};

export default function ClaimPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    setResults([]);
    setSelectedId(null);

    try {
      const res = await fetch(
        `/api/companies/search?q=${encodeURIComponent(query.trim())}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data = (await res.json()) as SearchResponse;
      setResults(data.companies ?? []);
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !evidence.trim()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/dashboard/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: selectedId, evidence: evidence.trim() }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to submit claim");
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit claim"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-[#0F1F3D] mb-2">
          Claim Submitted!
        </h2>
        <p className="text-slate-500 text-sm max-w-sm mb-6">
          Your claim has been submitted and is pending admin review. We&apos;ll
          notify you once it&apos;s approved.
        </p>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="h-10 px-6 rounded-lg bg-[#0F1F3D] text-white text-sm font-semibold hover:bg-[#0F1F3D]/90 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-bold text-2xl text-[#0F1F3D]">Claim a Company</h1>
        <p className="text-slate-500 text-sm mt-1">
          Search for your company and submit a claim to prove ownership.
        </p>
      </div>

      {/* Step 1: Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-[#0F1F3D] text-base mb-4">
          Step 1: Find Your Company
        </h2>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company name..."
              className="w-full pl-9 pr-4 h-10 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="h-10 px-5 rounded-lg bg-[#0F1F3D] text-white text-sm font-semibold hover:bg-[#0F1F3D]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </form>

        {searchError && (
          <p className="mt-3 text-sm text-red-600">{searchError}</p>
        )}

        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              {results.length} result{results.length !== 1 ? "s" : ""} — select your company:
            </p>
            {results.map((company) => (
              <label
                key={company.id}
                className={[
                  "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
                  selectedId === company.id
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 hover:border-teal-300 hover:bg-teal-50/30",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="companyId"
                  value={company.id}
                  checked={selectedId === company.id}
                  onChange={() => setSelectedId(company.id)}
                  className="accent-teal-500 w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800 text-sm">
                      {company.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 ml-6">
                    {company.city && company.state
                      ? `${company.city.name}, ${company.state.abbreviation}`
                      : ""}
                    {company.website && (
                      <span className="ml-2">· {company.website}</span>
                    )}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        {!searching && query && results.length === 0 && (
          <p className="mt-4 text-sm text-slate-400 text-center py-4">
            No companies found. Try a different search term.
          </p>
        )}
      </div>

      {/* Step 2: Evidence */}
      {selectedId && (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-[#0F1F3D] text-base">
              Step 2: Provide Ownership Evidence
            </h2>
            <p className="text-sm text-slate-500">
              Explain your relationship to this company. Include details such as
              your business email, title/role, phone number, or any other
              verifiable information.
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Evidence <span className="text-red-500">*</span>
              </label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                rows={5}
                required
                minLength={20}
                className={inputClass}
                placeholder="I am the owner/manager of this company. My business email is owner@company.com. My role is..."
              />
              <p className="text-xs text-slate-400 mt-1">
                Minimum 20 characters. The more detail you provide, the faster
                we can verify your claim.
              </p>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {submitError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || evidence.trim().length < 20}
                className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Claim"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setEvidence("");
                  setSubmitError(null);
                }}
                className="h-10 px-4 rounded-lg border border-slate-200 text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
