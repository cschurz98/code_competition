// Problems dataset exported as a module
export const PROBLEMS = [
  {
    id: 1,
    title: "The Classic Two Sum",
    difficulty: "Easy",
    points: 100,
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution.",
    starterCode: `function twoSum(nums, target) {
  // Write your code here
  // Return an array [index1, index2]
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
}`,
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] }
    ],
    stressTest: () => {
      const size = 8000;
      const nums = Array.from({ length: size }, (_, i) => i);
      nums[size - 2] = 10000;
      nums[size - 1] = 10001;
      return { input: [nums, 20001], expected: [size - 2, size - 1] };
    },
    baseThresholds: { optimal: 10, acceptable: 100 }
  },

  {
    id: 2,
    title: "Palindrome Check",
    difficulty: "Medium",
    points: 200,
    description: "Given an integer x, return true if x is a palindrome integer. An integer is a palindrome when it reads the same backward as forward.",
    starterCode: `function isPalindrome(x) {
  // Convert to string or use math
  // Return true or false
  
}`,
    testCases: [
      { input: [121], expected: true },
      { input: [-121], expected: false },
      { input: [10], expected: false }
    ],
    stressTest: () => ({
      input: [123456789],
      expected: false,
      isBatch: true,
      batchSize: 200000
    }),
    baseThresholds: { optimal: 20, acceptable: 80 }
  },

  {
    id: 3,
    title: "FizzBuzz Architect",
    difficulty: "Hard",
    points: 300,
    description: "Return an array of strings from 1 to n. For multiples of 3 return 'Fizz', for 5 return 'Buzz', for both return 'FizzBuzz'.",
    starterCode: `function fizzBuzz(n) {
  // Return an array of strings
  
}`,
    testCases: [
      { input: [3], expected: ["1", "2", "Fizz"] },
      { input: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] }
    ],
    stressTest: () => ({ input: [300000], expected: null, checkOutput: res => res.length === 300000 && res[14] === "FizzBuzz" }),
    baseThresholds: { optimal: 40, acceptable: 150 }
  }
  ,
  {
    id: 4,
    title: "Reverse String",
    difficulty: "Easy",
    points: 100,
    description: "Reverse the characters in a string and return the new string.",
    starterCode: `function reverseString(s) {
  // return reversed string
}`,
    testCases: [
      { input: ["hello"], expected: "olleh" },
      { input: [""], expected: "" },
      { input: ["abc"], expected: "cba" }
    ],
    stressTest: () => ({ input: [Array.from({ length: 200000 }, () => 'a').join('')], expected: null }),
    baseThresholds: { optimal: 2, acceptable: 20 }
  },

  {
    id: 5,
    title: "Remove Duplicates (return unique array)",
    difficulty: "Easy",
    points: 100,
    description: "Given a sorted array, return a new array with duplicates removed (preserving order).",
    starterCode: `function uniqueSorted(arr) {
  // return new array with duplicates removed
}`,
    testCases: [
      { input: [[1,1,2]], expected: [1,2] },
      { input: [[1,1,1,1]], expected: [1] },
      { input: [[1,2,3]], expected: [1,2,3] }
    ],
    stressTest: () => ({ input: [Array.from({ length: 100000 }, (_, i) => Math.floor(i/2))], expected: null }),
    baseThresholds: { optimal: 5, acceptable: 40 }
  },

  {
    id: 6,
    title: "Valid Parentheses",
    difficulty: "Easy",
    points: 100,
    description: "Given a string containing only '()[]{}', determine if the input string is valid (properly closed and nested).",
    starterCode: `function isValid(s) {
  // return true/false
}`,
    testCases: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false }
    ],
    stressTest: () => ({ input: [Array.from({ length: 50000 }, (_, i) => (i % 2 === 0 ? '(' : ')')).join('')], expected: null, isBatch: true, batchSize: 20000 }),
    baseThresholds: { optimal: 5, acceptable: 30 }
  },

  {
    id: 7,
    title: "Binary Search",
    difficulty: "Easy",
    points: 100,
    description: "Implement binary search: given sorted array and target, return index or -1 if not found.",
    starterCode: `function binarySearch(arr, target) {
  // return index or -1
}`,
    testCases: [
      { input: [[1,2,3,4,5], 3], expected: 2 },
      { input: [[1,2,3], 4], expected: -1 },
      { input: [[], 1], expected: -1 }
    ],
    stressTest: () => ({ input: [[...Array.from({ length: 200000 }, (_, i) => i),], 199999], expected: 199999 }),
    baseThresholds: { optimal: 2, acceptable: 15 }
  },

  {
    id: 8,
    title: "Maximum Subarray (Kadane)",
    difficulty: "Medium",
    points: 200,
    description: "Find the contiguous subarray with the largest sum and return its sum.",
    starterCode: `function maxSubArray(nums) {
  // return maximum sum
}`,
    testCases: [
      { input: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 },
      { input: [[1]], expected: 1 },
      { input: [[5,4,-1,7,8]], expected: 23 }
    ],
    stressTest: () => ({ input: [Array.from({ length: 40000 }, (_, i) => (i%2===0? i : -i))], expected: null }),
    baseThresholds: { optimal: 10, acceptable: 60 }
  },

  {
    id: 9,
    title: "Longest Common Prefix",
    difficulty: "Easy",
    points: 100,
    description: "Return the longest common prefix string amongst an array of strings.",
    starterCode: `function longestCommonPrefix(strs) {
  // return the longest common prefix
}`,
    testCases: [
      { input: [["flower","flow","flight"]], expected: "fl" },
      { input: [["dog","racecar","car"]], expected: "" },
      { input: [["a"]], expected: "a" }
    ],
    stressTest: () => ({ input: [Array.from({ length: 50000 }, () => 'prefix_common_suffix')], expected: null }),
    baseThresholds: { optimal: 5, acceptable: 40 }
  },

  {
    id: 10,
    title: "Container With Most Water",
    difficulty: "Hard",
    points: 300,
    description: "Given n non-negative integers representing heights, find two lines that form a container holding the most water and return the max area.",
    starterCode: `function maxArea(height) {
  // return max area
}`,
    testCases: [
      { input: [[1,8,6,2,5,4,8,3,7]], expected: 49 },
      { input: [[1,1]], expected: 1 }
    ],
    stressTest: () => ({ input: [Array.from({ length: 60000 }, (_, i) => Math.abs(Math.sin(i)) * 100)], expected: null }),
    baseThresholds: { optimal: 25, acceptable: 120 }
  },

  {
    id: 11,
    title: "Rotate Array",
    difficulty: "Easy",
    points: 100,
    description: "Rotate an array to the right by k steps. Return the rotated array.",
    starterCode: `function rotateArray(nums, k) {
  // return rotated array
}`,
    testCases: [
      { input: [[1,2,3,4,5,6,7], 3], expected: [5,6,7,1,2,3,4] },
      { input: [[-1,-100,3,99], 2], expected: [3,99,-1,-100] }
    ],
    stressTest: () => ({ input: [Array.from({ length: 200000 }, (_, i) => i), 50000], expected: null }),
    baseThresholds: { optimal: 8, acceptable: 60 }
  },

  {
    id: 12,
    title: "Move Zeroes",
    difficulty: "Easy",
    points: 100,
    description: "Move all zeroes in the array to the end while maintaining the relative order of non-zero elements.",
    starterCode: `function moveZeroes(nums) {
  // return array with zeros moved
}`,
    testCases: [
      { input: [[0,1,0,3,12]], expected: [1,3,12,0,0] },
      { input: [[0]], expected: [0] }
    ],
    stressTest: () => ({ input: [Array.from({ length: 150000 }, (_, i) => (i%5===0?0:i))], expected: null }),
    baseThresholds: { optimal: 5, acceptable: 30 }
  },

  {
    id: 13,
    title: "Power of Two",
    difficulty: "Easy",
    points: 100,
    description: "Given an integer, determine if it is a power of two.",
    starterCode: `function isPowerOfTwo(n) {
  // return true/false
}`,
    testCases: [
      { input: [1], expected: true },
      { input: [16], expected: true },
      { input: [218], expected: false }
    ],
    stressTest: () => ({ input: [Math.pow(2, 30)], expected: true }),
    baseThresholds: { optimal: 2, acceptable: 15 }
  },

  {
    id: 14,
    title: "Group Anagrams",
    difficulty: "Medium",
    points: 200,
    description: "Group an array of strings into groups of anagrams (order within groups doesn't matter).",
    starterCode: `function groupAnagrams(strs) {
  // return array of grouped anagrams
}`,
    testCases: [
      { input: [["eat","tea","tan","ate","nat","bat"]], expected: [["eat","tea","ate"],["tan","nat"],["bat"]] },
      { input: [[""]], expected: [[""]] }
    ],
    stressTest: () => ({ input: [Array.from({ length: 50000 }, (_, i) => i%2===0? 'abc' : 'bca')], expected: null }),
    baseThresholds: { optimal: 12, acceptable: 80 }
  },

  {
    id: 15,
    title: "Top K Frequent Elements",
    difficulty: "Hard",
    points: 300,
    description: "Given a non-empty array of integers, return the k most frequent elements.",
    starterCode: `function topKFrequent(nums, k) {
  // return array of top k frequent
}`,
    testCases: [
      { input: [[1,1,1,2,2,3], 2], expected: [1,2] },
      { input: [[1], 1], expected: [1] }
    ],
    stressTest: () => ({ input: [Array.from({ length: 200000 }, (_, i) => Math.floor(Math.random()*1000)), 10], expected: null }),
    baseThresholds: { optimal: 30, acceptable: 150 }
  }
];

// Additional practice problems appended — keep IDs sequential
