"use client";

import { Download } from "lucide-react";

export function ExportCSVButton() {
  function handleExport() {
    window.location.href = "/api/admin/leads/export";
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  );
}
