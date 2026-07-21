# EkoSpot

Lagos hotspot discovery platform — restaurants, clubs, beaches, and cultural spaces in one place.

## Tech stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: Prisma ORM — SQLite locally, PostgreSQL in production
- **Auth**: Custom HMAC-SHA256 session cookies (no third-party provider required)
- **UI**: shadcn/ui + Tailwind CSS v4 + Radix UI primitives
- **Deployment**: Next.js standalone output (`output: "standalone"`)

---

## Prerequisites

- Node.js 20+
- npm or bun

---

## Quick start (local development)

```bash
# 1. Clone
git clone https://github.com/your-org/ekospot.git
cd ekospot

# 2. Install dependencies
npm install

# 3. Copy env and fill in production secrets
cp .env.example .env
# Edit .env — add AUTH_SECRET (see the "Environment variables" section below).

# 4. Sync the database schema to SQLite
npm run db:push

# 5. Generate the Prisma client
npm run db:generate

# 6. Start the dev server
npm run dev
```

The app will be live at `http://localhost:3000`.

---

## Environment variables

| Variable | Required in prod | Description |
|---|---|---|
| `AUTH_SECRET` | **Yes** | HMAC-SHA256 signing key. Must be ≥ 32 characters. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `DATABASE_URL` | **Yes** | Connection string for your database. Locally: `file:../db/custom.db` (SQLite). In production: your PostgreSQL connection string. |

All other configuration is read from the database at runtime.

### Setting `AUTH_SECRET` locally

The app ships with a dev-only fallback secret so you can run it without `AUTH_SECRET` set in development. **In production this fallback is disabled** — the app will refuse to start without a valid `AUTH_SECRET`.

```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# Copy the output and set it as AUTH_SECRET in your .env or hosting platform secrets UI.
```

---

## Database

### Schema management

| Command | Use case |
|---|---|
| `npm run db:push` | Sync schema to database (dev / one-off) |
| `npm run db:generate` | Regenerate Prisma client types |
| `npm run db:migrate` | Create a new migration (dev) |
| `npm run db:deploy` | Apply pending migrations (CI / production) |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:reset` | Reset and re-seed the database (dev only) |

### Migrating from SQLite (dev) to PostgreSQL (production)

1. Export your SQLite data if needed.
2. Provision a PostgreSQL database (Railway, Neon, Supabase, Fly.io, etc.).
3. Set `DATABASE_URL` to your PostgreSQL connection string.
4. Run `npm run db:deploy` to apply all migrations.
5. Restart the server.

---

## Production deploy checklist

Before deploying to any host (Vercel, Railway, Fly.io, self-hosted, etc.):

```bash
# 1. Run the pre-deploy smoke test
node scripts/deploy-check.js
# Exits 0 when all production checks pass. Add this to your CI pipeline.

# 2. Build the standalone output
npm run build

# 3. Set the following environment variables in your hosting platform:
#    AUTH_SECRET   ← your 48-byte random hex secret
#    DATABASE_URL  ← your production PostgreSQL connection string
#    NODE_ENV      ← production
```

### Vercel

Set `AUTH_SECRET` and `DATABASE_URL` in **Project → Settings → Environment Variables**. Vercel builds automatically on `git push` via the `build` script in `package.json`.

### Railway / Fly.io / Render

Set `AUTH_SECRET` and `DATABASE_URL` in the service's environment variable panel. Deploy using `npm run build` as the build command and `npm run start` as the start command.

### Self-hosted

```bash
# Build
npm run build

# Run
DATABASE_URL="postgresql://user:pass@host:5432/ekospot" \
AUTH_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")" \
NODE_ENV=production \
npm run start
```

---

## CI / GitHub Actions

```yaml
- name: Deploy check
  run: node scripts/deploy-check.js
  env:
    NODE_ENV: production
    AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

Run `npm run deploy-check` as a gate in your CI pipeline before deploying.

---

## Database scripts

`scripts/promote-admin.ts` — upgrades an existing user to admin role. Run with:

```bash
npx tsx scripts/promote-admin.ts <user-id-or-email>
```

---

## Project structure

```
src/
  app/                     # Next.js App Router pages and API routes
    api/                   # REST API endpoints
      auth/               # signup, login, logout, me
      listings/           # public hotspot listing + detail
      reviews/           # create, delete
      bookmarks/          # add, remove
      messaging/          # threads, messages, start
      bookings/           # create, list, PATCH, DELETE
  components/             # React UI components
    dashboard/           # Dashboard pages
    listings/            # Listing cards, detail, reserve
    ui/                  # shadcn/ui primitives
  lib/                   # Business logic, auth, Prisma client
prisma/
  schema.prisma          # Data model
scripts/
  deploy-check.js        # Pre-deploy environment validation
  promote-admin.ts      # Admin promotion utility
.trae/specs/            # Feature specs with tasks and checklists
```

---

## Admin role

Users with `role = "admin"` can promote other users, manage listings, and access admin-only API routes. Use `scripts/promote-admin.ts` to grant admin access to an existing user.
