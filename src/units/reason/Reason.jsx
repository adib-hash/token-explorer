import { useState } from "react";
import { Split, Gauge, ShieldCheck } from "lucide-react";
import { palette, fonts } from "../../theme.js";
import IntroPanel from "../../shared/ui/IntroPanel.jsx";
import UnitNav from "../../shared/ui/UnitNav.jsx";
import { findUnit } from "../../shared/data/curriculum.js";
import { REASON_SCENARIOS, DEFAULT_SCENARIO, findScenario } from "./data.js";
import DirectVsThinking from "./views/DirectVsThinking.jsx";
import Budget from "./views/Budget.jsx";
import SelfVerify from "./views/SelfVerify.jsx";

const UNIT = findUnit("reason");
const CONTENT_MAX = 960;

const VIEWS = [
  { id: "direct", label: "Direct vs Thinking", Icon: Split,       Component: DirectVsThinking },
  { id: "budget", label: "Thinking budget",    Icon: Gauge,       Component: Budget },
  { id: "verify", label: "Self-check",         Icon: ShieldCheck, Component: SelfVerify },
];

export default function Reason({ onNavigate, onHome }) {
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO);
  const [viewId, setViewId] = useState("direct");

  const scenario = findScenario(scenarioId);
  const ActiveView = (VIEWS.find(v => v.id === viewId) || VIEWS[0]).Component;

  return (
    <div style={{
      maxWidth: CONTENT_MAX,
      width: "100%",
      margin: "0 auto",
      padding: "16px 16px 24px",
      boxSizing: "border-box",
    }}>
      <IntroPanel {...UNIT} unitId={UNIT.id} />

      <ScenarioPicker value={scenarioId} onChange={setScenarioId} />

      <ViewTabs value={viewId} onChange={setViewId} />

      <div style={{ marginTop: "12px" }}>
        <ActiveView scenario={scenario} />
      </div>

      {onNavigate && <UnitNav unitId={UNIT.id} onNavigate={onNavigate} onHome={onHome} />}
    </div>
  );
}

function ScenarioPicker({ value, onChange }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: "6px",
      marginTop: "16px",
      marginBottom: "12px",
    }}>
      {REASON_SCENARIOS.map(s => {
        const active = s.id === value;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            style={{
              padding: "7px 12px", borderRadius: "8px",
              border: `1px solid ${active ? palette.accent : palette.border}`,
              background: active ? palette.accent + "20" : "transparent",
              color: active ? palette.accent : palette.textDim,
              fontSize: "12px", fontFamily: fonts.mono,
              cursor: "pointer", transition: "all 0.2s",
              WebkitTapHighlightColor: "transparent",
              minHeight: "36px",
            }}
          >{s.label}</button>
        );
      })}
    </div>
  );
}

function ViewTabs({ value, onChange }) {
  return (
    <div style={{
      display: "flex",
      gap: "4px",
      padding: "4px",
      borderRadius: "10px",
      background: palette.surface,
      border: `1px solid ${palette.border}`,
      overflowX: "auto",
    }}>
      {VIEWS.map(v => {
        const active = v.id === value;
        const Icon = v.Icon;
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            style={{
              flex: 1,
              minWidth: "fit-content",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "none",
              background: active ? palette.accent + "20" : "transparent",
              color: active ? palette.accent : palette.textDim,
              fontSize: "13px",
              fontWeight: active ? 600 : 400,
              fontFamily: fonts.sans,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
              WebkitTapHighlightColor: "transparent",
              minHeight: "40px",
            }}
          >
            <Icon size={14} />
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
