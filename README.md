# AI Enablement — Intake & Triage

A Next.js app for capturing, quantifying, triaging, and running discovery on workflow
friction opportunities. This is the successor to the spreadsheet version (archived in
[`/spreadsheet`](./spreadsheet)).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Tailwind CSS**
- **Neon** (serverless Postgres) + **Drizzle ORM**
- **Vercel AI SDK** + **AI Gateway** (Claude Opus 4.8) for interview extraction
- **lucide-react** icons

Persistence is API-backed (Neon). If `DATABASE_URL` is unset, the app **falls back to
browser localStorage** with seed data, so it runs with zero setup.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and AI_GATEWAY_API_KEY
npm run dev                  # http://localhost:3000

npm run build                # production build / typecheck
```

### Environment variables

| Var | What | Where to get it |
|---|---|---|
| `DATABASE_URL` | Neon Postgres pooled connection string | Neon dashboard, or Vercel's Neon integration |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key (for "Import from interview") | Vercel dashboard → AI Gateway → API Keys. On Vercel, OIDC is used automatically and this can be omitted. |

Both are optional locally: without `DATABASE_URL` the app uses localStorage; without the
gateway key only the AI import feature is disabled.

### Database commands

```bash
npm run db:generate   # generate SQL migrations from lib/db/schema.ts
npm run db:push       # push schema directly to the DB (fast, dev)
npm run db:migrate    # apply generated migrations (prod)
npm run db:seed       # load the sample opportunities/sessions/steps
```

## Structure

```
app/
  page.tsx                  Dashboard (KPIs, portfolio charts, top priorities)
  intake/                   Intake list, new-intake form, AI import (/intake/import)
  opportunities/            Triage table + opportunity brief (with live triage panel)
  discovery/                Discovery sessions + step log (filter by opportunity)
  settings/                 Reference lists, scoring weights
  api/
    data/                   Bootstrap load (returns all rows, or {dbConfigured:false})
    opportunities|sessions|steps/   CRUD route handlers
    extract/                Granola transcript -> structured intake (AI Gateway)
lib/
  types.ts                  Domain types
  lists.ts                  Dropdown values + scoring weights
  scoring.ts                Scoring engine (port of the spreadsheet formulas)
  store.tsx                 React context — API-backed, localStorage fallback
  seed.ts                   Sample opportunities, sessions, steps
  extraction.ts             Extraction schema + prompt + mapping
  db/                       Drizzle schema, Neon client, repository
components/                 UI primitives, badges, sidebar
drizzle/                    Generated SQL migrations
```

## The four stages

1. **Intake** — submit a workflow friction opportunity (`/intake/new`), or **import from
   an interview** (`/intake/import`): paste a Granola summary, AI drafts the form with
   per-field confidence and flags unanswered questions; you review and edit before saving.
2. **Triage** — auto-scored for impact, frequency, friction, risk → priority category (`/opportunities`)
3. **Discovery** — log session summaries + detailed step-by-step walkthroughs (`/discovery`)
4. **Brief** — the opportunity detail page doubles as a stakeholder brief (`/opportunities/[id]`)

## How persistence works

`lib/store.tsx` calls `/api/data` on load. If the DB is configured it uses Postgres and
all mutations go through the `/api/*` route handlers (optimistic local updates +
fire-and-forget writes). If not, it falls back to localStorage. The API routes use the
`lib/db` repository; types in `lib/types.ts` map 1:1 to the Drizzle tables.

## AI import (interview → intake)

`POST /api/extract` takes `{ transcript }`, runs `generateObject` (Vercel AI SDK) through
the AI Gateway against `anthropic/claude-opus-4-8`, and returns the drafted fields with a
`stated` / `inferred` / `missing` confidence + supporting quote each, plus a list of
intake questions the interview didn't answer. The schema and prompt live in
`lib/extraction.ts`. Audio/MP3 transcription is intentionally not wired up yet — the
Granola text path covers the common case.

## Deploy to Vercel

1. Import the repo; set **Root Directory** to `discovery-intake`.
2. Add the **Neon** integration (sets `DATABASE_URL`) and enable the **AI Gateway**.
3. Run `npm run db:push` (or `db:migrate`) once against the Neon database, then optionally
   `npm run db:seed`.
