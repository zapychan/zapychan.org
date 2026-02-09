import { useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { useIsMobile } from "../../hooks/useIsMobile";

const TrailContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99998;
  overflow: hidden;
`;

const TRAIL_CHARS = ["✦", "♥", "✧", "⋆", "✿", "♡", "˚", "⊹"];

const TRAIL_COLORS = [
  "#fffef0", // sparkle cream
  "#ffe0e4", // blush
  "#ffc2d8", // light pink
  "#ffa4cc", // soft pink
  "#ff86c0", // medium pink
];

export function CursorTrail() {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const throttleRef = useRef(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const now = Date.now();
      if (now - throttleRef.current < 25) return; // throttle to ~40fps
      throttleRef.current = now;

      const container = containerRef.current;
      if (!container) return;

      const count = 3 + Math.floor(Math.random() * 3); // 2-3 particles per tick
      for (let i = 0; i < count; i++) {
        const color = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)] ?? TRAIL_COLORS[0];
        const size = 6 + Math.random() * 8;
        const offsetX = (Math.random() - 0.5) * 22;
        const offsetY = (Math.random() - 0.5) * 22;
        const particle = document.createElement("div");
        particle.textContent = TRAIL_CHARS[Math.floor(Math.random() * TRAIL_CHARS.length)] ?? "✦";
        particle.style.cssText = `
          position: fixed;
          left: ${e.clientX + offsetX}px;
          top: ${e.clientY + offsetY}px;
          font-size: ${size}px;
          pointer-events: none;
          animation: cursorFade 0.6s ease-out forwards;
          color: ${color};
          text-shadow: 0 0 6px ${color}, 0 0 12px ${color}88;
          filter: saturate(1.4) brightness(1.15);
          z-index: 99998;
        `;
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1200);
      }
    },
    [],
  );

  useEffect(() => {
    if (isMobile) return;
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile, handleMouseMove]);

  if (isMobile) return null;

  return (
    <>
      <style>{`
        @keyframes cursorFade {
          0% { opacity: 1; transform: scale(1) translate(0, 0); }
          40% { opacity: 0.8; transform: scale(1.1) translate(0, -4px); }
          100% { opacity: 0; transform: scale(0.3) translate(0, -14px); }
        }
      `}</style>
      <TrailContainer ref={containerRef} />
    </>
  );
}
