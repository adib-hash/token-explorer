// Each scenario: a curated 5-token prefix, a 5x5 hand-picked attention matrix
// (causal: upper-triangle is zero; each row sums to ~1), and a hand-picked
// top-10 next-token logit distribution. Labels below every viz call these
// out as illustrative, not live model output.

export const PREDICT_SCENARIOS = [
  {
    id: "factual",
    label: "Factual completion",
    prefix: ["The", "capital", "of", "France", "is"],
    attention: [
      [1.00, 0.00, 0.00, 0.00, 0.00],
      [0.20, 0.80, 0.00, 0.00, 0.00],
      [0.10, 0.50, 0.40, 0.00, 0.00],
      [0.05, 0.40, 0.10, 0.45, 0.00],
      [0.06, 0.42, 0.06, 0.40, 0.06],
    ],
    logits: [
      { token: "Paris",     logit: 4.8 },
      { token: "the",       logit: 1.4 },
      { token: "located",   logit: 1.2 },
      { token: "France",    logit: 0.9 },
      { token: "Lyon",      logit: 0.5 },
      { token: "home",      logit: 0.3 },
      { token: "Europe",    logit: 0.1 },
      { token: "beautiful", logit: -0.2 },
      { token: "Marseille", logit: -0.5 },
      { token: "Berlin",    logit: -1.0 },
    ],
    correctToken: "Paris",
    footnote: "Factual recall: attention concentrates on 'France' and 'capital', the two tokens that together pin down the answer.",
  },
  {
    id: "code",
    label: "Code completion",
    prefix: ["function", "add", "(a,", "b)", "{"],
    attention: [
      [1.00, 0.00, 0.00, 0.00, 0.00],
      [0.35, 0.65, 0.00, 0.00, 0.00],
      [0.15, 0.40, 0.45, 0.00, 0.00],
      [0.10, 0.30, 0.35, 0.25, 0.00],
      [0.12, 0.28, 0.22, 0.20, 0.18],
    ],
    logits: [
      { token: "return",    logit: 4.2 },
      { token: "const",     logit: 1.6 },
      { token: "let",       logit: 1.3 },
      { token: "//",        logit: 1.0 },
      { token: "var",       logit: 0.4 },
      { token: "if",        logit: 0.3 },
      { token: "try",       logit: 0.0 },
      { token: "console",   logit: -0.3 },
      { token: "a",         logit: -0.6 },
      { token: "throw",     logit: -1.0 },
    ],
    correctToken: "return",
    footnote: "Code patterns: the model learns that open-brace after a function signature is almost always followed by 'return' or a variable declaration.",
  },
  {
    id: "ambiguous",
    label: "Ambiguous / creative",
    prefix: ["After", "the", "storm", "the", "town"],
    attention: [
      [1.00, 0.00, 0.00, 0.00, 0.00],
      [0.40, 0.60, 0.00, 0.00, 0.00],
      [0.20, 0.30, 0.50, 0.00, 0.00],
      [0.15, 0.25, 0.35, 0.25, 0.00],
      [0.10, 0.20, 0.30, 0.15, 0.25],
    ],
    logits: [
      { token: "was",       logit: 2.4 },
      { token: "felt",      logit: 2.1 },
      { token: "seemed",    logit: 2.0 },
      { token: "looked",    logit: 1.7 },
      { token: "lay",       logit: 1.2 },
      { token: "grew",      logit: 0.9 },
      { token: "stood",     logit: 0.6 },
      { token: "had",       logit: 0.3 },
      { token: "became",    logit: 0.1 },
      { token: "fell",      logit: -0.1 },
    ],
    correctToken: "was",
    footnote: "Ambiguous contexts: no single answer dominates. Temperature matters most here — a low value locks onto 'was' while a higher value lets 'felt' or 'seemed' win.",
  },
];

export const DEFAULT_SCENARIO = "factual";
