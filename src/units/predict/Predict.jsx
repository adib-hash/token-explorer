import { useState, useMemo, Fragment } from "react";
import { Thermometer, RotateCcw, GraduationCap, Eye, Sparkles } from "lucide-react";
import { palette, fonts } from "../../theme.js";
import { softmax } from "../../shared/util.js";
import IntroPanel from "../../shared/ui/IntroPanel.jsx";
import UnitNav from "../../shared/ui/UnitNav.jsx";
import { findUnit } from "../../shared/data/curriculum.js";
import { PREDICT_SCENARIOS, DEFAULT_SCENARIO } from "./data.js";

const UNIT = findUnit("predict");

const VIEWS = [
  { id: "attention", label: "Attention",  Icon: Eye },
  { id: "logits",    label: "Next token", Icon: Sparkles },
  { id: "training",  label: "Training vs. inference", Icon: GraduationCap },
];

function ScenarioPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
      {PREDICT_SCENARIOS.map(s => (
        <button key={s.id} onClick={() => onChange(s.id)} style={{
          padding: "7px 12px", borderRadius: "8px",
          border: `1px solid ${s.id === value ? palette.accent : palette.border}`,
          background: s.id === value ? palette.accent + "20" : "transparent",
          color: s.id === value ? palette.accent : palette.textDim,
          fontSize: "11px", fontFamily: fonts.mono,
          cursor: "pointer", transition: "all 0.2s",
          WebkitTapHighlightColor: "transparent",
        }}>{s.label}</button>
      ))}
    </div>
  );
}

function PrefixStrip({ tokens, committed, hoveredIdx, onHover }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center",
      padding: "12px 14px", borderRadius: "10px",
      background: palette.surface, border: `1px solid ${palette.border}`,
      marginBottom: "12px",
    }}>
      {tokens.map((tok, i) => (
        <div key={i}
          onMouseEnter={onHover ? () => onHover(i) : undefined}
          onMouseLeave={onHover ? () => onHover(null) : undefined}
          onClick={onHover ? () => onHover(hoveredIdx === i ? null : i) : undefined}
          style={{
            padding: "5px 10px", borderRadius: "6px",
            background: hoveredIdx === i ? palette.accent + "30" : palette.bg,
            border: `1.5px solid ${hoveredIdx === i ? palette.accent : palette.border}`,
            fontFamily: fonts.mono, fontSize: "14px",
            color: palette.text,
            cursor: onHover ? "pointer" : "default",
            transition: "all 0.2s",
            WebkitTapHighlightColor: "transparent",
          }}>{tok}</div>
      ))}
      {committed ? (
        <div style={{
          padding: "5px 10px", borderRadius: "6px",
          background: palette.success + "25",
          border: `1.5px solid ${palette.success}`,
          fontFamily: fonts.mono, fontSize: "14px", fontWeight: 700,
          color: palette.success,
          animation: "fadeSlideIn 0.3s ease",
        }}>{committed}</div>
      ) : (
        <div style={{
          padding: "5px 16px", borderRadius: "6px",
          border: `1.5px dashed ${palette.accent}60`,
          fontFamily: fonts.mono, fontSize: "14px",
          color: palette.accent, letterSpacing: "2px",
        }}>___</div>
      )}
    </div>
  );
}

function AttentionView({ scenario, hoveredIdx, setHoveredIdx }) {
  const { prefix, attention } = scenario;
  const N = prefix.length;

  // Which row to display as a "spotlight" — if hovered, that row; otherwise last row.
  const spotlightRow = hoveredIdx == null ? N - 1 : hoveredIdx;
  const weights = attention[spotlightRow];

  return (
    <div>
      <div style={{ fontSize: "11px", color: palette.textDim, marginBottom: "10px", fontFamily: fonts.mono, lineHeight: 1.6 }}>
        Each token can look at earlier tokens in the sentence to decide what comes next. Brighter = paying more attention. Hover a token to see what it attends to.
      </div>

      <PrefixStrip tokens={prefix} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} />

      {/* Spotlight row: shows what the selected token attends to */}
      <div style={{
        display: "flex", gap: "4px", alignItems: "flex-end",
        padding: "12px 14px", borderRadius: "10px",
        background: palette.surface, border: `1px solid ${palette.border}`,
        marginBottom: "16px",
      }}>
        <div style={{
          fontSize: "10px", fontFamily: fonts.mono, color: palette.textDim,
          marginRight: "6px", whiteSpace: "nowrap",
        }}>
          <strong style={{ color: palette.accent }}>{prefix[spotlightRow]}</strong>
          <br />attends →
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${N}, 1fr)`, gap: "3px" }}>
          {weights.map((w, j) => {
            const active = j <= spotlightRow;
            const alpha = Math.max(0.08, w);
            return (
              <div key={j} style={{
                padding: "10px 4px", borderRadius: "6px",
                background: active ? `rgba(108, 92, 231, ${alpha})` : palette.bg,
                border: `1px solid ${active && w > 0.05 ? palette.accent + "80" : palette.border}`,
                textAlign: "center",
                transition: "all 0.25s ease",
              }}>
                <div style={{
                  fontSize: "10px", fontFamily: fonts.mono,
                  color: active ? palette.text : palette.textDim + "80",
                  marginBottom: "2px",
                }}>{prefix[j]}</div>
                <div style={{
                  fontSize: "9px", fontFamily: fonts.mono,
                  color: active && w > 0.05 ? palette.accent : palette.textDim + "60",
                }}>{active ? w.toFixed(2) : "—"}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full attention matrix as a heatmap */}
      <div style={{
        padding: "14px", borderRadius: "10px",
        background: palette.surface, border: `1px solid ${palette.border}`,
      }}>
        <div style={{ fontSize: "10px", fontFamily: fonts.mono, color: palette.textDim, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
          Attention matrix
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: `auto repeat(${N}, minmax(0, 1fr))`,
          gap: "2px",
          fontFamily: fonts.mono, fontSize: "9px",
        }}>
          <div />
          {prefix.map((t, j) => (
            <div key={`col-${j}`} style={{
              textAlign: "center", padding: "2px 0", color: palette.textDim,
            }}>{t}</div>
          ))}
          {prefix.map((from, i) => (
            <Fragment key={`row-${i}`}>
              <div style={{
                padding: "0 6px 0 0", textAlign: "right", color: palette.textDim,
                display: "flex", alignItems: "center", justifyContent: "flex-end",
              }}>{from}</div>
              {prefix.map((_, j) => {
                const w = attention[i][j];
                const alpha = j > i ? 0 : Math.max(0.04, w);
                return (
                  <div key={`cell-${i}-${j}`} style={{
                    aspectRatio: "1 / 1",
                    background: j > i ? palette.border + "40" : `rgba(108, 92, 231, ${alpha})`,
                    borderRadius: "3px",
                    border: i === spotlightRow ? `1px solid ${palette.accent}80` : `1px solid transparent`,
                    transition: "border-color 0.2s",
                  }} />
                );
              })}
            </Fragment>
          ))}
        </div>
        <div style={{ fontSize: "9px", color: palette.textDim + "b0", marginTop: "8px", fontFamily: fonts.mono, lineHeight: 1.5 }}>
          Rows = "from". Columns = "to". Upper triangle is masked (a token can't attend to the future).
        </div>
      </div>

      <div style={{
        marginTop: "14px", padding: "10px 12px", borderRadius: "8px",
        background: palette.accent + "08", border: `1px solid ${palette.accent}20`,
        fontSize: "11px", color: palette.textDim, lineHeight: 1.6,
      }}>
        {scenario.footnote}
      </div>
    </div>
  );
}

function LogitsView({ scenario, committed, setCommitted }) {
  const [temperature, setTemperature] = useState(1.0);

  const ranked = useMemo(() => {
    const logits = scenario.logits.map(l => l.logit);
    const probs = softmax(logits, temperature);
    return scenario.logits
      .map((l, i) => ({ token: l.token, prob: probs[i] }))
      .sort((a, b) => b.prob - a.prob);
  }, [scenario, temperature]);

  const maxProb = ranked[0].prob;

  return (
    <div>
      <div style={{ fontSize: "11px", color: palette.textDim, marginBottom: "10px", fontFamily: fonts.mono, lineHeight: 1.6 }}>
        For every possible next token the model has a score. Softmax turns those scores into probabilities. Click a bar to commit that token.
      </div>

      <PrefixStrip tokens={scenario.prefix} committed={committed} />

      <div style={{
        padding: "12px 14px", borderRadius: "10px",
        background: palette.surface, border: `1px solid ${palette.border}`,
        marginBottom: "14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <Thermometer size={14} color={palette.warning} />
          <div style={{ fontSize: "11px", color: palette.textDim, fontFamily: fonts.mono }}>
            Temperature: <strong style={{ color: palette.text }}>{temperature.toFixed(2)}</strong>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{
            fontSize: "9px", color: palette.textDim, fontFamily: fonts.mono,
          }}>{temperature < 0.3 ? "deterministic" : temperature > 1.3 ? "creative" : "balanced"}</span>
        </div>
        <input
          type="range" min="0" max="2" step="0.05"
          value={temperature}
          onChange={e => setTemperature(parseFloat(e.target.value))}
          style={{
            width: "100%", accentColor: palette.accent,
            cursor: "pointer",
          }}
        />
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: "9px", color: palette.textDim + "a0",
          fontFamily: fonts.mono, marginTop: "2px",
        }}>
          <span>0 · sharp peak</span>
          <span>1 · neutral</span>
          <span>2 · flat</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {ranked.map((r, i) => {
          const pct = r.prob * 100;
          const width = (r.prob / maxProb) * 100;
          const isTop = i === 0;
          return (
            <button key={r.token} onClick={() => setCommitted(r.token)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 12px", borderRadius: "8px",
                background: palette.surface,
                border: `1px solid ${isTop ? palette.accent + "60" : palette.border}`,
                cursor: committed ? "default" : "pointer",
                textAlign: "left", color: palette.text, fontFamily: fonts.sans,
                opacity: committed && committed !== r.token ? 0.45 : 1,
                WebkitTapHighlightColor: "transparent",
                transition: "all 0.2s",
              }}
              disabled={!!committed}
            >
              <span style={{
                fontFamily: fonts.mono, fontSize: "13px", fontWeight: 600,
                color: isTop ? palette.accent : palette.text,
                minWidth: "90px",
              }}>{r.token}</span>
              <div style={{ flex: 1, height: "10px", background: palette.bg, borderRadius: "5px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${width}%`,
                  background: `linear-gradient(90deg, ${palette.accent}, ${palette.accent}cc)`,
                  borderRadius: "5px",
                  transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                }} />
              </div>
              <span style={{
                fontFamily: fonts.mono, fontSize: "11px", fontWeight: 700,
                color: palette.textDim, minWidth: "44px", textAlign: "right",
              }}>{pct.toFixed(1)}%</span>
            </button>
          );
        })}
      </div>

      {committed && (
        <div style={{
          marginTop: "14px", padding: "12px 14px", borderRadius: "10px",
          background: palette.success + "10", border: `1px solid ${palette.success}40`,
          display: "flex", alignItems: "center", gap: "10px",
          animation: "fadeSlideIn 0.3s ease",
        }}>
          <Sparkles size={14} color={palette.success} />
          <div style={{ fontSize: "11px", color: palette.text, lineHeight: 1.5, flex: 1 }}>
            You picked <strong style={{ color: palette.success }}>{committed}</strong>. This is <em>one</em> step. Repeat the same process — prefix + attention + logits + pick — thousands of times to generate a full response.
          </div>
          <button onClick={() => setCommitted(null)} style={{
            padding: "5px 10px", borderRadius: "6px",
            background: "transparent", border: `1px solid ${palette.border}`,
            color: palette.textDim, fontSize: "10px", fontFamily: fonts.mono,
            cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
            WebkitTapHighlightColor: "transparent",
          }}><RotateCcw size={10} /> Reset</button>
        </div>
      )}

      <div style={{
        marginTop: "14px", fontSize: "9px", color: palette.textDim + "90",
        fontFamily: fonts.mono, lineHeight: 1.6,
      }}>
        * Distribution is hand-picked for clarity. Real LLMs have ~100k tokens in their vocabulary, not 10.
      </div>
    </div>
  );
}

function TrainingView({ scenario }) {
  const probs = useMemo(() => {
    const logits = scenario.logits.map(l => l.logit);
    return softmax(logits, 1);
  }, [scenario]);
  const pairs = scenario.logits.map((l, i) => ({ ...l, prob: probs[i] }));
  const correctIdx = pairs.findIndex(p => p.token === scenario.correctToken);
  const topIdx = pairs.reduce((best, p, i) => p.prob > pairs[best].prob ? i : best, 0);
  const modelPicked = pairs[topIdx].token;
  const isRight = modelPicked === scenario.correctToken;

  return (
    <div>
      <div style={{ fontSize: "11px", color: palette.textDim, marginBottom: "10px", fontFamily: fonts.mono, lineHeight: 1.6 }}>
        During <strong style={{ color: palette.accent }}>inference</strong> the model just predicts. During <strong style={{ color: palette.warning }}>training</strong> the model is shown the right answer and nudged toward it — over billions of examples.
      </div>

      <PrefixStrip tokens={scenario.prefix} />

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px",
        marginBottom: "14px",
      }}>
        {/* Inference side */}
        <div style={{
          padding: "12px", borderRadius: "10px",
          background: palette.surface, border: `1px solid ${palette.border}`,
        }}>
          <div style={{
            fontSize: "10px", fontFamily: fonts.mono, fontWeight: 700,
            color: palette.accent, textTransform: "uppercase", letterSpacing: "0.5px",
            marginBottom: "8px",
          }}>Inference</div>
          <div style={{
            fontSize: "11px", color: palette.textDim, marginBottom: "10px", lineHeight: 1.5,
          }}>Model picks the highest-probability token.</div>
          <div style={{
            padding: "8px 10px", borderRadius: "6px",
            background: palette.accent + "20", border: `1px solid ${palette.accent}60`,
            fontFamily: fonts.mono, fontSize: "14px", fontWeight: 700,
            color: palette.accent, textAlign: "center",
          }}>{modelPicked}</div>
        </div>

        {/* Training side */}
        <div style={{
          padding: "12px", borderRadius: "10px",
          background: palette.warning + "08",
          border: `1px solid ${palette.warning}40`,
        }}>
          <div style={{
            fontSize: "10px", fontFamily: fonts.mono, fontWeight: 700,
            color: palette.warning, textTransform: "uppercase", letterSpacing: "0.5px",
            marginBottom: "8px",
          }}>Training target</div>
          <div style={{
            fontSize: "11px", color: palette.textDim, marginBottom: "10px", lineHeight: 1.5,
          }}>The correct next token — from the training data.</div>
          <div style={{
            padding: "8px 10px", borderRadius: "6px",
            background: palette.success + "25", border: `1px solid ${palette.success}`,
            fontFamily: fonts.mono, fontSize: "14px", fontWeight: 700,
            color: palette.success, textAlign: "center",
          }}>{scenario.correctToken}</div>
        </div>
      </div>

      <div style={{
        padding: "14px", borderRadius: "10px",
        background: palette.surface, border: `1px solid ${palette.border}`,
        marginBottom: "12px",
      }}>
        <div style={{
          fontSize: "10px", fontFamily: fonts.mono, color: palette.textDim,
          marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.4px",
        }}>Loss pushes these probabilities</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {pairs
            .map((p, i) => ({ ...p, idx: i }))
            .sort((a, b) => b.prob - a.prob)
            .slice(0, 6)
            .map(p => {
              const isCorrect = p.token === scenario.correctToken;
              const pct = p.prob * 100;
              return (
                <div key={p.token} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "6px 10px", borderRadius: "6px",
                  background: isCorrect ? palette.success + "12" : palette.bg,
                  border: `1px solid ${isCorrect ? palette.success + "60" : palette.border}`,
                }}>
                  <span style={{
                    fontFamily: fonts.mono, fontSize: "12px", fontWeight: 600,
                    color: isCorrect ? palette.success : palette.text,
                    minWidth: "80px",
                  }}>{p.token}</span>
                  <span style={{
                    fontFamily: fonts.mono, fontSize: "14px",
                    color: isCorrect ? palette.success : palette.textDim,
                    minWidth: "28px", textAlign: "center",
                  }}>{isCorrect ? "↑" : "↓"}</span>
                  <div style={{ flex: 1, height: "6px", background: palette.bg, borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct * 2}%`, maxWidth: "100%",
                      background: isCorrect ? palette.success : palette.textDim + "80",
                      borderRadius: "3px",
                    }} />
                  </div>
                  <span style={{
                    fontFamily: fonts.mono, fontSize: "10px",
                    color: palette.textDim, minWidth: "38px", textAlign: "right",
                  }}>{pct.toFixed(1)}%</span>
                </div>
              );
            })
          }
        </div>
      </div>

      <div style={{
        padding: "12px 14px", borderRadius: "8px",
        background: palette.accent + "08", border: `1px solid ${palette.accent}20`,
        fontSize: "11px", color: palette.textDim, lineHeight: 1.7,
      }}>
        On this example the current model is <strong style={{ color: isRight ? palette.success : palette.danger }}>{isRight ? "correct" : "wrong"}</strong>. Training computes a loss — how much probability the model gave to the right token vs. everything else — and nudges the weights so the right token becomes more likely next time. Do that over trillions of tokens and you get a trained LLM.
      </div>
    </div>
  );
}

export default function Predict({ onNavigate, onHome }) {
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO);
  const [view, setView] = useState("logits");
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [committed, setCommitted] = useState(null);

  const scenario = PREDICT_SCENARIOS.find(s => s.id === scenarioId) || PREDICT_SCENARIOS[0];

  // Reset per-view state when scenario changes
  const handleScenarioChange = (id) => {
    setScenarioId(id);
    setCommitted(null);
    setHoveredIdx(null);
  };

  return (
    <div style={{ padding: "16px", maxWidth: "720px", margin: "0 auto" }}>
      <IntroPanel {...UNIT} unitId={UNIT.id} />

      <ScenarioPicker value={scenarioId} onChange={handleScenarioChange} />

      <div style={{
        display: "flex", gap: "4px",
        borderRadius: "10px", padding: "4px",
        background: palette.surface, border: `1px solid ${palette.border}`,
        marginBottom: "16px",
      }}>
        {VIEWS.map(v => {
          const Icon = v.Icon;
          const active = view === v.id;
          return (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              flex: 1,
              padding: "9px 8px", borderRadius: "7px",
              border: "none",
              background: active ? palette.accent + "25" : "transparent",
              color: active ? palette.accent : palette.textDim,
              fontSize: "11px", fontFamily: fonts.sans,
              fontWeight: active ? 600 : 500,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              transition: "all 0.2s",
              WebkitTapHighlightColor: "transparent",
            }}>
              <Icon size={13} />
              <span style={{ whiteSpace: "nowrap" }}>{v.label}</span>
            </button>
          );
        })}
      </div>

      {view === "attention" && (
        <AttentionView scenario={scenario} hoveredIdx={hoveredIdx} setHoveredIdx={setHoveredIdx} />
      )}
      {view === "logits" && (
        <LogitsView scenario={scenario} committed={committed} setCommitted={setCommitted} />
      )}
      {view === "training" && (
        <TrainingView scenario={scenario} />
      )}

      {onNavigate && <UnitNav unitId={UNIT.id} onNavigate={onNavigate} onHome={onHome} />}
    </div>
  );
}
