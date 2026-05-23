# Calorie Tracker

A modern calorie and macro tracking app built with Next.js. Log meals in seconds using AI-powered photo or text analysis, set personalized daily targets from your body stats, and follow your progress with a clear daily dashboard and 7-day overview.

Install it as a Progressive Web App (PWA) on your phone or desktop for quick access without an app store.

## Features

### Meal logging — three ways

- **Photo** — Upload a food photo; Google Gemini estimates calories, protein, carbs, and fat.
- **Text** — Describe a meal naturally (e.g. *"two eggs, toast, black coffee"*) and get an instant macro estimate.
- **Manual** — Enter nutrition values yourself for full control.

### Personalized goals

Onboarding collects your age, height, weight, activity level, and goal (lose, maintain, or gain). The app calculates a daily calorie budget and macro split using standard metabolic formulas, with adjustable protein and goal intensity.

### Daily dashboard

- **Calorie ring** — See remaining calories at a glance.
- **Macro breakdown** — Track protein, carbs, and fat against your targets.
- **7-day view** — Browse the week and spot trends quickly.
- **Flexible dates** — Log or edit meals for any day, past or future.

### Authentication & data

- Email/password sign-up and login via **Supabase Auth**
- Per-user meal history and goals stored in **PostgreSQL**
- Protected API routes — all meal and goal endpoints require a signed-in user

### Progressive Web App

The app is installable on supported browsers. A service worker caches assets in production for faster loads and offline-friendly behavior.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack in dev) |
| UI | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| Auth | [Supabase Auth](https://supabase.com/docs/guides/auth) |
| Database | [PostgreSQL](https://www.postgresql.org/) via [Drizzle ORM](https://orm.drizzle.team/) |
| AI | [Google Gemini](https://ai.google.dev/) (`@google/generative-ai`) |
| Charts | [Recharts](https://recharts.org/) |
| PWA | [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa) |

## Project structure

```
app/
  (auth)/login/          # Login page
  (auth)/signup/         # Sign-up page
  home/                  # Public landing page
  onboarding/            # Goal setup flow
  page.tsx               # Main dashboard (authenticated)
  api/
    analyze/             # Photo → Gemini macro analysis
    analyze-text/        # Text → Gemini macro analysis
    meals/               # CRUD + daily/weekly totals
    goals/               # User calorie/macro targets
components/
  log-meal/              # Photo, text, and manual logging flows
  onboarding/            # Body params form and results
  home/                  # Landing page
  daily-summary.tsx      # Calorie ring and week strip
  daily-meals-list.tsx   # Meal list for selected date
lib/
  db/                    # Drizzle schema and client
  calorie-calculator.ts  # TDEE and macro math
  gemini.ts              # Gemini API helpers
  supabase/              # Browser and server Supabase clients
drizzle/                 # SQL migrations
public/icons/            # PWA icons
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project (Auth + Postgres)
- A [Google AI Studio](https://aistudio.google.com/) API key for Gemini

### 1. Clone and install

```bash
git clone <repository-url>
cd calorie-tracker
pnpm install
```

### 2. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `DATABASE_URL` | Postgres connection string (Supabase pooler or direct) |
| `GOOGLE_API_KEY` | Google AI API key for Gemini |
| `GEMINI_MODEL` | Model for photo analysis (default: `gemini-2.5-flash-lite`) |
| `GEMINI_TEXT_MODEL` | Model for text analysis (default: `gemini-2.5-flash-lite`) |

For Drizzle migrations, use a direct Postgres connection when possible. You can set `DATABASE_DIRECT_URL` or the config will attempt to rewrite the pooler port (`6543` → `5432`).

### 3. Database setup

Run migrations against your Postgres database:

```bash
pnpm db:migrate
```

Other database commands:

```bash
pnpm db:generate   # Generate migrations from schema changes
pnpm db:push       # Push schema directly (dev/prototyping)
pnpm db:studio     # Open Drizzle Studio
```

### 4. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

- **`/home`** — Public landing page
- **`/signup`** / **`/login`** — Create an account or sign in
- **`/onboarding`** — Set your calorie and macro targets (required before the dashboard)
- **`/`** — Main tracking dashboard

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format TypeScript/TSX with Prettier |
| `pnpm typecheck` | Run TypeScript compiler (no emit) |

## API overview

All API routes require an authenticated Supabase session unless noted.

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/analyze` | Analyze a food photo (multipart form, field: `image`) |
| `POST` | `/api/analyze-text` | Analyze a meal description (JSON: `{ description }`) |
| `GET` | `/api/meals?date=YYYY-MM-DD` | Meals and totals for a date |
| `GET` | `/api/meals?from=...&to=...` | Aggregated totals for a date range |
| `POST` | `/api/meals` | Create a meal entry |
| `PATCH` | `/api/meals/[id]` | Update a meal |
| `DELETE` | `/api/meals/[id]` | Delete a meal |
| `GET` | `/api/goals` | Fetch the current user's goals |
| `POST` | `/api/goals` | Save or update goals |

## Database schema

**`user_goals`** — One row per user with body parameters, activity level, goal type, and computed daily calories/protein/carbs/fat.

**`meal_entries`** — Individual logged meals with a date, food list (JSON), and macro totals.

See [`lib/db/schema.ts`](lib/db/schema.ts) for the full Drizzle definitions.

## Deployment

1. Set all environment variables in your hosting provider (Vercel, etc.).
2. Run database migrations against your production Postgres instance.
3. Build and deploy:

```bash
pnpm build
pnpm start
```

PWA service worker registration is enabled in production builds only.

## License

Private project — all rights reserved unless otherwise specified by the repository owner.
