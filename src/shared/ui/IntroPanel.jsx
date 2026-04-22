import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { palette, fonts } from "../../theme.js";
import { useLocalStorageState } from "../hooks/useLocalStorageState.js";

export default function IntroPanel({ unitId, title, tagline, whyItMatters, concepts, furtherReading }) {
  const [dismissed, setDismissed] = useLocalStorageState(`introDismissed:${unitId}`, false);
  const [localOpen, setLocalOpen] = useState(!dismissed);

  const isOpen = localOpen;
  const toggle = () => {
    const next = !isOpen;
    setLocalOpen(next);
    if (!next) setDismissed(true);
  };

  return (
    <div style={{
      borderRadius: "12px",
      border: `1px solid ${palette.accent}30`,
      background: `linear-gradient(180deg, ${palette.accent}10 0%, ${palette.accent}05 100%)`,
      marginBottom: "16px",
      overflow: "hidden",
    }}>
      <button
        onClick={toggle}
        style={{
          width: "100%",
          padding: "12px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "10px",
          background: "transparent", border: "none",
          color: palette.text, cursor: "pointer",
          fontFamily: fonts.sans,
          WebkitTapHighlightColor: "transparent",
          textAlign: "left",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "10px", fontWeight: 700, color: palette.accent,
            textTransform: "uppercase", letterSpacing: "0.6px",
            fontFamily: fonts.mono, marginBottom: "2px",
          }}>Why this matters</div>
          {!isOpen && (
            <div style={{ fontSize: "12px", color: palette.textDim, lineHeight: 1.5 }}>
              {tagline}
            </div>
          )}
        </div>
        <div style={{ color: palette.textDim, display: "flex", alignItems: "center", flexShrink: 0 }}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
        <div style={{
          padding: "0 14px 14px",
          animation: "fadeSlideIn 0.2s ease",
        }}>
          <div style={{
            fontSize: "13px", color: palette.text, lineHeight: 1.65,
            marginBottom: "10px",
          }}>
            {whyItMatters}
          </div>

          {concepts && concepts.length > 0 && (
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "6px",
              marginBottom: furtherReading && furtherReading.length > 0 ? "10px" : 0,
            }}>
              {concepts.map(c => (
                <div key={c} style={{
                  padding: "3px 9px", borderRadius: "999px",
                  background: palette.surface,
                  border: `1px solid ${palette.border}`,
                  fontSize: "10px", color: palette.textDim,
                  fontFamily: fonts.mono,
                  letterSpacing: "0.3px",
                }}>{c}</div>
              ))}
            </div>
          )}

          {furtherReading && furtherReading.length > 0 && (
            <div style={{
              display: "flex", flexDirection: "column", gap: "4px",
              paddingTop: "8px",
              borderTop: `1px solid ${palette.border}`,
            }}>
              <div style={{
                fontSize: "9px", fontWeight: 600, color: palette.textDim,
                textTransform: "uppercase", letterSpacing: "0.6px",
                fontFamily: fonts.mono, marginBottom: "2px",
              }}>Further reading</div>
              {furtherReading.map(link => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    fontSize: "11px", color: palette.accent,
                    textDecoration: "none",
                    fontFamily: fonts.sans,
                  }}
                >
                  {link.label}
                  <ExternalLink size={11} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
