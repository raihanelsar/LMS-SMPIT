import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {verifyToken} from "@/lib/auth";
import {cookies} from "next/headers";

export async function POST(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("lms_session");

        if (!token) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const decoded = await verifyToken(token.value);
        if (!decoded || (decoded.role !== "SUPER_ADMIN" && decoded.role !== "FACILITATOR")) {
            return NextResponse.json({error: "Forbidden"}, {status: 403});
        }

        const {id: programId} = await params;
        const {userId} = await request.json();

        if (!userId) {
            return NextResponse.json({error: "User ID is required"}, {status: 400});
        }

        // Check if program exists
        const program = await prisma.program.findUnique({
            where: {id: programId},
        });

        if (!program) {
            return NextResponse.json({error: "Program not found"}, {status: 404});
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: {id: userId},
        });

        if (!user) {
            return NextResponse.json({error: "User not found"}, {status: 404});
        }

        // Check if already assigned
        const existing = await prisma.programUser.findFirst({
            where: {
                programId,
                userId,
            },
        });

        if (existing) {
            return NextResponse.json({error: "User already assigned to this program"}, {status: 400});
        }

        // Create assignment
        const programUser = await prisma.programUser.create({
            data: {
                programId,
                userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        return NextResponse.json({programUser}, {status: 201});
    } catch (error) {
        console.error("Error assigning user to program:", error);
        return NextResponse.json({error: "Failed to assign user to program"}, {status: 500});
    }
}

export async function DELETE(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("lms_session");

        if (!token) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const decoded = await verifyToken(token.value);
        if (!decoded || (decoded.role !== "SUPER_ADMIN" && decoded.role !== "FACILITATOR")) {
            return NextResponse.json({error: "Forbidden"}, {status: 403});
        }

        const {id: programId} = await params;
        const {userId} = await request.json();

        if (!userId) {
            return NextResponse.json({error: "User ID is required"}, {status: 400});
        }

        // Delete assignment
        await prisma.programUser.deleteMany({
            where: {
                programId,
                userId,
            },
        });

        return NextResponse.json({message: "User removed from program"}, {status: 200});
    } catch (error) {
        console.error("Error removing user from program:", error);
        return NextResponse.json({error: "Failed to remove user from program"}, {status: 500});
    }
}
