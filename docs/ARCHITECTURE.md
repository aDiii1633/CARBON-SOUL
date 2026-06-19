# System Architecture

## Overview
Carbon Soul is a Next.js web application built for high performance, accessibility, and security.

The architecture comprises the following layers:
- **Frontend**: React Server Components and Client Components in the `app/` directory built on Next.js 14 App Router.
- **Backend API**: Serverless API routes under `app/api/` using NextAuth for authentication and Zod for data validation.
- **Data Layer**: PostgreSQL database managed via Prisma ORM.

## Key Components

- **Authentication**: `NextAuth` integrates with InsForge providers to manage JWT-based user sessions securely.
- **State Management**: Client-side state is handled optimally through `Zustand` (`lib/store.ts`).
- **Gamification Engine**: Complex streak and point calculation logic is isolated in `lib/gamification/` and integrated within database transactions.
- **Security**: 
  - All API payload inputs undergo strict `Zod` validation.
  - HTTP security headers (CSP, HSTS, X-Frame-Options) are enforced at the edge via `next.config.mjs`.

## Deployment & CI/CD
- **Environment**: Secrets are injected via `DATABASE_URL` and `NEXTAUTH_SECRET` (see `.env.example`).
- **Pipelines**: GitHub Actions (`.github/workflows/ci.yml`) enforce Linting, Type-Checking, Tests, and Builds on every push. Dependabot automates weekly security patching.
