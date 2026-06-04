import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const settings = await prisma.setting.findMany({
    orderBy: [{ group: "asc" }, { key: "asc" }],
    select: { key: true, value: true, type: true, group: true, label: true },
  });

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-primary">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure your dental billing directory</p>
      </div>
      <SettingsTabs initialSettings={settingsMap} />
    </div>
  );
}
