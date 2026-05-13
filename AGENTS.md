# AI Agent Instructions for Portal SSO

This is a Next.js 16 Single Sign-On (SSO) portal that serves as a central authentication hub for an organization's subsystems. See [README.md](README.md) for project overview and SSO integration guide.

## Quick Start Commands

```bash
# Development
pnpm install         # Install dependencies with pnpm (required)
pnpm dev            # Start dev server on http://localhost:4000 (uses Turbopack)
pnpm build          # Build for production
pnpm start          # Run production server

# Database
pnpm db:setup       # Initialize PostgreSQL schema
pnpm db:migrate     # Migrate data from public/data YAML to database
```

## Architecture Overview

### File Structure & Responsibilities

- **`/app`** — Next.js App Router pages and API routes
  - `/app/admin/*` — Protected admin panel (authentication required via cookies)
  - `/app/api/*` — RESTful backend APIs (news, banners, videos, contacts, auth, SSO)
  - `/app/login` — Admin login page
  - `/app/sso/authorize` — OAuth-like authorization flow entry point
- **`/components`** — React components (Header, Navbar, News, Videos, etc.)
- **`/lib`** — Utilities: `db.ts` (Prisma client), `mail.ts` (Nodemailer), `sso.ts` (token signing)
- **`/prisma`** — Schema and migrations
- **`/public/data`** — YAML data files (for reference; data now lives in PostgreSQL)
- **`/scripts`** — One-time setup scripts (`setup-db.ts`, `migrate-yaml-to-db.ts`)

### Core Technologies

| Stack | Version | Purpose |
|-------|---------|---------|
| Next.js | 16.2 | Framework with App Router |
| React | 19.2 | UI components |
| TypeScript | 5.7 | Type safety (strict mode required) |
| Prisma | 7.8 | Database ORM |
| PostgreSQL | 16 | Primary database |
| Tailwind CSS | 3.4 | Styling |
| NextAuth.js | 5.0-beta | Auth utilities |

### Database Schema

Four main Prisma models (in `/prisma/schema.prisma`):

- **Banner** — Homepage banners with title, image, link, and order
- **News** — News articles with title, description, date, image, and order
- **Video** — Videos by category, label, and source with order
- **Contact** — Contact info organized by tabs (unit, name, internal/external numbers)

All support `orderIndex` field for reordering via `/reorder` endpoints.

## Development Patterns

### Database Access

```typescript
import { getDb, getNews, getBanners, ... } from '@/lib/db';

// Helper functions exist for common queries
const news = await getNews();

// Or use getDb() for Prisma client access
const db = getDb();
const contact = await db.contact.findUnique({ where: { id: 1 } });
```

### API Routes

Follow Next.js app router conventions in `/app/api/`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  // Fetch & return data
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { field1, field2 } = await req.json();
  // Validate, create, return result
  return NextResponse.json({ success: true, data: result });
}
```

**Reordering pattern** — Updates `orderIndex` field:

```typescript
// PUT /api/{resource}/reorder
export async function PUT(req: NextRequest) {
  const { order } = await req.json(); // Array of { id, orderIndex }
  // Update all items in sequence
}
```

### Admin Authentication

- Protected by `/app/admin/middleware.ts` — redirects to `/login` if `adminName` cookie is missing
- Login via `/api/auth/request-code` → `/api/auth/verify-code` flow
- Sets `adminName` cookie on verification
- **Future improvement**: Consider upgrading to session/token-based auth (NextAuth.js is available)

### Components & UI

- Use [Tailwind CSS](https://tailwindcss.com/) for styling (configured in `tailwind.config.ts`)
- Form inputs use `@tailwindcss/forms` plugin
- Icons from `@heroicons/react`
- Drag-and-drop for reordering via `react-beautiful-dnd`
- Right-to-left (RTL) context: strings contain Persian/Farsi, watch text direction

## Key Conventions

### TypeScript
- **Strict mode enabled** — all code must be properly typed
- Import types explicitly: `import type { MyType } from '@/types'`
- Use `satisfies` operator where helpful for type inference

### API Error Handling
```typescript
try {
  // operation
  return NextResponse.json({ success: true, data: result });
} catch (err) {
  console.error('Failed to ...:', err);
  return NextResponse.json({ error: 'Failed to ...' }, { status: 500 });
}
```

### Environment Variables
All required `.env` variables documented in [README.md](README.md):
- `DATABASE_URL` — PostgreSQL connection
- `NEXT_PUBLIC_PORTAL_URL` — Frontend origin
- `SSO_*` — SSO configuration (issuer, secret, allowed domains, clients)
- `SMTP_*` — Email configuration (optional in dev; `/api/auth/request-code` returns code in response)

### Reordering Features
- All reorderable resources (banners, news, videos) have `orderIndex` field
- Use drag-and-drop UI with `react-beautiful-dnd`
- API endpoint: `PUT /api/{resource}/reorder` accepts array of `{ id, orderIndex }`

## Common Tasks

### Adding a New Content Type
1. Add Prisma model to `/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_{resource}`
3. Create `/app/api/{resource}/route.ts` with GET/POST/PUT/DELETE
4. Create `/app/api/{resource}/reorder/route.ts` for ordering (if needed)
5. Add helper in `/lib/db.ts` if frequently queried
6. Create admin page at `/app/admin/{resource}/page.tsx`

### Debugging
- Dev server logs in terminal show API errors
- Prisma Studio: `npx prisma studio` (opens browser UI for database)
- Check browser DevTools network tab for API failures
- Admin middleware issues → verify `adminName` cookie in DevTools

### Production Deployment
- Docker setup provided: `Dockerfile` + `docker-compose.yml`
- Environment variables injected at runtime (see `docker-compose.yml` for all vars)
- Database runs in separate PostgreSQL container with health checks
- App uses `next/standalone` output for minimal image size

## Common Pitfalls

1. **Prisma Client not generated** — Run `npx prisma generate` if types are missing
2. **Database not running** — Dev requires PostgreSQL; use Docker Compose: `docker-compose up -d postgres`
3. **Admin auth issues** — Ensure `adminName` cookie is set after login
4. **pnpm vs npm** — Project requires `pnpm` (configured in package.json); don't use npm
5. **Environment variables** — Copy `.env.example` to `.env.local` with actual values
6. **Turkish/Farsi text** — App supports RTL; be mindful of text direction in UI

## External References

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd)
- [Migration Guide](MIGRATION_GUIDE.md) — YAML to PostgreSQL migration details
