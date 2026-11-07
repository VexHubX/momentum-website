# Vexhub

Vexhub is a responsive, dark-themed script library for Roblox Studio learning and development. It includes a public searchable library and a Supabase-authenticated admin dashboard for managing script records. This static site is designed for free GitHub Pages hosting.

> **Responsible use:** This library is for code intended for Roblox Studio experiences you own or have permission to develop. Do not publish or use exploit, cheat, executor, or unauthorized game-manipulation scripts. Review scripts before running them.

## Project files

- `index.html`, `styles.css`, `app.js` — public library, filters, search, and copy control.
- `admin/index.html`, `admin/admin.css`, `admin/admin.js` — authenticated content dashboard.
- `config.js` — public Supabase project URL and anon/publishable key placeholders. These are browser configuration values, not passwords or service-role secrets.
- `supabase/schema.sql` — tables, timestamp trigger, and row-level security policies.

## Supabase setup

1. Create a Supabase project on its free plan and open **SQL Editor**.
2. Run the entire `supabase/schema.sql` script from this repository.
3. Open Supabase **Authentication → Providers** and keep Email enabled. For a private admin site, disable public sign-ups after creating the administrator (or use an invitation-only workflow).
4. Create the intended admin user in **Authentication → Users** using the dashboard's invite/add-user flow. Do not put an admin password in this repository.
5. Copy that user's UUID. In Supabase SQL Editor, run the following with the actual UUID:

   ```sql
   insert into public.admin_users (user_id)
   values ('PASTE-AUTH-USER-UUID-HERE');
   ```

   Only trusted project owners should add rows to `admin_users`. The browser dashboard cannot grant admin access.
6. In Supabase **Project Settings → API** (or Connect), copy the Project URL and the public anon/publishable key. Put those values in `config.js`:

   ```js
   window.VEXHUB_CONFIG = {
     supabaseUrl: "https://YOUR-PROJECT-REF.supabase.co",
     supabaseAnonKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY"
   };
   ```

   The anon/publishable key is meant to be exposed in a browser and is safe only because RLS is enabled. **Never use or commit the service-role/secret key.**
7. Under Supabase **Authentication → URL Configuration**, add your GitHub Pages origin to allowed redirect URLs, for example `https://YOUR-USERNAME.github.io/**`. Password sign-in does not require an OAuth redirect, but correct site URLs help with auth flows.

The `admin_users` table allows an authenticated user to read only their own allowlist row. Admin writes to scripts are authorized by server-enforced RLS policies. Public visitors can read published script metadata and code only. Drafts are not visible through the public client. There is deliberately no admin-creation action in the frontend.

## Run locally

Serve the repository root with any static web server (for example, `python -m http.server 8000`) and visit `http://localhost:8000`. Configure Supabase first. Opening files directly with `file://` is not supported because browser auth and requests need an HTTP origin.

## Publish on GitHub Pages

1. Push or merge the project files onto the repository's publishing branch (usually `main`).
2. On GitHub, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select `main` and `/(root)`, then save.
4. Wait for the Pages deployment to finish. The site URL is shown in **Settings → Pages**; for this repository it is normally `https://vexhubx.github.io/momentum-website/`.
5. Configure the matching Pages URL in Supabase Auth URL settings. Keep `config.js` configured with the public URL and anon key before publishing.

### Security notes

- GitHub Pages is static hosting; it cannot protect an HTML admin page from being downloaded. Security comes from Supabase Auth plus RLS: users without an allowlist row cannot read drafts or write script rows, even if they alter the UI or call the API directly.
- Use a unique admin password, enable MFA for the Supabase owner account, and promptly revoke compromised admin users in Supabase Auth and delete their `admin_users` row.
- Do not expose service-role keys, database passwords, or admin passwords in frontend files or Git history.
- Supabase is an external dependency, and its free-plan quotas and policies can change. Google Fonts and the Supabase JS client load from public CDNs; system fonts are used if the font stylesheet is unavailable.
