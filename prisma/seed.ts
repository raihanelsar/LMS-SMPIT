// Seed script for LMS Seribu Bulan
// Run with: npx tsx prisma/seed.ts

import {PrismaClient, RoleName} from "@prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import {Pool} from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log("🌱 Starting seed...");

    // Create users
    await prisma.user.upsert({
        where: {email: "admin@seribubulan.sch.id"},
        update: {},
        create: {
            name: "Super Admin",
            email: "admin@seribubulan.sch.id",
            password: await bcrypt.hash("admin123", 10),
            role: RoleName.SUPER_ADMIN,
            institution: "SMPIT Seribu Bulan Boarding School",
        },
    });

    const facilitator = await prisma.user.upsert({
        where: {email: "fasilitator@seribubulan.sch.id"},
        update: {},
        create: {
            name: "Dr. Ahmad Fasilitator",
            email: "fasilitator@seribubulan.sch.id",
            password: await bcrypt.hash("fasilitator123", 10),
            role: RoleName.FACILITATOR,
            institution: "SMPIT Seribu Bulan Boarding School",
        },
    });

    const peserta1 = await prisma.user.upsert({
        where: {email: "guru1@seribubulan.sch.id"},
        update: {},
        create: {
            name: "Budi Santoso, S.Pd",
            email: "guru1@seribubulan.sch.id",
            password: await bcrypt.hash("guru123", 10),
            role: RoleName.PESERTA,
            institution: "SMPIT Seribu Bulan Boarding School",
        },
    });

    const peserta2 = await prisma.user.upsert({
        where: {email: "guru2@seribubulan.sch.id"},
        update: {},
        create: {
            name: "Siti Aminah, M.Pd",
            email: "guru2@seribubulan.sch.id",
            password: await bcrypt.hash("guru123", 10),
            role: RoleName.PESERTA,
            institution: "SMPIT Seribu Bulan Boarding School",
        },
    });

    console.log("✅ Users created");

    // Create program
    const program = await prisma.program.create({
        data: {
            title: "Program Pelatihan Discovery Learning Berbantuan PID",
            description:
                "Program pelatihan guru SMPIT Seribu Bulan untuk menguasai metode Discovery Learning dengan bantuan media Papan Interaktif Digital (PID) Rumah Pendidikan.",
            startDate: new Date("2025-01-15"),
            endDate: new Date("2025-06-30"),
            batch: "Batch 1 - 2025",
            status: "RUNNING",
            users: {
                create: [{userId: facilitator.id}, {userId: peserta1.id}, {userId: peserta2.id}],
            },
        },
    });

    console.log("✅ Program created");

    // Create materials
    await Promise.all([
        prisma.material.create({
            data: {
                title: "Modul 1: Pengenalan Discovery Learning",
                fileUrl: "/materials/modul-1-discovery-learning.pdf",
                type: "PDF",
                programId: program.id,
            },
        }),
        prisma.material.create({
            data: {
                title: "Modul 2: Penggunaan Papan Interaktif Digital",
                fileUrl: "/materials/modul-2-pid.pdf",
                type: "PDF",
                programId: program.id,
            },
        }),
        prisma.material.create({
            data: {
                title: "Video Tutorial PID",
                fileUrl: "https://youtube.com/watch?v=example",
                type: "LINK",
                programId: program.id,
            },
        }),
    ]);

    console.log("✅ Materials created");

    // Create assignments
    const assignments = await Promise.all([
        prisma.assignment.create({
            data: {
                title: "Tugas 1: RPP Discovery Learning",
                type: "RPP",
                deadline: new Date("2025-03-15"),
                programId: program.id,
            },
        }),
        prisma.assignment.create({
            data: {
                title: "Tugas 2: Materi Ajar Digital",
                type: "MATERI",
                deadline: new Date("2025-04-15"),
                programId: program.id,
            },
        }),
        prisma.assignment.create({
            data: {
                title: "Tugas 3: Observasi Kelas",
                type: "OBSERVASI",
                deadline: new Date("2025-05-15"),
                programId: program.id,
            },
        }),
    ]);

    console.log("✅ Assignments created");

    // Create submissions
    await prisma.submission.create({
        data: {
            assignmentId: assignments[0].id,
            userId: peserta1.id,
            fileUrl: "/submissions/rpp-budi.pdf",
            status: "APPROVED",
            feedback: "RPP sudah sangat baik, implementasi Discovery Learning jelas terlihat.",
            score: 85,
        },
    });

    await prisma.submission.create({
        data: {
            assignmentId: assignments[0].id,
            userId: peserta2.id,
            fileUrl: "/submissions/rpp-siti.pdf",
            status: "SUBMITTED",
        },
    });

    console.log("✅ Submissions created");

    // Create OJT reports
    await prisma.ojtReport.create({
        data: {
            userId: peserta1.id,
            meeting: 1,
            documentationUrl: "/ojt/dokumentasi-budi-meeting1.pdf",
            videoUrl: "https://drive.google.com/file/d/example1",
            observationUrl: "/ojt/observasi-budi-meeting1.pdf",
            reflectionText:
                "Pelaksanaan OJT Pertemuan 1 berjalan lancar. Siswa sangat antusias dengan metode Discovery Learning menggunakan PID.",
            status: "APPROVED",
            studentProducts: {
                create: [
                    {fileUrl: "/student-products/karya-siswa-1.pdf"},
                    {fileUrl: "/student-products/karya-siswa-2.pdf"},
                ],
            },
        },
    });

    console.log("✅ OJT Reports created");

    // Create reflections
    await prisma.reflection.create({
        data: {
            userId: peserta1.id,
            programId: program.id,
            type: "TEACHER",
            response: {
                question1: "Metode Discovery Learning sangat efektif untuk meningkatkan keaktifan siswa.",
                question2: "PID membantu visualisasi materi yang abstrak.",
                question3: "Perlu lebih banyak latihan dalam penggunaan fitur-fitur PID.",
                rating: 4,
            },
        },
    });

    console.log("✅ Reflections created");

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📧 Test accounts:");
    console.log("  Super Admin: admin@seribubulan.sch.id / admin123");
    console.log("  Fasilitator: fasilitator@seribubulan.sch.id / fasilitator123");
    console.log("  Peserta 1: guru1@seribubulan.sch.id / guru123");
    console.log("  Peserta 2: guru2@seribubulan.sch.id / guru123");
}

main()
.catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
