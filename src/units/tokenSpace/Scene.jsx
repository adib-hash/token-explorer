import { useState, useRef, useMemo, useCallback, useImperativeHandle, forwardRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import { palette } from "../../theme.js";
import { VOCAB, CLUSTER_COLORS, CROSS_CLUSTER_LINKS, getFirstTokenInCluster } from "./data.js";

function ClusterSphere({ position, color, label, onClick, isHidden }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const clickScaleRef = useRef(1);

  useFrame(() => {
    if (!meshRef.current) return;
    const target = isHidden ? 0 : 1;

    if (clicked) {
      clickScaleRef.current = THREE.MathUtils.lerp(clickScaleRef.current, 1.4, 0.15);
      if (clickScaleRef.current > 1.38) {
        setClicked(false);
      }
    } else {
      clickScaleRef.current = THREE.MathUtils.lerp(clickScaleRef.current, 1.0, 0.1);
    }

    const s = target * clickScaleRef.current;
    meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);

    if (!isHidden) {
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.002 + position[0]) * 0.04;
    }
  });

  if (isHidden) return null;

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); setClicked(true); onClick(); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.35, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.6 : 0.3}
        roughness={0.2}
        metalness={0.3}
        transparent
        opacity={0.9}
      />
      <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div style={{
          fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.9)",
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase", letterSpacing: "0.5px",
          textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          whiteSpace: "nowrap", userSelect: "none",
        }}>
          {label}
        </div>
      </Html>
      {hovered && (
        <mesh>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      )}
    </mesh>
  );
}

function TokenLabel({ name, data, isSelected, isNearby, dimmed, position, onClick }) {
  return (
    <Html position={position} center distanceFactor={8} style={{ pointerEvents: "auto" }}>
      <div
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        style={{
          padding: "5px 12px", borderRadius: "7px", fontSize: "11px",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontWeight: isSelected ? 700 : 500,
          color: dimmed ? palette.textDim + "40" : isSelected ? "#fff" : palette.text,
          background: isSelected ? data.color + "55" : isNearby ? data.color + "25" : palette.surface + "cc",
          border: `1.5px solid ${isSelected ? data.color : isNearby ? data.color + "60" : palette.border + "60"}`,
          boxShadow: isSelected
            ? `0 0 16px ${data.color}50, 0 0 32px ${data.color}20`
            : isNearby ? `0 0 8px ${data.color}20` : `0 2px 6px rgba(0,0,0,0.25)`,
          cursor: "pointer",
          transition: "background 0.3s, border 0.3s, box-shadow 0.3s, opacity 0.4s, color 0.3s",
          whiteSpace: "nowrap",
          opacity: dimmed ? 0.15 : 1,
          WebkitTapHighlightColor: "transparent",
          userSelect: "none",
        }}
      >
        {name}
      </div>
    </Html>
  );
}

function ConnectionLine({ start, end, color, dashed, opacity }) {
  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={dashed ? 1.5 : 2}
      dashed={dashed}
      dashSize={0.15}
      gapSize={0.1}
      transparent
      opacity={opacity}
    />
  );
}

export const DEFAULT_CAM_POS = [5, 4, 8];

export const CameraZoomController = forwardRef(function CameraZoomController(_, ref) {
  const { camera } = useThree();

  useImperativeHandle(ref, () => ({
    zoomIn() {
      const dir = camera.position.clone().normalize();
      const dist = camera.position.length();
      const newDist = Math.max(4, dist - 1.2);
      camera.position.copy(dir.multiplyScalar(newDist));
    },
    zoomOut() {
      const dir = camera.position.clone().normalize();
      const dist = camera.position.length();
      const newDist = Math.min(16, dist + 1.2);
      camera.position.copy(dir.multiplyScalar(newDist));
    },
    resetZoom() {
      camera.position.set(...DEFAULT_CAM_POS);
      camera.lookAt(0, 0, 0);
    },
    getDistance() {
      return camera.position.length();
    },
  }));

  return null;
});

export default function TokenSpaceScene({ selectedToken, onSelectToken, selectedCluster, cameraRef }) {
  const tokens = Object.entries(VOCAB);
  const SPREAD_FACTOR = 1.4;

  const centroids = useMemo(() => {
    const result = {};
    for (const [cluster] of Object.entries(CLUSTER_COLORS)) {
      const ct = tokens.filter(([, v]) => v.cluster === cluster);
      result[cluster] = [
        ct.reduce((s, [, v]) => s + v.pos[0], 0) / ct.length,
        ct.reduce((s, [, v]) => s + v.pos[1], 0) / ct.length,
        ct.reduce((s, [, v]) => s + v.pos[2], 0) / ct.length,
      ];
    }
    return result;
  }, []);

  const getSpreadPos = useCallback((data) => {
    if (!selectedCluster || data.cluster !== selectedCluster) return data.pos;
    const c = centroids[data.cluster];
    const dx = data.pos[0] - c[0];
    const dy = data.pos[1] - c[1];
    const dz = data.pos[2] - c[2];
    return [
      dx * (1 + SPREAD_FACTOR),
      dy * (1 + SPREAD_FACTOR),
      dz * (1 + SPREAD_FACTOR),
    ];
  }, [selectedCluster, centroids]);

  const visibleTokens = useMemo(() => {
    if (!selectedCluster) return tokens;
    return tokens.filter(([, data]) => data.cluster === selectedCluster);
  }, [selectedCluster, tokens]);

  const crossLinks = useMemo(() => {
    if (!selectedCluster) return [];
    return CROSS_CLUSTER_LINKS.filter(
      l => VOCAB[l.a].cluster === selectedCluster || VOCAB[l.b].cluster === selectedCluster
    );
  }, [selectedCluster]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -5, -10]} intensity={0.4} color="#6c5ce7" />

      <CameraZoomController ref={cameraRef} />

      <OrbitControls
        enableDamping
        dampingFactor={0.12}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        minDistance={4}
        maxDistance={16}
        maxPolarAngle={Math.PI * 0.78}
        minPolarAngle={Math.PI * 0.22}
        enablePan={false}
        autoRotate={!selectedCluster && !selectedToken}
        autoRotateSpeed={0.8}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY }}
      />

      {Object.entries(CLUSTER_COLORS).map(([cluster, color]) => (
        <ClusterSphere
          key={`sphere-${cluster}`}
          position={centroids[cluster]}
          color={color}
          label={cluster}
          isHidden={!!selectedCluster}
          onClick={() => {
            const first = getFirstTokenInCluster(cluster);
            if (first) onSelectToken(first);
          }}
        />
      ))}

      {Object.entries(CLUSTER_COLORS).map(([cluster, color]) => {
        const show = !selectedCluster || cluster === selectedCluster;
        if (!show) return null;
        const pos = selectedCluster === cluster ? [0, 0, 0] : centroids[cluster];
        return (
          <pointLight
            key={`glow-${cluster}`}
            position={pos}
            color={color}
            intensity={selectedCluster === cluster ? 2 : 0.6}
            distance={selectedCluster === cluster ? 8 : 4}
          />
        );
      })}

      {selectedToken && VOCAB[selectedToken] && visibleTokens
        .filter(([name]) => name !== selectedToken)
        .map(([name, data]) => {
          const selData = VOCAB[selectedToken];
          const dist = Math.sqrt(
            (data.pos[0] - selData.pos[0]) ** 2 +
            (data.pos[1] - selData.pos[1]) ** 2 +
            (data.pos[2] - selData.pos[2]) ** 2
          );
          if (dist > 2.5) return null;
          const opacity = Math.max(0.15, 1 - dist / 2.5) * 0.6;
          return (
            <ConnectionLine
              key={`line-${name}`}
              start={getSpreadPos(selData)}
              end={getSpreadPos(data)}
              color={data.color}
              dashed={dist > 1.5}
              opacity={opacity}
            />
          );
        })}

      {crossLinks.map((link, i) => {
        const fromSelected = VOCAB[link.a].cluster === selectedCluster ? link.a : link.b;
        const toOther = fromSelected === link.a ? link.b : link.a;
        const opacity = Math.max(0.1, 1 - link.dist / 4.5) * 0.4;
        return (
          <ConnectionLine
            key={`cross-${i}`}
            start={getSpreadPos(VOCAB[fromSelected])}
            end={VOCAB[toOther].pos}
            color={VOCAB[toOther].color}
            dashed
            opacity={opacity}
          />
        );
      })}

      {visibleTokens.map(([name, data]) => {
        const isSelected = name === selectedToken;
        const isNearby = selectedToken && name !== selectedToken && (() => {
          const s = VOCAB[selectedToken];
          if (!s) return false;
          return Math.sqrt(
            (data.pos[0] - s.pos[0]) ** 2 +
            (data.pos[1] - s.pos[1]) ** 2 +
            (data.pos[2] - s.pos[2]) ** 2
          ) <= 2.5;
        })();
        const dimmed = selectedToken && !isSelected && !isNearby && !selectedCluster;
        const sp = getSpreadPos(data);

        return (
          <TokenLabel
            key={name}
            name={name}
            data={data}
            isSelected={isSelected}
            isNearby={isNearby}
            dimmed={dimmed}
            position={sp}
            onClick={() => onSelectToken(isSelected ? null : name)}
          />
        );
      })}
    </>
  );
}
