# SCG Safety Performance 360 — Multi-user

Responsive HSE dashboard for SCG with Supabase authentication and role-based access.

## Roles
- **Admin**: manage user roles and all HSE records.
- **HSE**: create and update shared incidents and corrective actions.
- **Viewer**: read-only access to shared incident and action records and dashboards.

New profiles are created with the Viewer role. The first administrator must be promoted manually by the project owner in Supabase SQL Editor. This prevents users from assigning themselves elevated privileges.

## Setup

### 1. Create Supabase project
Create a project at https://supabase.com. In SQL Editor, run the complete script in `supabase/schema.sql`.

### 2. Create the first administrator
Register the first user in the app (or create them in Supabase Authentication). Find that user's UUID under Authentication → Users, then run:
```sql
update public.profiles set role = 'admin' where id = 'YOUR_AUTH_USER_UUID';
```

### 3. Configure local environment
Copy `.env.example` to `.env.local` and set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (Supabase publishable/anon key only)

### 4. Deploy with GitHub Actions
In repository Settings → Secrets and variables → Actions, add repository secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The GitHub Pages workflow injects these at build time. Never add the Supabase service-role key to Vite variables or frontend code.

### 5. Invite users
In Supabase Authentication → Users, invite each colleague by email. New profiles default to Viewer. Once they sign in, an Admin can assign HSE or Viewer roles in User Management.

## Current implemented shared records
- Authenticated sign-in and account request UI
- Server-enforced profile roles with Supabase Row Level Security
- Shared corrective/preventive actions: create, list, update status, CSV export
- Shared incident register: create and list
- Admin user-role management
- Responsive dashboard and source screenshot reference charts

## Data integrity
The July 2025 chart values shown in the overview are reference/demo values transcribed from the supplied screenshot, not a verified import of the SCG source workbook. Do not use them as official monthly performance until validated. Action and incident records are stored centrally in Supabase. Other HSE modules and metric entry/import workflows remain scheduled for subsequent development.

## Run locally
```bash
npm install
npm run dev
```
