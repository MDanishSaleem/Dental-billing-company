import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { formatDateShort, truncate } from "@/lib/utils";
import { Star } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reviews | Dashboard — DentalBillingCompany.us",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const session = await requireAuth();
  const userId = session.user?.id;

  const company = await prisma.company.findFirst({
    where: { ownerId: userId },
    select: { id: true, name: true },
  });

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Star className="w-10 h-10 text-slate-300 mb-4" />
        <h2 className="font-bold text-xl text-[#0F1F3D] mb-2">
          No company linked
        </h2>
        <p className="text-slate-500 text-sm">
          You need to claim or register a company to see reviews.
        </p>
      </div>
    );
  }

  const reviews = await prisma.review.findMany({
    where: { companyId: company.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      title: true,
      content: true,
      reviewerName: true,
      createdAt: true,
      replyContent: true,
      repliedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl text-[#0F1F3D]">Reviews</h1>
        <p className="text-slate-500 text-sm mt-1">
          Approved reviews for your listing.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
            <Star className="w-7 h-7 text-amber-400" />
          </div>
          <p className="font-semibold text-slate-700 mb-1">No approved reviews yet</p>
          <p className="text-slate-400 text-sm max-w-sm">
            Reviews submitted by your customers will appear here once approved by
            our team.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-400">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {review.rating}/5
                    </span>
                  </div>
                  {review.title && (
                    <p className="font-semibold text-[#0F1F3D]">{review.title}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400">
                    {formatDateShort(review.createdAt)}
                  </p>
                  {review.reviewerName && (
                    <p className="text-xs font-medium text-slate-600 mt-0.5">
                      {review.reviewerName}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {truncate(review.content, 300)}
              </p>

              {review.replyContent && (
                <div className="mt-4 pl-4 border-l-2 border-teal-200 bg-teal-50/50 rounded-r-lg py-3 pr-3">
                  <p className="text-xs font-semibold text-teal-700 mb-1">
                    Your reply
                    {review.repliedAt && (
                      <span className="font-normal text-teal-500 ml-1">
                        · {formatDateShort(review.repliedAt)}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-600">
                    {review.replyContent}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
