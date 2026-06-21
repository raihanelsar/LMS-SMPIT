# LMS Seribu Bulan — Agent Guidelines

Learning Management System for SMPIT Seribu Bulan Boarding School. Manages teacher training programs (Discovery Learning with PID media). All UI text and error messages are in **Indonesian (Bahasa)**.

## Build and Dev Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations (dev) |
| `npm run db:push` | Push schema without migration |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Prisma Studio |

**No test runner is configured.** Infrastructure requires PostgreSQL and MinIO (S3-compatible storage on port 9000).

## Architecture

- **Next.js 16** App Router with **all client components** (`"use client"`) — no React Server Components for data fetching
- **Authentication**: JWT via `jose`, stored in `httpOnly` cookie (`lms_session`). Middleware (`src/middleware.ts`) protects routes and injects `x-user-id`/`x-user-role` headers. API routes use `withAuth(roles, handler)` wrapper from `src/lib/withAuth.ts`
- **Database**: Prisma 7 with `@prisma/adapter-pg` (connection pooling via `pg.Pool`) — NOT traditional Prisma connection strings. Schema in `prisma/schema.prisma`
- **File storage**: MinIO via `src/lib/storage.ts`, uploads return presigned URLs
- **Validation**: Zod v4 (uses `.issues` not `.errors` on validation results)
- **Three roles**: `SUPER_ADMIN`, `FACILITATOR`, `PESERTA` — role checks at both middleware and API level

## Conventions

### File Organization
- Path alias: `@/*` → `./src/*`
- Route group `(dashboard)` for authenticated pages under `DashboardLayout`
- API routes: `src/app/api/{resource}/route.ts` with `[id]/route.ts` for params
- Pages: `src/app/(dashboard)/{resource}/page.tsx` with `new/`, `[id]/`, `[id]/edit/` sub-routes
- Types centralized in `src/types/index.ts`
- API client functions in `src/lib/api-client.ts` as namespaced objects (`programsApi.list()`)

### Code Patterns
- **Always** use `@/` import alias, `import type` for type-only imports
- **Error messages** returned to clients are in Indonesian
- **API responses**: `{ resource }` for single items, `{ resources: [] }` for lists — no unified wrapper
- **Audit logging**: Major actions create `AuditLog` entries via Prisma
- **UI components**: shadcn/ui-inspired in `src/components/ui/` using CVA, `clsx`, `tailwind-merge`
- **Styling**: Tailwind CSS v4 with `@theme` block in `globals.css`, CSS custom properties for colors
- **Constants**: UPPER_SNAKE_CASE in `src/lib/constants.ts`

## Common Pitfalls

1. **Prisma v7 adapter pattern**: The seed script (`prisma/seed.ts`) creates its own Prisma client with pg adapter — it does NOT use the singleton from `src/lib/prisma.ts`
2. **Zod v4 API**: Use `result.issues` not `result.errors`; validation error access patterns differ from Zod v3
3. **Hardcoded JWT fallback**: Both `src/lib/auth.ts` and `src/middleware.ts` have a hardcoded fallback secret — always set `JWT_SECRET` in production
4. **No `.env.example`**: Check existing `.env` for required variables (`DATABASE_URL`, `JWT_SECRET`, `S3_*`, `NEXT_PUBLIC_*`)
5. **Dashboard uses `any`**: `src/app/(dashboard)/dashboard/page.tsx` uses `useState<any>` — prefer typed state when modifying
6. **MinIO defaults**: Storage uses `minioadmin/minioadmin` defaults — must configure for production

## Environment Variables

Required: `DATABASE_URL`, `JWT_SECRET`, `S3_ENDPOINT`, `S3_PORT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`
Optional: `S3_USE_SSL`, `S3_REGION`, `JWT_EXPIRATION`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`

## Seed Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@seribubulan.sch.id` | `admin123` |
| Fasilitator | `fasilitator@seribubulan.sch.id` | `fasilitator123` |
| Peserta | `guru1@seribubulan.sch.id` | `guru123` |
