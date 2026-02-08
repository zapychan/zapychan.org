import { useMemo } from "react";
import styled, { keyframes } from "styled-components";

const twinkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

const SparkleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
`;

const Sparkle = styled.div<{
  $x: number;
  $y: number;
  $delay: number;
  $duration: number;
  $size: number;
  $isEvil?: boolean;
}>`
  position: absolute;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  animation: ${twinkle} ${({ $duration }) => $duration}s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  font-size: ${({ $size }) => $size}px;
  line-height: 1;
  filter: ${({ $isEvil }) => ($isEvil ? "hue-rotate(320deg) saturate(0.6)" : "none")};
`;

interface SparklesProps {
  count?: number;
  isEvil?: boolean;
}

export function Sparkles({ count = 18, isEvil }: SparklesProps) {
  const sparkles = useMemo(() => {
    const items = [];
    const chars = isEvil
      ? ["✦", "✧", "⊗", "◈", "⬥", "▪"]
      : ["✦", "✧", "♥", "✿", "⋆", "☆"];
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        x: Math.random() * 95,
        y: Math.random() * 90,
        delay: Math.random() * 6,
        duration: 2 + Math.random() * 4,
        size: 8 + Math.random() * 14,
        char: chars[i % chars.length],
      });
    }
    return items;
  }, [count, isEvil]);

  return (
    <SparkleContainer>
      {sparkles.map((s) => (
        <Sparkle
          key={s.id}
          $x={s.x}
          $y={s.y}
          $delay={s.delay}
          $duration={s.duration}
          $size={s.size}
          $isEvil={isEvil}
        >
          {s.char}
        </Sparkle>
      ))}
    </SparkleContainer>
  );
}
