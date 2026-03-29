# Supabase Setup Guide

One-time manual steps before the app can authenticate users.
All steps happen in the [Supabase dashboard](https://supabase.com/dashboard).

---

## 1. Create the project

1. **New project** → Name: `dsygn-cloud`
2. Region: **Frankfurt (eu-central-1)** — required for EU data residency
3. Generate a strong DB password, save it somewhere safe
4. Wait ~2 min for provisioning

---

## 2. Enable GitHub OAuth

1. Dashboard → **Authentication → Providers → GitHub → Enable**
2. Go to [github.com/settings/developers → OAuth Apps → New OAuth App](https://github.com/settings/developers)
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: copy from the Supabase GitHub provider panel (looks like `https://<project-ref>.supabase.co/auth/v1/callback`)
3. Copy **Client ID** + **Client Secret** back into Supabase → Save

---

## 3. Enable Google OAuth

1. Dashboard → **Authentication → Providers → Google → Enable**
2. Go to [console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client ID](https://console.cloud.google.com/apis/credentials)
   - Application type: **Web application**
   - Authorized redirect URI: same callback URL as above
3. Copy **Client ID** + **Client Secret** back into Supabase → Save

---

## 4. Add localhost to allowed redirect URLs

Dashboard → **Authentication → URL Configuration**
Add `http://localhost:5173` to **Redirect URLs**

---

## 5. Run the SQL schema

Dashboard → **SQL Editor → New query** → paste and run the file below:

📄 **[`docs/superpowers/sql/001_initial_schema.sql`](sql/001_initial_schema.sql)**

Expected: green checkmark, no errors.

---

## 6. Copy env vars to `.env.local`

Dashboard → **Settings → API**

```bash
cp v3/.env.example v3/.env.local
```

Fill in:
- `VITE_SUPABASE_URL` ← Project URL
- `VITE_SUPABASE_ANON_KEY` ← `anon` `public` key

---

## 7. Verify

```bash
cd v3 && npm run dev
```

Open http://localhost:5173, click **Sign in**, try GitHub OAuth.
After a successful sign-in: Dashboard → **Table Editor → `public.users`** — you should see your row with `plan = 'free'`.
