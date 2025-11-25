# CodeClash

![CodeClash](https://img.shields.io/badge/CodeClash-static--webapp-blue?style=flat)
![Status](https://img.shields.io/badge/status-stable-green)
![License](https://img.shields.io/badge/license-CC%20BY--NC%204.0-yellow)

CodeClash is a clean, client-side coding challenge playground built using ES modules. It provides a compact, browser-based editor, visual test/console output, and scoring (correctness + efficiency).

This repository contains a modular single-page web app you can run locally or deploy to a static host (GitHub Pages, Netlify, Firebase).

---

## Live demo / local preview

Run the app locally with a simple static server (do not open index.html via file:// — ES modules require HTTP):

```powershell
cd 'C:\Users\cades\Documents\code_competition'
.\start-dev.ps1
# opens: http://localhost:8000/index.html
```

Other options:

```powershell
python -m http.server 8000
npx http-server -p 8000
```

---

## Key features

- Modular JavaScript split: `js/app.js`, `js/problems.js`, `js/utils.js`
- Tailwind-based UI for fast, readable layout (CDN)
- In-browser code editor + execution console
- Automatic test validation and time-based efficiency bonuses
- Extensible problem list — add or edit problems in `js/problems.js`

---

## Deploying (recommended: GitHub Pages)

1. Create a GitHub repo and push this project.
2. Settings → Pages → Source: select branch `main` and folder `/ (root)` → Save.
3. Visit `https://<your-username>.github.io/<repo>/` to confirm the site is live.

Netlify is an alternative — use Netlify Drop (drag & drop your project root) for a fast one-step deploy.

---

## Embedding into Google Sites

Google Sites cannot host raw HTML/JS, but it can embed external pages. To embed CodeClash:

1. Deploy the app publicly (GitHub Pages, Netlify, etc.) so it has an HTTPS URL.
2. In Google Sites choose Insert → Embed → By URL and paste your published URL.
3. Or use Insert → Embed → Embed Code and paste an iframe snippet if you prefer custom sizing:

```html
<iframe src="https://your-username.github.io/your-repo/" style="width:100%; height:700px; border:0;" loading="lazy"></iframe>
```

Notes/tips:
- The hosting service must allow framing (no X-Frame-Options: DENY or overly restrictive CSP frame-ancestors).
- Always use HTTPS for the embedded URL to avoid mixed-content issues in Google Sites.

---

## Project structure

- `index.html` — entry point, app UI
- `css/styles.css` — project styles
- `js/app.js` — app wiring + runner + UI
- `js/problems.js` — problems dataset, test cases, and thresholds
- `js/utils.js` — helper utilities

---

## Live Leaderboard (Supabase)

Replace the old JSON Load/Save with a live leaderboard backed by a free Supabase database.

Setup (one-time):

- Create a free project at https://supabase.com and note your Project URL and anon (public) API key: Settings → API.
- In SQL editor, create a table and open public policies:

```sql
create table if not exists public.scores (
	id bigint generated always as identity primary key,
	name text not null,
	score integer not null,
	status text,
	timestamp timestamptz not null default now()
);

alter table public.scores enable row level security;
create policy "Public read scores" on public.scores for select using (true);
create policy "Public insert scores" on public.scores for insert with check (true);
```

- Copy `js/leaderboard.config.example.js` to `js/leaderboard.config.js` and fill:

```js
window.LEADERBOARD_CONFIG = {
	url: 'https://YOUR_PROJECT.supabase.co',
	anonKey: 'YOUR_ANON_PUBLIC_KEY',
	table: 'scores'
};
```

Usage:

- When config is present, the Leaderboard buttons become Submit/Refresh, and the list auto-refreshes every 5 seconds.
- Data is stored in `public.scores`. No server to maintain.

Notes:

- For small events or classrooms, public insert/select is fine. For stricter control, require auth or limit inserts by IP/rate via Edge Functions.
- Rotate the anon key or tighten policies after your event if needed.

---

## Scoring (short)

- Base score for passing required test cases.
- Efficiency bonus awarded when the solution passes tests and meets time thresholds (see `js/problems.js`).

---

## Contributing

1. Fork the repo and create a branch.
2. Add or edit problems in `js/problems.js` and test locally.
3. Open a pull request describing the change and rationale.

Contributions are welcome — problems, test improvements, UI polish, and better scoring heuristics.

---

## Troubleshooting

- ES module / CORS errors: run the app over HTTP (see Quick start).
- Blank embed: verify the deployed URL is HTTPS and the host allows framing.
- Missing assets: inspect Network tab to find 404s and validate paths.

---

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).

You are free to copy, modify, and redistribute the code and assets, provided you:

- Give appropriate credit (attribution) to the original author; and
- Do not use the project or its contents for commercial purposes.

See `LICENSE` for the full license text and details: https://creativecommons.org/licenses/by-nc/4.0/

---

If you'd like I can help you deploy this repo to GitHub Pages, Netlify, or Firebase and verify the site URL and embedding in Google Sites.

Enjoy — happy coding! ✨
