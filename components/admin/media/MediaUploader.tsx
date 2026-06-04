"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

type FileUploadState = {
  name: string;
  status: "uploading" | "done" | "error";
  error?: string;
};

export function MediaUploader() {
  const router = useRouter();
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function updateFile(name: string, update: Partial<FileUploadState>) {
    setUploads((prev) =>
      prev.map((f) => (f.name === name ? { ...f, ...update } : f))
    );
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newStates: FileUploadState[] = files.map((f) => ({
      name: f.name,
      status: "uploading",
    }));
    setUploads(newStates);

    let anySuccess = false;

    await Promise.all(
      files.map(async (file) => {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/upload?folder=uploads", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json() as { error?: string };
            throw new Error(data.error ?? "Upload failed");
          }

          updateFile(file.name, { status: "done" });
          anySuccess = true;
        } catch (err) {
          updateFile(file.name, {
            status: "error",
            error: err instanceof Error ? err.message : "Upload failed",
          });
        }
      })
    );

    if (anySuccess) {
      router.refresh();
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-8 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors">
        <Upload className="w-6 h-6 text-slate-400" />
        <span className="text-sm text-slate-500 font-medium">
          Click to upload images
        </span>
        <span className="text-xs text-slate-400">
          JPEG, PNG, WebP, GIF · max 5 MB each
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="sr-only"
        />
      </label>

      {uploads.length > 0 && (
        <ul className="space-y-1.5">
          {uploads.map((f) => (
            <li key={f.name} className="flex items-center gap-2 text-sm">
              {f.status === "uploading" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-slate-500">Uploading {f.name}…</span>
                </>
              )}
              {f.status === "done" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-600 font-medium">{f.name} — uploaded</span>
                </>
              )}
              {f.status === "error" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-red-600">
                    {f.name} — {f.error}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
