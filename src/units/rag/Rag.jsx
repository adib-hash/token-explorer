import { useState, useMemo, useEffect } from "react";
import { Citrus, Cherry, Salad, Sun, Pill, Milk, Leaf, Circle } from "lucide-react";
import { palette } from "../../theme.js";
import { computeSimilarity } from "../../shared/util.js";
import { RAG_CHUNKS } from "./data.js";
import IntroPanel from "../../shared/ui/IntroPanel.jsx";
import UnitNav from "../../shared/ui/UnitNav.jsx";
import { findUnit } from "../../shared/data/curriculum.js";

const UNIT = findUnit("rag");

function ChunkIcon({ iconName, tint, size = 16 }) {
  const ICON_MAP = { Citrus, Cherry, Salad, Sun, Pill, Milk, Leaf };
  const Icon = ICON_MAP[iconName] || Circle;
  return (
    <div style={{
      width: size + 10, height: size + 10,
      borderRadius: "50%",
      background: tint + "20",
      border: `1px solid ${tint}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={size} color={tint} />
    </div>
  );
}

function RAGViz() {
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("What foods are high in vitamin C?");
  const [animPhase, setAnimPhase] = useState(0);

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

  useEffect(() => {
    setAnimPhase(0);
    if (step >= 2) {
      const t1 = setTimeout(() => setAnimPhase(1), 400);
      const t2 = setTimeout(() => setAnimPhase(2), 800);
      const t3 = setTimeout(() => setAnimPhase(3), 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [step]);

  const fakeVector = useMemo(() =>
    Array.from({ length: 12 }, () => (Math.random() * 2 - 1).toFixed(2)),
    [query]
  );

  const stepLabels = ["Query", "Embed", "Search", "Retrieve", "Generate"];

  return (
    <div>
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

      <div style={{ marginBottom: "20px", padding: "0 8px" }}>
        <div style={{
          display: "flex", alignItems: "flex-start",
          position: "relative",
        }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              position: "relative",
            }}>
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

      {step === 1 && (
        <div style={{
          padding: "20px", borderRadius: "12px",
          background: palette.surface, border: `1px solid ${palette.border}`,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px",
            flexWrap: "wrap", justifyContent: "center",
          }}>
            <div style={{
              padding: "8px 14px", borderRadius: "8px",
              background: palette.accent + "10", border: `1px solid ${palette.accent}30`,
              fontSize: "12px", color: palette.text, maxWidth: "180px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              fontFamily: "'JetBrains Mono', monospace",
            }}>"{query.slice(0, 25)}..."</div>

            <div style={{ color: palette.accent, fontSize: "18px", animation: "blink 1s infinite" }}>→</div>

            <div style={{
              padding: "8px 14px", borderRadius: "8px",
              background: palette.accent + "20", border: `1px solid ${palette.accent}50`,
              fontSize: "10px", color: palette.accent, fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
            }}>embedding model</div>

            <div style={{ color: palette.accent, fontSize: "18px" }}>→</div>
          </div>

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
                  <ChunkIcon iconName={chunk.iconName} tint={chunk.tint} size={14} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "10px", color: palette.text, lineHeight: 1.4,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{chunk.text}</div>
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

      {step === 3 && (
        <div style={{
          padding: "16px", borderRadius: "12px",
          background: palette.surface, border: `1px solid ${palette.border}`,
        }}>
          <div style={{
            display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center",
            marginBottom: "16px",
          }}>
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
                  <div style={{ marginBottom: "4px" }}>
                    <ChunkIcon iconName={chunk.iconName} tint={chunk.tint} size={12} />
                  </div>
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

          <div style={{
            textAlign: "center", margin: "8px 0",
            fontSize: "10px", color: palette.accent,
            fontFamily: "'JetBrains Mono', monospace",
          }}>↓ injected into prompt as context ↓</div>

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
              <span style={{ color: palette.success }}>Context:</span> {chunks.filter(c => c.relevant).map(c => `[${c.text.slice(0, 32)}...]`).join(" ")}<br/>
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

      {step === 4 && (
        <div style={{
          padding: "16px", borderRadius: "12px",
          background: palette.surface, border: `1px solid ${palette.border}`,
        }}>
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
                <ChunkIcon iconName={chunk.iconName} tint={chunk.tint} size={11} />
                <span style={{
                  fontSize: "10px", color: palette.textDim,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  flex: 1, minWidth: 0,
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

export default function Rag({ onNavigate, onHome }) {
  return (
    <div style={{ padding: "16px", maxWidth: "720px", margin: "0 auto" }}>
      <IntroPanel {...UNIT} unitId={UNIT.id} />

      <div style={{ fontSize: "13px", color: palette.textDim, marginBottom: "6px", lineHeight: 1.6 }}>
        <strong style={{ color: palette.text }}>Retrieval-Augmented Generation</strong> — how LLMs answer questions from documents they weren't trained on.
      </div>
      <div style={{ fontSize: "11px", color: palette.textDim, marginBottom: "16px", lineHeight: 1.6 }}>
        Step through each stage to see how a question becomes a grounded, source-cited answer.
      </div>
      <RAGViz />

      {onNavigate && <UnitNav unitId={UNIT.id} onNavigate={onNavigate} onHome={onHome} />}
    </div>
  );
}
