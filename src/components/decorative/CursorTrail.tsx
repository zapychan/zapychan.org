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

interface CursorTrailProps {
  isEvil?: boolean;
}

const TRAIL_CHARS = ["✦", "♥", "✧", "⋆", "✿"];
const EVIL_TRAIL_CHARS = ["✦", "◈", "✧", "⊗", "⬥"];

export function CursorTrail({ isEvil }: CursorTrailProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const throttleRef = useRef(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const now = Date.now();
      if (now - throttleRef.current < 50) return; // throttle to ~20fps
      throttleRef.current = now;

      const container = containerRef.current;
      if (!container) return;

      const chars = isEvil ? EVIL_TRAIL_CHARS : TRAIL_CHARS;
      const particle = document.createElement("div");
      particle.textContent = chars[Math.floor(Math.random() * chars.length)] ?? "✦";
      particle.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        font-size: ${8 + Math.random() * 10}px;
        pointer-events: none;
        animation: cursorFade 0.8s ease-out forwards;
        color: ${isEvil ? "#cc3366" : "#ff69b4"};
        z-index: 99998;
      `;
      container.appendChild(particle);

      setTimeout(() => particle.remove(), 800);
    },
    [isEvil],
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
          100% { opacity: 0; transform: scale(0.3) translate(${Math.random() > 0.5 ? "" : "-"}10px, -25px); }
        }
      `}</style>
      <TrailContainer ref={containerRef} />
    </>
  );
}
