import { prisma } from "@/lib/prisma";

const settingsCache = new Map<string, { value: string; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getSetting(key: string, defaultValue = ""): Promise<string> {
  const now = Date.now();
  const cached = settingsCache.get(key);
  if (cached && cached.expiresAt > now) return cached.value;

  const setting = await prisma.setting.findUnique({ where: { key } });
  const value = setting?.value ?? defaultValue;
  settingsCache.set(key, { value, expiresAt: now + CACHE_TTL });
  return value;
}

export async function getSettingsByGroup(group: string): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany({ where: { group } });
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

export async function setSetting(key: string, value: string, group = "general", label?: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value, group, label },
    create: { key, value, group, label, type: "string" },
  });
  settingsCache.delete(key);
}

export async function getSettingsMap(keys: string[]): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

export function clearSettingsCache() {
  settingsCache.clear();
}
