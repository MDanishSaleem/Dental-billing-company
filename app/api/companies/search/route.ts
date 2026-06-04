import { NextRequest, NextResponse } from "next/server"
import { searchCompanies } from "@/lib/search"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const q = searchParams.get("q") ?? undefined
    const city = searchParams.get("city") ?? undefined
    const state = searchParams.get("state") ?? undefined
    const zip = searchParams.get("zip") ?? undefined
    const service = searchParams.get("service") ?? undefined
    const tier = searchParams.get("tier") ?? undefined
    const minRatingRaw = searchParams.get("minRating")
    const pageRaw = searchParams.get("page")
    const perPageRaw = searchParams.get("perPage")
    const sortRaw = searchParams.get("sort")

    const minRating = minRatingRaw ? parseFloat(minRatingRaw) : undefined
    const page = pageRaw ? Math.max(1, parseInt(pageRaw, 10)) : 1
    const perPage = perPageRaw ? Math.min(50, Math.max(1, parseInt(perPageRaw, 10))) : 12
    const sort = (["rating", "reviews", "newest", "name"].includes(sortRaw ?? "")
      ? sortRaw
      : "rating") as "rating" | "reviews" | "newest" | "name"

    const result = await searchCompanies({
      q,
      city,
      state,
      zip,
      service,
      tier,
      minRating,
      page,
      perPage,
      sort,
    })

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    console.error("[GET /api/companies/search]", error)
    return NextResponse.json(
      { error: "Failed to search companies. Please try again." },
      { status: 500 }
    )
  }
}
