import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {verifyToken} from "@/lib/auth";
import {cookies} from "next/headers";
import bcrypt from "bcryptjs";
import type {RoleName} from "@/types";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("lms_session");

        if (!token) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const decoded = await verifyToken(token.value);
        if (!decoded || decoded.role !== "SUPER_ADMIN") {
            return NextResponse.json({error: "Forbidden"}, {status: 403});
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({error: "File is required"}, {status: 400});
        }

        if (!file.name.endsWith(".csv")) {
            return NextResponse.json({error: "File must be CSV format"}, {status: 400});
        }

        const text = await file.text();
        const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);

        if (lines.length < 2) {
            return NextResponse.json({error: "CSV file is empty or invalid"}, {status: 400});
        }

        // Parse CSV header
        const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const nameIndex = header.indexOf("name");
        const emailIndex = header.indexOf("email");
        const passwordIndex = header.indexOf("password");
        const roleIndex = header.indexOf("role");
        const institutionIndex = header.indexOf("institution");

        if (nameIndex === -1 || emailIndex === -1 || passwordIndex === -1) {
            return NextResponse.json({error: "CSV must contain name, email, and password columns"}, {status: 400});
        }

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        // Process each row
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",").map((v) => v.trim());

            if (values.length < Math.max(nameIndex, emailIndex, passwordIndex) + 1) {
                results.failed++;
                results.errors.push(`Row ${i}: Invalid data format`);
                continue;
            }

            const name = values[nameIndex];
            const email = values[emailIndex];
            const password = values[passwordIndex];
            const role = roleIndex !== -1 ? values[roleIndex]?.toUpperCase() : "PESERTA";
            const institution = institutionIndex !== -1 ? values[institutionIndex] : "";

            // Validate
            if (!name || !email || !password) {
                results.failed++;
                results.errors.push(`Row ${i}: Missing required fields`);
                continue;
            }

            if (!["SUPER_ADMIN", "FACILITATOR", "PESERTA"].includes(role)) {
                results.failed++;
                results.errors.push(`Row ${i}: Invalid role "${role}"`);
                continue;
            }

            // Check if email already exists
            const existingUser = await prisma.user.findUnique({
                where: {email},
            });

            if (existingUser) {
                results.failed++;
                results.errors.push(`Row ${i}: Email "${email}" already exists`);
                continue;
            }

            // Create user
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role: role as RoleName,
                        institution: institution || undefined,
                    },
                });
                results.success++;
            } catch {
                results.failed++;
                results.errors.push(`Row ${i}: Failed to create user`);
            }
        }

        return NextResponse.json({
            message: `Import completed: ${results.success} success, ${results.failed} failed`,
            results,
        });
    } catch (_error) {
        console.error("Error importing users:", _error);
        return NextResponse.json({error: "Failed to import users"}, {status: 500});
    }
}
