# CodeClash — Modular Version

What I changed
- Extracted CSS to `css/styles.css`
- Added modular JS files in `js/`: `app.js`, `problems.js`, `utils.js`
- Created a clean entry page `index.html` which loads the app as an ES module
- Replaced the old `CodeClash.html` with a small redirect to `index.html` and kept an archive copy
 - Added 12 additional practice problems (IDs 4–15) to `js/problems.js` covering common interview-style tasks (reverse string, binary search, Kadane, group anagrams, etc.)
 - Added 12 additional practice problems (IDs 4–15) to `js/problems.js` covering common interview-style tasks (reverse string, binary search, Kadane, group anagrams, etc.)
 - Made the problem selector vertically scrollable and added hover previews so you can see a short description/points/difficulty when mousing over a problem.
 - Problem preview improved: the hover-preview now animates (fade/slide) and automatically positions itself to avoid clipping (chooses above or below and clamps to viewport). It stays visible when you move the mouse into the preview to interact.
 - Problem sorting: a compact Sort control now lets you reorder the problem list by ID, points, difficulty or title (the choice persists between sessions).

How to run
1. Open `index.html` in a browser (no server required for client-side testing).
2. The page uses ES modules — modern browsers will run the modular code.

Troubleshooting: "stuck loading" / CORS (file://) errors
----------------------------------------------------

If you opened `index.html` directly from the filesystem (file://), some browsers will block loading ES modules or other resources because of CORS/security restrictions. Common browser errors you might see are:

- "Access to script at 'file:///.../js/app.js' from origin 'null' has been blocked by CORS policy"
- "Failed to load resource: net::ERR_FAILED"

Why this happens
- Browsers require origin-aware protocols (http/https) for certain resource loads (particularly ES modules). Loading via the file:// protocol produces a 'null' origin which many browsers treat as cross-origin for module imports.

Quick fixes
- Serve the project via a local HTTP server rather than opening files directly. Choose one of these options (PowerShell shown for Windows):

	- Python 3 (quick):
		```powershell
		python -m http.server 8000
		# then open http://localhost:8000/index.html in your browser
		```

	- npx http-server (Node):
		```powershell
		npx http-server -p 8000
		# then open http://localhost:8000/index.html
		```

	- Visual Studio Code Live Server extension — right click `index.html` -> "Open with Live Server".

Developer helper script
- There's a small convenience script you can use on Windows (PowerShell) to start a Python server and open the browser: `start-dev.ps1` (if you added it). The script will now set the server working directory to the script's folder so it serves your project files even if the script is double-clicked; however it's recommended to run it from PowerShell in the project directory for best results.
	If Python isn't on PATH, use one of the node or editor options above.

Tailwind warning
----------------
You may see this message in the console: "cdn.tailwindcss.com should not be used in production...". That's a warning from Tailwind when using the CDN build — it's fine while you're developing locally. For production, follow Tailwind's documentation and install it as a PostCSS plugin or use the CLI build step to produce optimized CSS.

Notes
- I preserved all functionality while splitting logic into separate modules. The main app logic lives in `js/app.js` and imports `PROBLEMS` from `js/problems.js` and helpers from `js/utils.js`.

Scoring
-------

The app evaluates solutions in two parts:

- Base Score: Points for passing the functional test cases for a given problem (the `points` value defined per problem).
- Efficiency Bonus: When your solution passes the tests, the app runs a stress test on large inputs to estimate runtime behavior. Efficient solutions that complete the stress test within the problem's "optimal" threshold receive a significant efficiency bonus (for example, +50 pts for O(n)-like performance). Solutions that fall in the "acceptable" range may receive a smaller bonus.

The combined score for a run is the base score plus any efficiency bonus. The app normalizes timings to account for different devices, and includes a brief performance analysis when a run completes.

Dynamic scoring
---------------

Scoring details are now dynamic per-problem — the app shows the base points, plus the efficiency thresholds used to determine bonuses (for example the "optimal" and "acceptable" timing thresholds). These values come from each problem's configuration in `js/problems.js` (fields like `points` and `baseThresholds` / `timeThresholds`).

When you switch problems the UI updates automatically to display the correct base points and threshold values for that problem.
 