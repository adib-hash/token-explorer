import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { palette, fonts } from "../../theme.js";
import { neighborUnits } from "../data/curriculum.js";

export default function UnitNav({ unitId, onNavigate, onHome }) {
  const { prev, next } = neighborUnits(unitId);

  return (
    <div style={{
      display: "flex", alignItems: "stretch", gap: "8px",
      marginTop: "24px", paddingTop: "16px",
      borderTop: `1px solid ${palette.border}`,
    }}>
      {prev ? (
        <button
          onClick={() => onNavigate(prev.id)}
          style={{
            flex: 1, minWidth: 0,
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 14px", borderRadius: "10px",
            background: palette.surface,
            border: `1px solid ${palette.border}`,
            color: palette.text, textAlign: "left",
            cursor: "pointer", fontFamily: fonts.sans,
            WebkitTapHighlightColor: "transparent",
            transition: "all 0.2s",
          }}
        >
          <ChevronLeft size={16} color={palette.textDim} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "10px", color: palette.textDim, fontFamily: fonts.mono, marginBottom: "2px" }}>Previous</div>
            <div style={{
              fontSize: "13px", fontWeight: 600, color: palette.text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{prev.title}</div>
          </div>
        </button>
      ) : (
        <div style={{ flex: 1 }} />
      )}

      <button
        onClick={onHome}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "12px", borderRadius: "10px",
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          color: palette.textDim, cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          flexShrink: 0,
          minWidth: "44px",
        }}
        title="Back to home"
      >
        <Home size={16} />
      </button>

      {next ? (
        <button
          onClick={() => onNavigate(next.id)}
          style={{
            flex: 1, minWidth: 0,
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 14px", borderRadius: "10px",
            background: palette.accent + "15",
            border: `1px solid ${palette.accent}40`,
            color: palette.text, textAlign: "right",
            cursor: "pointer", fontFamily: fonts.sans,
            WebkitTapHighlightColor: "transparent",
            transition: "all 0.2s",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "10px", color: palette.accent, fontFamily: fonts.mono, marginBottom: "2px" }}>Next</div>
            <div style={{
              fontSize: "13px", fontWeight: 600, color: palette.text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{next.title}</div>
          </div>
          <ChevronRight size={16} color={palette.accent} />
        </button>
      ) : (
        <div style={{ flex: 1 }} />
      )}
    </div>
  );
}
