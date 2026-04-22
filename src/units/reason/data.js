// Each scenario: a problem where a direct one-shot answer is wrong and a
// chain-of-thought trace is right. All text and step counts are hand-picked
// and illustrative — not live model output.

export const REASON_SCENARIOS = [
  {
    id: "math",
    label: "Math word problem",
    problem: "A shirt costs $40 after a 20% discount. What was the original price?",

    direct: {
      answer: "$48",
      correct: false,
      tokens: 4,
      commentary: "Intuitive but wrong. Adds 20% of $40 back to $40 instead of reversing the original 20% discount.",
    },

    thinking: {
      steps: [
        { text: "Let the original price be x.", tokens: 8 },
        { text: "A 20% discount means the price becomes 0.80·x.", tokens: 13 },
        { text: "Set 0.80·x = 40.", tokens: 8 },
        { text: "x = 40 / 0.80 = 50.", tokens: 11 },
        { text: "Original price: $50.", tokens: 6 },
      ],
      answer: "$50",
      correct: true,
    },

    budget: [
      { budget: 0,  stepsShown: 0, answer: "$48", correct: false, note: "No thinking — blurts a guess." },
      { budget: 15, stepsShown: 2, answer: "$48", correct: false, note: "Starts setup but runs out before solving for x. Still guesses." },
      { budget: 30, stepsShown: 4, answer: "$50", correct: true,  note: "Enough room to set up and solve 0.80·x = 40." },
      { budget: 60, stepsShown: 5, answer: "$50", correct: true,  note: "Plenty of room — same answer, more explanation." },
    ],

    verify: {
      initial: {
        reasoning: "$40 is after a 20% discount, so add back 20% of $40: $40 + (0.20 × $40) = $48.",
        answer: "$48",
        correct: false,
      },
      critique: "Let me check. If the original was $48 and I took 20% off, I'd get 48 × 0.80 = $38.40 — not $40. So $48 can't be right. I need to reverse the discount, not add 20% of the sale price.",
      revised: {
        reasoning: "Let x be the original. 0.80·x = 40 → x = 50. Check: 50 × 0.80 = 40. ✓",
        answer: "$50",
        correct: true,
      },
    },
  },

  {
    id: "logic",
    label: "Logic puzzle",
    problem: "Alice is older than Bob. Bob is older than Carol. Carol is 12 and Alice is 20. What integer ages are possible for Bob?",

    direct: {
      answer: "16",
      correct: false,
      tokens: 2,
      commentary: "Picks the midpoint between 12 and 20 and skips the fact that there's a whole range of valid ages.",
    },

    thinking: {
      steps: [
        { text: "From 'Alice older than Bob older than Carol', Bob sits strictly between Carol's and Alice's ages.", tokens: 18 },
        { text: "Carol is 12, so Bob > 12.", tokens: 8 },
        { text: "Alice is 20, so Bob < 20.", tokens: 8 },
        { text: "Integer ages for Bob: 13, 14, 15, 16, 17, 18, 19.", tokens: 18 },
      ],
      answer: "13–19",
      correct: true,
    },

    budget: [
      { budget: 0,  stepsShown: 0, answer: "16", correct: false, note: "Snap judgement: picks the midpoint." },
      { budget: 15, stepsShown: 1, answer: "16", correct: false, note: "Notices the ordering but hasn't enumerated the range yet." },
      { budget: 30, stepsShown: 3, answer: "13–19", correct: true, note: "Bounded on both sides — correct range emerges." },
      { budget: 60, stepsShown: 4, answer: "13–19", correct: true, note: "Same range, with the integers listed explicitly." },
    ],

    verify: {
      initial: {
        reasoning: "The midpoint of 12 and 20 is 16, so Bob is 16.",
        answer: "16",
        correct: false,
      },
      critique: "Wait — the problem says 'older than', not 'exactly in the middle'. Any age strictly between 12 and 20 works. I gave one value when the question asks for all of them.",
      revised: {
        reasoning: "Bob > 12 and Bob < 20. Integer ages: 13, 14, 15, 16, 17, 18, 19.",
        answer: "13–19",
        correct: true,
      },
    },
  },

  {
    id: "multihop",
    label: "Multi-hop factual",
    problem: "What's the official language of the country where the host city of the 2016 Summer Olympics is located?",

    direct: {
      answer: "Spanish",
      correct: false,
      tokens: 2,
      commentary: "Pattern-matches 'Olympics' and 'Latin America' to Spanish without checking which country actually hosted.",
    },

    thinking: {
      steps: [
        { text: "The 2016 Summer Olympics were held in Rio de Janeiro.", tokens: 13 },
        { text: "Rio de Janeiro is in Brazil.", tokens: 8 },
        { text: "Brazil's official language is Portuguese.", tokens: 8 },
        { text: "Answer: Portuguese.", tokens: 4 },
      ],
      answer: "Portuguese",
      correct: true,
    },

    budget: [
      { budget: 0,  stepsShown: 0, answer: "Spanish", correct: false, note: "Pattern-matches without checking any of the hops." },
      { budget: 15, stepsShown: 2, answer: "Spanish", correct: false, note: "Gets to Brazil but reaches for a familiar language before the language-of-Brazil step." },
      { budget: 30, stepsShown: 3, answer: "Portuguese", correct: true, note: "All three hops chained: Olympics → Rio → Brazil → Portuguese." },
      { budget: 60, stepsShown: 4, answer: "Portuguese", correct: true, note: "Same chain with the final answer stated explicitly." },
    ],

    verify: {
      initial: {
        reasoning: "The 2016 Olympics were in a Latin American country, so the official language is Spanish.",
        answer: "Spanish",
        correct: false,
      },
      critique: "Not every Latin American country speaks Spanish. The 2016 Olympics were in Rio de Janeiro, which is in Brazil — and Brazil's official language is Portuguese, not Spanish.",
      revised: {
        reasoning: "2016 Olympics → Rio de Janeiro → Brazil → Portuguese.",
        answer: "Portuguese",
        correct: true,
      },
    },
  },
];

export const DEFAULT_SCENARIO = "math";

export function findScenario(id) {
  return REASON_SCENARIOS.find(s => s.id === id) || REASON_SCENARIOS[0];
}
