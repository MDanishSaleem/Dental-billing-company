import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Building2 } from "lucide-react";
import { GalleryManager } from "@/components/dashboard/GalleryManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | DentalBillingCompany.us",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const session = await requireAuth();
  const userId = session.user?.id;

  const company = await prisma.company.findFirst({
    where: { ownerId: userId },
    select: {
      id: true,
      name: true,
      gallery: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, caption: true, sortOrder: true },
      },
    },
  });

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-[#0F1F3D] mb-2">
          No Company Found
        </h2>
        <p className="text-slate-500 text-sm max-w-sm">
          You don&apos;t have a company listing yet. Claim or register one to manage
          your gallery.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl text-[#0F1F3D]">Gallery</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage images for{" "}
          <span className="font-semibold text-[#0F1F3D]">{company.name}</span>
        </p>
      </div>

      <GalleryManager
        companyId={company.id}
        initialImages={company.gallery}
      />
    </div>
  );
}
