import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const MarqueeWrapper = styled.div`
  width: 100%;
  overflow: hidden;
  background: linear-gradient(90deg, #ff69b4, #ff1493, #ff69b4);
  padding: 3px 0;
  position: relative;
  z-index: 2;
  border-bottom: 2px solid #d4578a;
  border-top: 2px solid #ffcce0;
`;

const MarqueeTrack = styled.div`
  display: flex;
  white-space: nowrap;
  animation: ${scroll} 15s linear infinite;
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 0 #b03060;
  letter-spacing: 1px;
`;

const Segment = styled.span`
  flex-shrink: 0;
  padding: 0 4em;
`;

export function Marquee() {
  const [hitCount, setHitCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/hits")
      .then((r) => r.json())
      .then((d: { count: number }) => setHitCount(d.count))
      .catch(() => setHitCount(1337));
  }, []);

  const segments = [
    `♥ you are visitor #${hitCount ?? "..."} ♥`,
    `~*~ i am happy because everybody loves me ~*~`,
    `✧・゚: *✧ welcome to zapy chan dot org ✧*:・゚✧`,
  ];

  return (
    <MarqueeWrapper>
      <MarqueeTrack>
        {segments.map((s, i) => (
          <Segment key={i}>{s}</Segment>
        ))}
        {segments.map((s, i) => (
          <Segment key={`dup-${i}`}>{s}</Segment>
        ))}
      </MarqueeTrack>
    </MarqueeWrapper>
  );
}
