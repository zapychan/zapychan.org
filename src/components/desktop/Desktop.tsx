import { Suspense, useCallback, useState } from "react";
import styled from "styled-components";
import { Hourglass, Window, WindowHeader, WindowContent, Button } from "react95";
import { Mplayer11, Shell321 } from "@react95/icons";
import { useWindowManager } from "../../hooks/useWindowManager";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useEvilMode } from "../../hooks/useEvilMode";
import { useEasterEgg } from "../../hooks/useEasterEgg";
import { desktopIcons } from "../../data/desktopIcons";
import { DesktopIcon } from "./DesktopIcon";
import { Taskbar } from "./Taskbar";
import { ManagedWindow } from "../window/ManagedWindow";
import { windowRegistry } from "../window/windowRegistry";
import { Marquee } from "../decorative/Marquee";
import { Sparkles } from "../decorative/Sparkles";
import { CursorTrail } from "../decorative/CursorTrail";
import { GlitchOverlay } from "../evil/GlitchOverlay";
import { EvilTransition } from "../evil/EvilTransition";

const DesktopWrapper = styled.div<{ $isEvil?: boolean }>`
  width: 100vw;
  height: 100svh;
  overflow: hidden;
  position: relative;
  background-color: ${({ $isEvil }) => ($isEvil ? "#bf8099" : "#ffc0cb")};
  background-image: ${({ $isEvil }) =>
    $isEvil
      ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ctext x='15' y='35' font-size='20' opacity='0.08'%3E%E2%99%A5%3C/text%3E%3Ctext x='45' y='15' font-size='14' opacity='0.06'%3E%E2%9C%A6%3C/text%3E%3C/svg%3E")`
      : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ctext x='15' y='35' font-size='20' opacity='0.15'%3E%E2%99%A5%3C/text%3E%3Ctext x='45' y='15' font-size='14' opacity='0.1'%3E%E2%9C%A6%3C/text%3E%3C/svg%3E")`};
`;

const IconGrid = styled.div`
  position: absolute;
  top: 32px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2;

  @media (max-width: 767px) {
    top: 28px;
    left: 8px;
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

// Hidden easter egg icon
const HiddenIcon = styled(DesktopIcon)<{ $discovered: boolean }>`
  position: absolute;
  bottom: 52px;
  right: 12px;
  opacity: ${({ $discovered }) => ($discovered ? 0 : 0.05)};
  transition: opacity 0.3s;

  &:hover {
    opacity: ${({ $discovered }) => ($discovered ? 0 : 0.6)};
  }
`;

// Secret dialog
const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
`;

const DialogWindow = styled(Window)`
  width: 320px;
`;

const DialogContent = styled(WindowContent)`
  text-align: center;
  padding: 20px;
`;

export function Desktop() {
  const { windows, openWindow } = useWindowManager();
  const isMobile = useIsMobile();
  const { isEvil, isTransitioning } = useEvilMode();
  const { discovered, showDialog, discover, dismissDialog } = useEasterEgg();
  const [transitionVisible, setTransitionVisible] = useState(false);

  // Show transition when isTransitioning changes
  if (isTransitioning && !transitionVisible) {
    setTransitionVisible(true);
  }

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

  const handleSecretFound = useCallback(() => {
    discover();
  }, [discover]);

  const handleDialogDismiss = useCallback(() => {
    dismissDialog();
    openWindow("secretVideos", "Secret Videos!!", "secretVideos");
  }, [dismissDialog, openWindow]);

  return (
    <DesktopWrapper $isEvil={isEvil}>
      <Marquee isEvil={isEvil} />

      <Sparkles isEvil={isEvil} />
      <CursorTrail isEvil={isEvil} />

      {isEvil && <GlitchOverlay />}
      {transitionVisible && (
        <EvilTransition onComplete={() => setTransitionVisible(false)} />
      )}

      <IconGrid>
        {desktopIcons.map((icon) => (
          <DesktopIcon
            key={icon.id}
            label={icon.label}
            icon={icon.icon}
            onDoubleClick={() =>
              handleIconOpen(icon.id, icon.windowTitle, icon.componentKey, icon.size)
            }
          />
        ))}
        {discovered && (
          <DesktopIcon
            label="Secret Videos"
            icon={<Mplayer11 variant="32x32_4" />}
            onDoubleClick={() =>
              openWindow("secretVideos", "Secret Videos!!", "secretVideos")
            }
          />
        )}
      </IconGrid>

      {/* Hidden easter egg icon */}
      {!isMobile && !discovered && (
        <HiddenIcon
          $discovered={false}
          label="???"
          icon={<Shell321 variant="32x32_4" />}
          onDoubleClick={handleSecretFound}
        />
      )}

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

      {/* Secret discovery dialog */}
      {showDialog && (
        <DialogOverlay onClick={handleDialogDismiss}>
          <DialogWindow onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <WindowHeader active>
              <span style={{ fontWeight: "bold" }}>✨ Secret Found!! ✨</span>
            </WindowHeader>
            <DialogContent>
              <div style={{ fontSize: 40, margin: "12px 0" }}>🎉✨🔮</div>
              <p style={{ fontSize: 15, margin: "12px 0", color: "#ff1493" }}>
                You found a secret!!
              </p>
              <p style={{ fontSize: 13, margin: "8px 0" }}>
                A hidden folder has appeared on your desktop~
              </p>
              <Button
                onClick={handleDialogDismiss}
                primary
                style={{ marginTop: 12 }}
              >
                Open it!! ♥
              </Button>
            </DialogContent>
          </DialogWindow>
        </DialogOverlay>
      )}

      <Taskbar />
    </DesktopWrapper>
  );
}
