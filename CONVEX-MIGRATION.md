# Lagos Hotspot — Data Migration Plan

## Goal
- Keep Cloudflare Pages as the frontend host.
- Use Convex for dynamic data, auth/sessions, realtime features.
- Migrate data from SQLite (`db/custom.db`) + Prisma to Convex.

## Current state
- Frontend: Next.js app router with client-side router.
- Backend routes: Next.js API handlers backed by Prisma/SQLite.
- Auth: cookie-based HMAC sessions + Next.js route handlers.

## Migration plan

### Phase 1 — Schema & backend parity
- Expand `convex/schema.ts` to match Prisma models.
- Add Convex HTTP actions for auth (signup/login/session) and admin operations.
- Add Convex queries/mutations for listings, reviews, bookings, messaging, bookmarks, admin actions.
- Replace server-side Prisma calls in API routes with Convex calls or move logic into Convex actions.

### Phase 2 — Frontend integration
- Move data access from `api/*` REST calls to Convex client queries/mutations.
- Reuse auth store with Convex-seeded session token or direct user state from Convex.
- Use ConvexProvider wrapping the router/provider stack.

### Phase 3 — Hosting & cleanup
- Prepare Cloudflare Pages target:
  - `output: "export"` or Pages-compatible Next.js build.
  - Database/static assets documented.
- Remove Prisma server dependencies from runtime once migrated.
- Migrate data:
  - Export from SQLite: `sqlite3 db/custom.db .dump > /tmp/legacy.sql`
  - Map CSV/JSON rows into Convex tables via script or inline import.
  - Verify counts per table after import.

## Immediate actions needed
1. Enrich Convex schema.
2. Implement Convex auth using custom username/password with hashed credentials.
3. Implement listing CRUD in Convex.
4. Pilot moving `/api/listings` to Convex and keep API handlers as proxies during transition.
5. Document Cloudflare Pages build settings.
