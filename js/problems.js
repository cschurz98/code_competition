// Problems dataset exported as a module
export const PROBLEMS = [
  {
    id: 1,
    title: "The Classic Two Sum",
    difficulty: "Easy",
    points: 100,
    description: "You are given a list (array) of whole numbers and a target number. Your job is to find two numbers in the list that add up to equal the target. Return the positions (indices) of these two numbers. For example, if the list is [2, 7, 11, 15] and the target is 9, you should return [0, 1] because the numbers at position 0 (which is 2) and position 1 (which is 7) add up to 9. Note: Position counting starts at 0, not 1. There will always be exactly one correct answer.",
    starterCode: `function twoSum(nums, target) {
  // Write your code here
  // Return an array [index1, index2]

  }`,
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
      { input: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] }
    ],
    stressTest: () => {
      const size = 15000;
      const nums = Array.from({ length: size }, (_, i) => i);
      nums[size - 2] = 10000;
      nums[size - 1] = 10001;
      return { input: [nums, 20001], expected: [size - 2, size - 1] };
    },
    baseThresholds: { excellent: 5, great: 15, good: 50, acceptable: 150, poor: 300 }
  },

  {
    id: 2,
    title: "Palindrome Check",
    difficulty: "Medium",
    points: 200,
    description: "You are given a whole number. Determine if this number is a palindrome - meaning it reads the same forwards and backwards. For example, 121 is a palindrome because it's the same when reversed (1-2-1 backwards is still 1-2-1). However, 123 is not a palindrome because backwards it's 321. Negative numbers like -121 are never palindromes. Return true if the number is a palindrome, or false if it's not.",
    starterCode: `function isPalindrome(x) {
  // Convert to string or use math
  // Return true or false
  
}`,
    testCases: [
      { input: [121], expected: true },
      { input: [-121], expected: false },
      { input: [10], expected: false },
      { input: [0], expected: true },
      { input: [12321], expected: true }
    ],
    stressTest: () => ({
      input: [123456789],
      expected: false,
      isBatch: true,
      batchSize: 500000
    }),
    baseThresholds: { excellent: 10, great: 25, good: 60, acceptable: 120, poor: 250 }
  },

  {
    id: 3,
    title: "FizzBuzz Architect",
    difficulty: "Easy",
    points: 100,
    description: "Create a list (array) of strings containing numbers from 1 up to a given number n. Follow these special rules: If a number is divisible by 3 (like 3, 6, 9, 12), replace it with the word 'Fizz'. If a number is divisible by 5 (like 5, 10, 20), replace it with 'Buzz'. If a number is divisible by both 3 and 5 (like 15, 30), replace it with 'FizzBuzz'. For all other numbers, just use the number as a string. Example: For n=5, return ['1', '2', 'Fizz', '4', 'Buzz'].",
    starterCode: `function fizzBuzz(n) {
  // Return an array of strings
  
}`,
    testCases: [
      { input: [3], expected: ["1", "2", "Fizz"] },
      { input: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] },
      { input: [15], expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"] }
    ],
    stressTest: () => ({ input: [500000], expected: null, checkOutput: res => res.length === 500000 && res[14] === "FizzBuzz" }),
    baseThresholds: { excellent: 30, great: 60, good: 120, acceptable: 220, poor: 400 }
  }
  ,
  {
    id: 4,
    title: "Reverse String",
    difficulty: "Easy",
    points: 100,
    description: "Take a word or sentence (string) and flip it backwards. Return the reversed version. For example, if you're given 'hello', you should return 'olleh'. If given 'abc', return 'cba'. Empty strings should return empty strings.",
    starterCode: `function reverseString(s) {
  // return reversed string
}`,
    testCases: [
      { input: ["hello"], expected: "olleh" },
      { input: [""], expected: "" },
      { input: ["abc"], expected: "cba" },
      { input: ["a"], expected: "a" },
      { input: ["Hello World!"], expected: "!dlroW olleH" }
    ],
    stressTest: () => ({ input: [Array.from({ length: 500000 }, () => 'a').join('')], expected: null }),
    baseThresholds: { excellent: 2, great: 8, good: 20, acceptable: 50, poor: 100 }
  },

  {
    id: 5,
    title: "Remove Duplicates (return unique array)",
    difficulty: "Medium",
    points: 200,
    description: "You are given a list (array) of numbers that is already sorted from smallest to largest. Create and return a new list that contains each unique number only once, keeping them in the same order. For example, if given [1, 1, 2], return [1, 2]. If given [1, 1, 1, 1], return [1]. The input list is already sorted, which can help you solve this efficiently.",
    starterCode: `function uniqueSorted(arr) {
  // return new array with duplicates removed
}`,
    testCases: [
      { input: [[1,1,2]], expected: [1,2] },
      { input: [[1,1,1,1]], expected: [1] },
      { input: [[1,2,3]], expected: [1,2,3] },
      { input: [[]], expected: [] },
      { input: [[0,0,1,1,1,2,2,3,3,4]], expected: [0,1,2,3,4] }
    ],
    stressTest: () => ({ input: [Array.from({ length: 200000 }, (_, i) => Math.floor(i/2))], expected: null }),
    baseThresholds: { excellent: 5, great: 15, good: 40, acceptable: 90, poor: 180 }
  },

  {
    id: 6,
    title: "Valid Parentheses",
    difficulty: "Easy",
    points: 100,
    description: "Check if a string of brackets is valid. The string contains only these bracket types: ( ) [ ] { }. A valid string means every opening bracket has a matching closing bracket in the correct order. For example, '()' is valid, '()[]{}' is valid, but '(]' is not valid (wrong bracket type closes the opening). Also, brackets must be properly nested - '([)]' is invalid but '([])' is valid. Return true if valid, false if not.",
    starterCode: `function isValid(s) {
  // return true/false
}`,
    testCases: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
      { input: ["([)]"], expected: false },
      { input: ["{[]}"], expected: true },
      { input: [""], expected: true }
    ],
    stressTest: () => ({ input: [Array.from({ length: 100000 }, (_, i) => (i % 2 === 0 ? '(' : ')')).join('')], expected: null, isBatch: true, batchSize: 30000 }),
    baseThresholds: { excellent: 8, great: 20, good: 50, acceptable: 100, poor: 200 }
  },

  {
    id: 7,
    title: "Binary Search",
    difficulty: "Easy",
    points: 100,
    description: "Find a target number in a sorted list (array) using binary search - an efficient searching method. The list is already sorted from smallest to largest. Return the position (index) where the target number is found. If the target is not in the list, return -1. Binary search works by repeatedly dividing the search area in half: check the middle, then search either the left or right half based on whether the target is smaller or larger. Remember: positions start counting at 0.",
    starterCode: `function binarySearch(arr, target) {
  // return index or -1
}`,
    testCases: [
      { input: [[1,2,3,4,5], 3], expected: 2 },
      { input: [[1,2,3], 4], expected: -1 },
      { input: [[], 1], expected: -1 },
      { input: [[5], 5], expected: 0 },
      { input: [[-1,0,3,5,9,12], 9], expected: 4 }
    ],
    stressTest: () => ({ input: [[...Array.from({ length: 500000 }, (_, i) => i),], 499999], expected: 499999 }),
    baseThresholds: { excellent: 1, great: 3, good: 10, acceptable: 30, poor: 100 }
  },

  {
    id: 8,
    title: "Maximum Subarray (Kadane)",
    difficulty: "Hard",
    points: 300,
    description: "Find the group of consecutive numbers (subarray) in a list that has the largest sum. A subarray is a continuous sequence of numbers from the original list. For example, in [-2, 1, -3, 4, -1, 2, 1, -5, 4], the subarray [4, -1, 2, 1] has the largest sum of 6. You must include at least one number. Return just the sum (not the actual subarray). Tip: Kadane's algorithm is an efficient solution that tracks the best sum seen so far.",
    starterCode: `function maxSubArray(nums) {
  // return maximum sum
}`,
    testCases: [
      { input: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 },
      { input: [[1]], expected: 1 },
      { input: [[5,4,-1,7,8]], expected: 23 },
      { input: [[-1,-2,-3,-4]], expected: -1 },
      { input: [[0,-1,2,-3,4]], expected: 4 }
    ],
    stressTest: () => ({ input: [Array.from({ length: 100000 }, (_, i) => (i%2===0? i : -i))], expected: null }),
    baseThresholds: { excellent: 10, great: 25, good: 60, acceptable: 130, poor: 280 }
  },

  {
    id: 9,
    title: "Longest Common Prefix",
    difficulty: "Easy",
    points: 100,
    description: "Find the longest common beginning (prefix) shared by all words in a list. A prefix is the starting part of a word. For example, if given ['flower', 'flow', 'flight'], the longest common prefix is 'fl' because all three words start with those letters. If there's no common prefix (like in ['dog', 'racecar', 'car']), return an empty string. You need to find the longest starting sequence that appears in every single word.",
    starterCode: `function longestCommonPrefix(strs) {
  // return the longest common prefix
}`,
    testCases: [
      { input: [["flower","flow","flight"]], expected: "fl" },
      { input: [["dog","racecar","car"]], expected: "" },
      { input: [["a"]], expected: "a" },
      { input: [["prefix","pre","prepare"]], expected: "pre" },
      { input: [["test","test","test"]], expected: "test" }
    ],
    stressTest: () => ({ input: [Array.from({ length: 100000 }, () => 'prefix_common_suffix')], expected: null }),
    baseThresholds: { excellent: 8, great: 20, good: 50, acceptable: 110, poor: 220 }
  },

  {
    id: 10,
    title: "Container With Most Water",
    difficulty: "Medium",
    points: 200,
    description: "You are given a list of heights representing vertical lines positioned at consecutive positions (0, 1, 2, 3...). You need to pick any two lines to form a rectangle with the horizontal axis (ground). The rectangle's area equals: (width between positions) × (height of shorter line).<br><br><img src='resources/Container-of-water.jpg' alt='Container with most water visualization' style='max-width: 100%; height: auto; margin: 10px 0;'><br><br>For example, given heights [1, 8, 6, 2, 5, 4, 8, 3, 7], if you pick the line at position 1 (height 8) and position 8 (height 7), the width is 8-1=7 positions and the usable height is min(8,7)=7, giving area = 7 × 7 = 49. Your goal is to find the two lines that create the maximum possible area. Return this maximum area.",
    starterCode: `function maxArea(height) {
  // return max area
}`,
    testCases: [
      { input: [[1,8,6,2,5,4,8,3,7]], expected: 49 },
      { input: [[1,1]], expected: 1 },
      { input: [[4,3,2,1,4]], expected: 16 },
      { input: [[1,2,1]], expected: 2 }
    ],
    stressTest: () => ({ input: [Array.from({ length: 100000 }, (_, i) => Math.abs(Math.sin(i)) * 100)], expected: null }),
    baseThresholds: { excellent: 15, great: 35, good: 80, acceptable: 180, poor: 350 }
  },

  {
    id: 11,
    title: "Rotate Array",
    difficulty: "Easy",
    points: 100,
    description: "Shift all numbers in a list (array) to the right by k positions. Numbers that fall off the right end wrap around to the beginning. For example, if you have [1, 2, 3, 4, 5, 6, 7] and rotate by k=3 steps, the last 3 numbers [5, 6, 7] move to the front, giving you [5, 6, 7, 1, 2, 3, 4]. If k is larger than the array length, it wraps around multiple times. Return the rotated array.",
    starterCode: `function rotateArray(nums, k) {
  // return rotated array
}`,
    testCases: [
      { input: [[1,2,3,4,5,6,7], 3], expected: [5,6,7,1,2,3,4] },
      { input: [[-1,-100,3,99], 2], expected: [3,99,-1,-100] },
      { input: [[1,2], 0], expected: [1,2] },
      { input: [[1,2,3], 4], expected: [3,1,2] }
    ],
    stressTest: () => ({ input: [Array.from({ length: 400000 }, (_, i) => i), 100000], expected: null }),
    baseThresholds: { excellent: 8, great: 20, good: 50, acceptable: 120, poor: 250 }
  },

  {
    id: 12,
    title: "Move Zeroes",
    difficulty: "Easy",
    points: 100,
    description: "Take a list (array) of numbers and move all the zeros to the end, while keeping all other numbers in their original order. For example, [0, 1, 0, 3, 12] becomes [1, 3, 12, 0, 0]. The non-zero numbers (1, 3, 12) stay in the same order they appeared, but all zeros are pushed to the end. Return the modified array.",
    starterCode: `function moveZeroes(nums) {
  // return array with zeros moved
}`,
    testCases: [
      { input: [[0,1,0,3,12]], expected: [1,3,12,0,0] },
      { input: [[0]], expected: [0] },
      { input: [[1,2,3]], expected: [1,2,3] },
      { input: [[0,0,0,1,2]], expected: [1,2,0,0,0] }
    ],
    stressTest: () => ({ input: [Array.from({ length: 300000 }, (_, i) => (i%5===0?0:i))], expected: null }),
    baseThresholds: { excellent: 8, great: 20, good: 50, acceptable: 100, poor: 200 }
  },

  {
    id: 13,
    title: "Power of Two",
    difficulty: "Easy",
    points: 100,
    description: "Check if a number is a power of two. Powers of two are numbers you get by multiplying 2 by itself: 1 (2⁰), 2 (2¹), 4 (2²), 8 (2³), 16 (2⁴), 32, 64, 128, and so on. For example, 16 is a power of two (2×2×2×2), but 18 is not. Return true if the number is a power of two, false otherwise. Hint: powers of two have only one '1' bit in binary representation.",
    starterCode: `function isPowerOfTwo(n) {
  // return true/false
}`,
    testCases: [
      { input: [1], expected: true },
      { input: [16], expected: true },
      { input: [218], expected: false },
      { input: [0], expected: false },
      { input: [2], expected: true },
      { input: [3], expected: false }
    ],
    stressTest: () => ({ input: [Math.pow(2, 30)], expected: true, isBatch: true, batchSize: 1000000 }),
    baseThresholds: { excellent: 5, great: 15, good: 40, acceptable: 80, poor: 150 }
  },

  {
    id: 14,
    title: "Group Anagrams",
    difficulty: "Hard",
    points: 300,
    description: "Organize a list of words into groups where each group contains anagrams. Anagrams are words made from the same letters rearranged - like 'eat', 'tea', and 'ate' all use the letters e, a, t. Group these together. For example, given ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'], you should return [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]. The order of groups and order within groups doesn't matter. Hint: sorting the letters in each word can help identify anagrams.",
    starterCode: `function groupAnagrams(strs) {
  // return array of grouped anagrams
}`,
    testCases: [
      { input: [["eat","tea","tan","ate","nat","bat"]], expected: [["eat","tea","ate"],["tan","nat"],["bat"]] },
      { input: [[""]], expected: [[""]] },
      { input: [["a"]], expected: [["a"]] },
      { input: [["listen","silent","enlist"]], expected: [["listen","silent","enlist"]] }
    ],
    stressTest: () => ({ input: [Array.from({ length: 100000 }, (_, i) => i%2===0? 'abc' : 'bca')], expected: null }),
    baseThresholds: { excellent: 20, great: 45, good: 100, acceptable: 220, poor: 450 }
  },

  {
    id: 15,
    title: "Top K Frequent Elements",
    difficulty: "Hard",
    points: 300,
    description: "Find the k numbers that appear most often in a list. For example, in the list [1, 1, 1, 2, 2, 3] with k=2, the answer is [1, 2] because 1 appears 3 times (most frequent) and 2 appears 2 times (second most frequent). You need to count how many times each number appears (frequency), then return the k numbers with the highest counts. The order of the returned numbers doesn't matter. Note: k represents how many top elements you want.",
    starterCode: `function topKFrequent(nums, k) {
  // return array of top k frequent
}`,
    testCases: [
      { input: [[1,1,1,2,2,3], 2], expected: [1,2] },
      { input: [[1], 1], expected: [1] },
      { input: [[4,1,-1,2,-1,2,3], 2], expected: [-1,2] },
      { input: [[1,2,2,3,3,3], 1], expected: [3] }
    ],
    stressTest: () => ({ input: [Array.from({ length: 300000 }, (_, i) => Math.floor(Math.random()*1000)), 10], expected: null }),
    baseThresholds: { excellent: 35, great: 70, good: 140, acceptable: 280, poor: 550 }
  }
];

// Additional practice problems appended — keep IDs sequential

// --- Test case randomizer utilities and per-problem generators ---
// Simple seeded RNG (mulberry32) for reproducible randomness when seed supplied
function mulberry32(seed) {
  let t = seed >>> 0;
  return function() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(array, rnd) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function randInt(rnd, min, max) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

// small helpers to compute expected outputs for randomized inputs
function computeTwoSumAnswer(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }
  return null;
}

function computeIsPalindrome(x) {
  if (x < 0) return false;
  const s = String(x);
  return s === s.split('').reverse().join('');
}

function computeFizzBuzz(n) {
  const res = [];
  for (let i = 1; i <= n; i++) {
    let out = '';
    if (i % 3 === 0) out += 'Fizz';
    if (i % 5 === 0) out += 'Buzz';
    res.push(out || String(i));
  }
  return res;
}

function computeReverseString(s) {
  return s.split('').reverse().join('');
}

function computeUniqueSorted(arr) {
  const out = [];
  for (const v of arr) if (out.length === 0 || out[out.length - 1] !== v) out.push(v);
  return out;
}

function computeIsValidParens(s) {
  const map = { ')': '(', ']': '[', '}': '{' };
  const st = [];
  for (const c of s) {
    if (['(', '[', '{'].includes(c)) st.push(c);
    else if ([')', ']', '}'].includes(c)) {
      if (st.pop() !== map[c]) return false;
    }
  }
  return st.length === 0;
}

function computeBinarySearch(arr, target) {
  let l = 0, r = arr.length - 1;
  while (l <= r) {
    const m = Math.floor((l + r) / 2);
    if (arr[m] === target) return m;
    if (arr[m] < target) l = m + 1;
    else r = m - 1;
  }
  return -1;
}

function computeMaxSubArray(nums) {
  let best = -Infinity, cur = 0;
  for (const n of nums) { cur = Math.max(n, cur + n); best = Math.max(best, cur); }
  return best;
}

function computeLongestCommonPrefix(strs) {
  if (!strs.length) return '';
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (strs[i].indexOf(prefix) !== 0) prefix = prefix.slice(0, -1);
    if (!prefix) return '';
  }
  return prefix;
}

function computeMaxArea(height) {
  let i = 0, j = height.length - 1, best = 0;
  while (i < j) {
    const area = Math.min(height[i], height[j]) * (j - i);
    best = Math.max(best, area);
    if (height[i] < height[j]) i++; else j--;
  }
  return best;
}

function computeRotateArray(nums, k) {
  const n = nums.length; if (n === 0) return nums.slice();
  k = ((k % n) + n) % n;
  return nums.slice(n - k).concat(nums.slice(0, n - k));
}

function computeMoveZeroes(nums) {
  const out = nums.filter(x => x !== 0);
  return out.concat(Array(nums.length - out.length).fill(0));
}

function computeIsPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

function computeGroupAnagrams(strs) {
  const map = new Map();
  for (const s of strs) {
    const k = s.split('').sort().join('');
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(s);
  }
  return Array.from(map.values());
}

function computeTopKFrequent(nums, k) {
  const freq = new Map();
  for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);
  return Array.from(freq.entries()).sort((a,b)=>b[1]-a[1]).slice(0,k).map(x=>x[0]);
}

// Attach per-problem randomizers to PROBLEMS
PROBLEMS.forEach(problem => {
  problem.randomize = function(seed) {
    const s = seed == null ? Math.floor(Math.random() * 2 ** 31) : Number(seed) >>> 0;
    const rnd = mulberry32(s);
    const out = [];
    switch (problem.id) {
      case 1: { // Two Sum
        for (let t = 0; t < 3; t++) {
          const n = randInt(rnd, 3, 12);
          const nums = Array.from({ length: n }, () => randInt(rnd, -50, 200));
          const i = randInt(rnd, 0, n - 2);
          const j = randInt(rnd, i + 1, n - 1);
          nums[i] = randInt(rnd, -1000, 1000);
          nums[j] = randInt(rnd, -1000, 1000);
          const target = nums[i] + nums[j];
          const expected = computeTwoSumAnswer(nums, target);
          out.push({ input: [nums, target], expected });
        }
        break;
      }

      case 2: { // Palindrome Check
        out.push({ input: [121], expected: true });
        out.push({ input: [-121], expected: false });
        // random batch of palindromes and non-palindromes
        for (let t = 0; t < 3; t++) {
          const makePal = rnd() > 0.5;
          if (makePal) {
            const half = String(randInt(rnd, 1, 99999));
            const pal = half + half.split('').reverse().join('');
            out.push({ input: [Number(pal)], expected: true });
          } else {
            const n = randInt(rnd, 10, 999999);
            out.push({ input: [n], expected: computeIsPalindrome(n) });
          }
        }
        break;
      }

      case 3: { // FizzBuzz
        out.push({ input: [3], expected: computeFizzBuzz(3) });
        const n1 = randInt(rnd, 5, 30);
        out.push({ input: [n1], expected: computeFizzBuzz(n1) });
        const n2 = randInt(rnd, 50, 200);
        out.push({ input: [n2], expected: computeFizzBuzz(n2) });
        break;
      }

      case 4: { // Reverse String
        out.push({ input: ['hello'], expected: 'olleh' });
        for (let t = 0; t < 3; t++) {
          const len = randInt(rnd, 0, 30);
          let s = '';
          for (let i = 0; i < len; i++) s += String.fromCharCode(randInt(rnd, 97, 122));
          out.push({ input: [s], expected: computeReverseString(s) });
        }
        break;
      }

      case 5: { // Unique Sorted
        out.push({ input: [[1,1,2]], expected: [1,2] });
        for (let t = 0; t < 3; t++) {
          const n = randInt(rnd, 1, 30);
          const arr = [];
          for (let i = 0; i < n; i++) arr.push(Math.floor(i / randInt(rnd,1,3)));
          out.push({ input: [arr], expected: computeUniqueSorted(arr) });
        }
        break;
      }

      case 6: { // Valid Parentheses
        out.push({ input: ['()'], expected: true });
        out.push({ input: ['(]'], expected: false });
        // create a valid parentheses string by nesting random pairs
        let s = '';
        const pairs = ['()', '[]', '{}'];
        for (let i = 0; i < 5; i++) s += pairs[Math.floor(rnd()*pairs.length)];
        out.push({ input: [s], expected: computeIsValidParens(s) });
        break;
      }

      case 7: { // Binary Search
        for (let t = 0; t < 3; t++) {
          const n = randInt(rnd, 0, 30);
          const arr = Array.from({ length: n }, (_, i) => i * randInt(rnd,1,3));
          const choosePresent = rnd() > 0.4 && n > 0;
          const target = choosePresent ? arr[randInt(rnd,0,n-1)] : randInt(rnd, -10, 1000);
          out.push({ input: [arr, target], expected: computeBinarySearch(arr, target) });
        }
        break;
      }

      case 8: { // Maximum Subarray
        out.push({ input: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 });
        for (let t = 0; t < 2; t++) {
          const n = randInt(rnd, 1, 50);
          const nums = Array.from({ length: n }, () => randInt(rnd, -50, 50));
          out.push({ input: [nums], expected: computeMaxSubArray(nums) });
        }
        break;
      }

      case 9: { // Longest Common Prefix
        out.push({ input: [['flower','flow','flight']], expected: 'fl' });
        out.push({ input: [['dog','racecar','car']], expected: '' });
        // randomized group with common prefix
        const prefix = 'pre' + randInt(rnd,0,99);
        const arr = [prefix + 'fix', prefix + 'lude', prefix + 'tty'];
        out.push({ input: [arr], expected: computeLongestCommonPrefix(arr) });
        break;
      }

      case 10: { // Container With Most Water
        out.push({ input: [[1,8,6,2,5,4,8,3,7]], expected: 49 });
        for (let t = 0; t < 2; t++) {
          const n = randInt(rnd, 2, 30);
          const height = Array.from({ length: n }, () => randInt(rnd, 0, 100));
          out.push({ input: [height], expected: computeMaxArea(height) });
        }
        break;
      }

      case 11: { // Rotate Array
        out.push({ input: [[1,2,3,4,5,6,7], 3], expected: [5,6,7,1,2,3,4] });
        for (let t = 0; t < 2; t++) {
          const n = randInt(rnd, 0, 20);
          const nums = Array.from({ length: n }, (_, i) => i + 1);
          const k = randInt(rnd, 0, 50);
          out.push({ input: [nums, k], expected: computeRotateArray(nums, k) });
        }
        break;
      }

      case 12: { // Move Zeroes
        out.push({ input: [[0,1,0,3,12]], expected: [1,3,12,0,0] });
        for (let t = 0; t < 2; t++) {
          const n = randInt(rnd, 1, 30);
          const nums = Array.from({ length: n }, () => (rnd() < 0.2 ? 0 : randInt(rnd, -10, 20)));
          out.push({ input: [nums], expected: computeMoveZeroes(nums) });
        }
        break;
      }

      case 13: { // Power of Two
        out.push({ input: [1], expected: true });
        out.push({ input: [16], expected: true });
        for (let t = 0; t < 3; t++) {
          const pow = 1 << randInt(rnd, 0, 30);
          out.push({ input: [pow], expected: true });
          out.push({ input: [pow + randInt(rnd,1,100)], expected: computeIsPowerOfTwo(pow + randInt(rnd,1,100)) });
        }
        break;
      }

      case 14: { // Group Anagrams
        out.push({ input: [['eat','tea','tan','ate','nat','bat']], expected: computeGroupAnagrams(['eat','tea','tan','ate','nat','bat']) });
        for (let t = 0; t < 2; t++) {
          const strs = [];
          const seeds = ['abc','bca','cab','silent','listen'];
          for (let i = 0; i < 6; i++) strs.push(seeds[Math.floor(rnd()*seeds.length)]);
          out.push({ input: [strs], expected: computeGroupAnagrams(strs) });
        }
        break;
      }

      case 15: { // Top K Frequent
        out.push({ input: [[1,1,1,2,2,3], 2], expected: [1,2] });
        for (let t = 0; t < 2; t++) {
          const n = randInt(rnd, 5, 100);
          const nums = Array.from({ length: n }, () => randInt(rnd, 0, 10));
          const k = Math.min(randInt(rnd, 1, 5), 10);
          out.push({ input: [nums, k], expected: computeTopKFrequent(nums, k) });
        }
        break;
      }

      default: {
        // fallback: return original static testCases (copied)
        if (Array.isArray(problem.testCases)) return problem.testCases.map(tc => ({ ...tc }));
        return problem.testCases;
      }
    }
    // shuffle returned cases slightly so order is less predictable
    shuffle(out, rnd);
    return out;
  };
});
