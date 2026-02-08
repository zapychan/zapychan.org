import { useCallback } from "react";
import { MenuList, MenuListItem as MenuListItemBase, Separator } from "react95";
import styled from "styled-components";
import { useWindowManager } from "../../hooks/useWindowManager";

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

const MenuBanner = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 32px;
  background: linear-gradient(to top, #ff69b4, #ff1493);
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

export function StartMenu({ onClose }: StartMenuProps) {
  const { openWindow } = useWindowManager();

  const handleOpen = useCallback(
    (id: string, title: string, componentKey: string, props?: Record<string, unknown>) => {
      openWindow(id, title, componentKey, props);
      onClose();
    },
    [openWindow, onClose],
  );

  return (
    <MenuWrapper>
      <MenuBanner>zapychan95</MenuBanner>
      <MenuContent>
        <StyledMenuItem
          onClick={() =>
            handleOpen("paintings", "My Paintings", "gallery", {
              galleryType: "paintings",
            })
          }
        >
          <MenuIcon>🎨</MenuIcon>
          My Paintings
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() =>
            handleOpen("digital", "Digital Works", "gallery", {
              galleryType: "digital",
            })
          }
        >
          <MenuIcon>💻</MenuIcon>
          Digital Works
        </StyledMenuItem>
        <Separator />
        <StyledMenuItem
          onClick={() => handleOpen("about", "About Me", "about")}
        >
          <MenuIcon>📝</MenuIcon>
          About Me
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => handleOpen("guestbook", "Guestbook", "guestbook")}
        >
          <MenuIcon>📖</MenuIcon>
          Guestbook
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => handleOpen("links", "Cool Links", "links")}
        >
          <MenuIcon>🔗</MenuIcon>
          Cool Links
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => handleOpen("contact", "Contact Me", "contact")}
        >
          <MenuIcon>💌</MenuIcon>
          Contact Me
        </StyledMenuItem>
        <Separator />
        <StyledMenuItem disabled>
          <MenuIcon>🌸</MenuIcon>
          Shut Down...
        </StyledMenuItem>
      </MenuContent>
    </MenuWrapper>
  );
}
