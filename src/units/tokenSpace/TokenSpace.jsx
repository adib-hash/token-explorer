import { useState, useRef, useMemo, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { palette } from "../../theme.js";
import { VOCAB, CLUSTER_COLORS, CLUSTER_LABELS, getFirstTokenInCluster } from "./data.js";
import TokenSpaceScene from "./Scene.jsx";
import IntroPanel from "../../shared/ui/IntroPanel.jsx";
import UnitNav from "../../shared/ui/UnitNav.jsx";
import { findUnit } from "../../shared/data/curriculum.js";

const UNIT = findUnit("token-space");

const CONTENT_MAX = 960;

export default function TokenSpace({ onNavigate, onHome }) {
  const [selectedToken, setSelectedToken] = useState(null);
  const cameraRef = useRef();

  const selectedCluster = selectedToken && VOCAB[selectedToken]
    ? VOCAB[selectedToken].cluster
    : null;

  const nearbyTokens = useMemo(() => {
    if (!selectedToken || !VOCAB[selectedToken]) return [];
    const sel = VOCAB[selectedToken];
    return Object.entries(VOCAB)
      .filter(([n]) => n !== selectedToken)
      .map(([name, data]) => {
        const d = Math.sqrt(
          (data.pos[0] - sel.pos[0]) ** 2 +
          (data.pos[1] - sel.pos[1]) ** 2 +
          (data.pos[2] - sel.pos[2]) ** 2
        );
        return { name, ...data, distance: d };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  }, [selectedToken]);

  const handleClusterClick = useCallback((cluster) => {
    if (selectedCluster === cluster) {
      setSelectedToken(null);
    } else {
      const firstToken = getFirstTokenInCluster(cluster);
      if (firstToken) setSelectedToken(firstToken);
    }
  }, [selectedCluster]);

  return (
    <div style={{ padding: "0 0 16px" }}>
      <div style={{ padding: "16px 16px 0", maxWidth: CONTENT_MAX, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <IntroPanel {...UNIT} unitId={UNIT.id} />
      </div>

      <div style={{
        position: "relative",
        width: "100%",
        height: "min(70vh, 640px)",
        minHeight: "420px",
        background: palette.bg,
      }}>
        <Canvas
          camera={{ position: [5, 4, 8], fov: 50 }}
          style={{ background: palette.bg }}
          gl={{ antialias: true, alpha: true }}
        >
          <TokenSpaceScene
            selectedToken={selectedToken}
            onSelectToken={setSelectedToken}
            selectedCluster={selectedCluster}
            cameraRef={cameraRef}
          />
        </Canvas>

        <div style={{
          position: "absolute", top: "10px", left: "10px",
          display: "flex", flexWrap: "wrap", gap: "4px",
          maxWidth: "calc(100% - 72px)", zIndex: 10,
        }}>
          {Object.entries(CLUSTER_COLORS).map(([cluster, color]) => {
            const isActive = selectedCluster === cluster;
            return (
              <button key={cluster}
                onClick={() => handleClusterClick(cluster)}
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "6px 12px", borderRadius: "6px",
                  background: isActive ? color + "30" : selectedCluster && !isActive ? palette.surface + "80" : palette.surface + "dd",
                  border: `1.5px solid ${isActive ? color : palette.border}`,
                  fontSize: "11px",
                  color: isActive ? color : selectedCluster && !isActive ? palette.textDim + "60" : palette.textDim,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: isActive ? `0 0 8px ${color}30` : "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: color,
                  opacity: selectedCluster && !isActive ? 0.4 : 1,
                  boxShadow: isActive ? `0 0 6px ${color}` : "none",
                  transition: "opacity 0.3s ease",
                }} />
                {cluster}
              </button>
            );
          })}
        </div>

        <div style={{
          position: "absolute", top: "10px", right: "14px",
          display: "flex", flexDirection: "column", gap: "4px",
          alignItems: "flex-end",
          zIndex: 10,
        }}>
          {selectedCluster && (
            <button
              onClick={() => setSelectedToken(null)}
              style={{
                width: "38px", height: "38px", borderRadius: "8px",
                border: `1px solid ${palette.border}`,
                background: palette.surface + "ee",
                color: palette.textDim, fontSize: "14px",
                cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                WebkitTapHighlightColor: "transparent",
                transition: "all 0.2s ease",
              }}
              title="Back to all clusters"
            >←</button>
          )}
          <button
            onClick={() => cameraRef.current?.zoomIn()}
            style={{
              width: "38px", height: "38px", borderRadius: "8px",
              border: `1px solid ${palette.border}`,
              background: palette.surface + "ee",
              color: palette.text, fontSize: "18px",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              WebkitTapHighlightColor: "transparent",
            }}
            title="Zoom in"
          >+</button>
          <button
            onClick={() => cameraRef.current?.zoomOut()}
            style={{
              width: "38px", height: "38px", borderRadius: "8px",
              border: `1px solid ${palette.border}`,
              background: palette.surface + "ee",
              color: palette.text, fontSize: "18px",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              WebkitTapHighlightColor: "transparent",
            }}
            title="Zoom out"
          >−</button>
          <button
            onClick={() => cameraRef.current?.resetZoom()}
            style={{
              width: "38px", height: "38px", borderRadius: "8px",
              border: `1px solid ${palette.border}`,
              background: palette.surface + "ee",
              color: palette.accent, fontSize: "11px", fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              WebkitTapHighlightColor: "transparent",
            }}
            title="Reset zoom"
          >1x</button>
        </div>

        <div style={{
          position: "absolute", bottom: "10px", left: "10px",
          fontSize: "10px", color: palette.textDim + "90",
          fontFamily: "'JetBrains Mono', monospace",
          background: palette.bg + "cc", padding: "5px 10px", borderRadius: "4px",
          zIndex: 10,
        }}>
          {selectedCluster
            ? `viewing ${CLUSTER_LABELS[selectedCluster].toLowerCase()} · tap a legend pill or ← to go back`
            : "drag to rotate · tap a sphere or token to explore · scroll to zoom"
          }
        </div>
      </div>

      <div style={{ maxWidth: CONTENT_MAX, width: "100%", margin: "0 auto", padding: "0 16px", boxSizing: "border-box" }}>
        {selectedToken && VOCAB[selectedToken] ? (
          <div style={{
            padding: "16px 18px",
            borderRadius: "12px",
            border: `1px solid ${palette.border}`,
            background: palette.surface,
            marginTop: "16px",
          }}>
            <div style={{
              display: "flex", alignItems: "center",
              gap: "10px", marginBottom: "10px", flexWrap: "wrap",
            }}>
              <div style={{
                padding: "5px 14px", borderRadius: "8px",
                background: VOCAB[selectedToken].color + "25",
                border: `2px solid ${VOCAB[selectedToken].color}`,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "16px", fontWeight: 700,
                color: VOCAB[selectedToken].color,
              }}>{selectedToken}</div>
              <div style={{
                padding: "3px 10px", borderRadius: "20px",
                background: CLUSTER_COLORS[VOCAB[selectedToken].cluster] + "15",
                border: `1px solid ${CLUSTER_COLORS[VOCAB[selectedToken].cluster]}30`,
                fontSize: "11px", color: CLUSTER_COLORS[VOCAB[selectedToken].cluster],
                fontFamily: "'JetBrains Mono', monospace",
              }}>{CLUSTER_LABELS[VOCAB[selectedToken].cluster]}</div>
            </div>
            <div style={{ fontSize: "12px", color: palette.textDim, marginBottom: "10px", lineHeight: 1.5 }}>
              Nearest tokens in embedding space. <span style={{ color: palette.accent }}>Lower distance = more similar meaning.</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {nearbyTokens.map(t => {
                const closeness = Math.max(0, 1 - t.distance / 3);
                const isCrossCluster = t.cluster !== VOCAB[selectedToken].cluster;
                return (
                  <button key={t.name} onClick={() => setSelectedToken(t.name)} style={{
                    padding: "6px 14px", borderRadius: "6px",
                    border: `1px solid ${t.color}50`, background: t.color + "15",
                    color: t.color, fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                    transition: "all 0.15s",
                  }}>
                    {t.name}
                    <span style={{
                      fontSize: "10px", opacity: 0.7,
                      padding: "1px 5px", borderRadius: "3px",
                      background: `rgba(255,255,255,${closeness * 0.1})`,
                    }}>{t.distance.toFixed(2)}</span>
                    {isCrossCluster && (
                      <span style={{
                        fontSize: "10px", opacity: 0.5,
                        padding: "1px 4px", borderRadius: "3px",
                        border: `1px solid ${CLUSTER_COLORS[t.cluster]}40`,
                        color: CLUSTER_COLORS[t.cluster],
                      }}>{t.cluster}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{
            padding: "14px 16px", borderRadius: "10px",
            border: `1px solid ${palette.border}`,
            background: palette.surface,
            marginTop: "16px", textAlign: "center",
          }}>
            <div style={{ fontSize: "12px", color: palette.textDim, lineHeight: 1.5 }}>
              Click any sphere or token to explore its nearest neighbors in the embedding space.
            </div>
          </div>
        )}

        {onNavigate && <UnitNav unitId={UNIT.id} onNavigate={onNavigate} onHome={onHome} />}
      </div>
    </div>
  );
}
