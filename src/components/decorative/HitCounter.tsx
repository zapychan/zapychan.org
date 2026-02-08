import { useEffect, useState } from "react";
import styled from "styled-components";
import { Frame } from "react95";

const CounterWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #8b0045;
`;

const Digits = styled.div`
  display: flex;
  gap: 1px;
`;

const Digit = styled(Frame)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 20px;
  background: #1a0008;
  color: #ff69b4;
  font-family: "Courier New", monospace;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  line-height: 20px;
`;

interface HitCounterProps {
  isEvil?: boolean;
}

export function HitCounter({ isEvil }: HitCounterProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/hits")
      .then((r) => r.json())
      .then((d: { count: number }) => setCount(d.count))
      .catch(() => setCount(666));
  }, []);

  const digits = String(count ?? 0).padStart(6, "0");

  return (
    <CounterWrapper>
      <span>{isEvil ? "souls collected:" : "visitors:"}</span>
      <Digits>
        {digits.split("").map((d, i) => (
          <Digit variant="field" key={i} style={isEvil ? { color: "#cc3366" } : undefined}>
            {d}
          </Digit>
        ))}
      </Digits>
    </CounterWrapper>
  );
}
