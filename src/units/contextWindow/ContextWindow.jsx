import { useState, useEffect, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { palette } from "../../theme.js";
import { WHITEBOARD_SCENARIOS } from "./data.js";
import IntroPanel from "../../shared/ui/IntroPanel.jsx";
import UnitNav from "../../shared/ui/UnitNav.jsx";
import { findUnit } from "../../shared/data/curriculum.js";

const UNIT = findUnit("context-window");

function ContextWindowViz() {
  const [activeScenario, setActiveScenario] = useState("chat");
  const [phase, setPhase] = useState("empty");
  const [animProgress, setAnimProgress] = useState(0);

  const scenario = WHITEBOARD_SCENARIOS.find(s => s.id === activeScenario);
  const { systemSize, promptSize, responseSize, contextLimit } = scenario;
  const totalNeeded = systemSize + promptSize + responseSize;
  const isOverflow = totalNeeded > contextLimit;

  const switchToScenario = useCallback((scenarioId) => {
    setActiveScenario(scenarioId);
    setPhase("empty");
    setAnimProgress(0);
  }, []);

  useEffect(() => {
    setPhase("empty");
    setAnimProgress(0);
  }, [activeScenario]);

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

  const systemText = "You are a helpful AI assistant. Follow the user's instructions carefully. Respond concisely.";

  return (
    <div>
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

      <div style={{
        borderRadius: "12px", overflow: "hidden",
        border: `2px solid ${isOverflow && phase === "overflow" ? palette.danger : palette.border}`,
        background: palette.surface,
        minHeight: "240px",
        position: "relative",
        transition: "border-color 0.5s ease",
      }}>
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

        <div style={{ padding: "12px", minHeight: "190px", position: "relative" }}>
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

          {phase === "overflow" && (
            <div style={{
              padding: "16px", borderRadius: "8px",
              background: palette.danger + "12",
              border: `2px solid ${palette.danger}50`,
              textAlign: "center",
            }}>
              <div style={{
                display: "flex", justifyContent: "center", marginBottom: "8px",
                color: palette.danger,
              }}>
                <AlertTriangle size={22} />
              </div>
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

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
        <button onClick={replay} style={{
          padding: "5px 12px", borderRadius: "6px",
          border: `1px solid ${palette.border}`, background: "transparent",
          color: palette.textDim, fontSize: "10px",
          fontFamily: "'JetBrains Mono', monospace", cursor: "pointer",
          transition: "all 0.2s",
        }}>Replay animation</button>
      </div>

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

export default function ContextWindow({ onNavigate, onHome }) {
  return (
    <div style={{ padding: "16px", maxWidth: "960px", margin: "0 auto" }}>
      <IntroPanel {...UNIT} unitId={UNIT.id} />

      <div style={{ fontSize: "13px", color: palette.textDim, marginBottom: "6px", lineHeight: 1.6 }}>
        Think of an LLM's memory as a whiteboard. Everything — the system instructions, your prompt, and the AI's response — must fit on that whiteboard at once. This is the <strong style={{ color: palette.text }}>context window</strong>.
      </div>
      <div style={{ fontSize: "11px", color: palette.textDim, marginBottom: "16px", lineHeight: 1.6 }}>
        Watch how different tasks fill the board. When it overflows, the model literally cannot hold the information — older messages fall off, or the request is rejected entirely.
      </div>

      <ContextWindowViz />

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

      {onNavigate && <UnitNav unitId={UNIT.id} onNavigate={onNavigate} onHome={onHome} />}
    </div>
  );
}
