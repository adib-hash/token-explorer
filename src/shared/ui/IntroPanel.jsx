import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ExternalLink, X } from "lucide-react";
import { palette, fonts } from "../../theme.js";

export default function IntroPanel({ unitId, title, tagline, whyItMatters, concepts, furtherReading }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 14px",
          borderRadius: "10px",
          border: `1px solid ${palette.accent}30`,
          background: `linear-gradient(180deg, ${palette.accent}12 0%, ${palette.accent}06 100%)`,
          color: palette.text,
          cursor: "pointer",
          fontFamily: fonts.sans,
          textAlign: "left",
          WebkitTapHighlightColor: "transparent",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{
          fontSize: "10px",
          fontWeight: 700,
          color: palette.accent,
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          fontFamily: fonts.mono,
          flexShrink: 0,
        }}>
          Why this matters
        </div>
        <div style={{
          width: "1px",
          height: "16px",
          background: palette.accent + "30",
          flexShrink: 0,
        }} />
        <div style={{
          flex: 1,
          minWidth: 0,
          fontSize: "13px",
          color: palette.textDim,
          lineHeight: 1.4,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {tagline}
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 10px",
          borderRadius: "999px",
          background: palette.accent + "18",
          color: palette.accent,
          fontSize: "11px",
          fontWeight: 600,
          fontFamily: fonts.sans,
          flexShrink: 0,
        }}>
          Learn more
          <ArrowRight size={12} />
        </div>
      </button>

      {open && (
        <IntroModal
          title={title}
          tagline={tagline}
          whyItMatters={whyItMatters}
          concepts={concepts}
          furtherReading={furtherReading}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function IntroModal({ title, tagline, whyItMatters, concepts, furtherReading, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 8, 16, 0.72)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeSlideIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "calc(100dvh - 40px)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          border: `1px solid ${palette.accent}40`,
          background: palette.surface,
          boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${palette.accent}20`,
          overflow: "hidden",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          padding: "20px 20px 12px",
          borderBottom: `1px solid ${palette.border}`,
          background: `linear-gradient(180deg, ${palette.accent}12 0%, transparent 100%)`,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "10px",
              fontWeight: 700,
              color: palette.accent,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              fontFamily: fonts.mono,
              marginBottom: "6px",
            }}>
              Why this matters
            </div>
            <div style={{
              fontSize: "18px",
              fontWeight: 700,
              color: palette.text,
              fontFamily: fonts.sans,
              letterSpacing: "-0.2px",
              lineHeight: 1.3,
            }}>
              {title}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: `1px solid ${palette.border}`,
              background: palette.bg,
              color: palette.textDim,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "16px 20px 20px",
        }}>
          <div style={{
            fontSize: "13px",
            color: palette.textDim,
            lineHeight: 1.5,
            marginBottom: "14px",
            fontStyle: "italic",
          }}>
            {tagline}
          </div>

          <div style={{
            fontSize: "14px",
            color: palette.text,
            lineHeight: 1.7,
            marginBottom: "16px",
            whiteSpace: "pre-wrap",
          }}>
            {whyItMatters}
          </div>

          {concepts && concepts.length > 0 && (
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: furtherReading && furtherReading.length > 0 ? "18px" : 0,
            }}>
              {concepts.map((c) => (
                <div key={c} style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: palette.bg,
                  border: `1px solid ${palette.border}`,
                  fontSize: "11px",
                  color: palette.textDim,
                  fontFamily: fonts.mono,
                  letterSpacing: "0.3px",
                }}>{c}</div>
              ))}
            </div>
          )}

          {furtherReading && furtherReading.length > 0 && (
            <div style={{
              paddingTop: "14px",
              borderTop: `1px solid ${palette.border}`,
            }}>
              <div style={{
                fontSize: "10px",
                fontWeight: 700,
                color: palette.textDim,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                fontFamily: fonts.mono,
                marginBottom: "8px",
              }}>
                Further reading
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {furtherReading.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      color: palette.accent,
                      textDecoration: "none",
                      fontFamily: fonts.sans,
                    }}
                  >
                    {link.label}
                    <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
