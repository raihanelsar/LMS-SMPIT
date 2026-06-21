import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {withAuth} from "@/lib/withAuth";
import {userUpdateSchema} from "@/lib/validators";
import bcrypt from "bcryptjs";
import type {JwtPayload} from "@/lib/auth";

// GET single user
export const GET = withAuth(
    ["SUPER_ADMIN", "FACILITATOR", "PESERTA"],
    async (
        req: NextRequest,
        {params, session}: {params: Promise<Record<string, string | string[]>>; session: JwtPayload}
    ) => {
        try {
            const {id: rawId} = await params;
            const id = rawId as string;

            // Users can only view their own profile, admins/facilitators can view any
            if (session.role === "PESERTA" && session.sub !== id) {
                return NextResponse.json({error: "Tidak diizinkan untuk melihat profil pengguna lain"}, {status: 403});
            }

            const user = await prisma.user.findUnique({
                where: {id},
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    institution: true,
                    createdAt: true,
                    updatedAt: true,
                    programs: {
                        include: {
                            program: {
                                select: {
                                    id: true,
                                    title: true,
                                    batch: true,
                                    status: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            submissions: true,
                            ojtReports: true,
                            reflections: true,
                        },
                    },
                },
            });

            if (!user) {
                return NextResponse.json({error: "Pengguna tidak ditemukan"}, {status: 404});
            }

            return NextResponse.json({user}, {status: 200});
        } catch (error) {
            console.error("GET user error:", error);
            return NextResponse.json({error: "Gagal mengambil data pengguna"}, {status: 500});
        }
    }
);

// PUT update user
export const PUT = withAuth(
    ["SUPER_ADMIN", "PESERTA"],
    async (
        req: NextRequest,
        {params, session}: {params: Promise<Record<string, string | string[]>>; session: JwtPayload}
    ) => {
        try {
            const {id: rawId} = await params;
            const id = rawId as string;

            // Peserta can only update their own profile
            if (session.role === "PESERTA" && session.sub !== id) {
                return NextResponse.json({error: "Tidak diizinkan untuk mengubah profil pengguna lain"}, {status: 403});
            }

            const body = await req.json();
            const validation = userUpdateSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json({error: validation.error.issues[0].message}, {status: 400});
            }

            const existing = await prisma.user.findUnique({where: {id}});
            if (!existing) {
                return NextResponse.json({error: "Pengguna tidak ditemukan"}, {status: 404});
            }

            // If updating email, check if it's already taken
            if (validation.data.email && validation.data.email !== existing.email) {
                const emailExists = await prisma.user.findUnique({
                    where: {email: validation.data.email},
                });
                if (emailExists) {
                    return NextResponse.json({error: "Email sudah terdaftar"}, {status: 400});
                }
            }

            // Hash password if provided
            const updateData = {...validation.data};
            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            const user = await prisma.user.update({
                where: {id},
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    institution: true,
                    updatedAt: true,
                },
            });

            return NextResponse.json({message: "Pengguna berhasil diperbarui", user}, {status: 200});
        } catch (error) {
            console.error("PUT user error:", error);
            return NextResponse.json({error: "Gagal memperbarui pengguna"}, {status: 500});
        }
    }
);

// DELETE user
export const DELETE = withAuth(
    ["SUPER_ADMIN"],
    async (
        req: NextRequest,
        {params, session}: {params: Promise<Record<string, string | string[]>>; session: JwtPayload}
    ) => {
        try {
            const {id: rawId} = await params;
            const id = rawId as string;

            // Prevent self-deletion
            if (session.sub === id) {
                return NextResponse.json({error: "Tidak dapat menghapus akun sendiri"}, {status: 400});
            }

            const existing = await prisma.user.findUnique({where: {id}});
            if (!existing) {
                return NextResponse.json({error: "Pengguna tidak ditemukan"}, {status: 404});
            }

            await prisma.user.delete({where: {id}});

            return NextResponse.json({message: "Pengguna berhasil dihapus"}, {status: 200});
        } catch (error) {
            console.error("DELETE user error:", error);
            return NextResponse.json({error: "Gagal menghapus pengguna"}, {status: 500});
        }
    }
);
