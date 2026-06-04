import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

interface CompanyData {
  name: string;
  tagline: string | null;
  ratingAverage: number;
  reviewCount: number;
  tier: string;
  isVerified: boolean;
  city: { name: string } | null;
  state: { abbreviation: string } | null;
}

interface ApiResponse {
  company?: CompanyData;
  error?: string;
}

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return "★".repeat(full) + (hasHalf ? "½" : "") + "☆".repeat(empty);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { companySlug: string } }
) {
  const { companySlug } = params;
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://dentalbilling.us";

  let company: CompanyData | null = null;

  try {
    const res = await fetch(`${baseUrl}/api/companies/${companySlug}`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = (await res.json()) as ApiResponse;
      company = data.company ?? null;
    }
  } catch {
    // fallback to generic card below
  }

  const name = company?.name ?? "Dental Billing Company";
  const tagline = company?.tagline ?? "Professional Dental Billing Services";
  const rating = company?.ratingAverage ?? 0;
  const reviewCount = company?.reviewCount ?? 0;
  const tier = company?.tier ?? "FREE";
  const isVerified = company?.isVerified ?? false;
  const city = company?.city?.name ?? "";
  const stateAbbr = company?.state?.abbreviation ?? "";
  const location =
    city && stateAbbr ? `${city}, ${stateAbbr}` : city || stateAbbr;

  const isFeaturedOrPremium = tier === "FEATURED" || tier === "PREMIUM";
  const tierLabel =
    tier === "FEATURED" ? "Featured" : tier === "PREMIUM" ? "Premium" : "";

  const stars = rating > 0 ? renderStars(rating) : "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "1200px",
          height: "630px",
          backgroundColor: "#0F1F3D",
          padding: "60px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #14B8A6 0%, #3B82F6 100%)",
          }}
        />

        {/* Tier badge */}
        {isFeaturedOrPremium && (
          <div
            style={{
              position: "absolute",
              top: "36px",
              right: "60px",
              backgroundColor: "#F59E0B",
              color: "#0F1F3D",
              padding: "6px 18px",
              borderRadius: "20px",
              fontSize: "18px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
            }}
          >
            {`★ ${tierLabel}`}
          </div>
        )}

        {/* Verified badge */}
        {isVerified && (
          <div
            style={{
              position: "absolute",
              top: isFeaturedOrPremium ? "82px" : "36px",
              right: "60px",
              backgroundColor: "#14B8A6",
              color: "#fff",
              padding: "6px 18px",
              borderRadius: "20px",
              fontSize: "16px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
            }}
          >
            {"✓ Verified"}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* Company name */}
          <div
            style={{
              fontSize: "62px",
              fontWeight: "800",
              color: "#FFFFFF",
              lineHeight: 1.1,
              maxWidth: "900px",
              marginBottom: "20px",
            }}
          >
            {name}
          </div>

          {/* Tagline */}
          {tagline && (
            <div
              style={{
                fontSize: "26px",
                color: "#14B8A6",
                marginBottom: "30px",
                maxWidth: "820px",
                lineHeight: 1.4,
              }}
            >
              {tagline}
            </div>
          )}

          {/* Rating row */}
          {rating > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
                gap: "12px",
              }}
            >
              <span style={{ color: "#F59E0B", fontSize: "28px" }}>{stars}</span>
              <span
                style={{ color: "#FFFFFF", fontSize: "22px", fontWeight: "700" }}
              >
                {rating.toFixed(1)}
              </span>
              <span style={{ color: "#94A3B8", fontSize: "20px" }}>
                {`(${reviewCount} ${reviewCount === 1 ? "review" : "reviews"})`}
              </span>
            </div>
          )}

          {/* Location */}
          {location && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "#CBD5E1",
                fontSize: "22px",
                gap: "8px",
              }}
            >
              <span style={{ color: "#14B8A6" }}>{"📍"}</span>
              <span>{location}</span>
            </div>
          )}
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "60px",
            right: "60px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "#3B82F6",
              fontSize: "22px",
              fontWeight: "700",
              letterSpacing: "0.02em",
            }}
          >
            {"DentalBilling.us"}
          </div>
          <div
            style={{
              color: "#475569",
              fontSize: "16px",
            }}
          >
            {"The #1 Dental Billing Directory"}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
