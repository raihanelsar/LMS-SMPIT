import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {jwtVerify} from "jose";
import {COOKIE_NAME, PUBLIC_PATHS, PROTECTED_ROUTES} from "@/lib/constants";

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "seribu-bulan-lms-jwt-secret-key-2024-change-in-production"
);

export async function proxy(request: NextRequest) {
    const {pathname} = request.nextUrl;

    // Skip public paths
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Skip static files and API routes that don't need auth
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico") ||
        pathname.startsWith("/public") ||
        pathname === "/"
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;

    // Check login page - redirect to dashboard if already authenticated
    if (pathname === "/login") {
        if (token) {
            try {
                await jwtVerify(token, SECRET);
                return NextResponse.redirect(new URL("/dashboard", request.url));
            } catch {
                // Invalid token, allow access to login
            }
        }
        return NextResponse.next();
    }

    // Check if route is protected
    const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    if (!isProtected && !pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        const {payload} = await jwtVerify(token, SECRET);

        // Add user info to headers for API routes
        if (pathname.startsWith("/api/")) {
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set("x-user-id", payload.sub as string);
            requestHeaders.set("x-user-role", payload.role as string);

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        }

        // Role-based access control
        const role = payload.role as string;

        if (pathname.startsWith("/users") && role !== "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        return NextResponse.next();
    } catch {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
