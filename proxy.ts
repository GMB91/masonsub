import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // For development: use cookie-based role (in production, use Supabase session)
  // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  // const { data: { session } } = await supabase.auth.getSession();
  // const role = session?.user?.user_metadata?.role;
  
  const role = req.cookies.get("user_role")?.value || "admin";
  const isAuthenticated = req.cookies.get("authenticated")?.value === "true" || true; // Allow for dev

  // Protected routes - require authentication
  if (pathname.startsWith("/system-administrator")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Core routes - system_admin only
    if (pathname.startsWith("/system-administrator/core")) {
      if (role !== "system_admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Admin routes - admin or system_admin
    if (pathname.startsWith("/system-administrator/admin")) {
      if (!["admin", "system_admin"].includes(role || "")) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/system-administrator/:path*",
    "/api/:path*",
  ],
};
