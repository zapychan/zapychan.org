import styled, { keyframes } from "styled-components";

const screenTear = keyframes`
  0%, 93%, 100% { clip-path: none; opacity: 0; }
  94% { clip-path: inset(40% 0 30% 0); opacity: 1; transform: translateX(4px); }
  95% { clip-path: inset(10% 0 60% 0); opacity: 1; transform: translateX(-3px); }
  96% { clip-path: none; opacity: 0; }
  97% { clip-path: inset(70% 0 5% 0); opacity: 1; transform: translateX(2px); }
  98% { clip-path: none; opacity: 0; }
`;

const flicker = keyframes`
  0%, 97%, 100% { opacity: 0; }
  97.5% { opacity: 0.15; }
  98% { opacity: 0; }
  98.5% { opacity: 0.08; }
  99% { opacity: 0; }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99997;
`;

const ScreenTear = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    0deg,
    transparent 0%,
    rgba(139, 34, 82, 0.08) 50%,
    transparent 100%
  );
  animation: ${screenTear} 12s ease-in-out infinite;
  animation-delay: 3s;
`;

const StaticFlash = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(139, 34, 82, 0.1);
  animation: ${flicker} 15s ease-in-out infinite;
  animation-delay: 7s;
`;

export function GlitchOverlay() {
  return (
    <Overlay>
      <ScreenTear />
      <StaticFlash />
    </Overlay>
  );
}
