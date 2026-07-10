import { NextRequest, NextResponse } from "next/server";

const publicOnlyPaths = ["/", "/diagnosis", "/thanks", "/api/submissions"];
const adminOnlyPrefixes = ["/admin", "/api/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = normalizeHost(request.headers.get("host"));
  const publicHosts = parseHosts(process.env.PUBLIC_SITE_HOSTS);
  const adminHosts = parseHosts(process.env.ADMIN_SITE_HOSTS);

  if (!publicHosts.length && !adminHosts.length) {
    return NextResponse.next();
  }

  if (publicHosts.includes(host) && isAdminPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (adminHosts.includes(host)) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (isPublicPagePath(pathname)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

function parseHosts(value?: string) {
  return (value || "")
    .split(",")
    .map((host) => normalizeHost(host))
    .filter(Boolean);
}

function normalizeHost(value?: string | null) {
  return (value || "").trim().toLowerCase().replace(/:\d+$/, "");
}

function isAdminPath(pathname: string) {
  return adminOnlyPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isPublicPagePath(pathname: string) {
  return publicOnlyPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
