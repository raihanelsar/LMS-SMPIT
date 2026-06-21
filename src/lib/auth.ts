import {SignJWT, jwtVerify} from "jose";
import {cookies} from "next/headers";
import {COOKIE_NAME, TOKEN_EXPIRY_DAYS} from "./constants";

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "seribu-bulan-lms-jwt-secret-key-2024-change-in-production"
);

export type JwtPayload = {
    sub: string;
    email: string;
    role: string;
    name: string;
    iat?: number;
    exp?: number;
};

export async function signToken(payload: Omit<JwtPayload, "iat" | "exp">) {
    const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({alg: "HS256"})
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY_DAYS}d`)
    .setSubject(payload.sub)
    .sign(SECRET);
    return token;
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
    try {
        const {payload} = await jwtVerify(token, SECRET);
        return payload as unknown as JwtPayload;
    } catch {
        return null;
    }
}

export async function setSessionCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * TOKEN_EXPIRY_DAYS,
    });
}

export async function clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<JwtPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
}

export {SECRET};
