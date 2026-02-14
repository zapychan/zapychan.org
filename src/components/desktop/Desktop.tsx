import { Suspense, useCallback, useState } from "react";
import styled from "styled-components";
import { Hourglass } from "react95";
import { useWindowManager } from "../../hooks/useWindowManager";
import { desktopIcons } from "../../data/desktopIcons";
import { DesktopIcon } from "./DesktopIcon";
import { Taskbar } from "./Taskbar";
import { ManagedWindow } from "../window/ManagedWindow";
import { windowRegistry } from "../window/windowRegistry";
import { Marquee } from "../decorative/Marquee";
import { Sparkles } from "../decorative/Sparkles";
import { CursorTrail } from "../decorative/CursorTrail";

const ICON_POSITIONS_KEY = "zapychan-icon-positions";

const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  mspaint: { x: 12, y: 32 },
  ipad: { x: 12, y: 128 },
  paintings: { x: 12, y: 224 },
  gif: { x: 110, y: 32 },
  selfPortraits: { x: 110, y: 128 },
  about: { x: 12, y: 360 },
  paintApp: { x: 110, y: 360 },
};

function loadIconPositions(): Record<string, { x: number; y: number }> {
  try {
    const stored = localStorage.getItem(ICON_POSITIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { }
  return {};
}

function saveIconPositions(positions: Record<string, { x: number; y: number }>) {
  try {
    localStorage.setItem(ICON_POSITIONS_KEY, JSON.stringify(positions));
  } catch { }
}

const DesktopWrapper = styled.div`
  width: 100vw;
  height: 100svh;
  overflow: hidden;
  position: relative;
  background-color: #ffc0cb;
  background-image: url("/images/bg.gif");
  background-repeat: repeat;
`;

const IconLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;

  > * {
    pointer-events: auto;
    position: absolute;
  }
`;

const WindowLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const LoadingFallback = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

export function Desktop() {
  const { windows, openWindow } = useWindowManager();
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(loadIconPositions);

  const getPosition = useCallback(
    (id: string) => iconPositions[id] || DEFAULT_POSITIONS[id] || { x: 12, y: 32 },
    [iconPositions],
  );

  const handleIconDragEnd = useCallback((id: string, pos: { x: number; y: number }) => {
    setIconPositions((prev) => {
      const next = { ...prev, [id]: pos };
      saveIconPositions(next);
      return next;
    });
  }, []);

  const handleIconOpen = useCallback(
    (id: string, title: string, componentKey: string, size?: { width: number; height: number }) => {
      const props: Record<string, unknown> = {};
      if (componentKey === "gallery") {
        props.galleryType = id;
      }
      openWindow(id, title, componentKey, props, size);
    },
    [openWindow],
  );

  const renderIcons = () => (
    <>
      {desktopIcons.map((icon) => (
        <DesktopIcon
          key={icon.id}
          label={icon.label}
          icon={icon.icon}
          position={getPosition(icon.id)}
          onDragEnd={(pos) => handleIconDragEnd(icon.id, pos)}
          onDoubleClick={() =>
            handleIconOpen(icon.id, icon.windowTitle, icon.componentKey, icon.size)
          }
        />
      ))}
    </>
  );

  return (
    <DesktopWrapper>
      <Marquee />

      <Sparkles />
      <CursorTrail />

      <IconLayer>{renderIcons()}</IconLayer>

      <WindowLayer>
        {windows.map((w) => {
          const Component = windowRegistry[w.componentKey];
          if (!Component) return null;
          return (
            <ManagedWindow key={w.id} windowState={w}>
              <Suspense
                fallback={
                  <LoadingFallback>
                    <Hourglass size={32} />
                  </LoadingFallback>
                }
              >
                <Component windowId={w.id} props={w.props} />
              </Suspense>
            </ManagedWindow>
          );
        })}
      </WindowLayer>

      <Taskbar />
    </DesktopWrapper>
  );
}
