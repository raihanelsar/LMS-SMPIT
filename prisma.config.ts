// Prisma configuration for LMS - SMPIT Seribu Bulan Boarding School
import "dotenv/config";
import {defineConfig} from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
});
