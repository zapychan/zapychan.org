import { useCallback } from "react";
import { MenuList, MenuListItem as MenuListItemBase, Separator } from "react95";
import styled from "styled-components";
import { Mspaint, Notepad, Pbrush1, Wangimg130, Computer, CurvesAndColors100 } from "@react95/icons";
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
  padding-top: 10px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: white;
  font-weight: bold;
  font-size: 18px;
  letter-spacing: 3px;
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

export function StartMenu({ onClose }: StartMenuProps) {
  const { openWindow } = useWindowManager();

  const handleOpen = useCallback(
    (id: string, title: string, componentKey: string, props?: Record<string, unknown>, size?: { width: number; height: number }) => {
      openWindow(id, title, componentKey, props, size);
      onClose();
    },
    [openWindow, onClose],
  );

  return (
    <MenuWrapper>
      <MenuBanner>
        zapy chan . org
      </MenuBanner>
      <MenuContent>
        <StyledMenuItem
          onClick={() =>
            handleOpen("mspaint", "MS Paint Art", "gallery", {
              galleryType: "mspaint",
            })
          }
        >
          <MenuIcon><Pbrush1 variant="32x32_4" width={16} height={16} /></MenuIcon>
          MS Paint Art
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() =>
            handleOpen("ipad", "iPad Art", "gallery", {
              galleryType: "ipad",
            })
          }
        >
          <MenuIcon><CurvesAndColors100 variant="32x32_4" width={16} height={16} /></MenuIcon>
          iPad Art
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() =>
            handleOpen("paintings", "Paintings", "gallery", {
              galleryType: "paintings",
            })
          }
        >
          <MenuIcon><Wangimg130 variant="32x32_4" width={16} height={16} /></MenuIcon>
          Paintings
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() =>
            handleOpen("gif", "GIFs", "gallery", {
              galleryType: "gif",
            })
          }
        >
          <MenuIcon><img src="/images/icons/gif-icon.png" width={16} height={16} style={{ objectFit: "cover" }} alt="" /></MenuIcon>
          GIFs
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() =>
            handleOpen("selfPortraits", "Self Portraits", "gallery", {
              galleryType: "selfPortraits",
            })
          }
        >
          <MenuIcon><img src="/images/icons/wired-icon.png" width={16} height={16} style={{ objectFit: "cover" }} alt="" /></MenuIcon>
          Self Portraits
        </StyledMenuItem>
        <Separator />
        <StyledMenuItem
          onClick={() =>
            handleOpen("paintApp", "untitled - Paint", "mspaintApp", undefined, { width: 720, height: 560 })
          }
        >
          <MenuIcon><Mspaint variant="16x16_4" /></MenuIcon>
          Paint
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => handleOpen("about", "About Me", "about", undefined, { width: 480, height: 520 })}
        >
          <MenuIcon><img src="/images/icons/pfp-icon.png" width={16} height={16} style={{ imageRendering: "pixelated" }} alt="" /></MenuIcon>
          About Me
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => handleOpen("guestbook", "Guestbook", "guestbook", undefined, { width: 480, height: 520 })}
        >
          <MenuIcon><Notepad variant="16x16_4" /></MenuIcon>
          Guestbook
        </StyledMenuItem>
        <Separator />
        <StyledMenuItem disabled>
          <MenuIcon><Computer variant="16x16_4" /></MenuIcon>
          Shut Down...
        </StyledMenuItem>
      </MenuContent>
    </MenuWrapper>
  );
}
