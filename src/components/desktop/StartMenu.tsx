import { useCallback } from "react";
import { MenuList, MenuListItem as MenuListItemBase, Separator } from "react95";
import styled, { keyframes } from "styled-components";
import { Mspaint, Pbrush1, Notepad, Settings, WindowsExplorer, Computer } from "@react95/icons";
import { useWindowManager } from "../../hooks/useWindowManager";
import { useEvilMode } from "../../hooks/useEvilMode";

interface StartMenuProps {
  onClose: () => void;
}

const MenuWrapper = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 10000;
  width: 250px;
  margin-bottom: 2px;
`;

const MenuBanner = styled.div<{ $isEvil?: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 32px;
  background: ${({ $isEvil }) =>
    $isEvil
      ? "linear-gradient(to top, #8b2252, #4a0e2a)"
      : "linear-gradient(to top, #ff69b4, #ff1493)"};
  display: flex;
  align-items: flex-end;
  padding-bottom: 10px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: white;
  font-weight: bold;
  font-size: 16px;
  letter-spacing: 2px;
  z-index: 1;
`;

const MenuContent = styled(MenuList)`
  padding-left: 32px;
  width: 100%;
  font-size: 14px;
`;

const StyledMenuItem = styled(MenuListItemBase)`
  padding: 8px 12px;
  font-size: 14px;
  min-height: 36px;
`;

const MenuIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  margin-right: 10px;
`;

// Glitchy evil mode trigger item
const glitchFlicker = keyframes`
  0%, 92%, 100% { opacity: 1; transform: none; }
  93% { opacity: 0.7; transform: translateX(1px); }
  94% { opacity: 1; transform: translateX(-1px); }
  95% { opacity: 0.8; transform: none; }
  96% { opacity: 1; }
`;

const EvilMenuItem = styled(StyledMenuItem)`
  animation: ${glitchFlicker} 5s ease-in-out infinite;
  color: inherit;

  &:hover {
    animation: none;
  }
`;

export function StartMenu({ onClose }: StartMenuProps) {
  const { openWindow } = useWindowManager();
  const { isEvil, toggleEvil, disableEvil } = useEvilMode();

  const handleOpen = useCallback(
    (id: string, title: string, componentKey: string, props?: Record<string, unknown>, size?: { width: number; height: number }) => {
      openWindow(id, title, componentKey, props, size);
      onClose();
    },
    [openWindow, onClose],
  );

  const handleEvilToggle = useCallback(() => {
    toggleEvil();
    onClose();
  }, [toggleEvil, onClose]);

  const handleRestore = useCallback(() => {
    disableEvil();
    onClose();
  }, [disableEvil, onClose]);

  return (
    <MenuWrapper>
      <MenuBanner $isEvil={isEvil}>
        {isEvil ? "z̸a̵p̶y̷95" : "zapychan95"}
      </MenuBanner>
      <MenuContent>
        <StyledMenuItem
          onClick={() =>
            handleOpen("mspaint", isEvil ? "M̸S̷ P̵a̶i̸n̷t̸ A̷r̵t̸" : "MS Paint Art", "gallery", {
              galleryType: "mspaint",
            })
          }
        >
          <MenuIcon><Mspaint variant="16x16_4" /></MenuIcon>
          {isEvil ? "M̸S̷ P̵a̶i̸n̷t̸ A̷r̵t̸" : "MS Paint Art"}
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() =>
            handleOpen("ipad", isEvil ? "i̸P̷a̵d̶ A̵r̸t̷" : "iPad Art", "gallery", {
              galleryType: "ipad",
            })
          }
        >
          <MenuIcon><Pbrush1 variant="32x32_4" width={16} height={16} /></MenuIcon>
          {isEvil ? "i̸P̷a̵d̶ A̵r̸t̷" : "iPad Art"}
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() =>
            handleOpen("paintApp", "untitled - Paint", "mspaintApp", undefined, { width: 720, height: 560 })
          }
        >
          <MenuIcon><Mspaint variant="16x16_4" /></MenuIcon>
          Paint
        </StyledMenuItem>
        <Separator />
        <StyledMenuItem
          onClick={() => handleOpen("about", isEvil ? "A̷b̸o̵u̶t̸ M̷e̵" : "About Me", "about", undefined, { width: 480, height: 520 })}
        >
          <MenuIcon><Notepad variant="16x16_4" /></MenuIcon>
          {isEvil ? "A̷b̸o̵u̶t̸ M̷e̵" : "About Me"}
        </StyledMenuItem>
        <Separator />
        {isEvil ? (
          <StyledMenuItem onClick={handleRestore}>
            <MenuIcon><WindowsExplorer variant="16x16_4" /></MenuIcon>
            Restore Defaults
          </StyledMenuItem>
        ) : (
          <EvilMenuItem onClick={handleEvilToggle}>
            <MenuIcon><Settings variant="16x16_4" /></MenuIcon>
            S̷y̵s̶t̵e̸m̷.̵.̸.̵
          </EvilMenuItem>
        )}
        <StyledMenuItem disabled>
          <MenuIcon><Computer variant="16x16_4" /></MenuIcon>
          Shut Down...
        </StyledMenuItem>
      </MenuContent>
    </MenuWrapper>
  );
}
