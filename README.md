# Noni Web

Marketing site + admin web app for [Noni](https://github.com/elanr9/noni).

## Stack

- Next.js (App Router)
- Tailwind CSS
- Supabase Auth + Postgres

## Local

```bash
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

## Vercel

1. Import this repo in Vercel
2. Set env vars from `.env.example`
3. Deploy
4. In Supabase Auth → URL Configuration, add:
   - Site URL: your Vercel URL
   - Redirect URLs: `https://YOUR_DOMAIN/auth/callback`
5. In Google Cloud OAuth client, add the same callback under Authorized redirect URIs if using the web OAuth flow:
   - `https://zdcmmzofnrdqbwexuqnm.supabase.co/auth/v1/callback` (already)
   - and your Vercel origin is handled via Supabase

## Routes

- `/` — landing
- `/login` — Google + email login
- `/admin` — admin dashboard (role `admin` required)
- `/privacy`, `/terms` — legal pages for Google OAuth / App Store
