import { useState, useCallback } from "react";
import { palette, fonts, keyframesCss, googleFontsHref } from "./theme.js";
import TokenSpace from "./units/tokenSpace/TokenSpace.jsx";
import Tokenizer from "./units/tokenizer/Tokenizer.jsx";
import ContextWindow from "./units/contextWindow/ContextWindow.jsx";
import Rag from "./units/rag/Rag.jsx";

const TABS = [
  { id: "space", label: "Token Space", icon: "🌌", Component: TokenSpace },
  { id: "tokenize", label: "Tokenizer", icon: "🔪", Component: Tokenizer },
  { id: "context", label: "Context Window", icon: "🪟", Component: ContextWindow },
  { id: "rag", label: "RAG Pipeline", icon: "🔍", Component: Rag },
];

export default function App() {
  const [tab, setTab] = useState("space");
  const [resetKey, setResetKey] = useState(0);

  const handleHomeClick = useCallback(() => {
    if (tab === "space") {
      setResetKey(k => k + 1);
    } else {
      setTab("space");
    }
  }, [tab]);

  const ActiveComponent = TABS.find(t => t.id === tab)?.Component;

  return (
    <div style={{
      width: "100vw", height: "100dvh", background: palette.bg,
      color: palette.text, fontFamily: fonts.sans,
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <link href={googleFontsHref} rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: keyframesCss }} />

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
            fontFamily: fonts.sans,
            minHeight: "44px",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {ActiveComponent && <ActiveComponent key={`${tab}-${resetKey}`} />}
      </div>
    </div>
  );
}
