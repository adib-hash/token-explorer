import { useEffect, useState } from "react";
import { ShieldCheck, RotateCcw } from "lucide-react";
import { palette, fonts } from "../../../theme.js";
import { AnswerPill } from "./DirectVsThinking.jsx";

export default function SelfVerify({ scenario }) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(false);
  }, [scenario.id]);

  return (
    <div>
      <ProblemCard text={scenario.problem} />

      <Stage
        number={1}
        label="Initial answer"
        tone={scenario.verify.initial.correct ? "accent" : "danger"}
        reasoning={scenario.verify.initial.reasoning}
        answer={scenario.verify.initial.answer}
        correct={scenario.verify.initial.correct}
      />

      {!checked ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
          <button
            onClick={() => setChecked(true)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "11px 18px",
              borderRadius: "10px",
              background: palette.accent + "20",
              border: `1px solid ${palette.accent}60`,
              color: palette.accent,
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: fonts.sans,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              transition: "all 0.2s",
            }}
          >
            <ShieldCheck size={15} />
            Run self-check
          </button>
        </div>
      ) : (
        <>
          <DownArrow />

          <div style={{
            padding: "14px 16px",
            borderRadius: "10px",
            border: `1px solid ${palette.warning}40`,
            background: `linear-gradient(180deg, ${palette.warning}10 0%, ${palette.surface} 100%)`,
            marginTop: "16px",
            animation: "fadeSlideIn 0.3s ease",
          }}>
            <div style={{
              fontSize: "10px", fontWeight: 700,
              color: palette.warning,
              textTransform: "uppercase", letterSpacing: "0.6px",
              fontFamily: fonts.mono,
              marginBottom: "8px",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <ShieldCheck size={12} /> Self-critique
            </div>
            <div style={{
              fontSize: "14px", color: palette.text, lineHeight: 1.6,
            }}>"{scenario.verify.critique}"</div>
          </div>

          <DownArrow />

          <Stage
            number={2}
            label="Revised answer"
            tone={scenario.verify.revised.correct ? "accent" : "danger"}
            reasoning={scenario.verify.revised.reasoning}
            answer={scenario.verify.revised.answer}
            correct={scenario.verify.revised.correct}
          />

          <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
            <button
              onClick={() => setChecked(false)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 16px", borderRadius: "8px",
                background: palette.surface,
                border: `1px solid ${palette.border}`,
                color: palette.textDim,
                fontSize: "13px", fontFamily: fonts.sans,
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
                transition: "all 0.2s",
              }}
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </>
      )}

      <Footnote />
    </div>
  );
}

function Stage({ number, label, tone, reasoning, answer, correct }) {
  const color = tone === "accent" ? palette.accent : palette.danger;

  return (
    <div style={{
      marginTop: "16px",
      padding: "16px 18px",
      borderRadius: "12px",
      border: `1px solid ${color}30`,
      background: `linear-gradient(180deg, ${color}08 0%, ${palette.surface} 60%)`,
      borderLeft: `4px solid ${color}`,
      animation: "fadeSlideIn 0.3s ease",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        marginBottom: "10px",
      }}>
        <div style={{
          width: "22px", height: "22px", borderRadius: "50%",
          background: color + "25",
          color,
          fontSize: "11px", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: fonts.mono,
        }}>{number}</div>
        <div style={{
          fontSize: "10px", fontWeight: 700, color,
          textTransform: "uppercase", letterSpacing: "0.6px",
          fontFamily: fonts.mono,
        }}>Stage {number} — {label}</div>
      </div>

      <div style={{
        fontSize: "14px", color: palette.text, lineHeight: 1.6,
        marginBottom: "14px",
        fontStyle: "italic",
      }}>"{reasoning}"</div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <AnswerPill value={answer} correct={correct} />
      </div>
    </div>
  );
}

function DownArrow() {
  return (
    <div style={{
      display: "flex", justifyContent: "center",
      padding: "6px 0",
      color: palette.textDim,
      fontSize: "20px",
      fontFamily: fonts.mono,
    }}>↓</div>
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
      Illustrative — hand-picked reasoning, not live model output.
    </div>
  );
}
