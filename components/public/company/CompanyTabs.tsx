"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutGrid,
  Briefcase,
  MessageSquare,
  ImageIcon,
  CheckCircle2,
  MapPin,
  Star,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { cn, formatDateShort } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  reviewerName: string | null;
  createdAt: Date;
  replyContent: string | null;
  repliedAt: Date | null;
  isVerifiedPurchase: boolean;
};

type ServiceItem = {
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  };
};

type GalleryItem = {
  id: number;
  url: string;
  caption: string | null;
};

type CompanyTabsProps = {
  company: {
    id: string;
    slug: string;
    description: string | null;
    serviceArea: string | null;
    services: ServiceItem[];
    reviews: ReviewItem[];
    gallery: GalleryItem[];
    city?: { name: string; slug: string } | null;
    state?: { name: string; abbreviation: string; slug: string } | null;
  };
};

type Tab = "overview" | "services" | "reviews" | "gallery";

const REVIEWS_PER_PAGE = 5;

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ company }: CompanyTabsProps) {
  const location =
    company.city && company.state
      ? `${company.city.name}, ${company.state.abbreviation}`
      : company.state?.name ?? "";

  return (
    <div className="space-y-6">
      {company.description ? (
        <div>
          <h2 className="font-display font-bold text-primary text-lg mb-3">
            About This Company
          </h2>
          <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
            {company.description}
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-sm italic">
          No description provided yet.
        </p>
      )}

      {company.services.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-primary text-base mb-3">
            Specialties
          </h3>
          <div className="flex flex-wrap gap-2">
            {company.services.map((svc) => (
              <span
                key={svc.category.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-100"
              >
                {svc.category.icon && (
                  <span className="text-base" aria-hidden="true">
                    {svc.category.icon}
                  </span>
                )}
                {svc.category.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {(company.serviceArea || location) && (
        <div>
          <h3 className="font-display font-semibold text-primary text-base mb-2">
            Service Area
          </h3>
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
            <p>{company.serviceArea ?? `Serving ${location} and surrounding areas`}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Services Tab ─────────────────────────────────────────────────────────────

function ServicesTab({ services }: { services: ServiceItem[] }) {
  if (!services.length) {
    return (
      <p className="text-slate-400 text-sm italic py-4">
        No services listed yet.
      </p>
    );
  }

  return (
    <div>
      <h2 className="font-display font-bold text-primary text-lg mb-4">
        Services Offered
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((svc) => (
          <div
            key={svc.category.id}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:border-teal-200 hover:bg-teal-50/40 transition-colors"
          >
            {svc.category.icon ? (
              <span className="text-2xl shrink-0" aria-hidden="true">
                {svc.category.icon}
              </span>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4 text-teal-600" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-primary text-sm">
                {svc.category.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              {(review.reviewerName ?? "A").charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-slate-800 text-sm">
              {review.reviewerName ?? "Anonymous"}
            </span>
            {review.isVerifiedPurchase && (
              <Badge variant="teal_light" className="text-[11px] py-0">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Verified
              </Badge>
            )}
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
        <span className="text-xs text-slate-400 shrink-0">
          {formatDateShort(review.createdAt)}
        </span>
      </div>

      {review.title && (
        <p className="font-semibold text-slate-800 text-sm mb-1">
          {review.title}
        </p>
      )}
      <p className="text-slate-600 text-sm leading-relaxed">{review.content}</p>

      {review.replyContent && (
        <div className="mt-4 ml-4 pl-4 border-l-2 border-teal-200 bg-teal-50/50 rounded-r-lg p-3">
          <p className="text-xs font-semibold text-teal-700 mb-1">
            Response from the company
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {review.replyContent}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────

function ReviewsTab({
  reviews,
  companySlug,
}: {
  reviews: ReviewItem[];
  companySlug: string;
}) {
  const [page, setPage] = useState(1);
  const total = reviews.length;
  const paginated = reviews.slice(0, page * REVIEWS_PER_PAGE);
  const hasMore = paginated.length < total;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-primary text-lg">
          Reviews
          {total > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({total})
            </span>
          )}
        </h2>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/companies/${companySlug}#write-review`}>
            <Star className="w-3.5 h-3.5" />
            Write a Review
          </Link>
        </Button>
      </div>

      {total === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
          <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">No reviews yet.</p>
          <p className="text-slate-400 text-xs mt-1">
            Be the first to share your experience!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginated.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
              >
                Load More Reviews
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────

function GalleryTab({ gallery }: { gallery: GalleryItem[] }) {
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  if (!gallery.length) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
        <ImageIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-500 text-sm font-medium">No photos yet.</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="font-display font-bold text-primary text-lg mb-4">
        Photo Gallery
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {gallery.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLightbox(item)}
            className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <Image
              src={item.url}
              alt={item.caption ?? "Gallery image"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="relative max-w-4xl w-full max-h-[80vh] rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.url}
              alt={lightbox.caption ?? "Gallery image"}
              width={1200}
              height={800}
              className="w-full h-full object-contain"
              priority
            />
            {lightbox.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-sm px-4 py-2 text-center">
                {lightbox.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main CompanyTabs Component ───────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
];

export function CompanyTabs({ company }: CompanyTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 mb-6 gap-0.5 overflow-x-auto scrollbar-hide">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors",
              activeTab === id
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === "reviews" && company.reviews.length > 0 && (
              <span
                className={cn(
                  "text-xs rounded-full px-1.5 py-0.5 font-bold",
                  activeTab === id
                    ? "bg-teal-100 text-teal-700"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {company.reviews.length}
              </span>
            )}
            {id === "gallery" && company.gallery.length > 0 && (
              <span
                className={cn(
                  "text-xs rounded-full px-1.5 py-0.5 font-bold",
                  activeTab === id
                    ? "bg-teal-100 text-teal-700"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {company.gallery.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <OverviewTab company={company} />}
      {activeTab === "services" && <ServicesTab services={company.services} />}
      {activeTab === "reviews" && (
        <ReviewsTab reviews={company.reviews} companySlug={company.slug} />
      )}
      {activeTab === "gallery" && <GalleryTab gallery={company.gallery} />}
    </div>
  );
}
