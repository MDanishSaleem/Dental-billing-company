import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}

export async function requireCompanyOwner() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (!["ADMIN", "COMPANY_OWNER"].includes(session.user.role)) redirect("/");
  return session;
}

export function isAdmin(role?: string) {
  return role === "ADMIN";
}

export function isCompanyOwner(role?: string) {
  return role === "COMPANY_OWNER" || role === "ADMIN";
}
