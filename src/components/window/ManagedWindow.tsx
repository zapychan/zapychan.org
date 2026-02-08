import { type ReactNode, useCallback } from "react";
import { Window, WindowHeader, WindowContent, Button } from "react95";
import styled from "styled-components";
import { useWindowManager, type WindowState } from "../../hooks/useWindowManager";
import { useIsMobile } from "../../hooks/useIsMobile";

interface ManagedWindowProps {
  windowState: WindowState;
  children: ReactNode;
}

const StyledWindow = styled(Window) <{
  $isMobile: boolean;
  $x: number;
  $y: number;
  $zIndex: number;
}>`
  position: ${({ $isMobile }) => ($isMobile ? "fixed" : "absolute")};
  display: flex;
  flex-direction: column;
  ${({ $isMobile, $x, $y }) =>
    $isMobile
      ? `
    top: 0;
    left: 0;
    width: 100vw;
    height: calc(100vh - 48px);
    max-width: 100vw;
    border: none;
  `
      : `
    top: ${$y}px;
    left: ${$x}px;
    width: 600px;
    height: 600px;
    min-height: 300px;
    max-width: calc(100vw - 20px);
    max-height: calc(100vh - 60px);
    resize: both;
    overflow: hidden;
  `}
  z-index: ${({ $zIndex }) => $zIndex};
`;

const StyledHeader = styled(WindowHeader)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const HeaderTitle = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 2px;
  margin-left: 4px;
`;

const ContentWrapper = styled(WindowContent)`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export function ManagedWindow({ windowState, children }: ManagedWindowProps) {
  const { closeWindow, focusWindow, minimizeWindow, moveWindow } =
    useWindowManager();
  const isMobile = useIsMobile();

  const handleMouseDown = useCallback(() => {
    focusWindow(windowState.id);
  }, [focusWindow, windowState.id]);

  const handleClose = useCallback(() => {
    closeWindow(windowState.id);
  }, [closeWindow, windowState.id]);

  const handleMinimize = useCallback(() => {
    minimizeWindow(windowState.id);
  }, [minimizeWindow, windowState.id]);

  // Drag handling for desktop
  const handleHeaderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isMobile) return;
      e.preventDefault();
      focusWindow(windowState.id);

      const startX = e.clientX - windowState.position.x;
      const startY = e.clientY - windowState.position.y;

      const handlePointerMove = (ev: PointerEvent) => {
        moveWindow(windowState.id, {
          x: Math.max(0, ev.clientX - startX),
          y: Math.max(0, ev.clientY - startY),
        });
      };

      const handlePointerUp = () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    [isMobile, windowState.id, windowState.position, focusWindow, moveWindow],
  );

  if (windowState.isMinimized) return null;

  return (
    <StyledWindow
      $isMobile={isMobile}
      $x={windowState.position.x}
      $y={windowState.position.y}
      $zIndex={windowState.zIndex}
      onMouseDown={handleMouseDown}
    >
      <StyledHeader
        active
        onPointerDown={handleHeaderPointerDown}
      >
        <HeaderTitle>{windowState.title}</HeaderTitle>
        <HeaderButtons>
          {isMobile ? (
            <Button size="sm" onClick={handleClose} style={{ minWidth: 44, minHeight: 32 }}>
              <span style={{ fontWeight: "bold" }}>← Back</span>
            </Button>
          ) : (
            <>
              <Button size="sm" square onClick={handleMinimize}>
                <span style={{ fontWeight: "bold" }}>_</span>
              </Button>
              <Button size="sm" square onClick={handleClose}>
                <span style={{ fontWeight: "bold" }}>✕</span>
              </Button>
            </>
          )}
        </HeaderButtons>
      </StyledHeader>
      <ContentWrapper>{children}</ContentWrapper>
    </StyledWindow>
  );
}
