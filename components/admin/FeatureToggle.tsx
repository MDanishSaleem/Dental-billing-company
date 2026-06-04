"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureToggleProps {
  companyId: string;
  isFeatured: boolean;
}

export function FeatureToggle({ companyId, isFeatured }: FeatureToggleProps) {
  const [featured, setFeatured] = useState(isFeatured);
  const [isPending, startTransition] = useTransition();

  async function toggle() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/companies/${companyId}/feature`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFeatured: !featured }),
        });
        if (res.ok) {
          setFeatured((prev) => !prev);
        }
      } catch {
        // silently fail — user can refresh
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-50",
        featured
          ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border-slate-200 text-slate-500 hover:bg-slate-50"
      )}
      title={featured ? "Remove featured" : "Mark as featured"}
    >
      <Sparkles className="w-3 h-3" />
      {featured ? "Featured" : "Feature"}
    </button>
  );
}
