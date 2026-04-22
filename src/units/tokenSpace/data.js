export const VOCAB = {
  "apple":    { pos: [2, 1, 0],    cluster: "food",    color: "#e74c3c" },
  "banana":   { pos: [2.4, 0.6, 0.3], cluster: "food", color: "#f1c40f" },
  "orange":   { pos: [2.2, 1.4, -0.2], cluster: "food", color: "#e67e22" },
  "grape":    { pos: [1.8, 0.8, 0.5], cluster: "food",  color: "#9b59b6" },
  "mango":    { pos: [2.6, 1.2, 0.1], cluster: "food",  color: "#f39c12" },
  "cherry":   { pos: [1.6, 1.3, -0.3], cluster: "food", color: "#c0392b" },
  "learn":    { pos: [-2, 2, 1],   cluster: "education", color: "#3498db" },
  "study":    { pos: [-1.6, 2.3, 0.8], cluster: "education", color: "#2980b9" },
  "teach":    { pos: [-2.3, 1.7, 1.2], cluster: "education", color: "#1abc9c" },
  "school":   { pos: [-1.8, 2.6, 0.5], cluster: "education", color: "#16a085" },
  "book":     { pos: [-2.1, 1.9, 1.5], cluster: "education", color: "#2c3e50" },
  "read":     { pos: [-1.4, 2.1, 1.1], cluster: "education", color: "#34495e" },
  "happy":    { pos: [0, -2, 2],   cluster: "emotion",  color: "#f1c40f" },
  "joy":      { pos: [0.3, -1.7, 2.2], cluster: "emotion", color: "#f39c12" },
  "sad":      { pos: [0.8, -2.5, 1.5], cluster: "emotion", color: "#7f8c8d" },
  "love":     { pos: [-0.2, -1.5, 2.5], cluster: "emotion", color: "#e74c3c" },
  "fear":     { pos: [1.2, -2.8, 1.2], cluster: "emotion", color: "#2c3e50" },
  "anger":    { pos: [1.5, -2.2, 1.8], cluster: "emotion", color: "#c0392b" },
  "code":     { pos: [-1, 0, -2.5],  cluster: "tech",   color: "#00d2ff" },
  "program":  { pos: [-0.7, 0.3, -2.2], cluster: "tech", color: "#0abde3" },
  "function": { pos: [-1.3, -0.2, -2.8], cluster: "tech", color: "#48dbfb" },
  "data":     { pos: [-0.5, 0.6, -2.0], cluster: "tech",  color: "#01a3a4" },
  "model":    { pos: [-1.5, 0.1, -2.3], cluster: "tech",  color: "#00cec9" },
  "token":    { pos: [-0.8, -0.4, -2.6], cluster: "tech", color: "#6c5ce7" },
  "run":      { pos: [3, -1, -1],  cluster: "action",  color: "#e17055" },
  "walk":     { pos: [3.3, -0.7, -0.7], cluster: "action", color: "#fdcb6e" },
  "jump":     { pos: [2.7, -1.3, -1.3], cluster: "action", color: "#00b894" },
  "swim":     { pos: [3.5, -0.4, -0.4], cluster: "action", color: "#0984e3" },
  "fly":      { pos: [2.5, -1.6, -1.6], cluster: "action", color: "#a29bfe" },
  "king":     { pos: [0, 3, -1],   cluster: "royalty",  color: "#ffd700" },
  "queen":    { pos: [0.4, 3.2, -0.7], cluster: "royalty", color: "#daa520" },
  "prince":   { pos: [-0.3, 2.7, -1.2], cluster: "royalty", color: "#b8860b" },
  "castle":   { pos: [0.6, 2.5, -1.5], cluster: "royalty", color: "#8b7355" },
};

export const CLUSTER_COLORS = {
  food: "#e74c3c", education: "#3498db", emotion: "#f1c40f",
  tech: "#00d2ff", action: "#e17055", royalty: "#ffd700",
};

export const CLUSTER_LABELS = {
  food: "Food & Fruit", education: "Learning & Education",
  emotion: "Emotions & Feelings", tech: "Technology & Code",
  action: "Movement & Action", royalty: "Royalty & Power",
};

export const CROSS_CLUSTER_DIST = 4.5;

export const CROSS_CLUSTER_LINKS = (() => {
  const links = [];
  const entries = Object.entries(VOCAB);
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [nameA, dataA] = entries[i];
      const [nameB, dataB] = entries[j];
      if (dataA.cluster === dataB.cluster) continue;
      const d = Math.sqrt(
        (dataA.pos[0] - dataB.pos[0]) ** 2 +
        (dataA.pos[1] - dataB.pos[1]) ** 2 +
        (dataA.pos[2] - dataB.pos[2]) ** 2
      );
      if (d <= CROSS_CLUSTER_DIST) {
        links.push({ a: nameA, b: nameB, dist: d });
      }
    }
  }
  return links;
})();

export function getFirstTokenInCluster(cluster) {
  const entry = Object.entries(VOCAB).find(([, v]) => v.cluster === cluster);
  return entry ? entry[0] : null;
}
