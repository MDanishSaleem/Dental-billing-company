"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ApproveButtonProps {
  companyId: string;
}

export function ApproveButton({ companyId }: ApproveButtonProps) {
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function approve() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/companies/${companyId}/approve`, {
          method: "PATCH",
        });
        if (res.ok) {
          setDone(true);
          router.refresh();
        }
      } catch {
        // silently fail
      }
    });
  }

  if (done) return null;

  return (
    <button
      type="button"
      onClick={approve}
      disabled={isPending}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <CheckCircle2 className="w-3 h-3" />
      )}
      Approve
    </button>
  );
}
