import { PROBLEMS } from './problems.js';
import { deepEqual, calibrateMachine, downloadJSON } from './utils.js';
import { fetchLeaderboard as remoteFetchLeaderboard, submitScore as remoteSubmitScore, isRemoteEnabled, login, signup, logout, getUser } from './leaderboard.js';

// ---- Application state ----
const state = {
  currentProblem: PROBLEMS[0],
  code: PROBLEMS[0].starterCode,
  myScore: 0,
  problemScores: {},
  myStatus: 'Coding...',
  isRunning: false,
  syntaxError: null,
  lintWarnings: [],
  leaderboardData: [],
  speedFactor: 1.0
  ,sortMode: localStorage.getItem('codeclash.sortMode') || 'id'
  ,generatedCases: {} // store per-problem generated/randomized test cases
  ,problemCode: {} // store user's code for each problem
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
  statusWarning: document.getElementById('status-warning'),
  usernameDisplay: document.getElementById('username-display')
  ,scoringPanel: document.getElementById('scoring-panel')
  ,tabDocs: document.getElementById('tab-docs')
  ,docsPanel: document.getElementById('docs-panel')
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
  // Save code for current problem
  if (state.currentProblem) {
    state.problemCode[state.currentProblem.id] = state.code;
  }
  updateLineNumbers();
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    // reset lint state
    state.syntaxError = null;
    state.lintWarnings = [];

    // Prefer AST parse using acorn (if available) for better diagnostics
    if (typeof window !== 'undefined' && window.acorn) {
      try {
        const ast = window.acorn.parse(state.code, { ecmaVersion: 'latest', locations: true, sourceType: 'script' });
        // detect undeclared variables (treat as errors)
        const undeclared = findUndeclaredVars(ast);
          if (undeclared.length) {
            state.syntaxError = { name: 'Undeclared Variable', message: undeclared.slice(0, 6).map(d => `${d.name} (line ${d.line})`).join(', ') + (undeclared.length > 6 ? ` +${undeclared.length - 6} more` : '') };
          } else {
            // gather a broad set of lint warnings (semicolons, unused vars, no-var, eqeqeq, no-console)
            const semiIssues = findMissingSemicolons(ast, state.code);
            const extra = findAdditionalLintIssues(ast, state.code);
            state.lintWarnings = [...semiIssues, ...extra];
          }
      } catch (err) {
        state.syntaxError = { name: err.name || 'SyntaxError', message: err.message || String(err) };
      }
    } else {
      // fallback: new Function still catches syntax errors
      try {
        new Function(state.code);
      } catch (err) {
        state.syntaxError = { name: err.name, message: err.message };
      }
    }

    updateSyntaxUI();
  }, 500);
}

// ---- Analysis helpers (AST-based) ----
function findUndeclaredVars(ast) {
  // Simple scope tracker — not full ES semantics but catches common undeclared references.
  const GLOBALS = new Set([
    'console','Math','JSON','Number','String','Boolean','Array','Object','Date','performance','localStorage','setTimeout','clearTimeout','document','window','fetch','setInterval','clearInterval','JSON','PROBLEMS','deepEqual','calibrateMachine','downloadJSON','alert','prompt','confirm'
  ]);

  const undeclared = [];
  // stack of scopes (each a Set of declared names)
  const scopeStack = [new Set()];

  // helpers
  function pushScope() { scopeStack.push(new Set()); }
  function popScope() { scopeStack.pop(); }
  function declare(name) { scopeStack[scopeStack.length - 1].add(name); }
  function isDeclared(name) {
    if (GLOBALS.has(name)) return true;
    for (let i = scopeStack.length - 1; i >= 0; --i) if (scopeStack[i].has(name)) return true;
    return false;
  }

  // collect names from binding patterns (Identifier, ObjectPattern, ArrayPattern)
  function collectPatternNames(node, res) {
    res = res || [];
    if (!node) return res;
    if (node.type === 'Identifier') res.push(node.name);
    else if (node.type === 'ObjectPattern') {
      for (const prop of node.properties || []) {
        if (prop.type === 'RestElement') collectPatternNames(prop.argument, res);
        else collectPatternNames(prop.value || prop.key, res);
      }
    } else if (node.type === 'ArrayPattern') {
      for (const el of node.elements || []) collectPatternNames(el, res);
    } else if (node.type === 'AssignmentPattern') collectPatternNames(node.left, res);
    else if (node.type === 'RestElement') collectPatternNames(node.argument, res);
    return res;
  }

  // walk AST recursively and maintain scope
  function walk(node, parent) {
    if (!node || typeof node.type !== 'string') return;

    switch (node.type) {
      case 'Program':
      case 'BlockStatement':
        if (node.type === 'BlockStatement') pushScope();
        for (const child of node.body || []) walk(child, node);
        if (node.type === 'BlockStatement') popScope();
        return;

      case 'FunctionDeclaration':
        if (node.id && node.id.name) declare(node.id.name);
        // create new scope for function body
        pushScope();
        for (const p of node.params || []) collectPatternNames(p).forEach(n => declare(n));
        walk(node.body, node);
        popScope();
        return;

      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
        pushScope();
        for (const p of node.params || []) collectPatternNames(p).forEach(n => declare(n));
        walk(node.body, node);
        popScope();
        return;

      case 'VariableDeclaration':
        for (const d of node.declarations || []) {
          const names = collectPatternNames(d.id);
          names.forEach(n => declare(n));
          // traverse initializer
          if (d.init) walk(d.init, node);
        }
        return;

      case 'ClassDeclaration':
        if (node.id && node.id.name) declare(node.id.name);
        if (node.body) walk(node.body, node);
        return;

      case 'CatchClause':
        pushScope();
        if (node.param) collectPatternNames(node.param).forEach(n => declare(n));
        walk(node.body, node);
        popScope();
        return;

      default:
        // detect identifiers that are references
        if (node.type === 'Identifier') {
          // skip declaration sites
          if (parent) {
            // variable declaration id
            if ((parent.type === 'VariableDeclarator' && parent.id === node) ||
                (parent.type === 'FunctionDeclaration' && parent.id === node) ||
                (parent.type === 'ClassDeclaration' && parent.id === node) ||
                (parent.type === 'ImportSpecifier') ||
                (parent.type === 'ImportDefaultSpecifier') ||
                (parent.type === 'ImportNamespaceSpecifier')) {
              // declaration, ignore
            } else if (parent.type === 'MemberExpression' && parent.property === node && !parent.computed) {
              // property name, not a reference
            } else if (parent.type === 'Property' && parent.key === node && !parent.computed) {
              // object literal property key
            } else {
              // treat as reference
              if (!isDeclared(node.name)) {
                undeclared.push({ name: node.name, line: node.loc && node.loc.start && node.loc.start.line });
              }
            }
          }
        }
    }

    // generic walk for any remaining child nodes
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) for (const c of child) walk(c, node);
      else if (child && typeof child.type === 'string') walk(child, node);
    }
  }

  walk(ast, null);

  // filter out duplicates & some obviously allowed names
  const uniq = [];
  const seen = new Set();
  for (const u of undeclared) {
    if (!u.name || seen.has(u.name)) continue;
    if (GLOBALS.has(u.name)) continue;
    if (/^[A-Z][A-Za-z0-9_]*$/.test(u.name)) {
      // allow capitalized names (likely constructors) — still warn, but less strict
    }
    seen.add(u.name);
    uniq.push(u);
  }

  return uniq;
}

function findMissingSemicolons(ast, source) {
  const issues = [];
  function walk(node) {
    if (!node || typeof node.type !== 'string') return;
    // check nodes where semicolon is commonly present: ExpressionStatement, VariableDeclaration, ReturnStatement
    if (node.type === 'ExpressionStatement' || node.type === 'VariableDeclaration' || node.type === 'ReturnStatement') {
      const snippet = source.slice(node.start, node.end).trimRight();
      // ignore blocks and function declarations (these aren't expected to have semicolons)
      if (snippet && !snippet.endsWith(';')) {
        // when code ends with '}' it's okay (e.g. function declaration). Only warn for single-line exprs
        if (!snippet.endsWith('}')) {
          issues.push({ message: `${node.type} may be missing a terminating semicolon`, line: node.loc && node.loc.end && node.loc.end.line });
        }
      }
    }

    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) for (const c of child) walk(c);
      else if (child && typeof child.type === 'string') walk(child);
    }
  }

  walk(ast);
  return issues;
}

// Additional ESLint-like rules implemented (non-exhaustive)
function findAdditionalLintIssues(ast, source) {
  const warnings = [];

  // maps of declared variables and usage counts
  const declared = new Map(); // name -> { kind, line }
  const refs = new Map(); // name -> count

  // small helper to collect pattern names (Identifier, ObjectPattern, ArrayPattern)
  function collectPatternNames(node, res) {
    res = res || [];
    if (!node) return res;
    if (node.type === 'Identifier') res.push(node.name);
    else if (node.type === 'ObjectPattern') {
      for (const prop of node.properties || []) {
        if (prop.type === 'RestElement') collectPatternNames(prop.argument, res);
        else collectPatternNames(prop.value || prop.key, res);
      }
    } else if (node.type === 'ArrayPattern') {
      for (const el of node.elements || []) collectPatternNames(el, res);
    } else if (node.type === 'AssignmentPattern') collectPatternNames(node.left, res);
    else if (node.type === 'RestElement') collectPatternNames(node.argument, res);
    return res;
  }

  // quick helpers
  function addRef(name) { if (!name) return; refs.set(name, (refs.get(name) || 0) + 1); }
  function addDecl(name, kind, line) { if (!name) return; declared.set(name, { kind, line }); }

  // lexer/walk utility: do a simple recursive walk similar to earlier
  function walk(node, parent) {
    if (!node || typeof node.type !== 'string') return;

    // collect declarations
    if (node.type === 'VariableDeclaration') {
      const kind = node.kind; // var/let/const
      if (kind === 'var') {
        warnings.push({ message: "Avoid 'var' — prefer 'let' or 'const'", line: node.loc && node.loc.start && node.loc.start.line });
      }
      for (const d of node.declarations || []) {
        // id can be patterns
        const names = collectPatternNames(d.id);
        for (const n of names) addDecl(n, kind, node.loc && node.loc.start && node.loc.start.line);
      }
    }

    // function params are declarations
    if ((node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') && node.params) {
      for (const p of node.params) collectPatternNames(p).forEach(n => addDecl(n, 'param', node.loc && node.loc.start && node.loc.start.line));
    }

    // detect binary eq/neq and console usage
    if (node.type === 'BinaryExpression' && (node.operator === '==' || node.operator === '!=')) {
      warnings.push({ message: `Use strict equality (=== / !==) instead of '${node.operator}'`, line: node.loc && node.loc.start && node.loc.start.line });
    }

    if (node.type === 'MemberExpression' && node.object && node.object.type === 'Identifier' && node.object.name === 'console') {
      warnings.push({ message: 'Avoid using console.* in production code', line: node.loc && node.loc.start && node.loc.start.line });
    }

    // register identifier references
    if (node.type === 'Identifier') {
      // skip declaration forms
      if (parent) {
        if ((parent.type === 'VariableDeclarator' && parent.id === node) ||
            (parent.type === 'FunctionDeclaration' && parent.id === node) ||
            (parent.type === 'ClassDeclaration' && parent.id === node) ||
            (parent.type && parent.type.startsWith('Import'))) {
          // declaration site
        } else if (parent.type === 'MemberExpression' && parent.property === node && !parent.computed) {
          // property name
        } else if (parent.type === 'Property' && parent.key === node && !parent.computed) {
          // object key
        } else {
          addRef(node.name);
        }
      }
    }

    // descend
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) for (const c of child) walk(c, node);
      else if (child && typeof child.type === 'string') walk(child, node);
    }
  }

  walk(ast, null);

  // detect unused declarations
  for (const [name, info] of declared) {
    const count = refs.get(name) || 0;
    if (count === 0 && !name.startsWith('_')) {
      warnings.push({ message: `Unused variable '${name}'`, line: info.line });
    }
  }

  // dedupe warnings by message+line
  const seen = new Set();
  const uniq = [];
  for (const w of warnings) {
    const key = `${w.message}@@${w.line || 0}`;
    if (!seen.has(key)) { seen.add(key); uniq.push(w); }
  }
  return uniq;
}

function updateSyntaxUI() {
  const hasError = Boolean(state.syntaxError);
  const hasWarnings = (state.lintWarnings && state.lintWarnings.length > 0);
  if (hasError) {
    els.statusValid.classList.add('hidden');
    if (els.statusWarning) els.statusWarning.classList.add('hidden');
    els.statusError.classList.remove('hidden');
    // show overlay styled as an error
    els.syntaxOverlay.classList.remove('hidden');
    els.syntaxOverlay.style.background = '';
    els.syntaxOverlay.style.borderColor = '';
    els.syntaxTitle.textContent = state.syntaxError.name || 'SYNTAX ERROR';
    els.syntaxMsg.textContent = state.syntaxError.message || '';
    // error visuals
    try {
      const inner = els.syntaxOverlay.querySelector('.flex.items-start.gap-3');
      const iconBox = inner?.children[0];
      const contentBox = inner?.children[1];
      if (iconBox) { iconBox.style.background = 'rgba(153, 27, 27, 0.35)'; iconBox.style.color = '#fb7185'; }
      if (contentBox) {
        contentBox.querySelector('#syntax-error-title').style.color = '#fee2e2';
        contentBox.querySelector('#syntax-error-msg').style.color = '#fff';
        contentBox.querySelector('div:nth-child(3)').style.color = 'rgba(255,200,200,0.7)';
      }
    } catch (e) {}
  } else if (hasWarnings) {
    // show lint warnings but don't block run
    els.statusValid.classList.remove('hidden');
    if (els.statusWarning) els.statusWarning.classList.remove('hidden');
    els.statusError.classList.add('hidden');
    // show overlay styled as a warning
    els.syntaxOverlay.classList.remove('hidden');
    els.syntaxOverlay.style.background = 'rgba(74, 48, 12, 0.95)';
    els.syntaxOverlay.style.borderColor = 'rgba(161,98,7,0.6)';
    els.syntaxTitle.textContent = 'LINT WARNING';
    els.syntaxMsg.textContent = state.lintWarnings.map(w => (w.line ? `line ${w.line}: ` : '') + w.message).join(' — ');
    try {
      const inner = els.syntaxOverlay.querySelector('.flex.items-start.gap-3');
      const iconBox = inner?.children[0];
      const contentBox = inner?.children[1];
      if (iconBox) { iconBox.style.background = 'rgba(161,98,7,0.18)'; iconBox.style.color = '#f6ad55'; }
      if (contentBox) {
        contentBox.querySelector('#syntax-error-title').style.color = '#f7d08a';
        contentBox.querySelector('#syntax-error-msg').style.color = '#fff7e6';
        contentBox.querySelector('div:nth-child(3)').style.color = 'rgba(255,235,179,0.7)';
      }
    } catch (e) {}
  } else {
    els.statusValid.classList.remove('hidden');
    if (els.statusWarning) els.statusWarning.classList.add('hidden');
    els.statusError.classList.add('hidden');
    els.syntaxOverlay.classList.add('hidden');
    // reset overlay style
    els.syntaxOverlay.style.background = '';
    els.syntaxOverlay.style.borderColor = '';
  }
  // make sure icons get refreshed (if any new icons or state-specific visibility changed)
  try { if (window.lucide) window.lucide.createIcons(); } catch(e) {}
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
  // If remote leaderboard is enabled, submit to database; otherwise fallback to JSON download
  if (isRemoteEnabled()) {
    const user = getUser();
    if (!user) {
      showLoginModal();
      return;
    }
    const name = user.user_metadata?.username || user.email || 'Player';
    const status = `Submitted: ${new Date().toLocaleTimeString()}`;
    remoteSubmitScore(name, state.myScore, status).then(res => {
      if (!res.ok) {
        alert('Submit failed: ' + res.error);
        return;
      }
      // refresh leaderboard after submit
      alert(res.updated ? 'Score updated!' : 'Score submitted!');
      remoteFetchLeaderboard().then(r => {
        if (r.ok) {
          state.leaderboardData = r.data;
          updateLeaderboardUI();
        }
      });
    });
    return;
  }
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
  // If remote leaderboard is enabled, refresh from database; otherwise read JSON file
  if (isRemoteEnabled()) {
    remoteFetchLeaderboard().then(r => {
      if (!r.ok) {
        alert('Refresh failed: ' + r.error);
        return;
      }
      state.leaderboardData = r.data;
      updateLeaderboardUI();
      alert('Leaderboard refreshed.');
    });
    return;
  }
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
  // Load saved code for this problem, or use starter code if none exists
  state.code = state.problemCode[problem.id] !== undefined ? state.problemCode[problem.id] : problem.starterCode;
  state.syntaxError = null;
  els.editor.value = state.code;
  updateLineNumbers();
  renderProblemList();
  els.problemTitle.textContent = problem.title;
  els.problemDesc.textContent = problem.description;
  const diffColor = problem.difficulty === 'Easy' ? 'emerald' : problem.difficulty === 'Medium' ? 'yellow' : 'red';
  els.problemDifficulty.textContent = problem.difficulty;
  els.problemDifficulty.className = `px-2 py-0.5 rounded text-xs font-semibold bg-${diffColor}-500/10 text-${diffColor}-400`;
  // Show static testCases as examples, but generate randomized cases for actual testing
  els.exampleCases.innerHTML = problem.testCases.slice(0,2).map(tc => `
    <div class="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs">
      <div class="mb-1"><span class="text-slate-500">Input:</span> <span class="text-indigo-300">${JSON.stringify(tc.input)}</span></div>
      <div><span class="text-slate-500">Output:</span> <span class="text-emerald-300">${JSON.stringify(tc.expected)}</span></div>
    </div>
  `).join('');
  // Generate randomized test cases for actual execution (regenerated on load)
  state.generatedCases[problem.id] = (problem.randomize ? problem.randomize() : problem.testCases.slice());
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

      // Regenerate test cases each run for randomization
      const testCases = state.currentProblem.randomize 
        ? state.currentProblem.randomize() 
        : (state.generatedCases[state.currentProblem.id] || state.currentProblem.testCases || []);
      
      testCases.forEach(tc => {
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
  if (els.tabDocs) {
    els.tabDocs.classList.remove('text-white', 'border-indigo-500');
    els.tabDocs.classList.add('text-slate-500', 'border-transparent');
  }
  if (els.docsPanel) els.docsPanel.classList.add('hidden');
}

function hideConsole() {
  els.consolePanel.style.height = '2.5rem';
  els.consoleHeaderCollapsed.classList.remove('hidden');
  els.consoleContent.classList.add('hidden');
  els.tabConsole.classList.remove('text-white', 'border-indigo-500');
  els.tabConsole.classList.add('text-slate-500', 'border-transparent');
  els.tabProblem.classList.add('text-white', 'border-indigo-500');
  els.tabProblem.classList.remove('text-slate-500', 'border-transparent');
  if (els.tabDocs) {
    els.tabDocs.classList.remove('text-white', 'border-indigo-500');
    els.tabDocs.classList.add('text-slate-500', 'border-transparent');
  }
  if (els.docsPanel) els.docsPanel.classList.add('hidden');
}

function openDocs() {
  // collapse console
  els.consolePanel.style.height = '2.5rem';
  els.consoleHeaderCollapsed.classList.remove('hidden');
  els.consoleContent.classList.add('hidden');
  // tab states
  els.tabProblem.classList.remove('text-white', 'border-indigo-500');
  els.tabProblem.classList.add('text-slate-500', 'border-transparent');
  els.tabConsole.classList.remove('text-white', 'border-indigo-500');
  els.tabConsole.classList.add('text-slate-500', 'border-transparent');
  if (els.tabDocs) {
    els.tabDocs.classList.add('text-white', 'border-indigo-500');
    els.tabDocs.classList.remove('text-slate-500', 'border-transparent');
  }
  if (els.docsPanel) {
    els.docsPanel.classList.remove('hidden');
    // ensure icons are refreshed if docs newly visible
    try { if (window.lucide) window.lucide.createIcons(); } catch(e){}
  }
}

function hideDocs() {
  if (els.docsPanel) els.docsPanel.classList.add('hidden');
  if (els.tabDocs) {
    els.tabDocs.classList.remove('text-white', 'border-indigo-500');
    els.tabDocs.classList.add('text-slate-500', 'border-transparent');
  }
}

function resetProblem() {
  if (!state.currentProblem) return;
  // Clear saved code and reload with starter code
  delete state.problemCode[state.currentProblem.id];
  state.code = state.currentProblem.starterCode;
  state.syntaxError = null;
  els.editor.value = state.code;
  updateLineNumbers();
  handleInput();
}

function setupListeners() {
  els.editor.addEventListener('input', handleInput);
  els.editor.addEventListener('scroll', () => els.lineNumbers.scrollTop = els.editor.scrollTop);
  
  // Handle Tab key for indentation and auto-completion for brackets, quotes, etc.
  els.editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = els.editor.selectionStart;
      const end = els.editor.selectionEnd;
      const value = els.editor.value;
      
      // Insert tab (2 spaces) at cursor position
      els.editor.value = value.substring(0, start) + '  ' + value.substring(end);
      
      // Move cursor after the inserted tab
      els.editor.selectionStart = els.editor.selectionEnd = start + 2;
      
      // Trigger input event to update state and line numbers
      handleInput();
    }
  });

  // Auto-complete brackets, quotes, parentheses
  els.editor.addEventListener('input', (e) => {
    // Only handle single character inputs
    if (e.inputType !== 'insertText' || !e.data || e.data.length !== 1) return;
    
    const pairs = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`'
    };
    
    const char = e.data;
    if (pairs[char]) {
      const start = els.editor.selectionStart;
      const value = els.editor.value;
      
      // Insert closing character
      els.editor.value = value.substring(0, start) + pairs[char] + value.substring(start);
      
      // Move cursor between the pair
      els.editor.selectionStart = els.editor.selectionEnd = start;
      
      // Trigger handleInput for state update
      handleInput();
    }
  });
  
  els.btnReset.addEventListener('click', resetProblem);
  els.btnRun.addEventListener('click', () => { if (!state.isRunning) runCode(); });
  els.btnExport.addEventListener('click', exportData);
  els.btnImport.addEventListener('click', () => els.jsonInput.click());
  els.jsonInput.addEventListener('change', importData);
  els.tabConsole.addEventListener('click', openConsole);
  els.consoleHeaderCollapsed.addEventListener('click', openConsole);
  els.tabProblem.addEventListener('click', hideConsole);
  if (els.tabDocs) els.tabDocs.addEventListener('click', openDocs);
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

// ---- Login/Auth UI ----
function showLoginModal() {
  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-slate-800 rounded-lg p-6 w-96 shadow-2xl">
      <h2 class="text-xl font-bold text-white mb-4">Login Required</h2>
      <div id="auth-tabs" class="flex gap-2 mb-4">
        <button id="tab-login" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded">Login</button>
        <button id="tab-signup" class="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded">Sign Up</button>
      </div>
      <div id="login-form">
        <input type="text" id="login-email" placeholder="Username" class="w-full px-3 py-2 bg-slate-700 text-white rounded mb-3" />
        <input type="password" id="login-password" placeholder="Password" class="w-full px-3 py-2 bg-slate-700 text-white rounded mb-3" />
        <button id="btn-login" class="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold">Login</button>
      </div>
      <div id="signup-form" class="hidden">
        <input type="text" id="signup-username" placeholder="Username" class="w-full px-3 py-2 bg-slate-700 text-white rounded mb-3" />
        <input type="password" id="signup-password" placeholder="Password (min 6 chars)" class="w-full px-3 py-2 bg-slate-700 text-white rounded mb-3" />
        <button id="btn-signup" class="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold">Sign Up</button>
      </div>
      <div id="auth-error" class="hidden mt-3 p-2 bg-red-900/50 text-red-200 text-sm rounded"></div>
      <button id="btn-close-auth" class="mt-4 text-slate-400 hover:text-white text-sm">Cancel</button>
    </div>
  `;
  document.body.appendChild(modal);

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const errorDiv = document.getElementById('auth-error');

  tabLogin.addEventListener('click', () => {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    tabLogin.classList.remove('bg-slate-700', 'text-slate-300');
    tabLogin.classList.add('bg-indigo-600', 'text-white');
    tabSignup.classList.add('bg-slate-700', 'text-slate-300');
    tabSignup.classList.remove('bg-indigo-600', 'text-white');
    errorDiv.classList.add('hidden');
  });

  tabSignup.addEventListener('click', () => {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    tabSignup.classList.remove('bg-slate-700', 'text-slate-300');
    tabSignup.classList.add('bg-indigo-600', 'text-white');
    tabLogin.classList.add('bg-slate-700', 'text-slate-300');
    tabLogin.classList.remove('bg-indigo-600', 'text-white');
    errorDiv.classList.add('hidden');
  });

  document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    if (!email || !password) {
      errorDiv.textContent = 'Please enter username and password';
      errorDiv.classList.remove('hidden');
      return;
    }
    const res = await login(email, password);
    if (!res.ok) {
      errorDiv.textContent = res.error;
      errorDiv.classList.remove('hidden');
      return;
    }
    updateUserDisplay();
    modal.remove();
  });

  document.getElementById('btn-signup').addEventListener('click', async () => {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    if (!username || !password) {
      errorDiv.textContent = 'Please enter username and password';
      errorDiv.classList.remove('hidden');
      return;
    }
    if (password.length < 6) {
      errorDiv.textContent = 'Password must be at least 6 characters';
      errorDiv.classList.remove('hidden');
      return;
    }
    const res = await signup(null, password, username);
    if (!res.ok) {
      errorDiv.textContent = res.error;
      errorDiv.classList.remove('hidden');
      return;
    }
    updateUserDisplay();
    modal.remove();
  });

  document.getElementById('btn-close-auth').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function updateUserDisplay() {
  const user = getUser();
  if (user) {
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
    els.usernameDisplay.textContent = username;
    const avatar = document.getElementById('user-avatar');
    if (avatar) avatar.textContent = username[0].toUpperCase();
  } else {
    els.usernameDisplay.textContent = 'Guest';
    const avatar = document.getElementById('user-avatar');
    if (avatar) avatar.textContent = 'G';
  }
}

// ---- Initialization ----
function init() {
  renderProblemList();
  loadProblem(PROBLEMS[0]);
  setupListeners();
  updateLeaderboardUI();
  // If remote is enabled, adjust UI and start periodic refresh
  if (isRemoteEnabled()) {
    try {
      // Check for existing session and update UI
      updateUserDisplay();
      
      // Add click handler to user avatar for login/logout
      const userAvatar = document.getElementById('user-avatar');
      if (userAvatar) {
        userAvatar.addEventListener('click', () => {
          const user = getUser();
          if (user) {
            // Show logout confirmation
            if (confirm('Do you want to logout?')) {
              logout().then(() => {
                updateUserDisplay();
                alert('Logged out successfully');
              });
            }
          } else {
            // Show login modal
            showLoginModal();
          }
        });
      }
      
      // Change button labels for clarity
      if (els.btnExport) els.btnExport.textContent = 'Submit';
      if (els.btnImport) els.btnImport.textContent = 'Refresh';
      // Import button should trigger remote refresh instead of file picker
      if (els.btnImport) {
        els.btnImport.replaceWith(els.btnImport.cloneNode(true));
        const newImportBtn = document.getElementById('btn-import');
        if (newImportBtn) newImportBtn.addEventListener('click', () => importData({ target: {} }));
      }
      // Start a periodic refresh to keep leaderboard live
      setInterval(() => {
        remoteFetchLeaderboard().then(r => {
          if (r.ok) { state.leaderboardData = r.data; updateLeaderboardUI(); }
        });
      }, 5000);
    } catch(e) {}
  }
  lucide.createIcons();
  // run initial lint/syntax check for the preloaded starter code
  handleInput();
}

init();

export default { init };
