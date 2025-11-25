// JavaScript Quick Reference Documentation Panel
// Beginner-friendly guide with clear examples and explanations

const JS_DOC_SECTIONS = [
  {
    id: 'bigo',
    icon: 'activity',
    title: 'Big O Notation & Efficiency',
    blurb: 'Big O notation describes how the running time or space grows as the input size increases. It helps you compare algorithms and spot slow code. Lower is better! Common classes: O(1) (constant), O(log n) (logarithmic), O(n) (linear), O(n^2) (quadratic).',
    concepts: [
      { name: 'What is Big O?', code: 'O(1): Fastest, does not grow with input size\nO(n): Grows linearly with input\nO(n^2): Grows much faster (nested loops)', link: 'https://developer.mozilla.org/en-US/docs/Glossary/Big_O_notation' },
      { name: 'Example: Linear vs Quadratic', code: '// Linear: O(n)\nfor (let i = 0; i < n; i++) { ... }\n// Quadratic: O(n^2)\nfor (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j++) { ... }\n}', link: 'https://www.bigocheatsheet.com/' },
      { name: 'How to Improve Efficiency', code: '- Avoid unnecessary nested loops\n- Use objects/maps for fast lookups (O(1))\n- Sort data if it helps you search faster\n- Break early from loops if you found the answer\n- Use built-in methods (like .map, .filter) which are optimized', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Keyed_collections' },
      { name: 'Example: Using a Set for Fast Lookup', code: 'const arr = [1,2,3,4,5];\nconst set = new Set(arr);\nset.has(3);  // O(1) lookup, very fast', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set' },
      { name: 'Example: Breaking Early', code: 'for (let i = 0; i < arr.length; i++) {\n  if (arr[i] === target) {\n    // found it!\n    break;\n  }\n}', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/break' },
    ]
  },
  {
    id: 'variables',
    icon: 'square-pen',
    title: '1. Variables & Data Types',
    blurb: 'Variables store data. Think of them as labeled boxes that hold values. Use const for values that don\'t change, let for values that do.',
    concepts: [
      { name: 'Numbers', code: 'const age = 25;  // whole number\nconst price = 9.99;  // decimal', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types' },
      { name: 'Strings (Text)', code: 'const name = "Alice";  // double quotes\nconst city = \'Boston\';  // single quotes work too', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String' },
      { name: 'Booleans', code: 'const isActive = true;  // only true or false\nconst isDone = false;', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean' },
      { name: 'const vs let vs var', code: 'const pi = 3.14;  // cannot change later\nlet score = 0;  // can change\nvar oldWay = "x";  // old style (avoid using)', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const' },
      { name: 'Why avoid var?', code: 'var x = 1;\nif (true) {\n  var x = 2;  // same x! (function scope)\n}\nconsole.log(x);  // 2 (confusing!)\n// Use let/const instead (block scope)', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var' },
      { name: 'Checking Types', code: 'typeof 42  // "number"\ntypeof "hi"  // "string"\ntypeof true  // "boolean"', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof' },
    ]
  },
  {
    id: 'arrays',
    icon: 'list',
    title: '2. Arrays (Lists)',
    blurb: 'Arrays store multiple values in order. Like a numbered list starting at 0. Perfect for collections of items.',
    concepts: [
      { name: 'Creating Arrays', code: 'const fruits = ["apple", "banana", "orange"];\nconst nums = [1, 2, 3, 4, 5];\nconst empty = [];', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array' },
      { name: 'Accessing Items', code: 'const fruits = ["apple", "banana"];\nfruits[0]  // "apple" (first item)\nfruits[1]  // "banana" (second item)', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array' },
      { name: 'Array Length', code: 'const nums = [10, 20, 30];\nnums.length  // 3 (how many items)', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/length' },
      { name: 'Adding to End', code: 'const nums = [1, 2];\nnums.push(3);  // now [1, 2, 3]\nnums.push(4);  // now [1, 2, 3, 4]', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push' },
      { name: 'Removing from End', code: 'const nums = [1, 2, 3];\nconst last = nums.pop();  // removes 3\n// nums is now [1, 2]', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop' },
      { name: 'Adding to Start', code: 'const nums = [2, 3];\nnums.unshift(1);  // now [1, 2, 3]', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift' },
      { name: 'Copying Arrays', code: 'const original = [1, 2, 3];\nconst copy = [...original];  // separate copy\ncopy[0] = 99;  // original stays [1,2,3]', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax' },
    ]
  },
  {
    id: 'conditionals',
    icon: 'shuffle',
    title: '3. Making Decisions (if/else)',
    blurb: 'Make your code choose different paths based on conditions. Like a choose-your-own-adventure story.',
    concepts: [
      { name: 'Basic if', code: 'const age = 18;\nif (age >= 18) {\n  console.log("Adult");\n}', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else' },
      { name: 'if...else', code: 'const score = 85;\nif (score >= 90) {\n  console.log("A");\n} else {\n  console.log("B or lower");\n}', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else' },
      { name: 'Multiple Conditions', code: 'const temp = 75;\nif (temp > 80) {\n  console.log("Hot");\n} else if (temp > 60) {\n  console.log("Nice");\n} else {\n  console.log("Cold");\n}', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else' },
      { name: 'Comparisons', code: '5 === 5  // true (equal)\n5 !== 3  // true (not equal)\n5 > 3   // true (greater than)\n5 < 10  // true (less than)', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators' },
      { name: 'And / Or', code: 'const age = 25, hasID = true;\nif (age >= 21 && hasID) {  // both must be true\n  console.log("Can enter");\n}\nif (age < 13 || age > 65) {  // one is enough\n  console.log("Discount");\n}', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND' },
    ]
  },
  {
    id: 'loops',
    icon: 'repeat',
    title: '4. Loops (Repeating Actions)',
    blurb: 'Repeat code multiple times without copy-pasting. Perfect for processing lists or counting.',
    concepts: [
      { name: 'for Loop (Counting)', code: '// Print numbers 0 to 4\nfor (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n// Output: 0, 1, 2, 3, 4', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for' },
      { name: 'for...of (Arrays)', code: 'const fruits = ["apple", "banana", "orange"];\nfor (const fruit of fruits) {\n  console.log(fruit);  // each fruit\n}', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of' },
      { name: 'while Loop', code: 'let count = 0;\nwhile (count < 3) {\n  console.log(count);\n  count++;  // don\'t forget to increase!\n}', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while' },
      { name: 'Break Early', code: '// Stop when we find 5\nfor (let i = 0; i < 10; i++) {\n  if (i === 5) break;  // exit loop\n  console.log(i);\n}', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/break' },
    ]
  },
  {
    id: 'functions',
    icon: 'function-square',
    title: '5. Functions (Reusable Code)',
    blurb: 'Functions are like recipes - define once, use many times. They take inputs and give back outputs.',
    concepts: [
      { name: 'Basic Function', code: 'function greet(name) {\n  return "Hello " + name;\n}\nconst msg = greet("Alice");  // "Hello Alice"', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions' },
      { name: 'Arrow Functions', code: '// Shorter syntax (same thing)\nconst add = (a, b) => {\n  return a + b;\n};\nadd(5, 3)  // 8', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions' },
      { name: 'Super Short', code: '// If just returning, even shorter!\nconst double = (n) => n * 2;\ndouble(5)  // 10', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions' },
      { name: 'Multiple Params', code: 'const fullName = (first, last) => {\n  return first + " " + last;\n};\nfullName("John", "Doe")  // "John Doe"', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions' },
      { name: 'No Return = undefined', code: 'function sayHi() {\n  console.log("Hi!");\n  // no return statement\n}\nconst result = sayHi();  // undefined', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return' },
    ]
  },
  {
    id: 'array-methods',
    icon: 'search',
    title: '6. Array Methods (Transform & Filter)',
    blurb: 'Powerful built-in tools to transform, filter, and search arrays without writing loops.',
    concepts: [
      { name: 'map (Transform)', code: '// Double every number\nconst nums = [1, 2, 3];\nconst doubled = nums.map(n => n * 2);\n// [2, 4, 6]', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map' },
      { name: 'filter (Keep Some)', code: '// Keep only even numbers\nconst nums = [1, 2, 3, 4, 5];\nconst evens = nums.filter(n => n % 2 === 0);\n// [2, 4]', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter' },
      { name: 'find (First Match)', code: '// Find first number > 10\nconst nums = [5, 12, 8, 19];\nconst result = nums.find(n => n > 10);\n// 12', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find' },
      { name: 'includes (Check)', code: 'const fruits = ["apple", "banana"];\nfruits.includes("apple")  // true\nfruits.includes("orange")  // false', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes' },
      { name: 'reduce (Combine)', code: '// Add all numbers together\nconst nums = [1, 2, 3, 4];\nconst sum = nums.reduce((total, n) => total + n, 0);\n// 10', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce' },
      { name: 'sort (Order)', code: '// Sort numbers smallest to largest\nconst nums = [3, 1, 4, 2];\nnums.sort((a, b) => a - b);\n// [1, 2, 3, 4]', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort' },
    ]
  },
  {
    id: 'objects',
    icon: 'box',
    title: '7. Objects (Grouped Data)',
    blurb: 'Objects group related data together using keys and values. Like a contact card with name, phone, email.',
    concepts: [
      { name: 'Creating Objects', code: 'const person = {\n  name: "Alice",\n  age: 25,\n  city: "Boston"\n};', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer' },
      { name: 'Accessing Values', code: 'const person = {name: "Bob", age: 30};\nperson.name  // "Bob"\nperson.age   // 30', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors' },
      { name: 'Adding/Changing', code: 'const person = {name: "Alice"};\nperson.age = 25;  // add new\nperson.name = "Alicia";  // change existing', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors' },
      { name: 'Getting All Keys', code: 'const person = {name: "Bob", age: 30};\nObject.keys(person);\n// ["name", "age"]', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys' },
      { name: 'Getting All Values', code: 'const person = {name: "Bob", age: 30};\nObject.values(person);\n// ["Bob", 30]', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values' },
    ]
  },
  {
    id: 'strings',
    icon: 'quote',
    title: '8. Working with Text (Strings)',
    blurb: 'Strings are text. JavaScript has many helpful methods to slice, search, and transform text.',
    concepts: [
      { name: 'Template Strings', code: 'const name = "Alice";\nconst age = 25;\nconst msg = `Hi, I\'m ${name} and I\'m ${age}`;\n// "Hi, I\'m Alice and I\'m 25"', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals' },
      { name: 'Joining Strings', code: 'const first = "Hello";\nconst last = "World";\nconst full = first + " " + last;\n// "Hello World"', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String' },
      { name: 'Length', code: 'const word = "hello";\nword.length  // 5', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length' },
      { name: 'Uppercase/Lowercase', code: 'const word = "Hello";\nword.toUpperCase()  // "HELLO"\nword.toLowerCase()  // "hello"', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase' },
      { name: 'Check Contains', code: 'const text = "Hello World";\ntext.includes("World")  // true\ntext.includes("xyz")    // false', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes' },
      { name: 'Split into Array', code: 'const csv = "apple,banana,orange";\nconst fruits = csv.split(",");\n// ["apple", "banana", "orange"]', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split' },
    ]
  },
  {
    id: 'math',
    icon: 'calculator',
    title: '9. Math Operations',
    blurb: 'JavaScript has built-in math functions for common calculations. Math.round, Math.max, and more.',
    concepts: [
      { name: 'Basic Math', code: '5 + 3   // 8 (addition)\n10 - 4  // 6 (subtraction)\n6 * 7   // 42 (multiplication)\n20 / 4  // 5 (division)', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators' },
      { name: 'Remainder', code: '10 % 3  // 1 (what\'s left over)\n7 % 2   // 1\n8 % 2   // 0 (even numbers = 0)', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder' },
      { name: 'Rounding', code: 'Math.round(4.7)  // 5 (nearest)\nMath.floor(4.7)  // 4 (down)\nMath.ceil(4.2)   // 5 (up)', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round' },
      { name: 'Min / Max', code: 'Math.min(5, 2, 9, 1)  // 1 (smallest)\nMath.max(5, 2, 9, 1)  // 9 (largest)', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max' },
      { name: 'Power', code: 'Math.pow(2, 3)  // 8 (2³ = 2×2×2)\n2 ** 3          // 8 (same thing)', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/pow' },
      { name: 'Random', code: 'Math.random()  // 0 to 1 (like 0.847)\nMath.floor(Math.random() * 10)  // 0-9', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random' },
    ]
  }
];
function renderDocs() {
  const host = document.getElementById('docs-panel');
  if (!host) return;

  host.innerHTML = `
    <div class="p-6">
      <div class="mb-6 flex items-center gap-3">
        <i data-lucide="book-open" class="w-6 h-6 text-indigo-400"></i>
        <h2 class="text-2xl font-bold text-white">JavaScript Basics Guide</h2>
      </div>
      <p class="text-slate-300 text-sm leading-relaxed mb-2">
        Learn JavaScript fundamentals with clear examples. Click any section to expand it.
      </p>
      <p class="text-slate-400 text-xs leading-relaxed mb-8">
        💡 Tip: Each code example links to MDN for more details. Start with Variables, then work down.
      </p>
      <div class="space-y-3" id="js-doc-sections"></div>
    </div>
  `;

  const container = host.querySelector('#js-doc-sections');
  container.innerHTML = JS_DOC_SECTIONS.map(sec => {
    const rows = sec.concepts.map(c => {
      // Preserve line breaks in code by converting \n to <br>
      const codeHtml = c.code.replace(/\n/g, '<br>').replace(/ {2}/g, '&nbsp;&nbsp;');
      return `
      <div class="py-3 border-b border-slate-700/30 last:border-none">
        <div class="flex items-start justify-between gap-3 mb-2">
          <div class="text-xs font-semibold text-emerald-400">${c.name}</div>
          <a href="${c.link}" target="_blank" rel="noopener" class="text-[10px] text-cyan-400 hover:text-cyan-300 underline whitespace-nowrap flex-shrink-0">
            MDN Docs ↗
          </a>
        </div>
        <div class="bg-slate-950/50 rounded p-3 border border-slate-700/30">
          <code class="text-[11px] leading-relaxed text-indigo-200 block whitespace-pre-wrap break-all">${codeHtml}</code>
        </div>
      </div>`;
    }).join('');
    return `
      <div class="group rounded-lg bg-slate-800/40 border border-slate-700/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow" data-doc-section="${sec.id}">
        <button class="w-full flex items-center justify-between px-5 py-3 text-left bg-slate-800/60 hover:bg-slate-700/60 transition-colors">
          <div class="flex items-center gap-3">
            <i data-lucide="${sec.icon}" class="w-5 h-5 text-indigo-400"></i>
            <span class="text-base font-bold text-white">${sec.title}</span>
          </div>
          <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 transition-transform duration-300"></i>
        </button>
        <div class="px-5 pt-3 pb-2 text-xs text-slate-300 leading-relaxed bg-slate-900/30 hidden">${sec.blurb}</div>
        <div class="px-5 pb-4 text-xs hidden">${rows}</div>
      </div>`;
  }).join('');

  // Collapse / expand handlers
  container.querySelectorAll('[data-doc-section]').forEach(panel => {
    const btn = panel.querySelector('button');
    const blurb = panel.children[1];
    const body = panel.children[2];
    btn.addEventListener('click', () => {
      const isOpen = !body.classList.contains('hidden');
      if (isOpen) {
        body.classList.add('hidden');
        blurb.classList.add('hidden');
        btn.querySelector('[data-lucide="chevron-down"]').style.transform = 'rotate(0deg)';
      } else {
        body.classList.remove('hidden');
        blurb.classList.remove('hidden');
        btn.querySelector('[data-lucide="chevron-down"]').style.transform = 'rotate(180deg)';
      }
      // refresh icons after state change
      try { if (window.lucide) window.lucide.createIcons(); } catch(e){}
    });
  });

  // Render lucide icons
  try { if (window.lucide) window.lucide.createIcons(); } catch(e) {}
}


// Defer rendering until DOM ready (in case this script loads before element exists)
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', renderDocs);
} else {
	renderDocs();
}

export { renderDocs };
