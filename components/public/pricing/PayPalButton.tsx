"use client";

import { useState } from "react";

interface PayPalButtonProps {
  planId: string;
  companyId: string;
  disabled?: boolean;
}

export default function PayPalButton({
  planId,
  companyId,
  disabled = false,
}: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (loading || disabled) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, companyId }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to create PayPal order");
      }

      const data = (await res.json()) as { orderId: string; approveUrl: string };

      // Redirect to PayPal approval page
      window.location.href = data.approveUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#FFC439] hover:bg-[#F0B429] active:bg-[#E0A820] text-[#003087] font-bold text-base px-6 py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label="Pay with PayPal"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-[#003087] border-t-transparent rounded-full" />
            <span>Connecting to PayPal…</span>
          </>
        ) : (
          <>
            {/* PayPal logo wordmark approximated with text styling */}
            <span className="text-[#003087] font-extrabold tracking-tight">
              Pay
              <span className="text-[#009CDE]">Pal</span>
            </span>
            <span>— Pay Now</span>
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-600 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
