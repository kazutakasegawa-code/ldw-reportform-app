import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";

export async function POST() {
  await clearAdminCookie();
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("thingi_admin_token");
  return response;
}
