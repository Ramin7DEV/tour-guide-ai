# Azerbaijan Tour Guide

A mobile app that plans a trip day by day. The traveller picks a city and dates, swipes through places, and an AI model splits the places into days, orders them by proximity and draws the route on a map.

Built as a working prototype in 2025 with React Native, Expo and Supabase. [Case study](https://raminbakhshaliyev.com/en/work/azerbaijan-tour-guide)

## How it works

```
Welcome -> City -> Dates -> Categories -> Swipe places -> Generate route -> Route on a map
```

1. The app reads cities, categories and places from Supabase (public, read-only).
2. The selected place ids and dates go to the `generate-route` Edge Function.
3. The function loads those places from the database, asks an LLM (Gemma 4 through OpenRouter, with a smaller Gemma as fallback) to group them into days, and then **does not trust the answer**: it keeps only known places, takes names and coordinates from the database, and computes travel times from the coordinates.
4. The app shows the day-by-day plan and the route.

No sign-up is needed and no personal data is sent to the model; the prompt contains only place data and dates.

## What is in this repository

| Folder | What it is |
|---|---|
| [`mobile-frontend`](mobile-frontend) | Expo app: 7 screens, English and Azerbaijani, Zustand state, React Navigation, `react-native-maps`, optional Sentry |
| [`backend/supabase`](backend/supabase) | Database schema, RLS policies, SQL helpers and the `generate-route` Edge Function (Deno) |

The sample data has two cities, Baku and Gabala, and 19 places, all of them in Baku (Gabala is listed but has no places yet). It is enough to try the whole flow, and it is not the full dataset the original app used.

## Quick start

You need a current Node.js LTS release, a free [Supabase](https://supabase.com) project, an [OpenRouter](https://openrouter.ai) API key, and the Supabase CLI.

**1. Database.** In the Supabase SQL editor run these files from `backend/supabase/database`, in this order:
`schema.sql`, `categories_schema.sql`, `rls_policies.sql`, `categories_rpc.sql`, `test_data.sql`, `categories_test_data.sql`, `route_quota.sql`.

**2. Edge Function.**

```bash
cd backend
supabase secrets set OPENROUTER_API_KEY=your_key --project-ref YOUR_PROJECT_REF
supabase functions deploy generate-route --project-ref YOUR_PROJECT_REF
```

**3. App.**

```bash
cd mobile-frontend
cp .env.example .env     # your Supabase URL and anon key
npm install
npx expo start
```

Android maps need a Google Maps SDK key in `GOOGLE_MAPS_API_KEY`. Restrict that key to your app in the Google Cloud console.

## Limits that protect your AI budget

Each route request can cost up to four model calls, so `generate-route` refuses requests beyond a quota (table and function in `route_quota.sql`):

- 5 requests per hour per client (`ROUTE_LIMIT_PER_HOUR`)
- 300 requests per day for everyone together (`ROUTE_LIMIT_PER_DAY`)

Both are optional function secrets (`supabase secrets set ROUTE_LIMIT_PER_HOUR=10`); the numbers above are the defaults.

A client is identified by a salted hash of its IP address; the address itself is never stored. If the quota cannot be checked, the request fails instead of running unchecked, and a limit that is not a positive whole number falls back to the default.

The daily cap protects your bill, not your availability: someone who spreads requests over many IPs can use up the day's allowance for everyone. Also set a monthly credit limit on your OpenRouter key.

## Known limitations

This is a prototype. Read this before you copy anything from it.

- **No user accounts.** The route endpoint is protected by the quota above, not by identity. Several people behind one IP share one hourly allowance. For production, add Supabase auth and verify the JWT in the function.
- **No automated tests.**
- **Gemma model ids** (`google/gemma-4-31b-it` and `google/gemma-4-26b-a4b-it`) are set in the function; check that they still exist on OpenRouter and change them if not.
- **Public data.** Cities, places and categories are readable by anyone with the anon key by design. Other tables have RLS enabled with no policies, so they are not reachable with that key.
- **The `user_trips` table is unused.** It is a placeholder for saving trips.
- **AI output varies.** The function validates and repairs it, but descriptions and tips can still be uneven, especially in Azerbaijani.
- **Unsplash and placeholder images** in the sample data are hot-linked.

## License

MIT, see [LICENSE](LICENSE).

## Author

Ramin Bakhshalıyev, Mobile & AI Product Builder in Baku. [raminbakhshaliyev.com](https://raminbakhshaliyev.com)
