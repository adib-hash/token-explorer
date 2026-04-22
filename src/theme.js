export const palette = {
  bg: "#0a0e1a", surface: "#111827", surfaceHover: "#1a2235",
  border: "#1e293b", text: "#e2e8f0", textDim: "#94a3b8",
  accent: "#6c5ce7", accentGlow: "rgba(108, 92, 231, 0.3)",
  success: "#00b894", warning: "#fdcb6e", danger: "#e17055",
};

export const fonts = {
  sans: "'DM Sans', -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
  serif: "'Georgia', serif",
};

export const motion = { fast: 180, base: 280, slow: 520 };
export const breakpoints = { sm: 480, md: 640, lg: 1024 };

export const keyframesCss = `
@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(108,92,231,0.4); } 50% { box-shadow: 0 0 0 8px rgba(108,92,231,0); } }
`;

export const googleFontsHref = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
