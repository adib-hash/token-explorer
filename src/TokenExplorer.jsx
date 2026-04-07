import { useState, useRef, useMemo, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";

// ─── CONSTANTS & DATA ────────────────────────────────────────
const VOCAB = {
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

const CLUSTER_COLORS = {
  food: "#e74c3c", education: "#3498db", emotion: "#f1c40f",
  tech: "#00d2ff", action: "#e17055", royalty: "#ffd700",
};

const CLUSTER_LABELS = {
  food: "Food & Fruit", education: "Learning & Education",
  emotion: "Emotions & Feelings", tech: "Technology & Code",
  action: "Movement & Action", royalty: "Royalty & Power",
};

const TOKENIZE_EXAMPLES = {
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

const MORPHEME_MEANINGS = {
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

const MORPHEME_TYPES = {
  "un": "prefix", "pre": "prefix", "inter": "prefix", "de": "prefix", "bio": "prefix",
  "ly": "suffix", "ing": "suffix", "ization": "suffix", "able": "suffix",
  "er": "suffix", "scence": "suffix", "ging": "suffix",
  "happi": "root", "token": "root", "lumine": "root", "learn": "root",
  "national": "root", "process": "root", "believ": "root", "straw": "root",
  "berry": "root", "bug": "root", "transform": "root",
};

const MORPHEME_TYPE_COLORS = {
  prefix: { bg: "#0984e320", border: "#0984e360", text: "#74b9ff", label: "Prefix" },
  root:   { bg: "#6c5ce720", border: "#6c5ce760", text: "#a29bfe", label: "Root" },
  suffix: { bg: "#00b89420", border: "#00b89460", text: "#55efc4", label: "Suffix" },
};

const palette = {
  bg: "#0a0e1a", surface: "#111827", surfaceHover: "#1a2235",
  border: "#1e293b", text: "#e2e8f0", textDim: "#94a3b8",
  accent: "#6c5ce7", accentGlow: "rgba(108, 92, 231, 0.3)",
  success: "#00b894", warning: "#fdcb6e", danger: "#e17055",
};

// ─── SIMPLE TOKENIZER FOR CUSTOM WORDS ────────────────────────
function simpleTokenize(word) {
  const w = word.toLowerCase();
  if (w.length <= 2) return [w];

  // Common English prefixes, suffixes, and roots (sorted longest-first)
  const prefixes = ["anti","auto","bi","co","counter","de","dis","down","extra","fore","hyper","il","im","in","inter","ir","mal","micro","mid","mis","mono","multi","non","out","over","poly","post","pre","pro","pseudo","re","semi","sub","super","trans","tri","ultra","un","under","up"];
  const suffixes = ["ization","ments","ness","ment","tion","sion","ious","eous","ible","able","less","ness","ling","ally","ical","ence","ance","ular","ular","ous","ful","ive","ing","ish","ist","ism","ity","ize","ise","ory","ary","ery","dom","age","ate","ify","ent","ant","ure","ial","ous","ive","ess","eer","ard","let","kin","ed","en","er","ly","al","ty","th"];

  prefixes.sort((a, b) => b.length - a.length);
  suffixes.sort((a, b) => b.length - a.length);

  const result = [];
  let remaining = w;

  // Extract prefixes
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

  // Extract suffixes from the end
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

  // Whatever is left is the root/stem
  if (remaining.length > 0) {
    result.push(remaining);
  }
  result.push(...suffixParts);

  return result;
}

// ─── RAG SIMILARITY FUNCTION ────────────────────────────────
function computeSimilarity(query, text) {
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

function getFirstTokenInCluster(cluster) {
  const entry = Object.entries(VOCAB).find(([, v]) => v.cluster === cluster);
  return entry ? entry[0] : null;
}

const CROSS_CLUSTER_DIST = 4.5;
const CROSS_CLUSTER_LINKS = (() => {
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

// ─── THREE.JS CLUSTER SPHERE ────────────────────────────────
function ClusterSphere({ position, color, label, onClick, isHidden }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const clickScaleRef = useRef(1);

  useFrame(() => {
    if (!meshRef.current) return;
    const target = isHidden ? 0 : 1;

    // Click pulse animation (3a)
    if (clicked) {
      clickScaleRef.current = THREE.MathUtils.lerp(clickScaleRef.current, 1.4, 0.15);
      if (clickScaleRef.current > 1.38) {
        setClicked(false);
      }
    } else {
      clickScaleRef.current = THREE.MathUtils.lerp(clickScaleRef.current, 1.0, 0.1);
    }

    const s = target * clickScaleRef.current;
    meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);

    // Gentle float
    if (!isHidden) {
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.002 + position[0]) * 0.04;
    }
  });

  if (isHidden) return null;

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); setClicked(true); onClick(); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.35, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.6 : 0.3}
        roughness={0.2}
        metalness={0.3}
        transparent
        opacity={0.9}
      />
      <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div style={{
          fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.9)",
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase", letterSpacing: "0.5px",
          textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          whiteSpace: "nowrap", userSelect: "none",
        }}>
          {label}
        </div>
      </Html>
      {/* Glow ring */}
      {hovered && (
        <mesh>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      )}
    </mesh>
  );
}

// ─── THREE.JS TOKEN LABEL ────────────────────────────────
function TokenLabel({ name, data, isSelected, isNearby, dimmed, position, onClick }) {
  return (
    <Html position={position} center distanceFactor={8} style={{ pointerEvents: "auto" }}>
      <div
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        style={{
          padding: "5px 12px", borderRadius: "7px", fontSize: "11px",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontWeight: isSelected ? 700 : 500,
          color: dimmed ? palette.textDim + "40" : isSelected ? "#fff" : palette.text,
          background: isSelected ? data.color + "55" : isNearby ? data.color + "25" : palette.surface + "cc",
          border: `1.5px solid ${isSelected ? data.color : isNearby ? data.color + "60" : palette.border + "60"}`,
          boxShadow: isSelected
            ? `0 0 16px ${data.color}50, 0 0 32px ${data.color}20`
            : isNearby ? `0 0 8px ${data.color}20` : `0 2px 6px rgba(0,0,0,0.25)`,
          cursor: "pointer",
          transition: "background 0.3s, border 0.3s, box-shadow 0.3s, opacity 0.4s, color 0.3s",
          whiteSpace: "nowrap",
          opacity: dimmed ? 0.15 : 1,
          WebkitTapHighlightColor: "transparent",
          userSelect: "none",
        }}
      >
        {name}
      </div>
    </Html>
  );
}

// ─── THREE.JS CONNECTION LINE ────────────────────────────────
function ConnectionLine({ start, end, color, dashed, opacity }) {
  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={dashed ? 1.5 : 2}
      dashed={dashed}
      dashSize={0.15}
      gapSize={0.1}
      transparent
      opacity={opacity}
    />
  );
}

// AutoRotate is handled via OrbitControls autoRotate prop

// ─── CAMERA ZOOM CONTROLLER ────────────────────────────────
const DEFAULT_CAM_POS = [5, 4, 8];

const CameraZoomController = forwardRef(function CameraZoomController(_, ref) {
  const { camera } = useThree();
  
  useImperativeHandle(ref, () => ({
    zoomIn() {
      const dir = camera.position.clone().normalize();
      const dist = camera.position.length();
      const newDist = Math.max(4, dist - 1.2);
      camera.position.copy(dir.multiplyScalar(newDist));
    },
    zoomOut() {
      const dir = camera.position.clone().normalize();
      const dist = camera.position.length();
      const newDist = Math.min(16, dist + 1.2);
      camera.position.copy(dir.multiplyScalar(newDist));
    },
    resetZoom() {
      camera.position.set(...DEFAULT_CAM_POS);
      camera.lookAt(0, 0, 0);
    },
    getDistance() {
      return camera.position.length();
    },
  }));

  return null;
});

// ─── MAIN 3D SCENE ────────────────────────────────────
function TokenSpaceScene({ selectedToken, onSelectToken, selectedCluster, cameraRef }) {
  const tokens = Object.entries(VOCAB);
  const SPREAD_FACTOR = 1.4;
  // 1b: removed unused controlsRef

  // Cluster centroids
  const centroids = useMemo(() => {
    const result = {};
    for (const [cluster] of Object.entries(CLUSTER_COLORS)) {
      const ct = tokens.filter(([, v]) => v.cluster === cluster);
      result[cluster] = [
        ct.reduce((s, [, v]) => s + v.pos[0], 0) / ct.length,
        ct.reduce((s, [, v]) => s + v.pos[1], 0) / ct.length,
        ct.reduce((s, [, v]) => s + v.pos[2], 0) / ct.length,
      ];
    }
    return result;
  }, []);

  // Spread position for selected cluster tokens
  const getSpreadPos = useCallback((data) => {
    if (!selectedCluster || data.cluster !== selectedCluster) return data.pos;
    const c = centroids[data.cluster];
    const dx = data.pos[0] - c[0];
    const dy = data.pos[1] - c[1];
    const dz = data.pos[2] - c[2];
    return [
      dx * (1 + SPREAD_FACTOR),
      dy * (1 + SPREAD_FACTOR),
      dz * (1 + SPREAD_FACTOR),
    ];
  }, [selectedCluster, centroids]);

  // Which tokens to show
  const visibleTokens = useMemo(() => {
    if (!selectedCluster) return tokens;
    return tokens.filter(([, data]) => data.cluster === selectedCluster);
  }, [selectedCluster, tokens]);

  // Cross-cluster links for selected cluster
  const crossLinks = useMemo(() => {
    if (!selectedCluster) return [];
    return CROSS_CLUSTER_LINKS.filter(
      l => VOCAB[l.a].cluster === selectedCluster || VOCAB[l.b].cluster === selectedCluster
    );
  }, [selectedCluster]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -5, -10]} intensity={0.4} color="#6c5ce7" />

      <CameraZoomController ref={cameraRef} />

      {/* OrbitControls — smooth drag, scroll zoom, pinch zoom */}
      <OrbitControls
        enableDamping
        dampingFactor={0.12}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        minDistance={4}
        maxDistance={16}
        maxPolarAngle={Math.PI * 0.78}
        minPolarAngle={Math.PI * 0.22}
        enablePan={false}
        autoRotate={!selectedCluster && !selectedToken}
        autoRotateSpeed={0.8}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY }}
      />

      {/* Cluster spheres (only when no cluster is selected) */}
      {Object.entries(CLUSTER_COLORS).map(([cluster, color]) => (
        <ClusterSphere
          key={`sphere-${cluster}`}
          position={centroids[cluster]}
          color={color}
          label={cluster}
          isHidden={!!selectedCluster}
          onClick={() => {
            const first = getFirstTokenInCluster(cluster);
            if (first) onSelectToken(first);
          }}
        />
      ))}

      {/* Cluster background glow (point light at centroid) */}
      {Object.entries(CLUSTER_COLORS).map(([cluster, color]) => {
        const show = !selectedCluster || cluster === selectedCluster;
        if (!show) return null;
        const pos = selectedCluster === cluster ? [0, 0, 0] : centroids[cluster];
        return (
          <pointLight
            key={`glow-${cluster}`}
            position={pos}
            color={color}
            intensity={selectedCluster === cluster ? 2 : 0.6}
            distance={selectedCluster === cluster ? 8 : 4}
          />
        );
      })}

      {/* Intra-cluster connection lines */}
      {selectedToken && VOCAB[selectedToken] && visibleTokens
        .filter(([name]) => name !== selectedToken)
        .map(([name, data]) => {
          const selData = VOCAB[selectedToken];
          const dist = Math.sqrt(
            (data.pos[0] - selData.pos[0]) ** 2 +
            (data.pos[1] - selData.pos[1]) ** 2 +
            (data.pos[2] - selData.pos[2]) ** 2
          );
          if (dist > 2.5) return null;
          const opacity = Math.max(0.15, 1 - dist / 2.5) * 0.6;
          return (
            <ConnectionLine
              key={`line-${name}`}
              start={getSpreadPos(selData)}
              end={getSpreadPos(data)}
              color={data.color}
              dashed={dist > 1.5}
              opacity={opacity}
            />
          );
        })}

      {/* Cross-cluster connection lines */}
      {crossLinks.map((link, i) => {
        const fromSelected = VOCAB[link.a].cluster === selectedCluster ? link.a : link.b;
        const toOther = fromSelected === link.a ? link.b : link.a;
        const opacity = Math.max(0.1, 1 - link.dist / CROSS_CLUSTER_DIST) * 0.4;
        return (
          <ConnectionLine
            key={`cross-${i}`}
            start={getSpreadPos(VOCAB[fromSelected])}
            end={VOCAB[toOther].pos}
            color={VOCAB[toOther].color}
            dashed
            opacity={opacity}
          />
        );
      })}

      {/* Token labels */}
      {visibleTokens.map(([name, data]) => {
        const isSelected = name === selectedToken;
        const isNearby = selectedToken && name !== selectedToken && (() => {
          const s = VOCAB[selectedToken];
          if (!s) return false;
          return Math.sqrt(
            (data.pos[0] - s.pos[0]) ** 2 +
            (data.pos[1] - s.pos[1]) ** 2 +
            (data.pos[2] - s.pos[2]) ** 2
          ) <= 2.5;
        })();
        const dimmed = selectedToken && !isSelected && !isNearby && !selectedCluster;
        const sp = getSpreadPos(data);

        return (
          <TokenLabel
            key={name}
            name={name}
            data={data}
            isSelected={isSelected}
            isNearby={isNearby}
            dimmed={dimmed}
            position={sp}
            onClick={() => onSelectToken(isSelected ? null : name)}
          />
        );
      })}
    </>
  );
}

// ─── TOKENIZER VISUALIZATION ────────────────────────────────
function TokenizerViz({ word, tokens }) {
  const [activeIdx, setActiveIdx] = useState(null);

  const vectors = useMemo(() =>
    tokens.map(() => [
      (Math.random() * 2 - 1).toFixed(2),
      (Math.random() * 2 - 1).toFixed(2),
      (Math.random() * 2 - 1).toFixed(2),
    ]),
    [tokens.join(",")]
  );

  const charCount = word.length;
  const tokenCount = tokens.length;
  const ratio = (charCount / tokenCount).toFixed(1);

  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <span style={{
          fontFamily: "'Georgia', serif", fontSize: "28px",
          color: palette.text, letterSpacing: "2px",
        }}>{word}</span>
        <div style={{
          fontSize: "11px", color: palette.textDim, marginTop: "4px",
          fontFamily: "'JetBrains Mono', monospace",
        }}>raw text input</div>
      </div>

      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        gap: "12px", marginBottom: "16px", flexWrap: "wrap",
      }}>
        <div style={{
          padding: "6px 14px", borderRadius: "8px",
          background: palette.warning + "15", border: `1px solid ${palette.warning}30`,
          fontFamily: "'JetBrains Mono', monospace", fontSize: "12px",
        }}>
          <span style={{ color: palette.warning, fontWeight: 700 }}>{charCount}</span>
          <span style={{ color: palette.textDim }}> chars</span>
        </div>
        <span style={{ color: palette.accent, fontSize: "16px" }}>→</span>
        <div style={{
          padding: "6px 14px", borderRadius: "8px",
          background: palette.accent + "15", border: `1px solid ${palette.accent}30`,
          fontFamily: "'JetBrains Mono', monospace", fontSize: "12px",
        }}>
          <span style={{ color: palette.accent, fontWeight: 700 }}>{tokenCount}</span>
          <span style={{ color: palette.textDim }}> tokens</span>
        </div>
        <div style={{
          padding: "4px 10px", borderRadius: "6px",
          background: palette.surface, border: `1px solid ${palette.border}`,
          fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: palette.textDim,
        }}>{ratio} chars/token</div>
      </div>

      <div style={{
        textAlign: "center", margin: "4px 0 16px", color: palette.accent,
        fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
      }}>↓ subword tokenization ↓</div>

      <div style={{
        display: "flex", justifyContent: "center", gap: "12px",
        marginBottom: "14px", flexWrap: "wrap",
      }}>
        {Object.entries(MORPHEME_TYPE_COLORS).map(([type, style]) => (
          <div key={type} style={{
            display: "flex", alignItems: "center", gap: "4px",
            fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: style.text,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "2px",
              background: style.bg, border: `1px solid ${style.border}`,
            }} />
            {style.label}
          </div>
        ))}
      </div>

      <div style={{
        display: "flex", justifyContent: "center",
        gap: "8px", flexWrap: "wrap", marginBottom: "20px",
      }}>
        {tokens.map((tok, i) => {
          const isActive = activeIdx === i;
          const type = MORPHEME_TYPES[tok] || "root";
          const typeStyle = MORPHEME_TYPE_COLORS[type];
          return (
            <div key={`${word}-${i}`}
              onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)}
              onClick={() => setActiveIdx(isActive ? null : i)}
              style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
            >
              <div style={{
                padding: "10px 18px", borderRadius: "8px",
                background: isActive ? typeStyle.bg.replace("20", "40") : typeStyle.bg,
                border: `2px solid ${isActive ? typeStyle.border.replace("60", "cc") : typeStyle.border}`,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "18px", fontWeight: 600, color: typeStyle.text,
                transition: "all 0.2s ease",
                boxShadow: isActive ? `0 0 20px ${typeStyle.border.replace("60", "30")}` : "none",
              }}>{tok}</div>
              <div style={{
                fontSize: "10px", color: palette.textDim, marginTop: "4px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>{type} · #{i + 1}</div>
              {isActive && MORPHEME_MEANINGS[tok] && (
                <div style={{
                  position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
                  transform: "translateX(-50%)",
                  maxWidth: "90vw", whiteSpace: "normal",
                  padding: "6px 12px", borderRadius: "6px",
                  background: palette.surface, border: `1px solid ${palette.border}`,
                  fontSize: "10px", color: palette.text,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)", zIndex: 100,
                  fontFamily: "'JetBrains Mono', monospace",
                  animation: "fadeSlideIn 0.2s ease",
                }}>
                  {MORPHEME_MEANINGS[tok]}
                  <div style={{
                    position: "absolute", bottom: "-4px", left: "50%",
                    transform: "translateX(-50%) rotate(45deg)",
                    width: "8px", height: "8px",
                    background: palette.surface, borderRight: `1px solid ${palette.border}`,
                    borderBottom: `1px solid ${palette.border}`,
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        padding: "12px 16px", borderRadius: "8px",
        background: palette.surface, border: `1px solid ${palette.border}`,
      }}>
        <div style={{
          fontSize: "10px", color: palette.textDim, marginBottom: "8px",
          fontFamily: "'JetBrains Mono', monospace",
        }}>embedding vectors (simplified — real vectors have 768+ dimensions)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {tokens.map((tok, i) => {
            const type = MORPHEME_TYPES[tok] || "root";
            const typeStyle = MORPHEME_TYPE_COLORS[type];
            return (
              <div key={`vec-${i}`} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "4px 8px", borderRadius: "4px",
                background: activeIdx === i ? typeStyle.bg : "transparent",
                transition: "background 0.2s",
              }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px", color: typeStyle.text, fontWeight: 600, minWidth: "80px",
                }}>{tok}</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px", color: palette.textDim,
                }}>[{vectors[i].join(", ")}]</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CONTEXT WINDOW VISUALIZATION ────────────────────────────────

const WHITEBOARD_SCENARIOS = [
  {
    id: "chat",
    label: "Quick Chat",
    prompt: "What's the capital of France?",
    response: "The capital of France is Paris. It's the largest city in France and serves as the country's political, economic, and cultural center.",
    systemSize: 3,
    promptSize: 8,
    responseSize: 12,
    contextLimit: 100,
  },
  {
    id: "code",
    label: "Code Review",
    prompt: "Review this React component for performance issues:\n\nfunction UserList({ users }) {\n  const [filter, setFilter] = useState('');\n  const filtered = users.filter(u =>\n    u.name.toLowerCase().includes(filter)\n  );\n  return (\n    <div>\n      <input onChange={e => setFilter(e.target.value)} />\n      {filtered.map(u => <UserCard key={u.id} user={u} />)}\n    </div>\n  );\n}",
    response: "I see a few performance issues:\n\n1. filtered recalculates on every render — wrap it in useMemo.\n2. The input onChange creates a new function each render — use useCallback.\n3. UserCard likely needs React.memo to prevent unnecessary re-renders.\n\nHere's the optimized version:\n\nfunction UserList({ users }) {\n  const [filter, setFilter] = useState('');\n  const handleChange = useCallback(e => setFilter(e.target.value), []);\n  const filtered = useMemo(() =>\n    users.filter(u => u.name.toLowerCase().includes(filter)),\n    [users, filter]\n  );\n  return (\n    <div>\n      <input onChange={handleChange} />\n      {filtered.map(u => <UserCard key={u.id} user={u} />)}\n    </div>\n  );\n}",
    systemSize: 5,
    promptSize: 30,
    responseSize: 45,
    contextLimit: 100,
  },
  {
    id: "long",
    label: "Long Document",
    prompt: "Summarize this 50-page research paper on climate change mitigation strategies, carbon capture technology, renewable energy adoption rates across different economies, policy frameworks for emissions reduction, and the economic impacts of transitioning away from fossil fuels...\n\n[... 49 more pages of dense academic text covering methodology, findings across 30 countries, statistical analyses, future projections through 2050, and policy recommendations ...]",
    response: "Key findings from the paper:\n\n1. Carbon capture is viable but expensive — $50-120/ton\n2. Solar adoption outpacing projections by 3x\n3. Policy matters more than technology alone",
    systemSize: 3,
    promptSize: 85,
    responseSize: 10,
    contextLimit: 100,
  },
  {
    id: "overflow",
    label: "Overflow",
    prompt: "Here's my entire codebase — all 200 files, including every test, config file, and documentation page. I need you to understand all of it and then refactor the authentication system while maintaining backwards compatibility with every existing API consumer...\n\n[... massive codebase dump: hundreds of files, thousands of lines, entire git history, CI/CD configs, deployment scripts, database schemas ...]",
    response: "",
    systemSize: 5,
    promptSize: 120,
    responseSize: 25,
    contextLimit: 100,
  },
];

function ContextWindowViz() {
  const [activeScenario, setActiveScenario] = useState("chat");
  const [phase, setPhase] = useState("empty"); // empty, system, prompt, responding, done, overflow
  const [animProgress, setAnimProgress] = useState(0);

  const scenario = WHITEBOARD_SCENARIOS.find(s => s.id === activeScenario);
  const { systemSize, promptSize, responseSize, contextLimit } = scenario;
  const totalNeeded = systemSize + promptSize + responseSize;
  const isOverflow = totalNeeded > contextLimit;

  // 1a: Dedicated function that sets both scenario and resets phase together
  const switchToScenario = useCallback((scenarioId) => {
    setActiveScenario(scenarioId);
    setPhase("empty");
    setAnimProgress(0);
  }, []);

  // Reset when scenario changes
  useEffect(() => {
    setPhase("empty");
    setAnimProgress(0);
  }, [activeScenario]);

  // Animation timer
  useEffect(() => {
    if (phase === "empty") {
      const t = setTimeout(() => setPhase("system"), 600);
      return () => clearTimeout(t);
    }
    if (phase === "system") {
      const t = setTimeout(() => setPhase("prompt"), 800);
      return () => clearTimeout(t);
    }
    if (phase === "prompt") {
      const t = setTimeout(() => {
        if (isOverflow) {
          setPhase("overflow");
        } else {
          setPhase("responding");
          setAnimProgress(0);
        }
      }, 1200);
      return () => clearTimeout(t);
    }
    if (phase === "responding") {
      const interval = setInterval(() => {
        setAnimProgress(p => {
          if (p >= 1) {
            clearInterval(interval);
            setPhase("done");
            return 1;
          }
          return p + 0.04;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase, isOverflow]);

  // Calculate fill amounts
  const systemFill = phase === "empty" ? 0 : systemSize;
  const promptFill = phase === "empty" || phase === "system" ? 0 : promptSize;
  const responseFill = (phase === "responding" || phase === "done")
    ? responseSize * (phase === "done" ? 1 : animProgress)
    : 0;
  const totalFill = systemFill + promptFill + responseFill;
  const systemPercent = (systemFill / contextLimit) * 100;
  const promptPercent = (promptFill / contextLimit) * 100;
  const responsePercent = (responseFill / contextLimit) * 100;

  const replay = () => {
    setPhase("empty");
    setAnimProgress(0);
  };

  // What to show in each board region
  const systemText = "You are a helpful AI assistant. Follow the user's instructions carefully. Respond concisely.";

  return (
    <div>
      {/* Scenario selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
        {WHITEBOARD_SCENARIOS.map(s => (
          <button key={s.id} onClick={() => switchToScenario(s.id)} style={{
            padding: "6px 12px", borderRadius: "6px",
            border: `1px solid ${s.id === activeScenario ? palette.accent : palette.border}`,
            background: s.id === activeScenario ? palette.accent + "20" : "transparent",
            color: s.id === activeScenario ? palette.accent : palette.textDim,
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            cursor: "pointer", transition: "all 0.2s",
          }}>{s.label}</button>
        ))}
      </div>

      {/* The Whiteboard — dark themed (1c) */}
      <div style={{
        borderRadius: "12px", overflow: "hidden",
        border: `2px solid ${isOverflow && phase === "overflow" ? palette.danger : palette.border}`,
        background: palette.surface,
        minHeight: "240px",
        position: "relative",
        transition: "border-color 0.5s ease",
      }}>
        {/* Board header */}
        <div style={{
          padding: "8px 12px",
          background: palette.bg,
          borderBottom: `1px solid ${palette.border}`,
          borderTop: `2px solid ${palette.accent}40`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{
            fontSize: "10px", fontWeight: 600, color: palette.textDim,
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px",
          }}>CONTEXT WINDOW</span>
          <span style={{
            fontSize: "10px", color: palette.textDim,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{Math.round(totalFill).toLocaleString()} / {contextLimit} tokens</span>
        </div>

        {/* Board content area */}
        <div style={{ padding: "12px", minHeight: "190px", position: "relative" }}>
          {/* System instructions region */}
          {phase !== "empty" && (
            <div style={{
              marginBottom: "8px",
              padding: "8px 10px", borderRadius: "6px",
              background: palette.warning + "10",
              border: `1px dashed ${palette.warning}50`,
              transition: "all 0.5s ease",
              animation: "fadeSlideIn 0.4s ease",
            }}>
              <div style={{
                fontSize: "10px", fontWeight: 700, color: palette.warning,
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px",
              }}>System · {systemSize} tokens</div>
              <div style={{
                fontSize: "10px", color: palette.textDim, lineHeight: 1.5,
                fontFamily: "'JetBrains Mono', monospace", fontStyle: "italic",
              }}>{systemText}</div>
            </div>
          )}

          {/* User prompt region */}
          {(phase === "prompt" || phase === "responding" || phase === "done" || phase === "overflow") && (
            <div style={{
              marginBottom: "8px",
              padding: "8px 10px", borderRadius: "6px",
              background: palette.accent + "10",
              border: `1px solid ${palette.accent}30`,
              transition: "all 0.5s ease",
            }}>
              <div style={{
                fontSize: "10px", fontWeight: 700, color: palette.accent,
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px",
              }}>Your prompt · {promptSize} tokens</div>
              <div style={{
                fontSize: "10px", color: palette.text, lineHeight: 1.6,
                fontFamily: "'JetBrains Mono', monospace",
                whiteSpace: "pre-wrap",
              }}>{scenario.prompt}</div>
            </div>
          )}

          {/* AI response region (animated fill) */}
          {(phase === "responding" || phase === "done") && (
            <div style={{
              padding: "8px 10px", borderRadius: "6px",
              background: palette.success + "10",
              border: `1px solid ${palette.success}30`,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                fontSize: "10px", fontWeight: 700, color: palette.success,
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px",
              }}>AI response · {Math.round(responseFill)} / {responseSize} tokens</div>
              <div style={{
                fontSize: "10px", color: palette.text, lineHeight: 1.6,
                fontFamily: "'JetBrains Mono', monospace",
                whiteSpace: "pre-wrap",
              }}>
                {scenario.response.slice(0, Math.floor(scenario.response.length * animProgress))}
                {phase === "responding" && (
                  <span style={{ color: palette.success, animation: "blink 0.8s infinite" }}>▊</span>
                )}
              </div>
            </div>
          )}

          {/* Overflow state */}
          {phase === "overflow" && (
            <div style={{
              padding: "16px", borderRadius: "8px",
              background: palette.danger + "12",
              border: `2px solid ${palette.danger}50`,
              textAlign: "center",
            }}>
              <div style={{
                fontSize: "20px", marginBottom: "8px",
              }}>⚠</div>
              <div style={{
                fontSize: "13px", fontWeight: 700, color: palette.danger,
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: "6px",
              }}>Context Window Full</div>
              <div style={{
                fontSize: "11px", color: palette.textDim, lineHeight: 1.6,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                Needed {totalNeeded} tokens but only {contextLimit} available.
                <br />The whiteboard is full — erase some content to make room.
              </div>
              <div style={{
                marginTop: "12px", display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap",
              }}>
                <button onClick={() => switchToScenario("chat")} style={{
                  padding: "6px 14px", borderRadius: "6px",
                  border: `1px solid ${palette.accent}`, background: palette.accent + "15",
                  color: palette.accent, fontSize: "10px",
                  fontFamily: "'JetBrains Mono', monospace", cursor: "pointer",
                }}>Try a shorter prompt</button>
                <button onClick={replay} style={{
                  padding: "6px 14px", borderRadius: "6px",
                  border: `1px solid ${palette.border}`, background: "transparent",
                  color: palette.textDim, fontSize: "10px",
                  fontFamily: "'JetBrains Mono', monospace", cursor: "pointer",
                }}>Replay</button>
              </div>
            </div>
          )}
        </div>

        {/* Capacity bar at the bottom */}
        <div style={{
          height: "6px", background: palette.bg,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", left: 0, top: 0, height: "100%",
            width: `${systemPercent}%`,
            background: palette.warning,
            transition: "width 0.5s ease",
          }} />
          <div style={{
            position: "absolute", left: `${systemPercent}%`, top: 0, height: "100%",
            width: `${promptPercent}%`,
            background: palette.accent,
            transition: "all 0.5s ease",
          }} />
          <div style={{
            position: "absolute", left: `${systemPercent + promptPercent}%`, top: 0, height: "100%",
            width: `${responsePercent}%`,
            background: palette.success,
            transition: "all 0.3s ease",
          }} />
        </div>
      </div>

      {/* Replay button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
        <button onClick={replay} style={{
          padding: "5px 12px", borderRadius: "6px",
          border: `1px solid ${palette.border}`, background: "transparent",
          color: palette.textDim, fontSize: "10px",
          fontFamily: "'JetBrains Mono', monospace", cursor: "pointer",
          transition: "all 0.2s",
        }}>Replay animation</button>
      </div>

      {/* Color legend */}
      <div style={{
        display: "flex", gap: "14px", marginTop: "12px", marginBottom: "16px",
        justifyContent: "center", flexWrap: "wrap",
      }}>
        {[
          { color: palette.warning, label: "System instructions" },
          { color: palette.accent, label: "Your prompt (input)" },
          { color: palette.success, label: "AI response (output)" },
        ].map(l => (
          <div key={l.label} style={{
            display: "flex", alignItems: "center", gap: "5px",
            fontSize: "10px", color: palette.textDim,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "2px", background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RAG VISUALIZATION ────────────────────────────────
function RAGViz() {
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("What foods are high in vitamin C?");
  const [animPhase, setAnimPhase] = useState(0); // sub-animation within each step

  const RAG_CHUNKS = [
    { id: 0, text: "Oranges contain about 70mg of vitamin C per fruit, making them one of the most popular sources.", icon: "🍊" },
    { id: 1, text: "Strawberries are rich in antioxidants including vitamin C and manganese.", icon: "🍓" },
    { id: 2, text: "Bell peppers surprisingly contain more vitamin C than oranges per serving.", icon: "🫑" },
    { id: 3, text: "Vitamin D is synthesized through sun exposure on the skin.", icon: "☀️" },
    { id: 4, text: "Iron supplements should be taken with food to improve absorption.", icon: "💊" },
    { id: 5, text: "Calcium is important for bone health and found in dairy products.", icon: "🥛" },
    { id: 6, text: "Kiwi fruit contains nearly twice the vitamin C of an orange.", icon: "🥝" },
  ];

  const chunks = useMemo(() => {
    const scored = RAG_CHUNKS.map(chunk => ({
      ...chunk,
      score: parseFloat(computeSimilarity(query, chunk.text).toFixed(2)),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.map((chunk, i) => ({
      ...chunk,
      relevant: i < 3 && chunk.score > 0.45,
      rank: i,
    }));
  }, [query]);

  // Reset animation when step changes
  useEffect(() => {
    setAnimPhase(0);
    if (step >= 2) {
      const t1 = setTimeout(() => setAnimPhase(1), 400);
      const t2 = setTimeout(() => setAnimPhase(2), 800);
      const t3 = setTimeout(() => setAnimPhase(3), 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [step]);

  // Fake vector for visual display
  const fakeVector = useMemo(() =>
    Array.from({ length: 12 }, () => (Math.random() * 2 - 1).toFixed(2)),
    [query]
  );

  const stepLabels = ["Query", "Embed", "Search", "Retrieve", "Generate"];

  return (
    <div>
      {/* Query input */}
      <div style={{ marginBottom: "16px", position: "relative" }}>
        <input value={query} onChange={e => { setQuery(e.target.value); setStep(0); }} placeholder="Ask a question..."
          style={{
            width: "100%", padding: "12px 14px", borderRadius: "10px",
            border: `2px solid ${step === 0 ? palette.accent : palette.border}`,
            background: palette.surface, color: palette.text,
            fontSize: "16px", fontFamily: "'DM Sans', sans-serif",
            outline: "none", boxSizing: "border-box",
            transition: "border-color 0.3s ease",
          }}
        />
      </div>

      {/* Pipeline progress bar with labels */}
      <div style={{ marginBottom: "20px", padding: "0 8px" }}>
        {/* Each step is a flex column: circle on top, label below. Lines connect circles. */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          position: "relative",
        }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              position: "relative",
            }}>
              {/* Connector line to the next circle */}
              {i < 4 && (
                <div style={{
                  position: "absolute", top: "15px",
                  left: "calc(50% + 16px)", right: "calc(-50% + 16px)",
                  height: "2px",
                  background: step > i ? palette.accent : palette.border,
                  transition: "background 0.3s ease",
                  zIndex: 1,
                }} />
              )}
              <button
                onClick={() => setStep(i)}
                style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  border: `2px solid ${step >= i ? palette.accent : palette.border}`,
                  background: step >= i ? palette.accent : palette.surface,
                  color: step >= i ? "#fff" : palette.textDim,
                  fontSize: "12px", fontWeight: 700,
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s ease",
                  WebkitTapHighlightColor: "transparent",
                  position: "relative", zIndex: 2,
                  flexShrink: 0,
                }}
              >{i + 1}</button>
              <div style={{
                fontSize: "10px", marginTop: "6px",
                color: step === i ? palette.accent : palette.textDim,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: step === i ? 600 : 400,
                transition: "color 0.3s ease",
                textAlign: "center",
              }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── STEP 1: QUERY ─── */}
      {step === 0 && (
        <div style={{
          padding: "24px 20px", borderRadius: "12px",
          background: palette.surface, border: `1px solid ${palette.border}`,
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "11px", color: palette.textDim, marginBottom: "12px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>user sends a question</div>
          <div style={{
            fontSize: "18px", color: palette.text, fontFamily: "'Georgia', serif",
            fontStyle: "italic", lineHeight: 1.6,
          }}>"{query}"</div>
          <div style={{
            marginTop: "16px", display: "flex", justifyContent: "center",
          }}>
            <button onClick={() => setStep(1)} style={{
              padding: "8px 20px", borderRadius: "8px",
              background: palette.accent + "20", border: `1px solid ${palette.accent}`,
              color: palette.accent, fontSize: "11px", fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer", transition: "all 0.2s",
            }}>Embed this query →</button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: EMBED ─── */}
      {step === 1 && (
        <div style={{
          padding: "20px", borderRadius: "12px",
          background: palette.surface, border: `1px solid ${palette.border}`,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px",
            flexWrap: "wrap", justifyContent: "center",
          }}>
            {/* Text side */}
            <div style={{
              padding: "8px 14px", borderRadius: "8px",
              background: palette.accent + "10", border: `1px solid ${palette.accent}30`,
              fontSize: "12px", color: palette.text, maxWidth: "180px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              fontFamily: "'JetBrains Mono', monospace",
            }}>"{query.slice(0, 25)}..."</div>

            {/* Arrow */}
            <div style={{ color: palette.accent, fontSize: "18px", animation: "blink 1s infinite" }}>→</div>

            {/* Embedding model box */}
            <div style={{
              padding: "8px 14px", borderRadius: "8px",
              background: palette.accent + "20", border: `1px solid ${palette.accent}50`,
              fontSize: "10px", color: palette.accent, fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
            }}>embedding model</div>

            <div style={{ color: palette.accent, fontSize: "18px" }}>→</div>
          </div>

          {/* Vector grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "4px",
            padding: "12px", borderRadius: "8px",
            background: palette.bg, border: `1px solid ${palette.border}`,
          }}>
            {fakeVector.map((v, i) => {
              const val = parseFloat(v);
              const intensity = Math.abs(val);
              const hue = val > 0 ? palette.accent : palette.danger;
              return (
                <div key={i} style={{
                  padding: "6px 4px", borderRadius: "4px",
                  background: hue + Math.round(intensity * 30).toString(16).padStart(2, "0"),
                  fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
                  color: palette.text, textAlign: "center",
                  animation: `fadeSlideIn ${0.1 + i * 0.05}s ease`,
                }}>{v}</div>
              );
            })}
          </div>
          <div style={{
            fontSize: "10px", color: palette.textDim, marginTop: "8px", textAlign: "center",
            fontFamily: "'JetBrains Mono', monospace",
          }}>768-dimensional vector (showing 12 of 768)</div>

          <div style={{ marginTop: "14px", textAlign: "center" }}>
            <button onClick={() => setStep(2)} style={{
              padding: "8px 20px", borderRadius: "8px",
              background: palette.accent + "20", border: `1px solid ${palette.accent}`,
              color: palette.accent, fontSize: "11px", fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
            }}>Search the vector DB →</button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: SEARCH — Radar/sonar visual ─── */}
      {step === 2 && (
        <div style={{
          padding: "16px", borderRadius: "12px",
          background: palette.surface, border: `1px solid ${palette.border}`,
        }}>
          <div style={{
            fontSize: "10px", color: palette.textDim, marginBottom: "12px",
            fontFamily: "'JetBrains Mono', monospace", textAlign: "center",
          }}>scanning {RAG_CHUNKS.length} document chunks for similarity...</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {chunks.map((chunk, i) => {
              const barWidth = chunk.score * 100;
              const isHit = chunk.score > 0.5;
              const revealed = animPhase > i * 0.5;
              return (
                <div key={chunk.id} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "8px 10px", borderRadius: "8px",
                  background: palette.bg,
                  border: `1px solid ${isHit && revealed ? palette.success + "40" : palette.border}`,
                  opacity: revealed ? 1 : 0.3,
                  transition: "all 0.4s ease",
                }}>
                  <span style={{ fontSize: "16px", flexShrink: 0 }}>{chunk.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "10px", color: palette.text, lineHeight: 1.4,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{chunk.text}</div>
                    {/* Similarity bar */}
                    <div style={{
                      marginTop: "4px", height: "4px", borderRadius: "2px",
                      background: palette.border, overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: "2px",
                        width: revealed ? `${barWidth}%` : "0%",
                        background: isHit
                          ? `linear-gradient(90deg, ${palette.success}, ${palette.success}cc)`
                          : `linear-gradient(90deg, ${palette.textDim}40, ${palette.textDim}20)`,
                        transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                      }} />
                    </div>
                  </div>
                  <div style={{
                    fontSize: "11px", fontWeight: 700, minWidth: "36px", textAlign: "right",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isHit ? palette.success : palette.textDim,
                    opacity: revealed ? 1 : 0,
                    transition: "opacity 0.4s ease",
                  }}>{(chunk.score * 100).toFixed(0)}%</div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "14px", textAlign: "center" }}>
            <button onClick={() => setStep(3)} style={{
              padding: "8px 20px", borderRadius: "8px",
              background: palette.accent + "20", border: `1px solid ${palette.accent}`,
              color: palette.accent, fontSize: "11px", fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
            }}>Retrieve top matches →</button>
          </div>
        </div>
      )}

      {/* ─── STEP 4: RETRIEVE — matched chunks fly into context ─── */}
      {step === 3 && (
        <div style={{
          padding: "16px", borderRadius: "12px",
          background: palette.surface, border: `1px solid ${palette.border}`,
        }}>
          <div style={{
            display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center",
            marginBottom: "16px",
          }}>
            {/* Retrieved chunks */}
            {chunks.map((chunk, i) => {
              const isRetrieved = chunk.relevant;
              return (
                <div key={chunk.id} style={{
                  width: "calc(50% - 6px)", minWidth: "140px",
                  padding: "10px", borderRadius: "8px",
                  background: isRetrieved ? palette.success + "10" : palette.bg,
                  border: `1.5px solid ${isRetrieved ? palette.success + "50" : palette.border}`,
                  opacity: isRetrieved ? 1 : 0.25,
                  transform: isRetrieved && animPhase >= 1
                    ? "translateY(0) scale(1)"
                    : isRetrieved ? "translateY(-8px) scale(0.95)" : "translateY(4px) scale(0.9)",
                  transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s`,
                  position: "relative",
                }}>
                  {isRetrieved && (
                    <div style={{
                      position: "absolute", top: "-8px", right: "8px",
                      padding: "2px 8px", borderRadius: "4px",
                      background: palette.success, color: "#fff",
                      fontSize: "10px", fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>#{i + 1} · {(chunk.score * 100).toFixed(0)}%</div>
                  )}
                  <div style={{ fontSize: "14px", marginBottom: "4px" }}>{chunk.icon}</div>
                  <div style={{
                    fontSize: "10px", color: isRetrieved ? palette.text : palette.textDim,
                    lineHeight: 1.4,
                  }}>{chunk.text.slice(0, 60)}...</div>
                  {!isRetrieved && (
                    <div style={{
                      fontSize: "10px", color: palette.textDim, marginTop: "4px",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>filtered out ({(chunk.score * 100).toFixed(0)}%)</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Arrow into context window */}
          <div style={{
            textAlign: "center", margin: "8px 0",
            fontSize: "10px", color: palette.accent,
            fontFamily: "'JetBrains Mono', monospace",
          }}>↓ injected into prompt as context ↓</div>

          {/* Context window preview */}
          <div style={{
            padding: "10px 12px", borderRadius: "8px",
            background: palette.bg, border: `1px dashed ${palette.accent}40`,
          }}>
            <div style={{
              fontSize: "10px", color: palette.accent, marginBottom: "6px",
              fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>context window</div>
            <div style={{ fontSize: "10px", color: palette.textDim, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6 }}>
              <span style={{ color: palette.warning }}>System:</span> Answer using only the provided context.<br/>
              <span style={{ color: palette.success }}>Context:</span> {chunks.filter(c => c.relevant).map(c => `[${c.icon} ${c.text.slice(0, 30)}...]`).join(" ")}<br/>
              <span style={{ color: palette.accent }}>User:</span> {query}
            </div>
          </div>

          <div style={{ marginTop: "14px", textAlign: "center" }}>
            <button onClick={() => setStep(4)} style={{
              padding: "8px 20px", borderRadius: "8px",
              background: palette.accent + "20", border: `1px solid ${palette.accent}`,
              color: palette.accent, fontSize: "11px", fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
            }}>Generate response →</button>
          </div>
        </div>
      )}

      {/* ─── STEP 5: GENERATE — streaming response with source attribution ─── */}
      {step === 4 && (
        <div style={{
          padding: "16px", borderRadius: "12px",
          background: palette.surface, border: `1px solid ${palette.border}`,
        }}>
          {/* Model "thinking" indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px",
          }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: palette.success,
              animation: "blink 1s infinite",
            }} />
            <span style={{
              fontSize: "10px", color: palette.textDim,
              fontFamily: "'JetBrains Mono', monospace",
            }}>model generating from {chunks.filter(c => c.relevant).length} retrieved chunks</span>
          </div>

          {/* Generated response with inline citations */}
          <div style={{
            padding: "14px 16px", borderRadius: "8px",
            background: palette.bg, border: `1px solid ${palette.border}`,
            fontSize: "13px", color: palette.text, lineHeight: 1.8,
            animation: "fadeSlideIn 0.4s ease",
          }}>
            Foods high in vitamin C include{" "}
            <strong style={{ color: palette.success }}>oranges</strong>{" "}
            <span style={{
              fontSize: "10px", padding: "1px 5px", borderRadius: "3px",
              background: palette.success + "20", color: palette.success,
              fontFamily: "'JetBrains Mono', monospace", verticalAlign: "super",
            }}>1</span>
            {" "}(~70mg per fruit),{" "}
            <strong style={{ color: palette.success }}>strawberries</strong>{" "}
            <span style={{
              fontSize: "10px", padding: "1px 5px", borderRadius: "3px",
              background: palette.success + "20", color: palette.success,
              fontFamily: "'JetBrains Mono', monospace", verticalAlign: "super",
            }}>2</span>
            {" "}(rich in antioxidants), and surprisingly{" "}
            <strong style={{ color: palette.success }}>bell peppers</strong>{" "}
            <span style={{
              fontSize: "10px", padding: "1px 5px", borderRadius: "3px",
              background: palette.success + "20", color: palette.success,
              fontFamily: "'JetBrains Mono', monospace", verticalAlign: "super",
            }}>3</span>
            {" "}which contain even more vitamin C per serving than oranges.
          </div>

          {/* Source attributions */}
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {chunks.filter(c => c.relevant).map((chunk, i) => (
              <div key={chunk.id} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "6px 10px", borderRadius: "6px",
                background: palette.bg, border: `1px solid ${palette.success}20`,
                animation: `fadeSlideIn ${0.3 + i * 0.15}s ease`,
              }}>
                <span style={{
                  fontSize: "10px", fontWeight: 700, color: palette.success,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: palette.success + "20",
                  padding: "1px 5px", borderRadius: "3px", flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ fontSize: "10px", marginRight: "4px" }}>{chunk.icon}</span>
                <span style={{
                  fontSize: "10px", color: palette.textDim,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{chunk.text}</span>
                <span style={{
                  fontSize: "10px", color: palette.success, flexShrink: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{(chunk.score * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explainer text below visualization */}
      <div style={{
        marginTop: "16px", padding: "12px 14px", borderRadius: "8px",
        background: palette.accent + "08", border: `1px solid ${palette.accent}15`,
      }}>
        <div style={{ fontSize: "11px", color: palette.textDim, lineHeight: 1.7 }}>
          {step === 0 && "RAG starts with a question. Instead of asking the LLM to answer from memory (which can hallucinate), the system searches external documents first."}
          {step === 1 && "The embedding model converts your question into a numerical vector — a point in 768-dimensional space where similar meanings cluster together. This is the same concept from the Token Space tab."}
          {step === 2 && "The query vector is compared against every chunk in the database using cosine similarity. High scores mean the chunk is semantically related to your question, even if the exact words differ."}
          {step === 3 && "Only the top-matching chunks are pulled from storage and injected into the LLM's prompt as context. This is the 'retrieval' in Retrieval-Augmented Generation. The rest are discarded."}
          {step === 4 && "The LLM generates its answer grounded in the retrieved chunks — not from memory. The superscript citations trace each claim back to a source document, making the response verifiable."}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────
const TABS = [
  { id: "space", label: "Token Space", icon: "🌌" },
  { id: "tokenize", label: "Tokenizer", icon: "🔪" },
  { id: "context", label: "Context Window", icon: "🪟" },
  { id: "rag", label: "RAG Pipeline", icon: "🔍" },
];

export default function TokenExplorer() {
  const [tab, setTab] = useState("space");
  const [selectedToken, setSelectedToken] = useState(null);
  const [tokenizerInput, setTokenizerInput] = useState("unhappily");
  const [customWord, setCustomWord] = useState("");
  const cameraRef = useRef();

  const handleHomeClick = useCallback(() => {
    setTab("space");
    setSelectedToken(null);
    setTokenizerInput("unhappily");
    setCustomWord("");
    if (cameraRef.current) cameraRef.current.resetZoom();
  }, []);

  const selectedCluster = selectedToken && VOCAB[selectedToken]
    ? VOCAB[selectedToken].cluster
    : null;

  const nearbyTokens = useMemo(() => {
    if (!selectedToken || !VOCAB[selectedToken]) return [];
    const sel = VOCAB[selectedToken];
    return Object.entries(VOCAB)
      .filter(([n]) => n !== selectedToken)
      .map(([name, data]) => {
        const d = Math.sqrt(
          (data.pos[0] - sel.pos[0]) ** 2 +
          (data.pos[1] - sel.pos[1]) ** 2 +
          (data.pos[2] - sel.pos[2]) ** 2
        );
        return { name, ...data, distance: d };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  }, [selectedToken]);

  // 2a: Use TOKENIZE_EXAMPLES if available, otherwise simpleTokenize
  const currentTokenization = useMemo(() => {
    if (TOKENIZE_EXAMPLES[tokenizerInput]) return TOKENIZE_EXAMPLES[tokenizerInput];
    return simpleTokenize(tokenizerInput);
  }, [tokenizerInput]);

  const handleClusterClick = useCallback((cluster) => {
    if (selectedCluster === cluster) {
      setSelectedToken(null);
    } else {
      const firstToken = getFirstTokenInCluster(cluster);
      if (firstToken) setSelectedToken(firstToken);
    }
  }, [selectedCluster]);



  return (
    <div style={{
      width: "100vw", height: "100dvh", background: palette.bg,
      color: palette.text, fontFamily: "'DM Sans', -apple-system, sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden",
      paddingTop: "env(safe-area-inset-top)",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      ` }} />

      <div style={{
        padding: "14px 20px 10px",
        borderBottom: `1px solid ${palette.border}`,
        background: `linear-gradient(180deg, ${palette.surface} 0%, ${palette.bg} 100%)`,
        flexShrink: 0,
      }}>
        <div
          onClick={handleHomeClick}
          style={{
            fontSize: "18px", fontWeight: 700, letterSpacing: "-0.5px",
            background: `linear-gradient(135deg, ${palette.accent} 0%, #a29bfe 50%, #00d2ff 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
          }}
        >Token Explorer</div>
        <div style={{ fontSize: "11px", color: palette.textDim, marginTop: "2px" }}>
          Visualize how LLMs read, store, and retrieve language
        </div>
      </div>

      <div style={{
        display: "flex", gap: "2px", padding: "8px 16px",
        borderBottom: `1px solid ${palette.border}`,
        overflowX: "auto", flexShrink: 0,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 14px", borderRadius: "8px", border: "none",
            background: tab === t.id ? palette.accent + "25" : "transparent",
            color: tab === t.id ? palette.accent : palette.textDim,
            fontSize: "12px", fontWeight: tab === t.id ? 600 : 400,
            cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
            fontFamily: "'DM Sans', sans-serif",
            minHeight: "44px",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {tab === "space" && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, minHeight: "280px", position: "relative" }}>
              <Canvas
                camera={{ position: [5, 4, 8], fov: 50 }}
                style={{ background: palette.bg }}
                gl={{ antialias: true, alpha: true }}
              >
                <TokenSpaceScene
                  selectedToken={selectedToken}
                  onSelectToken={setSelectedToken}
                  selectedCluster={selectedCluster}
                  cameraRef={cameraRef}
                />
              </Canvas>

              {/* Cluster legend — clickable overlay */}
              <div style={{
                position: "absolute", top: "8px", left: "8px",
                display: "flex", flexWrap: "wrap", gap: "4px",
                maxWidth: "calc(100% - 60px)", zIndex: 10,
              }}>
                {Object.entries(CLUSTER_COLORS).map(([cluster, color]) => {
                  const isActive = selectedCluster === cluster;
                  return (
                    <button key={cluster}
                      onClick={() => handleClusterClick(cluster)}
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        padding: "5px 10px", borderRadius: "6px",
                        background: isActive ? color + "30" : selectedCluster && !isActive ? palette.surface + "80" : palette.surface + "dd",
                        border: `1.5px solid ${isActive ? color : palette.border}`,
                        fontSize: "10px",
                        color: isActive ? color : selectedCluster && !isActive ? palette.textDim + "60" : palette.textDim,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: isActive ? 600 : 400,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: isActive ? `0 0 8px ${color}30` : "none",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: color,
                        opacity: selectedCluster && !isActive ? 0.4 : 1,
                        boxShadow: isActive ? `0 0 6px ${color}` : "none",
                        transition: "opacity 0.3s ease",
                      }} />
                      {cluster}
                    </button>
                  );
                })}
              </div>

              {/* Zoom controls + back button */}
              <div style={{
                position: "absolute", top: "8px", right: "12px",
                display: "flex", flexDirection: "column", gap: "4px",
                zIndex: 10,
              }}>
                {selectedCluster && (
                  <button
                    onClick={() => setSelectedToken(null)}
                    style={{
                      height: "36px", borderRadius: "8px",
                      border: `1px solid ${palette.border}`,
                      background: palette.surface + "ee",
                      color: palette.textDim, fontSize: "10px",
                      fontFamily: "'JetBrains Mono', monospace",
                      cursor: "pointer", display: "flex", padding: "0 10px",
                      alignItems: "center", justifyContent: "center", gap: "4px",
                      WebkitTapHighlightColor: "transparent",
                      transition: "all 0.2s ease",
                    }}
                  >← all</button>
                )}
                <button
                  onClick={() => cameraRef.current?.zoomIn()}
                  style={{
                    width: "36px", height: "36px", borderRadius: "8px",
                    border: `1px solid ${palette.border}`,
                    background: palette.surface + "ee",
                    color: palette.text, fontSize: "18px",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  title="Zoom in"
                >+</button>
                <button
                  onClick={() => cameraRef.current?.zoomOut()}
                  style={{
                    width: "36px", height: "36px", borderRadius: "8px",
                    border: `1px solid ${palette.border}`,
                    background: palette.surface + "ee",
                    color: palette.text, fontSize: "18px",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  title="Zoom out"
                >−</button>
                <button
                  onClick={() => cameraRef.current?.resetZoom()}
                  style={{
                    width: "36px", height: "36px", borderRadius: "8px",
                    border: `1px solid ${palette.border}`,
                    background: palette.surface + "ee",
                    color: palette.accent, fontSize: "10px", fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  title="Reset zoom"
                >1x</button>
              </div>

              <div style={{
                position: "absolute", bottom: "8px", left: "8px",
                fontSize: "10px", color: palette.textDim + "70",
                fontFamily: "'JetBrains Mono', monospace",
                background: palette.bg + "cc", padding: "4px 8px", borderRadius: "4px",
                zIndex: 10,
              }}>
                {selectedCluster
                  ? `viewing ${CLUSTER_LABELS[selectedCluster].toLowerCase()} · tap a legend pill or ← to go back`
                  : "drag to rotate · tap a sphere or token to explore · scroll to zoom"
                }
              </div>
            </div>

            {selectedToken && VOCAB[selectedToken] ? (
              <div style={{
                padding: "14px 16px",
                borderTop: `1px solid ${palette.border}`,
                background: palette.surface, flexShrink: 0,
              }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: "10px", marginBottom: "10px", flexWrap: "wrap",
                }}>
                  <div style={{
                    padding: "5px 14px", borderRadius: "8px",
                    background: VOCAB[selectedToken].color + "25",
                    border: `2px solid ${VOCAB[selectedToken].color}`,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "15px", fontWeight: 700,
                    color: VOCAB[selectedToken].color,
                  }}>{selectedToken}</div>
                  <div style={{
                    padding: "3px 10px", borderRadius: "20px",
                    background: CLUSTER_COLORS[VOCAB[selectedToken].cluster] + "15",
                    border: `1px solid ${CLUSTER_COLORS[VOCAB[selectedToken].cluster]}30`,
                    fontSize: "10px", color: CLUSTER_COLORS[VOCAB[selectedToken].cluster],
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{CLUSTER_LABELS[VOCAB[selectedToken].cluster]}</div>
                </div>
                <div style={{ fontSize: "11px", color: palette.textDim, marginBottom: "8px", lineHeight: 1.5 }}>
                  Nearest tokens in embedding space. <span style={{ color: palette.accent }}>Lower distance = more similar meaning.</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {nearbyTokens.map(t => {
                    const closeness = Math.max(0, 1 - t.distance / 3);
                    const isCrossCluster = t.cluster !== VOCAB[selectedToken].cluster;
                    return (
                      <button key={t.name} onClick={() => setSelectedToken(t.name)} style={{
                        padding: "5px 12px", borderRadius: "6px",
                        border: `1px solid ${t.color}50`, background: t.color + "15",
                        color: t.color, fontSize: "11px",
                        fontFamily: "'JetBrains Mono', monospace",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                        transition: "all 0.15s",
                      }}>
                        {t.name}
                        <span style={{
                          fontSize: "10px", opacity: 0.7,
                          padding: "1px 5px", borderRadius: "3px",
                          background: `rgba(255,255,255,${closeness * 0.1})`,
                        }}>{t.distance.toFixed(2)}</span>
                        {isCrossCluster && (
                          <span style={{
                            fontSize: "10px", opacity: 0.5,
                            padding: "1px 4px", borderRadius: "3px",
                            border: `1px solid ${CLUSTER_COLORS[t.cluster]}40`,
                            color: CLUSTER_COLORS[t.cluster],
                          }}>{t.cluster}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{
                padding: "14px 16px", borderTop: `1px solid ${palette.border}`,
                background: palette.surface, flexShrink: 0, textAlign: "center",
              }}>
                <div style={{ fontSize: "12px", color: palette.textDim, lineHeight: 1.5 }}>
                  Click any sphere or token to explore its nearest neighbors in the embedding space.
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "tokenize" && (
          <div style={{ padding: "16px" }}>
            <div style={{ fontSize: "13px", color: palette.textDim, marginBottom: "16px", lineHeight: 1.6 }}>
              Models break words into morphemes: the smallest meaningful fragments in their ~100k-token vocabulary.
            </div>

            {/* Custom word input — live tokenization as you type */}
            <div style={{ marginBottom: "12px" }}>
              <input
                type="text"
                value={customWord}
                onChange={e => {
                  const val = e.target.value;
                  setCustomWord(val);
                  if (val.trim().length > 0) {
                    setTokenizerInput(val.trim().toLowerCase());
                  }
                }}
                placeholder="Type any word to tokenize..."
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: "8px",
                  border: `1px solid ${customWord ? palette.accent : palette.border}`,
                  background: palette.surface,
                  color: palette.text, fontSize: "16px",
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
              />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
              {Object.keys(TOKENIZE_EXAMPLES).map(word => (
                <button key={word} onClick={() => { setTokenizerInput(word); setCustomWord(""); }} style={{
                  padding: "8px 14px", borderRadius: "6px",
                  border: `1px solid ${word === tokenizerInput ? palette.accent : palette.border}`,
                  background: word === tokenizerInput ? palette.accent + "20" : "transparent",
                  color: word === tokenizerInput ? palette.accent : palette.textDim,
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                  cursor: "pointer", transition: "all 0.2s",
                }}>{word}</button>
              ))}
            </div>
            <TokenizerViz word={tokenizerInput} tokens={currentTokenization} />
            <div style={{
              marginTop: "24px", padding: "14px 16px", borderRadius: "10px",
              background: palette.accent + "08", border: `1px solid ${palette.accent}20`,
            }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: palette.accent, marginBottom: "6px" }}>Why does this matter?</div>
              <div style={{ fontSize: "11px", color: palette.textDim, lineHeight: 1.7 }}>
                This is why AI can understand a word it's never seen before, like "Sprockethouse" → [sprocket] + [house]. But it also explains why AI struggles with character-level tasks like counting letters.
              </div>
            </div>
          </div>
        )}

        {tab === "context" && (
          <div style={{ padding: "16px" }}>
            <div style={{ fontSize: "13px", color: palette.textDim, marginBottom: "6px", lineHeight: 1.6 }}>
              Think of an LLM's memory as a whiteboard. Everything — the system instructions, your prompt, and the AI's response — must fit on that whiteboard at once. This is the <strong style={{ color: palette.text }}>context window</strong>.
            </div>
            <div style={{ fontSize: "11px", color: palette.textDim, marginBottom: "16px", lineHeight: 1.6 }}>
              Watch how different tasks fill the board. When it overflows, the model literally cannot hold the information — older messages fall off, or the request is rejected entirely.
            </div>

            <ContextWindowViz />

            {/* Explainer cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
              <div style={{
                padding: "12px 14px", borderRadius: "8px",
                background: palette.surface, border: `1px solid ${palette.border}`,
              }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: palette.accent, marginBottom: "4px" }}>
                  Why can't the AI just remember everything?
                </div>
                <div style={{ fontSize: "11px", color: palette.textDim, lineHeight: 1.6 }}>
                  Unlike a human brain, an LLM has no persistent memory between messages. Every time you send a message, the <em>entire conversation</em> is re-written on a fresh whiteboard. That's why long chats eventually "forget" early context — the oldest writing gets erased to make room.
                </div>
              </div>
              <div style={{
                padding: "12px 14px", borderRadius: "8px",
                background: palette.surface, border: `1px solid ${palette.border}`,
              }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: palette.warning, marginBottom: "4px" }}>
                  The hidden cost: system prompts
                </div>
                <div style={{ fontSize: "11px", color: palette.textDim, lineHeight: 1.6 }}>
                  Before you even type anything, the system prompt is already on the board — personality, rules, safety guidelines. Some apps use 2,000+ tokens just for instructions you never see. That's space your prompt can't use.
                </div>
              </div>
              <div style={{
                padding: "12px 14px", borderRadius: "8px",
                background: palette.surface, border: `1px solid ${palette.border}`,
              }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: palette.success, marginBottom: "4px" }}>
                  Input vs. output: an asymmetric budget
                </div>
                <div style={{ fontSize: "11px", color: palette.textDim, lineHeight: 1.6 }}>
                  Pasting a long document uses massive input tokens but the summary only needs a few output tokens. Code review is the opposite — short input, long detailed output. Understanding this tradeoff helps you craft better prompts.
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "rag" && (
          <div style={{ padding: "16px" }}>
            <div style={{ fontSize: "13px", color: palette.textDim, marginBottom: "6px", lineHeight: 1.6 }}>
              <strong style={{ color: palette.text }}>Retrieval-Augmented Generation</strong> — how LLMs answer questions from documents they weren't trained on.
            </div>
            <div style={{ fontSize: "11px", color: palette.textDim, marginBottom: "16px", lineHeight: 1.6 }}>
              Step through each stage to see how a question becomes a grounded, source-cited answer.
            </div>
            <RAGViz />
          </div>
        )}
      </div>
    </div>
  );
}
