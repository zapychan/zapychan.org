import { useCallback } from "react";
import { MenuList, MenuListItem as MenuListItemBase, Separator } from "react95";
import styled, { keyframes } from "styled-components";
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
  display: inline-block;
  width: 28px;
  text-align: center;
  margin-right: 10px;
  font-size: 20px;
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
    (id: string, title: string, componentKey: string, props?: Record<string, unknown>) => {
      openWindow(id, title, componentKey, props);
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
            handleOpen("paintings", isEvil ? "M̷y P̵a̸i̶n̷t̸i̷n̸g̷s̶" : "My Paintings", "gallery", {
              galleryType: "paintings",
            })
          }
        >
          <MenuIcon>🎨</MenuIcon>
          {isEvil ? "M̷y P̵a̸i̶n̷t̸i̷n̸g̷s̶" : "My Paintings"}
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() =>
            handleOpen("digital", isEvil ? "D̷i̸g̶i̵t̸a̵l̶ W̸o̵r̷k̸s̵" : "Digital Works", "gallery", {
              galleryType: "digital",
            })
          }
        >
          <MenuIcon>💻</MenuIcon>
          {isEvil ? "D̷i̸g̶i̵t̸a̵l̶ W̸o̵r̷k̸s̵" : "Digital Works"}
        </StyledMenuItem>
        <Separator />
        <StyledMenuItem
          onClick={() => handleOpen("about", isEvil ? "A̷b̸o̵u̶t̸ M̷e̵" : "About Me", "about")}
        >
          <MenuIcon>📝</MenuIcon>
          {isEvil ? "A̷b̸o̵u̶t̸ M̷e̵" : "About Me"}
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => handleOpen("guestbook", isEvil ? "G̵u̸e̷s̶t̵b̶o̸o̵k̷" : "Guestbook", "guestbook")}
        >
          <MenuIcon>📖</MenuIcon>
          {isEvil ? "G̵u̸e̷s̶t̵b̶o̸o̵k̷" : "Guestbook"}
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => handleOpen("links", isEvil ? "C̸o̵o̶l̷ L̶i̸n̷k̶s̵" : "Cool Links", "links")}
        >
          <MenuIcon>🔗</MenuIcon>
          {isEvil ? "C̸o̵o̶l̷ L̶i̸n̷k̶s̵" : "Cool Links"}
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => handleOpen("contact", isEvil ? "C̶o̸n̵t̷a̶c̵t̸" : "Contact Me", "contact")}
        >
          <MenuIcon>💌</MenuIcon>
          {isEvil ? "C̶o̸n̵t̷a̶c̵t̸" : "Contact Me"}
        </StyledMenuItem>
        <Separator />
        {isEvil ? (
          <StyledMenuItem onClick={handleRestore}>
            <MenuIcon>🌸</MenuIcon>
            Restore Defaults
          </StyledMenuItem>
        ) : (
          <EvilMenuItem onClick={handleEvilToggle}>
            <MenuIcon>⚙️</MenuIcon>
            S̷y̵s̶t̵e̸m̷.̵.̸.̵
          </EvilMenuItem>
        )}
        <StyledMenuItem disabled>
          <MenuIcon>🌸</MenuIcon>
          Shut Down...
        </StyledMenuItem>
      </MenuContent>
    </MenuWrapper>
  );
}
