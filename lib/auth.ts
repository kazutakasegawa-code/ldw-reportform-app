import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

const cookieName = "thingi_admin_token";

export function adminToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return "";
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return Boolean(adminToken() && cookieStore.get(cookieName)?.value === adminToken());
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function setAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}
