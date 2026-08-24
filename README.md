# Finance — Personal Finance & Investment Tracker

A full-stack personal finance app: daily expenses (with receipt photos), income tracking, and an investment portfolio module with proper multi-transaction performance calculations (XIRR). Built to be used from your phone, laptop, and desktop against one shared database.

**Live app:** https://financial-app82326.vercel.app

## Tech stack

- **Next.js 15** (App Router, TypeScript) — one deployable app for both the UI and the backend (Server Actions instead of a separate API server).
- **PostgreSQL** via **Supabase** — hosted database.
- **Prisma** — type-safe database access and migrations.
- **Custom session auth** — email + password (bcrypt-hashed), signed random session tokens stored (hashed) in the database, secure httpOnly cookies, 48-hour sliding expiry. (Not NextAuth — its Credentials provider doesn't support persistent database sessions, which this app's "stay logged in 48h" requirement needs.)
- **Supabase Storage** — private bucket for receipt photos, served via short-lived signed URLs.
- **sharp** — resizes/compresses receipt photos server-side before upload.
- **Tailwind CSS** — styling, hand-built lightweight component set (no heavy UI framework dependency).
- **Recharts** — dashboard charts.
- **Vercel** — hosting.

## Project structure

```
prisma/schema.prisma        Database schema
src/lib/                    Framework-agnostic core: auth/session, prisma client,
                             storage, XIRR + portfolio math, validation, date ranges
src/actions/                Server Actions (create/update/delete) per module
src/components/             UI components, grouped by module + shared ui/ primitives
src/app/login, /register    Public auth pages
src/app/(app)/...           Authenticated app: dashboard, expenses, income,
                             investments, settings (protected by middleware + layout)
```

Every data model carries a `userId`, so although the app starts with a single account, it's already multi-user-ready — registration just isn't advertised anywhere beyond the `/register` page.

## Local development setup

### 1. Prerequisites

- [Node.js](https://nodejs.org) 20 or later.
- A free [Supabase](https://supabase.com) account (database + file storage).
- A free [GitHub](https://github.com) account (source control + deploys).
- A free [Vercel](https://vercel.com) account (hosting).

### 2. Create your Supabase project (database + storage)

1. Go to [supabase.com](https://supabase.com) → sign up (GitHub login is fine) → **New project**.
2. Pick any name/region, and set a strong database password — **save it somewhere**, you'll need it for the connection string.
3. Wait ~2 minutes for the project to provision.
4. **Get your database connection strings:** in the project, go to **Project Settings → Database → Connection string**.
   - Copy the **"Transaction" pooler** URI → this becomes `DATABASE_URL`.
   - Copy the **"Session" pooler** (or direct connection) URI → this becomes `DIRECT_URL`.
   - Both look like `postgresql://postgres.xxxx:[YOUR-PASSWORD]@...`. Replace `[YOUR-PASSWORD]` with the password from step 2.
5. **Create the receipts storage bucket:** go to **Storage** in the sidebar → **New bucket** → name it exactly `receipts` → **leave "Public bucket" turned OFF** (receipts must stay private; the app generates temporary signed links to view them).
6. **Get your API keys:** go to **Project Settings → API**.
   - Copy the **Project URL** → this becomes `NEXT_PUBLIC_SUPABASE_URL`.
   - Copy the **`service_role` secret key** (NOT the `anon` key) → this becomes `SUPABASE_SERVICE_ROLE_KEY`. Treat this like a password — it has full access to your project. It's only ever used server-side, never sent to the browser.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env` with the values from step 2, plus:

- `SESSION_SECRET` — any long random string. Generate one with `openssl rand -base64 32`, or just mash the keyboard for 40+ characters.
- `SUPABASE_RECEIPTS_BUCKET` — leave as `receipts` unless you named the bucket differently.
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` for local dev.

**Never commit `.env`** — it's already in `.gitignore`. Only `.env.example` (no real secrets) goes into git.

### 4. Install dependencies and set up the database

```bash
npm install
npx prisma migrate dev --name init
```

This creates all the tables in your Supabase database. Prisma will ask to confirm — say yes.

### 5. Run the app locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the login page.

### 6. Create your first user

There's no separate seed script — just go to `/register` and create your account normally:

[http://localhost:3000/register](http://localhost:3000/register)

This is also how you'd add a second user later if you ever share the app.

## Deploying so you can use it from your phone and other computers

### 1. Push the code to GitHub

1. Create a new **private** repository on [github.com/new](https://github.com/new) (name it e.g. `financial-app`). Don't initialize it with a README (this project already has one).
2. In this project folder:
   ```bash
   git add -A
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/financial-app.git
   git push -u origin main
   ```

### 2. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, and **import** the repository you just pushed.
2. Vercel auto-detects Next.js — leave the build settings as-is.
3. Before deploying, expand **Environment Variables** and add every variable from your `.env` file (`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_RECEIPTS_BUCKET`, `SESSION_SECRET`), plus set `NEXT_PUBLIC_APP_URL` to the `https://your-project.vercel.app` URL Vercel shows you (you can also update this after the first deploy once you know the final URL).
4. Click **Deploy**.
5. Once deployed, run the database migration against production (from your local machine, with your local `.env` pointed at the same Supabase project — since local and production share one database, you only ever migrate once per schema change):
   ```bash
   npx prisma migrate deploy
   ```

### 3. Using it from your phone / other devices

Once deployed, your app lives at a permanent URL like `https://financial-app-yourname.vercel.app`. Open that URL in any browser — phone, laptop, desktop — and log in with the account you created. Everything is stored in the shared Supabase database, so it's the same data everywhere. On your phone, use "Add to Home Screen" from the browser share menu for an app-like icon.

### 4. Shipping future changes

Any time you `git push` to the `main` branch, Vercel automatically rebuilds and redeploys. If a change includes a `prisma/schema.prisma` edit, run `npx prisma migrate dev --name <description>` locally first (to generate and apply the migration), commit the generated migration files, then push — and run `npx prisma migrate deploy` once against production as in step 2.5 above.

## Currency handling

The app supports ARS and USD from day one, tracked independently — **it never auto-converts or sums amounts across currencies**. Totals and charts are always grouped/labeled per currency (e.g. "ARS 45,000 · USD 320"). Adding a currency later just means adding it to the `CURRENCIES` list in `src/lib/validations.ts`. A future enhancement could add manual exchange-rate snapshots for an optional blended net-worth view — intentionally left out of this MVP to avoid misleading conversions.

## Investment performance methodology

Because an asset can be built from multiple purchases (and partial sales) on different dates, a flat CAGR doesn't apply cleanly. Each asset's **annualized return** is computed as **XIRR** — the money-weighted rate that discounts every transaction (and the current holding value, as of today) to zero net present value. For a single lump-sum purchase this reduces to the same number a simple CAGR would give. The **total return %** (simple, not annualized) is also shown for an easy sanity check. See `src/lib/xirr.ts` and `src/lib/portfolio.ts`.

## Security notes

- Passwords are hashed with bcrypt (12 rounds), never stored or logged in plain text.
- Sessions are random 256-bit tokens; only a SHA-256 hash of the token is stored server-side, so a database leak alone can't be replayed as a valid session cookie. Cookies are `httpOnly`, `secure` (in production), and `sameSite=lax`.
- All protected routes require a valid session, checked both in middleware (fast redirect) and again in each page/Server Action (defense in depth) — every database query is scoped to the logged-in user's `id`.
- Receipt images are stored in a **private** Supabase bucket; the app only ever hands out short-lived (10-minute) signed URLs, never public links.
- All input is validated with Zod on the server before touching the database; Prisma's parameterized queries prevent SQL injection.
- Secrets live only in environment variables (`.env` locally, Vercel's encrypted env vars in production) and are never referenced from client-side code.

## Possible future features (not in this MVP, by design)

- Live market price lookups (would require picking and paying for/rate-limiting a market data API — deliberately deferred; current price is entered manually for now).
- Manual exchange-rate snapshots for a blended multi-currency net worth view.
- CSV/PDF export of transactions.
- Recurring/scheduled expenses.
- Multi-user sharing/permissions beyond the existing per-user data isolation.
