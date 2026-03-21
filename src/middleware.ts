import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "valami-nagyon-titkos-kulcs"
);

export async function middleware(request: NextRequest) {
    const userAgentString = request.headers.get("user-agent") || "";
    const isNativeApp = userAgentString.includes("LakasInfoApp");
    const { pathname } = request.nextUrl;

    // if (!isNativeApp && pathname !== "/desktop-warning" && !pathname.endsWith(".apk")) {
    //     return NextResponse.redirect(new URL("/desktop-warning", request.url));
    // }

    const token = request.cookies.get("token")?.value;

    const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/house");

    const isAuthRoute =
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/";

    if (isProtectedRoute) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);

            if (!payload.houseId && !pathname.startsWith("/onboarding") && !pathname.startsWith("/house")) {
                return NextResponse.redirect(new URL("/onboarding", request.url));
            }

            if (payload.houseId && pathname.startsWith("/onboarding")) {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }

            if (!payload.houseId && pathname.startsWith("/dashboard")) {
                return NextResponse.redirect(new URL("/onboarding", request.url));
            }

            return NextResponse.next();
        } catch {
            const response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("token");
            return response;
        }
    }

    if (isAuthRoute && token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            const target = payload.houseId ? "/dashboard" : "/onboarding";
            return NextResponse.redirect(new URL(target, request.url));
        } catch {
            const response = NextResponse.next();
            response.cookies.delete("token");
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};