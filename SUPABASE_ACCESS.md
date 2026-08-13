# Supabase access for the Noni project (READ THIS BEFORE SAYING YOU HAVE NO ACCESS)

You have full admin access to the live Noni Supabase project. Never ask the user for credentials and never say you cannot reach the database.

## Project

- Project ref: `zdcmmzofnrdqbwexuqnm`
- URL: `https://zdcmmzofnrdqbwexuqnm.supabase.co`
- This is NOT one of the projects visible in `supabase projects list` (that CLI login is for a different account). Do not use the CLI to reach it.

## Credentials on this machine

- Management API access token: `SUPABASE_ACCESS_TOKEN` in `~/noni/.env.local` (the mobile repo, same Supabase project). The raw token is intentionally not pasted here so it never lands in git.
- Service role key and anon key: `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in this repo's `.env.local`.

## How to run SQL (DDL or queries) against the live database

Use the Management API query endpoint. IMPORTANT: Cloudflare blocks default curl and python user agents with a 403 "error code: 1010", so always send a normal User-Agent such as `supabase-cli/2.75.0`.

```bash
export SUPABASE_ACCESS_TOKEN=$(rg -o 'SUPABASE_ACCESS_TOKEN=(.*)' -r '$1' ~/noni/.env.local | tr -d '"' | head -1)
curl -s -X POST "https://api.supabase.com/v1/projects/zdcmmzofnrdqbwexuqnm/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "User-Agent: supabase-cli/2.75.0" \
  -d '{"query":"select 1"}'
```

## How to manage storage buckets

Use the Storage API with the service role key from this repo's `.env.local`:

```bash
set -a; source .env.local; set +a
curl -s "$NEXT_PUBLIC_SUPABASE_URL/storage/v1/bucket" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -H "apikey: $SUPABASE_SERVICE_ROLE_KEY"
```

## Migration hygiene

Files in `supabase/migrations/` are NOT automatically applied to the live project. After writing a migration, apply it yourself through the Management API query endpoint above, then verify with a select against `information_schema.tables` or `pg_policies`.
