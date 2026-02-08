import { useState, useCallback } from "react";
import { AppBar, Toolbar, Button } from "react95";
import styled from "styled-components";
import { useWindowManager } from "../../hooks/useWindowManager";
import { StartMenu } from "./StartMenu";

const TaskbarWrapper = styled(AppBar)`
  position: fixed !important;
  bottom: 0;
  top: auto !important;
  left: 0;
  right: 0;
  z-index: 9999;
`;

const TaskbarToolbar = styled(Toolbar)`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  position: relative;
  min-height: 40px;
`;

const StartButton = styled(Button)`
  font-weight: bold;
  min-width: 80px;
  font-size: 15px;
  padding: 4px 10px;
`;

const WindowButtons = styled.div`
  display: flex;
  gap: 2px;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 0;
  }
`;

const WindowButton = styled(Button)<{ $isActive: boolean }>`
  font-size: 13px;
  max-width: 170px;
  min-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 3px 8px;
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0.8)};
`;

const Clock = styled.div`
  font-size: 13px;
  padding: 4px 10px;
  border-style: inset;
  border-width: 2px;
  min-width: 68px;
  text-align: center;
  flex-shrink: 0;
`;

function useTime() {
  const [time, setTime] = useState(new Date());
  useState(() => {
    const interval = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(interval);
  });
  return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function Taskbar() {
  const { windows, minimizeWindow, restoreWindow } =
    useWindowManager();
  const [startOpen, setStartOpen] = useState(false);
  const time = useTime();

  const toggleStart = useCallback(() => {
    setStartOpen((prev) => !prev);
  }, []);

  const closeStart = useCallback(() => {
    setStartOpen(false);
  }, []);

  const handleWindowButton = useCallback(
    (id: string, isMinimized: boolean) => {
      if (isMinimized) {
        restoreWindow(id);
      } else {
        minimizeWindow(id);
      }
    },
    [restoreWindow, minimizeWindow],
  );

  return (
    <TaskbarWrapper>
      <TaskbarToolbar>
        <StartButton active={startOpen} onClick={toggleStart}>
          💖 Start
        </StartButton>

        <WindowButtons>
          {windows.map((w) => (
            <WindowButton
              key={w.id}
              $isActive={!w.isMinimized}
              active={!w.isMinimized}
              size="sm"
              onClick={() => handleWindowButton(w.id, w.isMinimized)}
            >
              {w.title}
            </WindowButton>
          ))}
        </WindowButtons>

        <Clock>{time}</Clock>
      </TaskbarToolbar>

      {startOpen && <StartMenu onClose={closeStart} />}
    </TaskbarWrapper>
  );
}
