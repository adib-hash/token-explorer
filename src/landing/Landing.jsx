import { Check, ArrowRight, Play, Orbit, Scissors, PanelTop, Search, BarChart3, Brain, Workflow, Sparkles } from "lucide-react";
import { palette, fonts } from "../theme.js";
import { CHAPTERS, findUnit } from "../shared/data/curriculum.js";

const ICON_MAP = {
  Orbit, Scissors, PanelTop, Search, BarChart3, Brain, Workflow, Sparkles,
};

function UnitCard({ unit, completed, onClick }) {
  const Icon = ICON_MAP[unit.iconName] || Sparkles;
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex", alignItems: "flex-start", gap: "12px",
        padding: "14px",
        background: palette.surface,
        border: `1px solid ${completed ? palette.success + "40" : palette.border}`,
        borderRadius: "10px",
        textAlign: "left",
        cursor: "pointer",
        color: palette.text,
        fontFamily: fonts.sans,
        WebkitTapHighlightColor: "transparent",
        transition: "all 0.2s",
      }}
    >
      <div style={{
        width: "36px", height: "36px",
        borderRadius: "8px",
        background: palette.accent + "18",
        border: `1px solid ${palette.accent}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={18} color={palette.accent} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px",
        }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: palette.text }}>{unit.title}</div>
          {completed && (
            <div style={{
              display: "flex", alignItems: "center", gap: "2px",
              padding: "1px 6px", borderRadius: "999px",
              background: palette.success + "20",
              color: palette.success,
              fontSize: "9px", fontFamily: fonts.mono,
              fontWeight: 600, letterSpacing: "0.3px",
            }}>
              <Check size={9} /> DONE
            </div>
          )}
        </div>
        <div style={{ fontSize: "12px", color: palette.textDim, lineHeight: 1.5 }}>{unit.tagline}</div>
      </div>
      <ArrowRight size={14} color={palette.textDim} style={{ flexShrink: 0, marginTop: "10px" }} />
    </button>
  );
}

export default function Landing({ completedUnits, lastUnitId, onOpenUnit }) {
  const last = lastUnitId ? findUnit(lastUnitId) : null;

  return (
    <div style={{
      maxWidth: "820px", margin: "0 auto",
      padding: "24px 20px 48px",
    }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          fontSize: "10px", fontWeight: 700, color: palette.accent,
          textTransform: "uppercase", letterSpacing: "1px",
          fontFamily: fonts.mono, marginBottom: "8px",
        }}>A visual guide to LLMs</div>
        <div style={{
          fontSize: "22px", fontWeight: 700, color: palette.text,
          letterSpacing: "-0.3px", lineHeight: 1.25, marginBottom: "8px",
        }}>
          Seven interactive lessons on how modern AI actually works.
        </div>
        <div style={{
          fontSize: "14px", color: palette.textDim, lineHeight: 1.6,
        }}>
          Start with how LLMs represent language. Then see how they hold state, predict, reason, and act. No math required — just scroll, click, and drag.
        </div>
      </div>

      {last && (
        <button
          onClick={() => onOpenUnit(last.id)}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", gap: "12px",
            padding: "14px",
            marginBottom: "24px",
            background: `linear-gradient(180deg, ${palette.accent}20 0%, ${palette.accent}10 100%)`,
            border: `1px solid ${palette.accent}60`,
            borderRadius: "12px",
            color: palette.text, textAlign: "left",
            cursor: "pointer", fontFamily: fonts.sans,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: palette.accent, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Play size={16} fill="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "10px", color: palette.accent,
              fontFamily: fonts.mono, fontWeight: 600,
              letterSpacing: "0.6px", textTransform: "uppercase",
              marginBottom: "2px",
            }}>Continue where you left off</div>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>{last.title}</div>
          </div>
          <ArrowRight size={16} color={palette.accent} />
        </button>
      )}

      {CHAPTERS.map((chapter, chapterIdx) => {
        if (chapter.units.length === 0) return null;
        return (
          <div key={chapter.id} style={{ marginBottom: "28px" }}>
            <div style={{
              display: "flex", alignItems: "baseline", gap: "8px",
              marginBottom: "4px",
            }}>
              <div style={{
                fontSize: "10px", fontFamily: fonts.mono,
                color: palette.textDim, letterSpacing: "0.6px",
                fontWeight: 600,
              }}>CHAPTER {chapterIdx + 1}</div>
              <div style={{
                fontSize: "10px", fontFamily: fonts.mono,
                color: palette.accent, letterSpacing: "0.4px",
              }}>· {chapter.subtitle}</div>
            </div>
            <div style={{
              fontSize: "18px", fontWeight: 700, color: palette.text,
              marginBottom: "4px",
            }}>{chapter.title}</div>
            <div style={{
              fontSize: "12px", color: palette.textDim, lineHeight: 1.6,
              marginBottom: "12px",
            }}>{chapter.description}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {chapter.units.map(unit => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  completed={completedUnits.includes(unit.id)}
                  onClick={() => onOpenUnit(unit.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div style={{
        marginTop: "36px", padding: "16px",
        borderRadius: "10px",
        background: palette.surface,
        border: `1px solid ${palette.border}`,
        fontSize: "11px", color: palette.textDim, lineHeight: 1.7,
        fontFamily: fonts.sans,
      }}>
        More chapters coming: <strong style={{ color: palette.text }}>Predict</strong> (how LLMs actually generate text), <strong style={{ color: palette.text }}>Reason</strong> (from next-token prediction to thinking), and <strong style={{ color: palette.text }}>Agents</strong> (when LLMs start acting in the world).
      </div>
    </div>
  );
}
