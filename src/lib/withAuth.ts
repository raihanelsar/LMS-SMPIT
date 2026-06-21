import {getSession} from "@/lib/auth";
import {NextRequest, NextResponse} from "next/server";
import {JwtPayload} from "./auth";
import type {RoleName} from "@/types";

type Handler = (
    req: NextRequest,
    ctx: {params: Promise<Record<string, string | string[]>>; session: JwtPayload}
) => Promise<NextResponse>;

type RoleGuard = RoleName | "ANY";

export function withAuth(guard: RoleGuard | RoleGuard[], handler: Handler) {
    return async (req: NextRequest, ctx: {params: Promise<Record<string, string | string[]>>}) => {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({error: "Unauthorized: session diperlukan"}, {status: 401});
        }

        const allowed = Array.isArray(guard) ? guard : [guard];
        if (!allowed.includes("ANY") && !allowed.includes(session.role as RoleGuard)) {
            return NextResponse.json({error: "Forbidden: hak akses tidak memadai"}, {status: 403});
        }

        return handler(req, {...ctx, session});
    };
}
