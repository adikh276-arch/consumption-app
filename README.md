# BreatheFree — Cigarette Consumption Tracker

A mobile-first cigarette consumption tracker built for Employee Assistance Programmes. Helps employees understand their smoking habits, see lifetime impact, and access support.

## Features

- **Daily Counter** — Quick +/− logging with motivational feedback
- **Lifetime Impact** — Days of life affected, money spent, total packs
- **Weekly Chart** — Visual 7-day consumption trend
- **Cross-Tracker Insights** — Correlations with sleep, mood, and energy data
- **Expert Booking** — Counsellor referral when consumption increases
- **Multi-Language** — 10 languages via Google Translate API
- **History & Export** — Full log with delete and CSV export

## Tech Stack

React + TypeScript + Vite + Tailwind CSS + Supabase + Recharts

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `VITE_GOOGLE_TRANSLATE_API_KEY` | Google Cloud Translation API key |

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GOOGLE_TRANSLATE_API_KEY=AIza...
```

## Database Schema (SQL)

Run this in the Supabase SQL Editor:

```sql
-- Users table (shared across trackers)
CREATE TABLE IF NOT EXISTS public.users (
  id BIGINT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consumption profiles
CREATE TABLE IF NOT EXISTS public.consumption_profiles (
  user_id BIGINT UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  start_month INTEGER NOT NULL,
  start_year INTEGER NOT NULL,
  avg_per_day INTEGER NOT NULL DEFAULT 10,
  per_pack INTEGER NOT NULL DEFAULT 20,
  cost_per_cig NUMERIC(10,2) NOT NULL DEFAULT 0.50,
  total_cigarettes BIGINT,
  days_affected NUMERIC(10,1),
  total_money_spent NUMERIC(12,2),
  total_packs BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consumption logs
CREATE TABLE IF NOT EXISTS public.consumption_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  count INTEGER NOT NULL DEFAULT 1,
  location TEXT,
  trigger TEXT,
  mood TEXT,
  notes TEXT
);

CREATE INDEX idx_consumption_logs_user_ts ON public.consumption_logs(user_id, timestamp DESC);

-- Custom config setter for RLS
CREATE OR REPLACE FUNCTION public.set_config(setting_name TEXT, setting_value TEXT, is_local BOOLEAN DEFAULT TRUE)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config(setting_name, setting_value, is_local);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_self" ON public.users
  USING (id::TEXT = current_setting('app.current_user_id', TRUE))
  WITH CHECK (id::TEXT = current_setting('app.current_user_id', TRUE));

CREATE POLICY "profiles_self" ON public.consumption_profiles
  USING (user_id::TEXT = current_setting('app.current_user_id', TRUE))
  WITH CHECK (user_id::TEXT = current_setting('app.current_user_id', TRUE));

CREATE POLICY "logs_self" ON public.consumption_logs
  USING (user_id::TEXT = current_setting('app.current_user_id', TRUE))
  WITH CHECK (user_id::TEXT = current_setting('app.current_user_id', TRUE));
```

## Authentication

This app uses a **token-based handshake**, not Supabase Auth:

1. User arrives with `?token=UUID` in the URL
2. App POSTs to `https://api.mantracare.com/user/user-info` with `{ "token": "UUID" }`
3. On success, extracts `user_id` and stores in `sessionStorage`
4. On failure, redirects to `/token`

Before every Supabase query:
```sql
SET LOCAL app.current_user_id = '<userId>';
```

## Language Support

Supports: EN, ES, FR, DE, HI, TA, TE, KN, ML, MR

- Override via URL: `?lang=hi`
- Persisted in `sessionStorage`
- Translations cached to minimize API calls
- Falls back to English on API failure

## Local Development

```bash
npm install
npm run dev
```

## Deployment

1. Build: `npm run build`
2. Serve the `dist/` folder
3. Set environment variables on your hosting platform

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GOOGLE_TRANSLATE_API_KEY
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Required CI/CD Secrets

| Secret | Usage |
|---|---|
| `VITE_SUPABASE_URL` | Build-time env var |
| `VITE_SUPABASE_ANON_KEY` | Build-time env var |
| `VITE_GOOGLE_TRANSLATE_API_KEY` | Build-time env var |
