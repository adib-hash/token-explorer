# SPEC — Reason unit (Chapter 3, Intelligence, Phase 4)

## Purpose

Teach the user **why reasoning models cost more and work better** by making the "think-first" behavior visible. After this unit a learner should understand:

1. Direct next-token prediction often fails on multi-step problems.
2. Writing an intermediate "scratchpad" (chain of thought) is what fixes it.
3. More reasoning tokens → more compute → better accuracy, up to a point.
4. A second "check your work" pass catches errors the first pass missed.

Pedagogically this extends the Predict unit (which ended at single-token next-word prediction) into multi-step token generation.

## Architecture

Mirrors the existing Predict unit (`src/units/predict/`). One top-level unit, three sub-views selected via a local sub-tab strip.

```
src/units/reason/
  Reason.jsx         ← top-level unit component, sub-tab switcher, scenario picker
  data.js            ← REASON_SCENARIOS array (hand-picked, not live model)
  views/
    DirectVsThinking.jsx
    Budget.jsx
    SelfVerify.jsx
```

**Sub-views:**

| id           | label                   | icon        | what it shows                                                  |
|--------------|-------------------------|-------------|----------------------------------------------------------------|
| `direct`     | Direct vs Thinking      | `Split`     | Same problem, two panels side by side: one-shot wrong answer vs. step-by-step right answer. Typewriter reveal. |
| `budget`     | Thinking budget         | `Gauge`     | Slider: 0 / 3 / 10 / 30 reasoning tokens. Shows truncated trace, answer, correctness, token cost. Accuracy flips at threshold. |
| `verify`     | Self-check              | `ShieldCheck` | Two-stage: initial answer, then a verifier pass that critiques and revises. |

Top-level unit icon: `Brain` (lucide-react).

## Scenarios (data.js)

Three hand-picked problems, same count as Predict. Each is a problem that a direct response gets wrong but a chain-of-thought gets right.

### 1. `math` — "shirt discount"
- **Problem:** "A shirt costs $40 after a 20% discount. What was the original price?"
- **Direct (wrong):** "$48" — intuitive but subtracts 20% of $40, not 20% of the original.
- **Thinking (right):** 5 steps reaching $50.
  1. Let original price = x.
  2. After a 20% discount, the price is x × 0.80.
  3. So 0.80x = 40.
  4. x = 40 / 0.80 = 50.
  5. The original price was **$50**.

### 2. `logic` — "relative ages"
- **Problem:** "Alice is older than Bob. Bob is older than Carol. Carol is 12 and Alice is 20. What's the range of possible ages for Bob?"
- **Direct (wrong):** "16" — picks the midpoint, ignoring the strict inequality.
- **Thinking (right):** 4 steps.
  1. From "Alice > Bob > Carol," Bob's age is strictly between Carol's and Alice's.
  2. Carol is 12, so Bob > 12.
  3. Alice is 20, so Bob < 20.
  4. Bob is any integer **from 13 to 19 inclusive**.

### 3. `multihop` — "multi-hop factual"
- **Problem:** "What's the official language of the country where the origin city of the 2016 Summer Olympics is located?"
- **Direct (wrong):** "Spanish" — confuses Olympic host country with a commonly-associated Hispanic country.
- **Thinking (right):** 4 steps.
  1. The 2016 Summer Olympics were held in Rio de Janeiro.
  2. Rio de Janeiro is in Brazil.
  3. Brazil's official language is Portuguese.
  4. Answer: **Portuguese**.

> Every viz labels itself as **illustrative — hand-picked steps, not live model output**, matching Predict's tone.

## Data shape

```js
// src/units/reason/data.js
export const REASON_SCENARIOS = [
  {
    id: "math",
    label: "Math word problem",
    problem: "A shirt costs $40 after a 20% discount. What was the original price?",

    direct: {
      answer: "$48",
      correct: false,
      tokens: 4,
      commentary: "Intuitive but wrong. Adds 20% to $40 instead of reversing the discount.",
    },

    thinking: {
      steps: [
        { text: "Let the original price be x.",                 tokens: 8 },
        { text: "A 20% discount means the price becomes 0.80·x.", tokens: 13 },
        { text: "Set 0.80·x = 40.",                              tokens: 8 },
        { text: "x = 40 / 0.80 = 50.",                           tokens: 11 },
        { text: "Original price: $50.",                          tokens: 6 },
      ],
      answer: "$50",
      correct: true,
    },

    // budget view: budget=N tokens → model stops after some step, guesses an answer.
    // Threshold is where accuracy flips.
    budget: [
      { budget: 0,  stepsShown: 0, answer: "$48", correct: false, note: "No thinking, jumps to a guess."             },
      { budget: 15, stepsShown: 2, answer: "$48", correct: false, note: "Starts but runs out before solving for x."   },
      { budget: 30, stepsShown: 4, answer: "$50", correct: true,  note: "Just enough to set up and solve the equation." },
      { budget: 60, stepsShown: 5, answer: "$50", correct: true,  note: "Plenty — same right answer, more explanation." },
    ],

    verify: {
      initial: {
        reasoning: "If something is $40 after 20% off, add back 20%: $40 + (0.20 × $40) = $48.",
        answer: "$48",
        correct: false,
      },
      critique: "Let me check. If the original was $48 and we took 20% off, we'd get 48 × 0.80 = $38.40, not $40. So $48 can't be right.",
      revised: {
        reasoning: "Let x be original. 0.80·x = 40 → x = 50. Check: 50 × 0.80 = 40. ✓",
        answer: "$50",
        correct: true,
      },
    },
  },
  // ...analogous shape for "logic" and "multihop"
];

export const DEFAULT_SCENARIO = "math";
```

## Sub-view specs

### DirectVsThinking.jsx

**Layout:**
```
┌─ Problem prompt card ────────────────────────────┐
│ A shirt costs $40 after a 20% discount. What was │
│ the original price?                              │
└──────────────────────────────────────────────────┘

┌─ DIRECT (no thinking) ──┬─ WITH THINKING ─────────┐
│                         │ 1. Let original = x.    │
│          $48            │ 2. 0.80·x = price…      │
│          ✗              │ 3. 0.80·x = 40          │
│                         │ 4. x = 40/0.80 = 50     │
│  Answer in 4 tokens     │ 5. Original: $50  ✓     │
│                         │                         │
│  "Adds 20% to $40       │  Answer in 46 tokens    │
│   instead of reversing  │                         │
│   the discount."        │                         │
└─────────────────────────┴─────────────────────────┘
         [Replay ↻]
```

- Steps reveal one at a time with a short fade-up animation on mount / replay (use `fadeSlideIn` keyframe from `theme.js`, already defined).
- Replay button re-triggers the staggered reveal.
- Desktop: two columns 50/50. Mobile (<768px): single column, Direct first, then Thinking — same viewport rules as Token Space (`useMediaQuery`).
- Color language: direct panel = `palette.danger` accents on the ✗; thinking panel = `palette.accent` accents + `palette.success` on the ✓.

### Budget.jsx

**Layout:**
```
┌─ Problem prompt card ────────────────────────────┐
│ ...                                              │
└──────────────────────────────────────────────────┘

Thinking budget:
  [────●────────────────]     0   15   30   60
                              ↑ four discrete stops

┌─ Trace (truncated to budget) ────────────────────┐
│ 1. Let original = x.                             │
│ 2. A 20% discount means the price is 0.80·x.     │
│ ⋯ (ran out of budget)                            │
└──────────────────────────────────────────────────┘

Answer: $48  ✗       Cost: 15 tokens
```

- Slider is 4 discrete stops (not continuous) — `<input type="range" min=0 max=3>` mapped to the budget array.
- As the user moves the slider, the trace grows/shrinks; the answer pill flips between ✗ and ✓ at the correctness threshold with a small pulse animation (use `pulseGlow` keyframe, already defined).
- Token counter in a prominent monospace readout on the right.
- Below the viz, a tiny "read me" caption explains what happened at the current budget (pulled from the scenario's `note` field).

### SelfVerify.jsx

**Layout:**
```
┌─ Problem prompt card ────────────────────────────┐
│ ...                                              │
└──────────────────────────────────────────────────┘

Stage 1 — Initial answer
┌──────────────────────────────────────────────────┐
│ "If something is $40 after 20% off, add back 20%:│
│  $40 + (0.20 × $40) = $48."                      │
│                                                  │
│           Answer: $48  ✗                         │
└──────────────────────────────────────────────────┘

              ↓ second pass

Stage 2 — Self-check
┌──────────────────────────────────────────────────┐
│ "Let me check. If the original was $48 and we    │
│  took 20% off, we'd get 48 × 0.80 = $38.40,      │
│  not $40. So $48 can't be right."                │
│                                                  │
│ Revised: "Let x be original. 0.80·x = 40 →       │
│           x = 50. Check: 50 × 0.80 = 40. ✓"      │
│                                                  │
│           Answer: $50  ✓                         │
└──────────────────────────────────────────────────┘
```

- Two cards, stage 1 revealed first, stage 2 slides in after a 600ms delay (or on a "Run self-check" button — designer's call; I'd default to button-gated so the learner sees the mistake before the critique). Recommendation: **button-gated** for pedagogy.
- Colored accent line on the left of each card (red for stage 1 when wrong, green for stage 2 when right).

## Shared pieces

- Scenario picker: same horizontal pill strip as Predict (`PREDICT_SCENARIOS` in `src/units/predict/Predict.jsx`) — can lift into a small `<ScenarioPicker>` component in `src/shared/ui/` later if we want DRY. For this SPEC, **copy the pattern inline** (matches existing conventions and avoids premature abstraction).
- Sub-tab strip: same as Predict's `VIEWS` array. Lucide icons: `Split`, `Gauge`, `ShieldCheck`.
- Layout wrapper: standard unit wrapper matching Tokenizer/Context Window — `maxWidth: 960px; margin: 0 auto; padding: 16px`. This is **not** the desktop-workbench layout; scroll-in-flow is fine because there's no wheel-zoom conflict.
- `<IntroPanel>` at the top (uses the new tagline + modal pattern).
- `<UnitNav>` at the bottom.

## curriculum.js addition

Append to Chapter 3 ("intelligence") units, after `predict`:

```js
{
  id: "reason",
  title: "Reason",
  iconName: "Brain",
  tagline: "Thinking out loud, one step at a time.",
  whyItMatters:
    "Ask an LLM a hard multi-step question and it often blurts a wrong answer on instinct. Make it 'think out loud' first — write down intermediate steps — and the same model gets it right. That's chain of thought. Modern 'reasoning' models like o1 and Claude's extended thinking mode do this automatically, which is why they cost more tokens but answer harder questions.",
  concepts: ["chain of thought", "test-time compute", "scratchpad", "self-verification"],
  furtherReading: [
    { label: "Chain-of-Thought Prompting — Wei et al.", href: "https://arxiv.org/abs/2201.11903" },
    { label: "OpenAI — Learning to reason with LLMs (o1)", href: "https://openai.com/index/learning-to-reason-with-llms/" },
    { label: "Anthropic — Claude's extended thinking", href: "https://docs.claude.com/en/docs/build-with-claude/extended-thinking" },
  ],
},
```

Remove the `// Phase 4: Reason` comment.

## App.jsx additions

- Import `Reason` from `./units/reason/Reason.jsx`.
- Register in `UNIT_COMPONENTS["reason"] = Reason`.
- Register in `TAB_ICONS["reason"] = Brain` (add `Brain` to the lucide-react import).

## Utilities

No new shared utils needed. The existing `fadeSlideIn` and `pulseGlow` keyframes in `src/theme.js` cover the animations. If we want a "stagger the step reveal," a simple `setTimeout` loop in a `useEffect` on mount/replay is enough — no need for a library.

## Copy rules

- Taglines in `<50 chars`.
- Problem prompts: 1–2 sentences, conversational.
- Step text: ≤15 words per step where possible. One idea per step.
- Never use emoji in UI (CLAUDE.md rule). `✓` and `✗` Unicode are OK as already used in Predict.
- Every viz surfaces a small italicized footnote: *"Illustrative — hand-picked steps, not live model output."* (matches Predict).

## Files to create

- `src/units/reason/Reason.jsx`
- `src/units/reason/data.js`
- `src/units/reason/views/DirectVsThinking.jsx`
- `src/units/reason/views/Budget.jsx`
- `src/units/reason/views/SelfVerify.jsx`

## Files to modify

- `src/shared/data/curriculum.js` — add the `reason` unit entry, remove Phase 4 comment.
- `src/App.jsx` — register component + tab icon.
- `package.json` + `CHANGELOG.md` — bump to `v1.5.0` (new module = minor bump), add a changelog entry.

## Deferred / out of scope

- **Self-consistency / majority-vote sampling** (option 4 the user did not pick) — deferred. Could be a future v1.6 add.
- **Branching tree-of-thought** — deferred.
- **Live API / real model inference** — not in scope, matches the rest of the app.

## Verification

1. `npm run build` — succeeds with no errors.
2. `npm run dev`, open `http://localhost:3000/`, navigate: Home → Reason tab.
3. Switch between the 3 sub-views. Each renders, animates on scenario change, and explains itself.
4. Switch between the 3 scenarios in each sub-view. Each scenario has sensible direct/thinking/budget/verify data.
5. Confirm UnitNav: Previous = Predict, Next = null (Reason is the last unit until Agents lands).
6. Mobile viewport: Direct-vs-Thinking stacks vertically; Budget slider is reachable; SelfVerify cards stack.
7. Click "Learn more" — modal appears, ESC closes, content is readable.
8. Run the whole mobile-bug checklist from CLAUDE.md once before committing.

## Open questions for Adib

1. **SelfVerify reveal — button-gated or auto?** I recommend button-gated ("Run self-check") so the learner sees the wrong answer first. OK?
2. **Are the three scenarios the right mix?** Math / logic / multi-hop factual. Open to swapping multi-hop for a counterfactual ("if gravity were twice as strong, what would happen to ocean tides?") if you prefer.
3. **Icon for Reason tab — `Brain`?** Alternatives: `Lightbulb`, `Route`, `Sparkles`. `Brain` is on-the-nose.
4. **Budget slider stops — 0 / 15 / 30 / 60 or something different?** These values are illustrative not real. Happy to tune.
