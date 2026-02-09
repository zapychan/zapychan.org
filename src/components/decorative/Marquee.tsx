import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

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
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 0 #b03060;
  letter-spacing: 1px;
  will-change: transform;
`;

const SegmentGroup = styled.div`
  display: flex;
  flex-shrink: 0;
`;

const Segment = styled.span`
  flex-shrink: 0;
  padding: 0 4em;
`;

const SPEED = 30; // pixels per second

export function Marquee() {
  const [hitCount, setHitCount] = useState<number | null>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [animStyle, setAnimStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    fetch("/api/hits")
      .then((r) => r.json())
      .then((d: { count: number }) => setHitCount(d.count))
      .catch(() => setHitCount(1337));
  }, []);

  useEffect(() => {
    if (!groupRef.current) return;
    const width = groupRef.current.offsetWidth;
    const duration = width / SPEED;

    let style = document.getElementById("marquee-kf") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = "marquee-kf";
      document.head.appendChild(style);
    }
    style.textContent = `@keyframes mq{0%{transform:translateX(0)}100%{transform:translateX(-${width}px)}}`;

    setAnimStyle({ animation: `mq ${duration}s linear infinite` });
  }, [hitCount]);

  const segments = [
    `♥ you are visitor #${hitCount ?? "..."} ♥`,
    `~*~ i am happy because everybody loves me ~*~`,
    `✧・゚: *✧ welcome to zapy chan dot org ✧*:・゚✧`,
  ];

  return (
    <MarqueeWrapper>
      <MarqueeTrack style={animStyle}>
        <SegmentGroup ref={groupRef}>
          {segments.map((s, i) => (
            <Segment key={i}>{s}</Segment>
          ))}
        </SegmentGroup>
        <SegmentGroup aria-hidden>
          {segments.map((s, i) => (
            <Segment key={`d1-${i}`}>{s}</Segment>
          ))}
        </SegmentGroup>
        <SegmentGroup aria-hidden>
          {segments.map((s, i) => (
            <Segment key={`d2-${i}`}>{s}</Segment>
          ))}
        </SegmentGroup>
      </MarqueeTrack>
    </MarqueeWrapper>
  );
}
