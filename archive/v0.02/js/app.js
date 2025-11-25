import { PROBLEMS } from './problems.js';
import { deepEqual, calibrateMachine, downloadJSON } from './utils.js';

// ---- Application state ----
const state = {
  currentProblem: PROBLEMS[0],
  code: PROBLEMS[0].starterCode,
  myScore: 0,
  problemScores: {},
  myStatus: 'Coding...',
  isRunning: false,
  syntaxError: null,
  leaderboardData: [],
  speedFactor: 1.0
  ,sortMode: localStorage.getItem('codeclash.sortMode') || 'id'
};

// ---- DOM references (collected once) ----
const els = {
  editor: document.getElementById('code-editor'),
  lineNumbers: document.getElementById('line-numbers'),
  btnRun: document.getElementById('btn-run'),
  btnRunText: document.getElementById('btn-run-text'),
  btnIcon: document.querySelector('#btn-run i'),
  btnReset: document.getElementById('btn-reset'),
  btnImport: document.getElementById('btn-import'),
  btnExport: document.getElementById('btn-export'),
  jsonInput: document.getElementById('json-input'),
  sortSelect: document.getElementById('sort-select'),
  problemList: document.getElementById('problem-list'),
  problemTitle: document.getElementById('problem-title'),
  problemDesc: document.getElementById('problem-desc'),
  problemDifficulty: document.getElementById('problem-difficulty'),
  exampleCases: document.getElementById('example-cases'),
  leaderboard: document.getElementById('leaderboard-list'),
  statusValid: document.getElementById('status-valid'),
  statusError: document.getElementById('status-error'),
  syntaxOverlay: document.getElementById('syntax-error-overlay'),
  syntaxTitle: document.getElementById('syntax-error-title'),
  syntaxMsg: document.getElementById('syntax-error-msg'),
  consolePanel: document.getElementById('console-panel'),
  consoleHeaderCollapsed: document.getElementById('console-header-collapsed'),
  consoleContent: document.getElementById('console-content'),
  consoleLogs: document.getElementById('console-logs'),
  executionTime: document.getElementById('execution-time'),
  timeVal: document.getElementById('time-val'),
  tabProblem: document.getElementById('tab-problem'),
  tabConsole: document.getElementById('tab-console'),
  consoleStatusDot: document.getElementById('console-status-dot'),
  consoleMiniStatus: document.getElementById('console-mini-status'),
  usernameDisplay: document.getElementById('username-display')
  ,scoringPanel: document.getElementById('scoring-panel')
};

// ---- Utility: update line numbers ----
function updateLineNumbers() {
  const lines = (els.editor.value || '').split('\n').length;
  els.lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => `<div>${i + 1}</div>`).join('');
}

// ---- Syntax check (debounced) ----
let debounceTimer = null;
function handleInput() {
  state.code = els.editor.value;
  updateLineNumbers();
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    try {
      new Function(state.code);
      state.syntaxError = null;
    } catch (err) {
      state.syntaxError = { name: err.name, message: err.message };
    }
    updateSyntaxUI();
  }, 500);
}

function updateSyntaxUI() {
  if (state.syntaxError) {
    els.statusValid.classList.add('hidden');
    els.statusError.classList.remove('hidden');
    els.syntaxOverlay.classList.remove('hidden');
    els.syntaxTitle.textContent = state.syntaxError.name || 'SYNTAX ERROR';
    els.syntaxMsg.textContent = state.syntaxError.message || '';
  } else {
    els.statusValid.classList.remove('hidden');
    els.statusError.classList.add('hidden');
    els.syntaxOverlay.classList.add('hidden');
  }
}

// ---- Leaderboard UI ----
function updateLeaderboardUI() {
  const displayList = [...state.leaderboardData];
  if (state.myScore >= 0) {
    displayList.push({ name: 'You (Current Session)', score: state.myScore, status: state.myStatus, isMe: true });
  }
  displayList.sort((a, b) => b.score - a.score);
  if (displayList.length === 0) {
    els.leaderboard.innerHTML = `<div class="text-slate-500 text-sm italic">No records. Play and save your score!</div>`;
    return;
  }
  els.leaderboard.innerHTML = displayList.map((p, idx) => {
    const isMe = p.isMe;
    return `
      <div class="flex items-center justify-between p-2 rounded ${isMe ? 'bg-indigo-900/50 border border-indigo-500/50' : 'bg-slate-700/30'}">
        <div class="flex items-center gap-3">
          <span class="font-mono text-sm w-4 ${idx < 3 ? 'text-yellow-400 font-bold' : 'text-slate-500'}">#${idx + 1}</span>
          <span class="text-sm ${isMe ? 'text-indigo-300 font-semibold' : 'text-slate-300'}">${p.name}</span>
        </div>
        <div class="text-right">
          <div class="text-sm font-mono text-emerald-400">${p.score} pts</div>
          <div class="text-xs text-slate-500 truncate max-w-[100px]">${p.status || '-'}</div>
        </div>
      </div>`;
  }).join('');
  lucide.createIcons();
}

// ---- Import / Export leaderboard ----
function exportData() {
  const name = prompt('Enter your name to save with your score:', 'Player 1');
  if (!name) return;
  const myRecord = { name, score: state.myScore, status: `Saved: ${new Date().toLocaleTimeString()}`, timestamp: Date.now() };
  els.usernameDisplay.textContent = name;
  const dataToSave = [...state.leaderboardData, myRecord].sort((a, b) => b.score - a.score);
  downloadJSON('codeclash_leaderboard.json', dataToSave);
  state.leaderboardData = dataToSave;
  updateLeaderboardUI();
}

function importData(ev) {
  const file = ev.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const loadedData = JSON.parse(e.target.result);
      if (Array.isArray(loadedData)) {
        state.leaderboardData = loadedData;
        updateLeaderboardUI();
        alert('Leaderboard loaded successfully!');
      } else {
        alert('Invalid JSON format: Expected an array.');
      }
    } catch (err) {
      alert('Error reading file: ' + err.message);
    }
  };
  reader.readAsText(file);
  ev.target.value = '';
}

// ---- Problem / editor UI handling ----
function renderProblemList() {
  // build sorted clone of problems based on user choice
  const sortMode = state.sortMode || 'id';
  const problemsClone = [...PROBLEMS];
  problemsClone.sort((a, b) => {
    if (sortMode === 'points') return b.points - a.points; // high -> low
    if (sortMode === 'difficulty') {
      const map = { 'Easy': 0, 'Medium': 1, 'Hard': 2 };
      return (map[a.difficulty] || 0) - (map[b.difficulty] || 0);
    }
    if (sortMode === 'title') return a.title.localeCompare(b.title);
    // default: id ascending
    return a.id - b.id;
  });

  // Render sorted set
  els.problemList.innerHTML = problemsClone.map(p => `
    <button data-prob-id="${p.id}" onclick="window.switchProblem(${p.id})" id="prob-btn-${p.id}"
      class="px-3 py-1.5 rounded-md text-xs font-medium text-left transition-colors ${state.currentProblem.id === p.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}">
      <div class="flex items-center justify-between w-full">
        <div class="truncate">${p.id}. ${p.title}</div>
        <div class="text-[10px] text-slate-400 ml-2">${p.difficulty}</div>
      </div>
    </button>
  `).join('');

  // Attach hover listeners to show a small preview tooltip for each problem
  setTimeout(() => { // ensure DOM nodes created
    const preview = document.getElementById('problem-preview');
    const previewTitle = document.getElementById('preview-title');
    const previewMeta = document.getElementById('preview-meta');
    const previewDesc = document.getElementById('preview-desc');

    // safe stateful timers to manage show/hide and avoid flicker
    let showTimer = null;
    let hideTimer = null;

    const buttons = els.problemList.querySelectorAll('button[data-prob-id]');
    buttons.forEach(btn => {
      const id = Number(btn.getAttribute('data-prob-id'));
      const prob = PROBLEMS.find(x => x.id === id);
      if (!prob) return;

      const showPreview = () => {
        if (!preview) return;

        // populate preview
        previewTitle.textContent = `${prob.title}`;
        previewMeta.innerHTML = `${prob.points} pts &nbsp;•&nbsp; <span class="text-xs font-semibold ${prob.difficulty === 'Easy' ? 'text-emerald-400' : prob.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'}">${prob.difficulty}</span>`;
        const descSnippet = (prob.description || '').slice(0, 220);
        previewDesc.textContent = descSnippet + (prob.description && prob.description.length > 220 ? '…' : '');

        // Use fixed positioning (viewport) so the preview can float without clipping
        preview.style.position = 'fixed';

        // Temporarily make measurable (don't animate yet)
        preview.style.display = 'block';
        preview.style.visibility = 'hidden';
        preview.classList.remove('preview-visible');

        // measure
        const rect = btn.getBoundingClientRect();
        const previewW = preview.offsetWidth || 300;
        const previewH = preview.offsetHeight || 120;

        const margin = 8;
        // Prefer below placement if it fits, otherwise try above
        const fitsBelow = (window.innerHeight - rect.bottom) >= (previewH + margin);
        const fitsAbove = rect.top >= (previewH + margin);
        let placement = 'bottom';
        let top = rect.bottom + margin;
        if (!fitsBelow && fitsAbove) {
          placement = 'top';
          top = rect.top - previewH - margin;
        } else if (!fitsBelow && !fitsAbove) {
          // neither fits entirely; clamp to viewport bottom
          placement = 'bottom';
          top = Math.min(window.innerHeight - previewH - margin, rect.bottom + margin);
        }

        // horizontal centering near the hovered button
        let left = Math.round(rect.left + rect.width / 2 - previewW / 2);
        // clamp horizontally to viewport
        left = Math.max(margin, Math.min(left, window.innerWidth - previewW - margin));

        preview.style.left = `${left}px`;
        preview.style.top = `${top}px`;
        preview.setAttribute('data-placement', placement === 'top' ? 'top' : 'bottom');

        // show with animation after placement is set
        preview.style.visibility = 'visible';
        // tiny delay to allow paint then animate
        requestAnimationFrame(() => requestAnimationFrame(() => preview.classList.add('preview-visible')));
      };

      const hidePreview = () => {
        if (!preview) return;
        preview.classList.remove('preview-visible');
        // after transition ends, hide display to reclaim layout
        setTimeout(() => { preview.style.display = 'none'; }, 220);
      };

      btn.addEventListener('mouseenter', (ev) => {
        // clear a pending hide and schedule show
        clearTimeout(hideTimer);
        clearTimeout(showTimer);
        showTimer = setTimeout(showPreview, 100);
      });

      btn.addEventListener('mouseleave', () => {
        clearTimeout(showTimer);
        // schedule hide so users can move into the preview without flicker
        hideTimer = setTimeout(hidePreview, 180);
      });

      // hide preview when clicking or switching problem
      btn.addEventListener('click', () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        hidePreview();
      });
    });

    // Keep preview open while hovering over it
    if (preview) {
      // Make sure preview listens only once
      if (!preview.dataset._initialized) {
        preview.addEventListener('mouseenter', () => { clearTimeout(hideTimer); });
        preview.addEventListener('mouseleave', () => { hideTimer = setTimeout(() => {
          preview.classList.remove('preview-visible');
          setTimeout(() => { preview.style.display = 'none'; }, 220);
        }, 180); });
        preview.dataset._initialized = '1';
      }
    }

    // hide preview if mouse leaves the whole list area (fallback)
    els.problemList.addEventListener('mouseleave', () => {
      const preview = document.getElementById('problem-preview');
      if (preview) {
        clearTimeout(showTimer);
        hideTimer = setTimeout(() => { preview.classList.remove('preview-visible'); setTimeout(() => preview.style.display = 'none', 200); }, 150);
      }
    });
  }, 0);
}

window.switchProblem = (id) => {
  const prob = PROBLEMS.find(p => p.id === id);
  if (prob) loadProblem(prob);
};

function loadProblem(problem) {
  state.currentProblem = problem;
  state.code = problem.starterCode;
  state.syntaxError = null;
  els.editor.value = state.code;
  updateLineNumbers();
  renderProblemList();
  els.problemTitle.textContent = problem.title;
  els.problemDesc.textContent = problem.description;
  const diffColor = problem.difficulty === 'Easy' ? 'emerald' : problem.difficulty === 'Medium' ? 'yellow' : 'red';
  els.problemDifficulty.textContent = problem.difficulty;
  els.problemDifficulty.className = `px-2 py-0.5 rounded text-xs font-semibold bg-${diffColor}-500/10 text-${diffColor}-400`;
  els.exampleCases.innerHTML = problem.testCases.slice(0,2).map(tc => `
    <div class="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs">
      <div class="mb-1"><span class="text-slate-500">Input:</span> <span class="text-indigo-300">${JSON.stringify(tc.input)}</span></div>
      <div><span class="text-slate-500">Output:</span> <span class="text-emerald-300">${JSON.stringify(tc.expected)}</span></div>
    </div>
  `).join('');
  els.consoleLogs.innerHTML = `<div class="text-slate-600 italic">Run your code to see results...</div>`;
  updateSyntaxUI();
  // Update the dynamic scoring panel for the newly loaded problem
  renderScoringPanel();
}

// ---- Scoring UI (dynamic per-problem) ----
function renderScoringPanel() {
  const panel = els.scoringPanel;
  if (!panel) return;
  const p = state.currentProblem || {};
  const base = p.points ?? 0;
  // support older/variant naming
  const thresholds = p.baseThresholds || p.timeThresholds || { optimal: null, acceptable: null };

  // Efficiency bonus rules (kept in sync with runCode bonuses)
  const optimalBonus = 50;
  const acceptableBonus = 20;

  const optimalStr = thresholds.optimal != null ? `${thresholds.optimal}ms or less` : 'N/A';
  const acceptableStr = thresholds.acceptable != null ? `${thresholds.acceptable}ms or less` : 'N/A';

  // stress test hint
  let stressHint = 'This problem has a stress test used to estimate runtime behavior.';
  if (!p.stressTest) stressHint = 'No stress test available for this problem — only functional tests are used.';

  panel.innerHTML = `
    <div class="mb-6 bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
      <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <i data-lucide="award" class="w-4 h-4 text-indigo-400"></i>
        Efficiency Scoring
      </h3>
      <div class="grid grid-cols-2 gap-4 text-center mb-4">
        <div class="bg-slate-800/50 rounded p-2 border border-slate-700">
          <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">Base Score</div>
          <div class="text-sm text-white">${base} pts — awarded for passing tests</div>
        </div>
        <div class="bg-slate-800/50 rounded p-2 border border-emerald-500/20 bg-emerald-900/10">
          <div class="text-[10px] text-emerald-400 font-bold uppercase mb-1">Efficiency Bonus</div>
          <div class="text-sm text-white">+${optimalBonus} pts if normalized time ≤ ${optimalStr}<br>+${acceptableBonus} pts if normalized time ≤ ${acceptableStr}</div>
        </div>
      </div>
      <p class="text-[11px] text-slate-500 leading-relaxed text-center mb-2">${stressHint}</p>
      <div class="text-[10px] text-slate-400 text-center">Timings are normalized for machine speed before evaluating thresholds.</div>
    </div>`;
  lucide.createIcons();
}

// ---- Execution & scoring logic ----
async function runCode() {
  if (state.syntaxError) {
    openConsole();
    els.consoleLogs.innerHTML = `<div class="p-3 rounded border bg-red-950/30 border-red-900/50 text-red-300 font-mono text-xs">Cannot run code with syntax errors.</div>`;
    return;
  }

  state.isRunning = true;
  updateRunButton();
  openConsole();
  els.consoleLogs.innerHTML = '';
  els.executionTime.classList.add('hidden');

  const calibration = calibrateMachine();
  state.speedFactor = calibration.factor;

  state.myStatus = 'Running Tests...';
  updateLeaderboardUI();

  setTimeout(() => {
    try {
      const userFunc = new Function(`return ${state.code}`)();
      const logs = [];
      let allPassed = true;

      // functional tests
      state.currentProblem.testCases.forEach(tc => {
        try {
          const inClone = JSON.parse(JSON.stringify(tc.input));
          const result = userFunc(...inClone);
          const passed = deepEqual(result, tc.expected);
          if (!passed) allPassed = false;
          logs.push({ passed, input: JSON.stringify(tc.input), expected: JSON.stringify(tc.expected), actual: JSON.stringify(result) });
        } catch (err) {
          allPassed = false;
          logs.push({ passed: false, error: err.message, input: JSON.stringify(tc.input) });
        }
      });

      // stress test and scoring
      let efficiencyBonus = 0, timeComplexityLabel = 'N/A', execTime = 0, normalizedTime = 0;
      if (allPassed && state.currentProblem.stressTest) {
        const stressData = state.currentProblem.stressTest();
        const start = performance.now();
        if (stressData.isBatch) {
          const batchInput = stressData.input;
          for (let i = 0; i < stressData.batchSize; i++) userFunc(...batchInput);
        } else {
          userFunc(...stressData.input);
        }
        const end = performance.now();
        execTime = end - start;
        normalizedTime = execTime / state.speedFactor;
        const t = state.currentProblem.baseThresholds;
        if (normalizedTime <= t.optimal) { efficiencyBonus = 50; timeComplexityLabel = 'Excellent (Likely O(n) or better)'; }
        else if (normalizedTime <= t.acceptable) { efficiencyBonus = 20; timeComplexityLabel = 'Good (Likely O(n log n))'; }
        else { efficiencyBonus = 0; timeComplexityLabel = 'Inefficient (Likely O(n²) or worse)'; }
      }

      const runScore = state.currentProblem.points + efficiencyBonus;
      const problemId = state.currentProblem.id;
      const previousBest = state.problemScores[problemId] || 0;
      let isNewBest = false;

      if (allPassed) {
        if (runScore > previousBest) {
          state.problemScores[problemId] = runScore; isNewBest = true;
          state.myScore = Object.values(state.problemScores).reduce((a,b) => a + b, 0);
          state.myStatus = `New Best! (${runScore}pts)`;
        } else {
          state.myStatus = `Passed (Best: ${previousBest}pts)`;
        }
        els.consoleStatusDot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block';
        els.consoleMiniStatus.textContent = 'Console Output (Passed)';
      } else {
        state.myStatus = 'Failed Tests';
        els.consoleStatusDot.className = 'w-1.5 h-1.5 rounded-full bg-red-500 inline-block';
        els.consoleMiniStatus.textContent = 'Console Output (Failed)';
      }

      renderLogs(logs, allPassed, efficiencyBonus, timeComplexityLabel, execTime, normalizedTime, isNewBest, previousBest);
      els.executionTime.classList.remove('hidden');
      els.timeVal.textContent = `${execTime.toFixed(2)}ms`;

    } catch (err) {
      els.consoleLogs.innerHTML = `<div class="p-3 rounded border bg-red-950/30 border-red-900/50 text-red-300 font-mono text-xs">Runtime Error: ${err.message}</div>`;
      state.myStatus = 'Runtime Error';
    }

    state.isRunning = false;
    updateRunButton();
    updateLeaderboardUI();
  }, 500);
}

function renderLogs(logs, allPassed, bonus, complexity, rawTime, normTime, isNewBest, previousBest) {
  let html = logs.map(log => `
    <div class="p-3 rounded border ${log.passed ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-red-950/30 border-red-900/50'}">
      <div class="flex items-center gap-2 mb-2">
        <i data-lucide="${log.passed ? 'check-circle' : 'x-circle'}" class="w-4 h-4 ${log.passed ? 'text-emerald-500' : 'text-red-500'}"></i>
        <span class="${log.passed ? 'text-emerald-400' : 'text-red-400'} font-bold">${log.passed ? 'Test Passed' : 'Test Failed'}</span>
      </div>
      ${log.error ? `<div class="text-red-300 ml-6">${log.error}</div>` : `
        <div class="grid grid-cols-[60px_1fr] gap-y-1 ml-6">
          <span class="text-slate-500">Input:</span>
          <span class="text-slate-300">${log.input}</span>
          ${!log.passed ? `
            <span class="text-slate-500">Expected:</span>
            <span class="text-slate-300">${log.expected}</span>
            <span class="text-slate-500">Actual:</span>
            <span class="text-red-300">${log.actual}</span>
          ` : ''}
        </div>`}
    </div>
  `).join('');

  if (allPassed) {
    const totalRunScore = state.currentProblem.points + bonus;
    const scoreMessage = isNewBest ? `<span class="text-emerald-400 font-bold">New Best Score!</span>` : `<span class="text-slate-400">Previous Best: ${previousBest} pts</span>`;
    const speedInfo = `Computer Speed Factor: ${state.speedFactor.toFixed(2)}x (Raw: ${rawTime.toFixed(2)}ms ➔ Norm: ${normTime.toFixed(2)}ms)`;
    html += `
      <div class="mt-4 p-4 bg-slate-900 rounded border border-indigo-500/30">
        <div class="flex items-center gap-2 mb-2">
          <i data-lucide="zap" class="w-4 h-4 text-yellow-400"></i>
          <span class="font-bold text-white">Performance Analysis</span>
        </div>
        <div class="grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <div class="text-slate-500">Stress Test Time</div>
            <div class="text-slate-300" title="${speedInfo}">${normTime.toFixed(2)}ms <span class="text-slate-600">(normalized)</span></div>
          </div>
          <div>
            <div class="text-slate-500">Est. Complexity</div>
            <div class="${bonus === 50 ? 'text-emerald-400' : bonus === 20 ? 'text-yellow-400' : 'text-red-400'}">${complexity}</div>
          </div>
        </div>
      </div>

      <div class="mt-4 p-4 bg-gradient-to-r from-emerald-900/20 to-indigo-900/20 rounded border border-emerald-500/30 text-center">
        <h4 class="text-emerald-400 font-bold text-lg mb-1">🎉 Challenge Completed!</h4>
        <p class="text-slate-400 text-sm mb-2">Base: ${state.currentProblem.points} + Efficiency: <span class="text-yellow-400 font-bold">+${bonus}</span></p>
        <div class="bg-slate-900/50 rounded p-2 inline-block border border-slate-700/50">
          <div class="text-white font-bold text-xl">${totalRunScore} pts</div>
          <div class="text-xs mt-1">${scoreMessage}</div>
        </div>
      </div>
    `;
  }

  els.consoleLogs.innerHTML = html;
  lucide.createIcons();
}

function updateRunButton() {
  if (state.isRunning) {
    els.btnRun.classList.add('opacity-50', 'cursor-not-allowed');
    els.btnRunText.textContent = 'Running...';
    els.btnIcon.setAttribute('data-lucide', 'refresh-cw');
    els.btnIcon.classList.add('animate-spin');
  } else {
    els.btnRun.classList.remove('opacity-50', 'cursor-not-allowed');
    els.btnRunText.textContent = 'Run Code';
    els.btnIcon.setAttribute('data-lucide', 'play');
    els.btnIcon.classList.remove('animate-spin');
  }
  lucide.createIcons();
}

// ---- UI toggles / listeners ----
function openConsole() {
  els.consolePanel.style.height = '16rem';
  els.consoleHeaderCollapsed.classList.add('hidden');
  els.consoleContent.classList.remove('hidden');
  els.tabConsole.classList.add('text-white', 'border-indigo-500');
  els.tabConsole.classList.remove('text-slate-500', 'border-transparent');
  els.tabProblem.classList.remove('text-white', 'border-indigo-500');
  els.tabProblem.classList.add('text-slate-500', 'border-transparent');
}

function hideConsole() {
  els.consolePanel.style.height = '2.5rem';
  els.consoleHeaderCollapsed.classList.remove('hidden');
  els.consoleContent.classList.add('hidden');
  els.tabConsole.classList.remove('text-white', 'border-indigo-500');
  els.tabConsole.classList.add('text-slate-500', 'border-transparent');
  els.tabProblem.classList.add('text-white', 'border-indigo-500');
  els.tabProblem.classList.remove('text-slate-500', 'border-transparent');
}

function setupListeners() {
  els.editor.addEventListener('input', handleInput);
  els.editor.addEventListener('scroll', () => els.lineNumbers.scrollTop = els.editor.scrollTop);
  els.btnReset.addEventListener('click', () => loadProblem(state.currentProblem));
  els.btnRun.addEventListener('click', () => { if (!state.isRunning) runCode(); });
  els.btnExport.addEventListener('click', exportData);
  els.btnImport.addEventListener('click', () => els.jsonInput.click());
  els.jsonInput.addEventListener('change', importData);
  els.tabConsole.addEventListener('click', openConsole);
  els.consoleHeaderCollapsed.addEventListener('click', openConsole);
  els.tabProblem.addEventListener('click', hideConsole);
  // sort selector
  if (els.sortSelect) {
    // initialize select to current saved mode
    els.sortSelect.value = state.sortMode || 'id';
    els.sortSelect.addEventListener('change', (ev) => {
      state.sortMode = ev.target.value;
      try { localStorage.setItem('codeclash.sortMode', state.sortMode); } catch(e){}
      renderProblemList();
    });
  }
  window.openConsole = openConsole; // expose for dev/debugger
}

// ---- Initialization ----
function init() {
  renderProblemList();
  loadProblem(PROBLEMS[0]);
  setupListeners();
  updateLeaderboardUI();
  lucide.createIcons();
}

init();

export default { init };
