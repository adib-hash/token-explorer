export const TOKENIZE_EXAMPLES = {
  "unhappily": ["un", "happi", "ly"],
  "tokenization": ["token", "ization"],
  "bioluminescence": ["bio", "lumine", "scence"],
  "learning": ["learn", "ing"],
  "internationalization": ["inter", "national", "ization"],
  "preprocessing": ["pre", "process", "ing"],
  "unbelievable": ["un", "believ", "able"],
  "strawberry": ["straw", "berry"],
  "debugging": ["de", "bug", "ging"],
  "transformer": ["transform", "er"],
};

export const MORPHEME_MEANINGS = {
  "un": "negation / reversal", "happi": "core: state of joy",
  "ly": "manner / adverb marker", "token": "core: symbolic unit",
  "ization": "process of becoming", "bio": "life / living",
  "lumine": "light / glow", "scence": "state or quality",
  "learn": "core: acquire knowledge", "ing": "ongoing action",
  "inter": "between / among", "national": "core: of a nation",
  "pre": "before", "process": "core: series of steps",
  "believ": "core: accept as true", "able": "capable of",
  "straw": "core: dried grain stalks", "berry": "core: small fruit",
  "de": "reverse / remove", "bug": "core: defect / insect",
  "ging": "ongoing action (variant)", "transform": "core: change form",
  "er": "agent / one who does",
};

export const MORPHEME_TYPES = {
  "un": "prefix", "pre": "prefix", "inter": "prefix", "de": "prefix", "bio": "prefix",
  "ly": "suffix", "ing": "suffix", "ization": "suffix", "able": "suffix",
  "er": "suffix", "scence": "suffix", "ging": "suffix",
  "happi": "root", "token": "root", "lumine": "root", "learn": "root",
  "national": "root", "process": "root", "believ": "root", "straw": "root",
  "berry": "root", "bug": "root", "transform": "root",
};

export const MORPHEME_TYPE_COLORS = {
  prefix: { bg: "#0984e320", border: "#0984e360", text: "#74b9ff", label: "Prefix" },
  root:   { bg: "#6c5ce720", border: "#6c5ce760", text: "#a29bfe", label: "Root" },
  suffix: { bg: "#00b89420", border: "#00b89460", text: "#55efc4", label: "Suffix" },
};
