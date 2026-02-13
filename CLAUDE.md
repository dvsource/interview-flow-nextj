# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Next.js 16 + Turbopack)
npm run build        # Production build (also runs TypeScript check)
npm run lint         # ESLint
npm install --legacy-peer-deps  # Required — react-day-picker/date-fns peer dep conflict
```

No test framework is configured.

## Architecture

**Stack:** Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui + tRPC v11 + Drizzle ORM + Neon PostgreSQL

### tRPC Wiring

- **Server init:** `src/server/trpc.ts` creates the tRPC instance (no middleware, no auth)
- **Router:** `src/server/routers/_app.ts` combines sub-routers → exported as `AppRouter` type
- **Route handler:** `src/app/api/trpc/[trpc]/route.ts` mounts via `fetchRequestHandler` at `/api/trpc`
- **Client:** `src/lib/trpc.ts` creates `createTRPCReact<AppRouter>()` with `httpBatchLink` (no transformer — plain JSON only)
- **Providers:** `src/app/layout.tsx` wraps the app in `trpc.Provider` → `QueryClientProvider` → `TooltipProvider`

### Database

- `src/server/db.ts` — `getDb()` creates a Drizzle instance over `neon(DATABASE_URL)` on each call (Neon handles pooling)
- `src/server/schema.ts` — Two tables: `questions` (content) and `questionActions` (archive/skip state)
- `next.config.ts` marks `@neondatabase/serverless` and `drizzle-orm` as `serverExternalPackages`

### State Management

`src/hooks/useQuestionStore.ts` is the core hook — it owns all question pagination, navigation, archive/skip state, and tRPC queries internally. The page component passes a filter object; the hook manages everything else.

Key design: server provides deterministic random ordering via `md5(id || seed)`, client generates a session seed (`sessionStorage`), and pages of 10 are fetched with prefetching at position -3.

### Client-Side Types

`src/types/question.ts` — Date fields are `string` (Drizzle Date → JSON ISO string on the wire).

## tRPC + Zod Gotchas

- Use `.nullish()` not `.optional()` on input schemas — tRPC serializes `undefined` as `null` over JSON
- Do NOT use `transformer: superjson` — client doesn't auto-deserialize the envelope
- `queryResult.data` can be a non-array truthy value; always guard with `Array.isArray()`
- tRPC v11 type inference makes all fields appear optional on client; cast with `as Question[]`

## @neondatabase/serverless API

- `neon()` returns a tagged template function — use `` sql`...` `` for static queries
- For dynamic WHERE: `sql.query("SELECT ... WHERE $1", [params])`
- Do NOT call `sql("string", params)` — TypeScript expects `TemplateStringsArray`
