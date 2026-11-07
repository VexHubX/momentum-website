# VEXHUB

Responsive Roblox Studio script library with a public searchable catalog and Supabase-authenticated admin dashboard. Static hosting remains compatible with GitHub Pages.

**Responsible use:** Publish code intended for Roblox Studio experiences you own or have permission to develop. Do not publish or use exploit, cheat, executor, or unauthorized game-manipulation scripts. Review scripts before running them.

## Files
- `index.html`, `styles.css`, `app.js`: public catalog, category filters, search, dates, and copy controls.
- `admin/`: Supabase email/password admin interface for creating, editing, deleting, publishing, and unpublishing scripts.
- `config.js`: browser-safe project URL and public anon/publishable key placeholders.
- `supabase/schema.sql`: scripts and admin allowlist tables, update timestamp trigger, and RLS policies.

## Supabase and admin setup
1. Create a Supabase project on its free plan. In **SQL Editor**, run the full `supabase/schema.sql` file.
2. In **Authentication → Providers**, keep Email enabled. Disable public sign-ups after admin creation (or use an invitation-only workflow).
3. Create the intended admin through **Authentication → Users** using invite/add-user. Set the password through Supabase's trusted flow; never store it in this repository.
4. Copy the admin user's UUID. In the SQL Editor, run `insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-UUID');` with that UUID. Only the trusted project owner should manage this allowlist.
5. In Supabase project API settings, copy the Project URL and the public anon/publishable key. Set them in `config.js` as `supabaseUrl` and `supabaseAnonKey`.
6. Never use a service-role/secret key in browser files. The anon key is public by design; row-level security is what protects data.
7. Under Supabase **Authentication → URL Configuration**, set the site URL to `https://vexhubx.github.io/momentum-website/` and allow that URL for redirects.
8. Sign into `https://vexhubx.github.io/momentum-website/admin/` with the authorized account.

RLS ensures anonymous visitors can select published scripts only, and allowlisted authenticated users can manage scripts. A non-admin login cannot access drafts or mutate content. GitHub Pages serves the admin HTML publicly; authorization is enforced by Supabase, not by hiding the page.

## GitHub Pages
This update is committed to the repository's existing `main` branch; no Pages settings or deployment source need to change. Check **Settings → Pages** and retain the existing publishing source. If configured for `main` and root, GitHub Pages deploys the updated site automatically. Expected URL: https://vexhubx.github.io/momentum-website/

For local testing, serve the repository via HTTP (for example `python -m http.server 8000`) and open `http://localhost:8000`; direct `file://` access is unsupported. Supabase JS and fonts use public CDNs; system font fallbacks are included. Free-plan limits and policies are governed by Supabase.
