export function simpleTokenize(word) {
  const w = word.toLowerCase();
  if (w.length <= 2) return [w];

  const prefixes = ["anti","auto","bi","co","counter","de","dis","down","extra","fore","hyper","il","im","in","inter","ir","mal","micro","mid","mis","mono","multi","non","out","over","poly","post","pre","pro","pseudo","re","semi","sub","super","trans","tri","ultra","un","under","up"];
  const suffixes = ["ization","ments","ness","ment","tion","sion","ious","eous","ible","able","less","ness","ling","ally","ical","ence","ance","ular","ular","ous","ful","ive","ing","ish","ist","ism","ity","ize","ise","ory","ary","ery","dom","age","ate","ify","ent","ant","ure","ial","ous","ive","ess","eer","ard","let","kin","ed","en","er","ly","al","ty","th"];

  prefixes.sort((a, b) => b.length - a.length);
  suffixes.sort((a, b) => b.length - a.length);

  const result = [];
  let remaining = w;

  let foundPrefix = true;
  while (foundPrefix && remaining.length > 2) {
    foundPrefix = false;
    for (const p of prefixes) {
      if (remaining.startsWith(p) && remaining.length > p.length + 1) {
        result.push(p);
        remaining = remaining.slice(p.length);
        foundPrefix = true;
        break;
      }
    }
  }

  const suffixParts = [];
  let foundSuffix = true;
  while (foundSuffix && remaining.length > 2) {
    foundSuffix = false;
    for (const s of suffixes) {
      if (remaining.endsWith(s) && remaining.length > s.length + 1) {
        suffixParts.unshift(s);
        remaining = remaining.slice(0, -s.length);
        foundSuffix = true;
        break;
      }
    }
  }

  if (remaining.length > 0) {
    result.push(remaining);
  }
  result.push(...suffixParts);

  return result;
}

export function computeSimilarity(query, text) {
  const qWords = new Set(query.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const tWords = new Set(text.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  if (qWords.size === 0) return 0.5;
  let matches = 0;
  for (const w of qWords) {
    for (const t of tWords) {
      if (t.includes(w) || w.includes(t)) { matches++; break; }
    }
  }
  return Math.min(0.99, 0.3 + (matches / qWords.size) * 0.65);
}

export function softmax(logits, temperature = 1) {
  const t = Math.max(0.0001, temperature);
  const scaled = logits.map(l => l / t);
  const maxL = Math.max(...scaled);
  const exps = scaled.map(l => Math.exp(l - maxL));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
