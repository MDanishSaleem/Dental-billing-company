import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    const result = await prisma.company.updateMany({
      where: {
        premiumUntil: { lt: now },
        tier: { not: "FREE" },
      },
      data: {
        tier: "FREE",
        isFeatured: false,
        premiumUntil: null,
        featuredUntil: null,
      },
    });

    return NextResponse.json({ expired: result.count }, { status: 200 });
  } catch (error) {
    console.error("[cron/check-subscriptions] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
