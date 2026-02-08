import { useMemo } from "react";
import styled, { keyframes } from "styled-components";

const glitchShift = keyframes`
  0%, 90%, 100% { transform: none; opacity: 1; }
  92% { transform: translateX(2px) skewX(2deg); opacity: 0.8; }
  94% { transform: translateX(-1px); opacity: 1; }
  96% { transform: translateX(1px) skewX(-1deg); opacity: 0.9; }
`;

const GlitchWrapper = styled.span<{ $intensity?: number }>`
  position: relative;
  display: inline;
  animation: ${glitchShift} ${({ $intensity }) => 8 - ($intensity ?? 1) * 2}s ease-in-out infinite;
`;

// Zalgo combining characters for text corruption
const ZALGO_UP = ['\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308', '\u030A', '\u030B', '\u030C', '\u030D', '\u030E', '\u030F'];
const ZALGO_MID = ['\u0315', '\u0316', '\u0317', '\u0318', '\u0319', '\u031A', '\u031B', '\u031C', '\u031D', '\u031E', '\u031F'];
const ZALGO_DOWN = ['\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325', '\u0326', '\u0327', '\u0328', '\u0329', '\u032A'];

function zalgoify(text: string, intensity: number = 1): string {
  return text
    .split("")
    .map((char) => {
      if (char === " " || Math.random() > 0.3 * intensity) return char;
      const marks: string[] = [];
      const count = Math.floor(Math.random() * intensity * 2) + 1;
      for (let i = 0; i < count; i++) {
        const pool = [ZALGO_UP, ZALGO_MID, ZALGO_DOWN][Math.floor(Math.random() * 3)]!;
        marks.push(pool[Math.floor(Math.random() * pool.length)]!);
      }
      return char + marks.join("");
    })
    .join("");
}

interface GlitchTextProps {
  children: string;
  intensity?: number; // 1-3
}

export function GlitchText({ children, intensity = 1 }: GlitchTextProps) {
  const corrupted = useMemo(
    () => zalgoify(children, intensity),
    [children, intensity],
  );

  return <GlitchWrapper $intensity={intensity}>{corrupted}</GlitchWrapper>;
}
