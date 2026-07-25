# Supabase setup (ZCRM)

## 1. Create project
Create a Supabase project at https://supabase.com

## 2. Apply migrations
In **SQL Editor**, run in order:

1. `migrations/00001_initial_schema.sql`
2. `migrations/00002_seed_demo_data.sql` (optional demo data)

Or with CLI:
```bash
supabase link --project-ref YOUR_REF
supabase db push
```

## 3. Expose schema `zcrm`
Dashboard → **Project Settings → API → Exposed schemas**  
Add: `zcrm`

## 4. Auth
Enable Email provider under Authentication.  
Create a user (or use the app Sign up page).

## 5. Env
Copy `.env.example` → `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 6. Run app
```bash
npm install
npm run dev
```

Open http://localhost:3000 → Sign up / Sign in.
