import { useState } from "react";
import { palette, fonts } from "../../../theme.js";
import { AnswerPill } from "./DirectVsThinking.jsx";

export default function Budget({ scenario }) {
  const stops = scenario.budget;
  const [idx, setIdx] = useState(0);
  const current = stops[idx];
  const visibleSteps = scenario.thinking.steps.slice(0, current.stepsShown);
  const cost = visibleSteps.reduce((s, step) => s + step.tokens, 0);

  return (
    <div>
      <ProblemCard text={scenario.problem} />

      <div style={{
        marginTop: "16px",
        padding: "14px 16px",
        borderRadius: "10px",
        border: `1px solid ${palette.border}`,
        background: palette.surface,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "10px",
          flexWrap: "wrap", gap: "8px",
        }}>
          <div style={{
            fontSize: "10px", fontWeight: 700, color: palette.textDim,
            textTransform: "uppercase", letterSpacing: "0.6px",
            fontFamily: fonts.mono,
          }}>Thinking budget</div>
          <div style={{
            fontSize: "13px", color: palette.text,
            fontFamily: fonts.mono, fontWeight: 600,
          }}>{current.budget} tokens</div>
        </div>

        <input
          type="range"
          min={0}
          max={stops.length - 1}
          step={1}
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          style={{
            width: "100%",
            accentColor: palette.accent,
            cursor: "pointer",
          }}
        />

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4px",
        }}>
          {stops.map((s, i) => (
            <button
              key={s.budget}
              onClick={() => setIdx(i)}
              style={{
                background: "transparent",
                border: "none",
                padding: "4px 6px",
                fontSize: "11px",
                fontFamily: fonts.mono,
                color: i === idx ? palette.accent : palette.textDim,
                fontWeight: i === idx ? 700 : 400,
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >{s.budget}</button>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: "16px",
        padding: "16px 18px",
        borderRadius: "12px",
        border: `1px solid ${current.correct ? palette.accent + "30" : palette.danger + "30"}`,
        background: current.correct
          ? `linear-gradient(180deg, ${palette.accent}08 0%, ${palette.surface} 60%)`
          : `linear-gradient(180deg, ${palette.danger}06 0%, ${palette.surface} 60%)`,
        transition: "all 0.3s",
      }}>
        <div style={{
          fontSize: "10px", fontWeight: 700, color: palette.textDim,
          textTransform: "uppercase", letterSpacing: "0.6px",
          fontFamily: fonts.mono, marginBottom: "10px",
        }}>Trace (truncated to budget)</div>

        {visibleSteps.length === 0 ? (
          <div style={{
            padding: "18px 10px",
            textAlign: "center",
            fontSize: "13px",
            color: palette.textDim,
            fontStyle: "italic",
          }}>No steps — answer is generated directly.</div>
        ) : (
          <ol style={{
            listStyle: "none", padding: 0, margin: 0,
            display: "flex", flexDirection: "column", gap: "8px",
          }}>
            {visibleSteps.map((step, i) => (
              <li key={i} style={{
                display: "flex", gap: "10px", alignItems: "baseline",
                padding: "8px 10px",
                borderRadius: "8px",
                background: palette.bg + "80",
                border: `1px solid ${palette.border}`,
              }}>
                <span style={{
                  fontSize: "11px", fontFamily: fonts.mono,
                  color: palette.accent, fontWeight: 700, flexShrink: 0,
                }}>{i + 1}.</span>
                <span style={{
                  fontSize: "14px", color: palette.text,
                  lineHeight: 1.5, flex: 1,
                }}>{step.text}</span>
              </li>
            ))}
            {current.stepsShown < scenario.thinking.steps.length && (
              <li style={{
                fontSize: "13px",
                color: palette.textDim,
                fontStyle: "italic",
                fontFamily: fonts.mono,
                textAlign: "center",
                padding: "4px 0",
              }}>⋯ ran out of budget</li>
            )}
          </ol>
        )}

        <div style={{
          marginTop: "14px",
          paddingTop: "12px",
          borderTop: `1px solid ${palette.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "12px", flexWrap: "wrap",
        }}>
          <AnswerPill value={current.answer} correct={current.correct} />
          <div style={{
            fontSize: "12px", color: palette.textDim, fontFamily: fonts.mono,
          }}>Cost: {cost} tokens used</div>
        </div>

        <div style={{
          marginTop: "12px",
          fontSize: "13px",
          color: palette.textDim,
          lineHeight: 1.55,
          fontStyle: "italic",
        }}>{current.note}</div>
      </div>

      <Footnote />
    </div>
  );
}

function ProblemCard({ text }) {
  return (
    <div style={{
      padding: "14px 16px",
      borderRadius: "10px",
      border: `1px solid ${palette.border}`,
      background: palette.surface,
    }}>
      <div style={{
        fontSize: "10px", fontWeight: 700, color: palette.textDim,
        textTransform: "uppercase", letterSpacing: "0.6px",
        fontFamily: fonts.mono, marginBottom: "6px",
      }}>Problem</div>
      <div style={{
        fontSize: "15px", color: palette.text, lineHeight: 1.55,
        fontFamily: fonts.sans,
      }}>{text}</div>
    </div>
  );
}

function Footnote() {
  return (
    <div style={{
      marginTop: "16px",
      fontSize: "11px",
      color: palette.textDim,
      fontStyle: "italic",
      textAlign: "center",
      fontFamily: fonts.sans,
    }}>
      Illustrative — hand-picked steps and answers, not live model output.
    </div>
  );
}
