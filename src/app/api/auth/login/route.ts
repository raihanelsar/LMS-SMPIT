import {NextRequest, NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {loginSchema} from "@/lib/validators";
import {signToken, setSessionCookie} from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
        }

        const {email, password} = validation.data;

        const user = await prisma.user.findUnique({where: {email}});
        if (!user) {
            return NextResponse.json({error: "Email atau password salah"}, {status: 401});
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({error: "Email atau password salah"}, {status: 401});
        }

        const token = await signToken({
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });

        await setSessionCookie(token);

        await prisma.auditLog.create({
            data: {userId: user.id, action: "LOGIN"},
        });

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                institution: user.institution,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({error: "Terjadi kesalahan pada server"}, {status: 500});
    }
}
