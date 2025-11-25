# CodeClash

![CodeClash](https://img.shields.io/badge/CodeClash-static--webapp-blue?style=flat)
![Status](https://img.shields.io/badge/status-stable-green)

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

This project is provided for learning / demo use. Add a `LICENSE` file to specify a license if you want to change this.

---

If you'd like I can help you deploy this repo to GitHub Pages, Netlify, or Firebase and verify the site URL and embedding in Google Sites.

Enjoy — happy coding! ✨
