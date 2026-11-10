# Dokanman (দোকানম্যান)

Mobile-first digital ledger and fast sales counter for small tea stalls and grocery shops in Bangladesh. Bengali/English UI, per-shop tenancy, cash/credit tracking, due collection, expenses, daily closing and backup.

## Stack

- Next.js 16 (App Router, Cache Components / PPR) + React 19 + TypeScript
- Tailwind CSS v4
- Neon Postgres via `@neondatabase/serverless` + Drizzle ORM
- `jose` HS256 session cookie (httpOnly, 30 days), `bcryptjs` PIN hashing
- Zustand for the in-progress cart
- Vercel Web Analytics (`@vercel/analytics`)

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run db:migrate           # apply drizzle/ migrations
npm run db:seed              # optional demo shop + products
npm run dev                  # http://localhost:3000
```

Demo login after seeding: phone `01700000000`, PIN `1234`.

### Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Pooled Neon connection used at runtime |
| `DATABASE_URL_UNPOOLED` | for migrations | Direct connection used by `db:migrate` |
| `AUTH_SECRET` | yes in production | Signs session cookies, 32+ characters. Generate with `openssl rand -base64 48` |

`AUTH_SECRET` falls back to a development-only value when `NODE_ENV` is not `production`. In production the app refuses to serve requests without a valid secret instead of silently using a known key.

## Deploying to Vercel

1. Push the repository to GitHub/GitLab/Bitbucket (`.env*` files are gitignored, only `.env.example` is committed).
2. Import the repository at [vercel.com/new](https://vercel.com/new). `vercel.json` already pins the framework, `npm ci`, `npm run build` and the `iad1` function region.
3. Add the environment variables from the table above under **Project → Settings → Environment Variables** for Production (and Preview if you want preview deployments to work).
4. Run migrations against the production database once, from your machine:

   ```bash
   DATABASE_URL_UNPOOLED="<production unpooled url>" npm run db:migrate
   ```

   Seeding is optional and only creates a demo shop — skip it for a real deployment.
5. Deploy. With the CLI:

   ```bash
   npx vercel          # preview deployment
   npx vercel --prod   # production deployment
   ```

6. Open **Project → Analytics** and enable Web Analytics. The `<Analytics />` component is already mounted in `src/app/layout.tsx`, so page views and routes start appearing after the first visit to the production or preview deployment. Analytics is inert in local development.

### Region note

The function region is pinned to `iad1` (us-east-1) because the Neon database runs in `us-east-1`. If you move the database, update `regions` in `vercel.json` to match; every request makes several database round trips, so cross-region distance dominates page latency.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm run start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a Drizzle migration from `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations (skips already-applied statements) |
| `npm run db:seed` | Insert demo shop, products and customers |

## Project layout

```
src/app        routes (login, signup, dashboard shell) and global styles
src/actions    server actions (auth, POS, ledger, expenses, settings, backup)
src/components dashboard, POS counter, ledger, expenses, modals, navigation
src/db         Drizzle schema, client, migrations, seed
src/lib        session/auth helpers
src/i18n       Bengali/English strings and currency formatting
drizzle/       SQL migrations
```
