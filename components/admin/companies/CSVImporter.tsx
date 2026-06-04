"use client";

import { useState, useRef } from "react";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";

type ParsedRow = {
  name: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  yearFounded?: string;
  employeeCount?: string;
  services?: string[];
};

type ImportError = {
  row: number;
  message: string;
};

type ImportResult = {
  imported: number;
  errors: ImportError[];
};

/** Parse a single CSV line handling quoted fields */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/** Parse full CSV text into an array of objects */
function parseCSV(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx] ?? "";
    });

    const name = record["name"] ?? "";
    if (!name) continue;

    const servicesRaw = record["services"] ?? "";
    const services = servicesRaw
      ? servicesRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

    rows.push({
      name,
      tagline: record["tagline"] || undefined,
      description: record["description"] || undefined,
      email: record["email"] || undefined,
      phone: record["phone"] || undefined,
      website: record["website"] || undefined,
      city: record["city"] || undefined,
      state: record["state"] || undefined,
      zipCode: record["zipcode"] || record["zip_code"] || record["zip"] || undefined,
      yearFounded: record["yearfounded"] || record["year_founded"] || undefined,
      employeeCount:
        record["employeecount"] || record["employee_count"] || record["employees"] || undefined,
      services: services && services.length > 0 ? services : undefined,
    });
  }
  return rows;
}

const EXPECTED_COLUMNS = [
  "name",
  "tagline",
  "description",
  "email",
  "phone",
  "website",
  "city",
  "state",
  "zipCode",
  "yearFounded",
  "employeeCount",
  "services",
];

export function CSVImporter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setResult(null);
    setProgress(null);
    setFileName(file.name);

    if (!file.name.endsWith(".csv")) {
      setParseError("Please upload a .csv file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setParseError(
            'No valid rows found. Make sure the CSV has a header row with "name" as a column.'
          );
          setRows([]);
        } else {
          setRows(parsed);
        }
      } catch {
        setParseError("Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (rows.length === 0) return;
    setImporting(true);
    setResult(null);
    setProgress({ done: 0, total: rows.length });

    try {
      const res = await fetch("/api/admin/companies/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      const data = (await res.json()) as ImportResult;
      setProgress({ done: rows.length, total: rows.length });
      setResult(data);
    } catch {
      setResult({
        imported: 0,
        errors: [{ row: 0, message: "Network error — import failed." }],
      });
    } finally {
      setImporting(false);
    }
  }

  function handleReset() {
    setRows([]);
    setFileName(null);
    setResult(null);
    setProgress(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-800 text-base mb-3">
          CSV Format
        </h2>
        <p className="text-sm text-slate-500 mb-3">
          Your CSV file should have a header row with the following columns (all
          optional except <code className="bg-slate-100 px-1 rounded">name</code>
          ):
        </p>
        <div className="flex flex-wrap gap-2">
          {EXPECTED_COLUMNS.map((col) => (
            <span
              key={col}
              className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono"
            >
              {col}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          The <code className="bg-slate-100 px-1 rounded">services</code> column
          should contain comma-separated service slugs inside quotes, e.g.{" "}
          <code className="bg-slate-100 px-1 rounded">
            &quot;insurance-billing,ar-recovery&quot;
          </code>
          .
        </p>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-800 text-base mb-4">
          Upload CSV
        </h2>

        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors">
          <Upload className="w-8 h-8 text-slate-300 mb-2" />
          <span className="text-sm text-slate-500 font-medium">
            {fileName ? fileName : "Click to select a CSV file"}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            {fileName ? `${rows.length} rows parsed` : ".csv files only"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        {parseError && (
          <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {parseError}
          </div>
        )}
      </div>

      {/* Preview Table */}
      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 text-base">
              Preview{" "}
              <span className="text-slate-400 font-normal text-sm">
                (showing first {Math.min(10, rows.length)} of {rows.length} rows)
              </span>
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-3 py-2 font-semibold text-slate-500 whitespace-nowrap">
                    #
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-500 whitespace-nowrap">
                    Name
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-500 whitespace-nowrap">
                    Tagline
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-500 whitespace-nowrap">
                    Email
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-500 whitespace-nowrap">
                    City
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-500 whitespace-nowrap">
                    State
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-500 whitespace-nowrap">
                    Services
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                  >
                    <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2 text-slate-700 font-medium max-w-[160px] truncate">
                      {row.name}
                    </td>
                    <td className="px-3 py-2 text-slate-500 max-w-[160px] truncate">
                      {row.tagline ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{row.email ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-500">{row.city ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-500">{row.state ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-500 max-w-[180px] truncate">
                      {row.services?.join(", ") ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Import Button */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-4">
            <button
              type="button"
              onClick={handleImport}
              disabled={importing}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {importing
                ? `Importing... ${progress ? `${progress.done}/${progress.total}` : ""}`
                : `Import ${rows.length} ${rows.length === 1 ? "Company" : "Companies"}`}
            </button>
            {progress && !result && (
              <span className="text-sm text-slate-500">
                Processing {progress.done} / {progress.total}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 text-base">
            Import Results
          </h2>

          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">
              Successfully imported {result.imported}{" "}
              {result.imported === 1 ? "company" : "companies"}.
            </span>
          </div>

          {result.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-600">
                {result.errors.length} error(s):
              </p>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      {err.row > 0 ? `Row ${err.row}: ` : ""}
                      {err.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="h-9 px-4 rounded-lg border border-slate-200 text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
}
