import styled, { keyframes } from "styled-components";

const glitchIn = keyframes`
  0% { opacity: 0; }
  10% { opacity: 1; background: rgba(139, 34, 82, 0.3); }
  20% { opacity: 0; }
  30% { opacity: 1; background: rgba(75, 14, 42, 0.5); }
  40% { opacity: 0; }
  50% { opacity: 1; background: rgba(139, 34, 82, 0.8); }
  60% { opacity: 1; background: white; }
  70% { opacity: 1; background: rgba(75, 14, 42, 0.4); }
  80% { opacity: 0.5; }
  100% { opacity: 0; }
`;

const TransitionOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999;
  pointer-events: none;
  animation: ${glitchIn} 0.8s ease-out forwards;
  background: rgba(75, 14, 42, 0.5);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 1px,
      rgba(255, 255, 255, 0.03) 1px,
      rgba(255, 255, 255, 0.03) 2px
    );
  }
`;

interface EvilTransitionProps {
  onComplete?: () => void;
}

export function EvilTransition({ onComplete }: EvilTransitionProps) {
  return (
    <TransitionOverlay onAnimationEnd={onComplete} />
  );
}
