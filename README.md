# FitVerse landing page

The marketing and waitlist site for FitVerse, an AI fitness app that reads nutrition,
training, sleep and recovery together.

Next.js 15 (App Router), Tailwind, Framer Motion. The waitlist form posts to
`/api/waitlist`, which stores signups in Supabase and sends a welcome email
through Resend.

## Run it

```bash
npm ci                             # installs exactly what package-lock.json says
cp .env.local.example .env.local   # then fill in the values below
npm run dev                        # http://localhost:3000
npm run build && npm start         # production (needs the env vars below)
```

## Environment variables

Set these on the host (and in `.env.local` for development). Never commit real
values: every `.env*` file except `.env.local.example` is gitignored.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL. Public by design. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **Secret.** Server only, bypasses RLS. Never prefix with `NEXT_PUBLIC_`. |
| `RESEND_API_KEY` | for email | **Secret.** Without it signups are stored but no welcome email is sent. |
| `RESEND_FROM_EMAIL` | for email | A verified sender, e.g. `FitVerse <hello@yourdomain>`. |
| `IP_HASH_SALT` | yes in production | Long random string. Salts the hash of the visitor IP used for rate limiting. |
| `UPSTASH_REDIS_REST_URL` | yes in production | Upstash Redis REST URL. Shared rate limit; without it production rejects signups with 503. |
| `UPSTASH_REDIS_REST_TOKEN` | yes in production | **Secret.** Upstash REST token. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | yes in production | Cloudflare Turnstile site key (widget type Invisible). Public by design. |
| `TURNSTILE_SECRET_KEY` | yes in production | **Secret.** Verified server-side before any database or email work. Without it production rejects signups with 503. |
| `NEXT_PUBLIC_SITE_URL` | optional | Public site URL. |

The database is defined by the files in `supabase/migrations/`, applied in order:
`0001_waitlist.sql` creates the table, `0002_waitlist_lockdown.sql` locks it down
(row level security, no public policies, case-insensitive unique email). Apply
them in the Supabase dashboard (SQL Editor, paste, Run) or with `supabase db push`.

## Deploy

The site is a standard Next.js app and deploys to Vercel with no extra config:

1. Push the repository to GitHub and import it in Vercel (Node 20 or newer).
2. Add every variable from the table above under Project Settings, Environment
   Variables. `IP_HASH_SALT`, the Upstash pair and the Turnstile pair are all
   required in production: without them the waitlist endpoint refuses requests.
3. Apply the Supabase migrations (see above) once.
4. Deploy. After the first deploy, submit the form once to check the signup lands
   in the `waitlist` table and the welcome email arrives.

Any other Node host works with `npm ci && npm run build && npm start`.

## Security notes

- Security headers (CSP, HSTS, frame, referrer and permissions policies) are set
  in `next.config.mjs`. `script-src` allows `'unsafe-inline'` because Next.js
  emits inline bootstrap scripts; `'unsafe-eval'` is development only.
- The waitlist endpoint is same-origin only, limits body size, rate-limits per
  IP hash (5 per 10 minutes, sliding window, shared through Upstash Redis),
  validates on the server, checks a Turnstile token and a honeypot field, and
  returns only generic errors. Details go to the server log.
- A duplicate email gets the same response as a new signup, so the form never
  reveals who is already registered.
- In production the route throws at load if `IP_HASH_SALT` is missing, and
  fails closed (503) if Upstash or Turnstile is not configured. Development
  falls back to an in-memory limiter and skips the Turnstile check, with a warning.
- Production builds do not publish source maps.
