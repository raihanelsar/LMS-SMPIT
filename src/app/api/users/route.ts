import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {withAuth} from "@/lib/withAuth";
import {userSchema} from "@/lib/validators";
import bcrypt from "bcryptjs";

export const GET = withAuth(["SUPER_ADMIN"], async (req: NextRequest) => {
    try {
        const {searchParams} = new URL(req.url);
        const role = searchParams.get("role");
        const search = searchParams.get("search");

        const where: Record<string, unknown> = {};
        if (role) where.role = role;
        if (search) {
            where.OR = [
                {name: {contains: search, mode: "insensitive"}},
                {email: {contains: search, mode: "insensitive"}},
            ];
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                institution: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        programs: true,
                        submissions: true,
                        ojtReports: true,
                        reflections: true,
                    },
                },
            },
            orderBy: {createdAt: "desc"},
        });

        return NextResponse.json({users}, {status: 200});
    } catch (error) {
        console.error("GET users error:", error);
        return NextResponse.json({error: "Gagal mengambil data pengguna"}, {status: 500});
    }
});

export const POST = withAuth(["SUPER_ADMIN"], async (req: NextRequest) => {
    try {
        const body = await req.json();
        const validation = userSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
        }

        const existingUser = await prisma.user.findUnique({
            where: {email: validation.data.email},
        });

        if (existingUser) {
            return NextResponse.json({error: "Email sudah terdaftar"}, {status: 400});
        }

        const hashedPassword = await bcrypt.hash(validation.data.password, 10);

        const user = await prisma.user.create({
            data: {
                ...validation.data,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                institution: true,
                createdAt: true,
            },
        });

        return NextResponse.json({message: "Pengguna berhasil ditambahkan", user}, {status: 201});
    } catch (error) {
        console.error("POST user error:", error);
        return NextResponse.json({error: "Gagal menambahkan pengguna"}, {status: 500});
    }
});
