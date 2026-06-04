import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { clearSettingsCache } from "@/lib/settings";

export async function GET() {
  try {
    await requireAdmin();

    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }

    return NextResponse.json(map);
  } catch (error) {
    console.error("[admin/settings GET] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const { settings } = await request.json() as {
      settings: { key: string; value: string }[];
    };

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: "settings must be an array" }, { status: 400 });
    }

    await Promise.all(
      settings.map((s) =>
        prisma.setting.upsert({
          where: { key: s.key },
          update: { value: s.value },
          create: { key: s.key, value: s.value },
        })
      )
    );

    clearSettingsCache();

    return NextResponse.json({ updated: settings.length });
  } catch (error) {
    console.error("[admin/settings PATCH] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
