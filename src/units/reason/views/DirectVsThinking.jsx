import { useEffect, useState } from "react";
import { RotateCcw, X, Check } from "lucide-react";
import { palette, fonts } from "../../../theme.js";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery.js";

export default function DirectVsThinking({ scenario }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [revealKey, setRevealKey] = useState(0);

  const { direct, thinking } = scenario;
  const thinkingTokens = thinking.steps.reduce((s, step) => s + step.tokens, 0);

  return (
    <div>
      <ProblemCard text={scenario.problem} />

      <div style={{
        display: "flex",
        flexDirection: isDesktop ? "row" : "column",
        gap: "12px",
        marginTop: "16px",
      }}>
        <DirectPanel direct={direct} />
        <ThinkingPanel
          steps={thinking.steps}
          answer={thinking.answer}
          totalTokens={thinkingTokens}
          revealKey={revealKey}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
        <button
          onClick={() => setRevealKey(k => k + 1)}
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
          Replay
        </button>
      </div>

      <Footnote />
    </div>
  );
}

function DirectPanel({ direct }) {
  return (
    <div style={{
      flex: 1,
      padding: "16px 18px",
      borderRadius: "12px",
      border: `1px solid ${palette.danger}30`,
      background: `linear-gradient(180deg, ${palette.danger}08 0%, ${palette.surface} 60%)`,
      display: "flex", flexDirection: "column",
    }}>
      <Heading tone="danger">Direct</Heading>
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 0 16px",
      }}>
        <AnswerPill value={direct.answer} correct={direct.correct} big />
      </div>
      <MetaRow tokens={direct.tokens} />
      <div style={{
        marginTop: "12px",
        paddingTop: "12px",
        borderTop: `1px solid ${palette.border}`,
        fontSize: "13px",
        color: palette.textDim,
        lineHeight: 1.55,
        fontStyle: "italic",
      }}>
        {direct.commentary}
      </div>
    </div>
  );
}

function ThinkingPanel({ steps, answer, totalTokens, revealKey }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    const timeouts = [];
    steps.forEach((_, i) => {
      timeouts.push(setTimeout(() => setShown(i + 1), 260 * (i + 1)));
    });
    return () => timeouts.forEach(clearTimeout);
  }, [steps, revealKey]);

  const allShown = shown >= steps.length;

  return (
    <div style={{
      flex: 1,
      padding: "16px 18px",
      borderRadius: "12px",
      border: `1px solid ${palette.accent}30`,
      background: `linear-gradient(180deg, ${palette.accent}08 0%, ${palette.surface} 60%)`,
      display: "flex", flexDirection: "column",
    }}>
      <Heading tone="accent">With thinking</Heading>

      <ol style={{
        listStyle: "none",
        padding: 0,
        margin: "12px 0 0",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}>
        {steps.map((step, i) => (
          <li key={i} style={{
            display: i < shown ? "flex" : "none",
            gap: "10px",
            alignItems: "baseline",
            padding: "8px 10px",
            borderRadius: "8px",
            background: palette.bg + "80",
            border: `1px solid ${palette.border}`,
            animation: "fadeSlideIn 0.28s ease",
          }}>
            <span style={{
              fontSize: "11px",
              fontFamily: fonts.mono,
              color: palette.accent,
              fontWeight: 700,
              flexShrink: 0,
            }}>{i + 1}.</span>
            <span style={{
              fontSize: "14px",
              color: palette.text,
              lineHeight: 1.5,
              flex: 1,
            }}>{step.text}</span>
          </li>
        ))}
      </ol>

      <div style={{
        marginTop: "16px",
        paddingTop: "12px",
        borderTop: `1px solid ${palette.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
      }}>
        <div style={{
          opacity: allShown ? 1 : 0.3,
          transition: "opacity 0.3s",
        }}>
          <AnswerPill value={answer} correct={true} />
        </div>
        <div style={{ opacity: allShown ? 1 : 0.3, transition: "opacity 0.3s" }}>
          <MetaRow tokens={totalTokens} />
        </div>
      </div>
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
        fontSize: "10px",
        fontWeight: 700,
        color: palette.textDim,
        textTransform: "uppercase",
        letterSpacing: "0.6px",
        fontFamily: fonts.mono,
        marginBottom: "6px",
      }}>Problem</div>
      <div style={{
        fontSize: "15px",
        color: palette.text,
        lineHeight: 1.55,
        fontFamily: fonts.sans,
      }}>{text}</div>
    </div>
  );
}

function Heading({ tone, children }) {
  const color = tone === "danger" ? palette.danger : palette.accent;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}80`,
      }} />
      <div style={{
        fontSize: "10px",
        fontWeight: 700,
        color,
        textTransform: "uppercase",
        letterSpacing: "0.6px",
        fontFamily: fonts.mono,
      }}>{children}</div>
    </div>
  );
}

export function AnswerPill({ value, correct, big = false }) {
  const color = correct ? palette.success : palette.danger;
  const Icon = correct ? Check : X;
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: big ? "10px 18px" : "6px 12px",
      borderRadius: big ? "12px" : "8px",
      border: `2px solid ${color}`,
      background: color + "18",
      color,
      fontSize: big ? "22px" : "14px",
      fontWeight: 700,
      fontFamily: fonts.mono,
      letterSpacing: "0.5px",
    }}>
      {value}
      <Icon size={big ? 18 : 14} strokeWidth={3} />
    </div>
  );
}

export function MetaRow({ tokens }) {
  return (
    <div style={{
      fontSize: "12px",
      color: palette.textDim,
      fontFamily: fonts.mono,
    }}>
      {tokens} tokens
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
      Illustrative — hand-picked steps, not live model output.
    </div>
  );
}
