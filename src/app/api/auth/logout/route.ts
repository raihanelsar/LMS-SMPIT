import {NextResponse} from "next/server";
import {clearSessionCookie, getSession} from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
    try {
        const session = await getSession();
        if (session) {
            await prisma.auditLog.create({
                data: {userId: session.sub, action: "LOGOUT"},
            });
        }
        await clearSessionCookie();
        return NextResponse.json({message: "Logout berhasil"});
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({error: "Terjadi kesalahan pada server"}, {status: 500});
    }
}
