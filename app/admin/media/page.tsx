import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import { MediaUploader } from "@/components/admin/media/MediaUploader";
import { DeleteMediaButton } from "@/components/admin/media/DeleteMediaButton";
import { ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminMediaPage() {
  await requireAdmin();

  const mediaItems = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      url: true,
      originalName: true,
      mimeType: true,
      size: true,
      width: true,
      height: true,
      alt: true,
      folder: true,
      createdAt: true,
    },
  });

  return (
    <div className="p-6">
      <h1 className="font-display font-bold text-2xl text-primary mb-6">Media Library</h1>

      {/* Upload section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">Upload Images</h2>
        <MediaUploader />
      </div>

      {/* Grid */}
      {mediaItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 text-center">
          <ImageIcon className="w-10 h-10 text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">No media yet</p>
          <p className="text-slate-400 text-sm mt-1">Upload your first image above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {mediaItems.map((media) => (
            <div
              key={media.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden group"
            >
              <div className="relative aspect-square bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.url}
                  alt={media.alt ?? media.originalName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteMediaButton mediaId={media.id} />
                </div>
              </div>
              <div className="p-2.5">
                <p
                  className="text-xs font-medium text-slate-700 truncate"
                  title={media.originalName}
                >
                  {media.originalName}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formatFileSize(media.size)} · {formatDateShort(media.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
