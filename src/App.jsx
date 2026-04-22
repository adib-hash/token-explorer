import { useState, useCallback, useEffect } from "react";

import { Orbit, Scissors, PanelTop, Search, Home as HomeIcon, Circle, BarChart3 } from "lucide-react";
import { palette, fonts, keyframesCss, googleFontsHref } from "./theme.js";
import TokenSpace from "./units/tokenSpace/TokenSpace.jsx";
import Tokenizer from "./units/tokenizer/Tokenizer.jsx";
import ContextWindow from "./units/contextWindow/ContextWindow.jsx";
import Rag from "./units/rag/Rag.jsx";
import Predict from "./units/predict/Predict.jsx";
import Landing from "./landing/Landing.jsx";
import { UNIT_ORDER, findUnit } from "./shared/data/curriculum.js";
import { useLocalStorageState } from "./shared/hooks/useLocalStorageState.js";

const UNIT_COMPONENTS = {
  "token-space": TokenSpace,
  "tokenizer": Tokenizer,
  "context-window": ContextWindow,
  "rag": Rag,
  "predict": Predict,
};

const TAB_ICONS = {
  "token-space": Orbit,
  "tokenizer": Scissors,
  "context-window": PanelTop,
  "rag": Search,
  "predict": BarChart3,
};

export default function App() {
  const [view, setView] = useState("home");
  const [resetKey, setResetKey] = useState(0);
  const [completedUnits, setCompletedUnits] = useLocalStorageState("completedUnits", []);
  const [lastUnitId, setLastUnitId] = useLocalStorageState("lastUnitId", null);

  useEffect(() => {
    if (view !== "home" && findUnit(view)) {
      setLastUnitId(view);
      setCompletedUnits(prev => prev.includes(view) ? prev : [...prev, view]);
    }
  }, [view, setLastUnitId, setCompletedUnits]);

  const handleHomeClick = useCallback(() => {
    if (view === "home") {
      setResetKey(k => k + 1);
    } else {
      setView("home");
    }
  }, [view]);

  const handleOpenUnit = useCallback((unitId) => {
    setView(unitId);
  }, []);

  const ActiveComponent = UNIT_COMPONENTS[view];

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
            display: "inline-block",
          }}
        >Token</div>
        <div style={{ fontSize: "11px", color: palette.textDim, marginTop: "2px" }}>
          A visual guide to how LLMs work
        </div>
      </div>

      {view !== "home" && (
        <div style={{
          display: "flex", gap: "2px", padding: "8px 16px",
          borderBottom: `1px solid ${palette.border}`,
          overflowX: "auto", flexShrink: 0,
          alignItems: "center",
        }}>
          <button
            onClick={() => setView("home")}
            style={{
              padding: "8px 10px", borderRadius: "8px", border: "none",
              background: "transparent",
              color: palette.textDim,
              cursor: "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: "6px",
              fontFamily: fonts.sans, fontSize: "12px",
              minHeight: "44px", WebkitTapHighlightColor: "transparent",
              flexShrink: 0,
            }}
            title="Back to home"
          >
            <HomeIcon size={14} />
          </button>
          <div style={{ width: "1px", height: "20px", background: palette.border, margin: "0 4px", flexShrink: 0 }} />
          {UNIT_ORDER.map(unit => {
            const Icon = TAB_ICONS[unit.id] || Circle;
            const active = view === unit.id;
            return (
              <button key={unit.id} onClick={() => setView(unit.id)} style={{
                padding: "8px 12px", borderRadius: "8px", border: "none",
                background: active ? palette.accent + "25" : "transparent",
                color: active ? palette.accent : palette.textDim,
                fontSize: "12px", fontWeight: active ? 600 : 400,
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
                fontFamily: fonts.sans,
                minHeight: "44px",
                display: "flex", alignItems: "center", gap: "6px",
                flexShrink: 0,
                WebkitTapHighlightColor: "transparent",
              }}>
                <Icon size={14} />
                {unit.title}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, overflow: "auto", WebkitOverflowScrolling: "touch" }}>
        {view === "home" ? (
          <Landing
            completedUnits={completedUnits}
            lastUnitId={lastUnitId}
            onOpenUnit={handleOpenUnit}
          />
        ) : ActiveComponent ? (
          <ActiveComponent
            key={`${view}-${resetKey}`}
            onNavigate={handleOpenUnit}
            onHome={() => setView("home")}
          />
        ) : null}
      </div>
    </div>
  );
}
