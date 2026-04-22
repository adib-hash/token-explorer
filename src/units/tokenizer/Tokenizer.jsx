import { useState, useMemo } from "react";
import { palette } from "../../theme.js";
import { simpleTokenize } from "../../shared/util.js";
import IntroPanel from "../../shared/ui/IntroPanel.jsx";
import UnitNav from "../../shared/ui/UnitNav.jsx";
import { findUnit } from "../../shared/data/curriculum.js";
import { TOKENIZE_EXAMPLES, MORPHEME_MEANINGS, MORPHEME_TYPES, MORPHEME_TYPE_COLORS } from "./data.js";

const UNIT = findUnit("tokenizer");

function TokenizerViz({ word, tokens }) {
  const [activeIdx, setActiveIdx] = useState(null);

  const vectors = useMemo(() =>
    tokens.map(() => [
      (Math.random() * 2 - 1).toFixed(2),
      (Math.random() * 2 - 1).toFixed(2),
      (Math.random() * 2 - 1).toFixed(2),
    ]),
    [tokens.join(",")]
  );

  const charCount = word.length;
  const tokenCount = tokens.length;
  const ratio = (charCount / tokenCount).toFixed(1);

  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <span style={{
          fontFamily: "'Georgia', serif", fontSize: "28px",
          color: palette.text, letterSpacing: "2px",
        }}>{word}</span>
        <div style={{
          fontSize: "11px", color: palette.textDim, marginTop: "4px",
          fontFamily: "'JetBrains Mono', monospace",
        }}>raw text input</div>
      </div>

      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        gap: "12px", marginBottom: "16px", flexWrap: "wrap",
      }}>
        <div style={{
          padding: "6px 14px", borderRadius: "8px",
          background: palette.warning + "15", border: `1px solid ${palette.warning}30`,
          fontFamily: "'JetBrains Mono', monospace", fontSize: "12px",
        }}>
          <span style={{ color: palette.warning, fontWeight: 700 }}>{charCount}</span>
          <span style={{ color: palette.textDim }}> chars</span>
        </div>
        <span style={{ color: palette.accent, fontSize: "16px" }}>→</span>
        <div style={{
          padding: "6px 14px", borderRadius: "8px",
          background: palette.accent + "15", border: `1px solid ${palette.accent}30`,
          fontFamily: "'JetBrains Mono', monospace", fontSize: "12px",
        }}>
          <span style={{ color: palette.accent, fontWeight: 700 }}>{tokenCount}</span>
          <span style={{ color: palette.textDim }}> tokens</span>
        </div>
        <div style={{
          padding: "4px 10px", borderRadius: "6px",
          background: palette.surface, border: `1px solid ${palette.border}`,
          fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: palette.textDim,
        }}>{ratio} chars/token</div>
      </div>

      <div style={{
        textAlign: "center", margin: "4px 0 16px", color: palette.accent,
        fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
      }}>↓ subword tokenization ↓</div>

      <div style={{
        display: "flex", justifyContent: "center", gap: "12px",
        marginBottom: "14px", flexWrap: "wrap",
      }}>
        {Object.entries(MORPHEME_TYPE_COLORS).map(([type, style]) => (
          <div key={type} style={{
            display: "flex", alignItems: "center", gap: "4px",
            fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: style.text,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "2px",
              background: style.bg, border: `1px solid ${style.border}`,
            }} />
            {style.label}
          </div>
        ))}
      </div>

      <div style={{
        display: "flex", justifyContent: "center",
        gap: "8px", flexWrap: "wrap", marginBottom: "20px",
      }}>
        {tokens.map((tok, i) => {
          const isActive = activeIdx === i;
          const type = MORPHEME_TYPES[tok] || "root";
          const typeStyle = MORPHEME_TYPE_COLORS[type];
          return (
            <div key={`${word}-${i}`}
              onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)}
              onClick={() => setActiveIdx(isActive ? null : i)}
              style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
            >
              <div style={{
                padding: "10px 18px", borderRadius: "8px",
                background: isActive ? typeStyle.bg.replace("20", "40") : typeStyle.bg,
                border: `2px solid ${isActive ? typeStyle.border.replace("60", "cc") : typeStyle.border}`,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "18px", fontWeight: 600, color: typeStyle.text,
                transition: "all 0.2s ease",
                boxShadow: isActive ? `0 0 20px ${typeStyle.border.replace("60", "30")}` : "none",
              }}>{tok}</div>
              <div style={{
                fontSize: "10px", color: palette.textDim, marginTop: "4px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>{type} · #{i + 1}</div>
              {isActive && MORPHEME_MEANINGS[tok] && (
                <div style={{
                  position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
                  transform: "translateX(-50%)",
                  maxWidth: "90vw", whiteSpace: "normal",
                  padding: "6px 12px", borderRadius: "6px",
                  background: palette.surface, border: `1px solid ${palette.border}`,
                  fontSize: "10px", color: palette.text,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)", zIndex: 100,
                  fontFamily: "'JetBrains Mono', monospace",
                  animation: "fadeSlideIn 0.2s ease",
                }}>
                  {MORPHEME_MEANINGS[tok]}
                  <div style={{
                    position: "absolute", bottom: "-4px", left: "50%",
                    transform: "translateX(-50%) rotate(45deg)",
                    width: "8px", height: "8px",
                    background: palette.surface, borderRight: `1px solid ${palette.border}`,
                    borderBottom: `1px solid ${palette.border}`,
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        padding: "12px 16px", borderRadius: "8px",
        background: palette.surface, border: `1px solid ${palette.border}`,
      }}>
        <div style={{
          fontSize: "10px", color: palette.textDim, marginBottom: "8px",
          fontFamily: "'JetBrains Mono', monospace",
        }}>embedding vectors (simplified — real vectors have 768+ dimensions)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {tokens.map((tok, i) => {
            const type = MORPHEME_TYPES[tok] || "root";
            const typeStyle = MORPHEME_TYPE_COLORS[type];
            return (
              <div key={`vec-${i}`} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "4px 8px", borderRadius: "4px",
                background: activeIdx === i ? typeStyle.bg : "transparent",
                transition: "background 0.2s",
              }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px", color: typeStyle.text, fontWeight: 600, minWidth: "80px",
                }}>{tok}</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px", color: palette.textDim,
                }}>[{vectors[i].join(", ")}]</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Tokenizer({ onNavigate, onHome }) {
  const [tokenizerInput, setTokenizerInput] = useState("unhappily");
  const [customWord, setCustomWord] = useState("");

  const currentTokenization = useMemo(() => {
    if (TOKENIZE_EXAMPLES[tokenizerInput]) return TOKENIZE_EXAMPLES[tokenizerInput];
    return simpleTokenize(tokenizerInput);
  }, [tokenizerInput]);

  return (
    <div style={{ padding: "16px", maxWidth: "720px", margin: "0 auto" }}>
      <IntroPanel {...UNIT} unitId={UNIT.id} />

      <div style={{ fontSize: "13px", color: palette.textDim, marginBottom: "16px", lineHeight: 1.6 }}>
        Models break words into morphemes: the smallest meaningful fragments in their ~100k-token vocabulary.
      </div>

      <div style={{ marginBottom: "12px" }}>
        <input
          type="text"
          value={customWord}
          onChange={e => {
            const val = e.target.value;
            setCustomWord(val);
            if (val.trim().length > 0) {
              setTokenizerInput(val.trim().toLowerCase());
            }
          }}
          placeholder="Type any word to tokenize..."
          style={{
            width: "100%", padding: "10px 14px", borderRadius: "8px",
            border: `1px solid ${customWord ? palette.accent : palette.border}`,
            background: palette.surface,
            color: palette.text, fontSize: "16px",
            fontFamily: "'JetBrains Mono', monospace",
            outline: "none", boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
        {Object.keys(TOKENIZE_EXAMPLES).map(word => (
          <button key={word} onClick={() => { setTokenizerInput(word); setCustomWord(""); }} style={{
            padding: "8px 14px", borderRadius: "6px",
            border: `1px solid ${word === tokenizerInput ? palette.accent : palette.border}`,
            background: word === tokenizerInput ? palette.accent + "20" : "transparent",
            color: word === tokenizerInput ? palette.accent : palette.textDim,
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            cursor: "pointer", transition: "all 0.2s",
          }}>{word}</button>
        ))}
      </div>
      <TokenizerViz word={tokenizerInput} tokens={currentTokenization} />
      <div style={{
        marginTop: "24px", padding: "14px 16px", borderRadius: "10px",
        background: palette.accent + "08", border: `1px solid ${palette.accent}20`,
      }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: palette.accent, marginBottom: "6px" }}>Why does this matter?</div>
        <div style={{ fontSize: "11px", color: palette.textDim, lineHeight: 1.7 }}>
          This is why AI can understand a word it's never seen before, like "Sprockethouse" → [sprocket] + [house]. But it also explains why AI struggles with character-level tasks like counting letters.
        </div>
      </div>

      {onNavigate && <UnitNav unitId={UNIT.id} onNavigate={onNavigate} onHome={onHome} />}
    </div>
  );
}
