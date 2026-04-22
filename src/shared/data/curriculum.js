export const CHAPTERS = [
  {
    id: "foundations",
    title: "Foundations",
    subtitle: "Representation",
    description: "How LLMs turn language into numbers and numbers back into language.",
    units: [
      {
        id: "token-space",
        title: "Token Space",
        iconName: "Orbit",
        tagline: "Words as points in space.",
        whyItMatters:
          "Every word an LLM knows lives as a point in a high-dimensional space. Similar meanings cluster together. This geometry is how the model 'understands' relationships between concepts.",
        concepts: ["embeddings", "vectors", "similarity", "semantic space"],
        furtherReading: [
          { label: "Illustrated Word2Vec — Jay Alammar", href: "https://jalammar.github.io/illustrated-word2vec/" },
        ],
      },
      {
        id: "tokenizer",
        title: "Tokenizer",
        iconName: "Scissors",
        tagline: "Breaking words into pieces.",
        whyItMatters:
          "Models don't see words — they see tokens, the ~100k fragments that make up their vocabulary. Understanding tokenization explains why 'strawberry' has 3 Rs but an LLM sometimes miscounts them.",
        concepts: ["subwords", "morphemes", "BPE", "vocabulary"],
        furtherReading: [
          { label: "OpenAI tokenizer playground", href: "https://platform.openai.com/tokenizer" },
        ],
      },
    ],
  },
  {
    id: "memory",
    title: "Memory",
    subtitle: "State",
    description: "How LLMs handle conversation, documents, and the information they weren't trained on.",
    units: [
      {
        id: "context-window",
        title: "Context Window",
        iconName: "PanelTop",
        tagline: "The whiteboard the model can see.",
        whyItMatters:
          "An LLM has no memory between messages. Everything it knows about your conversation sits on a fixed-size whiteboard. When the whiteboard fills up, older content falls off — that's why long chats forget.",
        concepts: ["token budget", "system prompt", "overflow", "no persistent memory"],
        furtherReading: [
          { label: "Anthropic — Claude context windows", href: "https://docs.claude.com/en/docs/build-with-claude/context-windows" },
        ],
      },
      {
        id: "rag",
        title: "RAG Pipeline",
        iconName: "Search",
        tagline: "Grounding answers in real documents.",
        whyItMatters:
          "Retrieval-Augmented Generation lets an LLM answer from documents it was never trained on. Instead of trusting the model's memory (which hallucinates), the system looks up relevant text first, then asks the model to answer using only that.",
        concepts: ["embeddings", "vector search", "retrieval", "grounding", "citations"],
        furtherReading: [
          { label: "Pinecone — what is RAG", href: "https://www.pinecone.io/learn/retrieval-augmented-generation/" },
        ],
      },
    ],
  },
  {
    id: "intelligence",
    title: "Intelligence",
    subtitle: "Capability",
    description: "How LLMs actually work, how they learned to reason, and how they became agents.",
    units: [
      {
        id: "predict",
        title: "Predict",
        iconName: "BarChart3",
        tagline: "How the model actually chooses the next word.",
        whyItMatters:
          "An LLM is a next-token predictor. Given any prefix of text, it produces a probability for every possible next token, and picks one. Doing that over and over is how it writes. Attention decides which earlier tokens matter; temperature decides how daring the pick is.",
        concepts: ["attention", "logits", "softmax", "temperature", "auto-regression", "training vs. inference"],
        furtherReading: [
          { label: "The Illustrated Transformer — Jay Alammar", href: "https://jalammar.github.io/illustrated-transformer/" },
          { label: "Let\'s build GPT — Karpathy (YouTube)", href: "https://www.youtube.com/watch?v=kCc8FmEb1nY" },
        ],
      },
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
      // Phase 5: Agents
    ],
  },
];

export const UNIT_ORDER = CHAPTERS.flatMap(ch =>
  ch.units.map(u => ({ ...u, chapterId: ch.id, chapterTitle: ch.title }))
);

export function findUnit(unitId) {
  return UNIT_ORDER.find(u => u.id === unitId);
}

export function neighborUnits(unitId) {
  const idx = UNIT_ORDER.findIndex(u => u.id === unitId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? UNIT_ORDER[idx - 1] : null,
    next: idx < UNIT_ORDER.length - 1 ? UNIT_ORDER[idx + 1] : null,
  };
}
