import React from "react";
import { Mspaint, Pbrush1, Wangimg130, CurvesAndColors100 } from "@react95/icons";

const IconImg = ({ src, style }: { src: string; style?: React.CSSProperties }) => (
  <img
    src={src}
    width={42}
    height={42}
    style={{ objectFit: "cover", border: "1px solid rgba(0,0,0,0.3)", ...style }}
    alt=""
  />
);

export interface DesktopIconConfig {
  id: string;
  label: string;
  windowTitle: string;
  componentKey: string;
  icon: React.ReactNode;
  size?: { width: number; height: number };
}

export const desktopIcons: DesktopIconConfig[] = [
  {
    id: "mspaint",
    label: "MS Paint Art",
    windowTitle: "MS Paint Art",
    componentKey: "gallery",
    icon: <Pbrush1 variant="32x32_4" width={42} height={42} />,
  },
  {
    id: "ipad",
    label: "iPad Art",
    windowTitle: "iPad Art",
    componentKey: "gallery",
    icon: <CurvesAndColors100 variant="32x32_4" width={42} height={42} />,
  },
  {
    id: "paintings",
    label: "Paintings",
    windowTitle: "Paintings",
    componentKey: "gallery",
    icon: <Wangimg130 variant="32x32_4" width={42} height={42} />,
  },
  {
    id: "gif",
    label: "GIFs",
    windowTitle: "GIFs",
    componentKey: "gallery",
    icon: <IconImg src="/images/icons/gif-icon.png" />,
  },
  {
    id: "selfPortraits",
    label: "Self Portraits",
    windowTitle: "Self Portraits",
    componentKey: "gallery",
    icon: <IconImg src="/images/icons/wired-icon.png" />,
  },
  {
    id: "about",
    label: "About.txt",
    windowTitle: "About Me",
    componentKey: "about",
    icon: <IconImg src="/images/icons/pfp-icon.png" style={{ imageRendering: "pixelated" }} />,
    size: { width: 480, height: 520 },
  },
  {
    id: "paintApp",
    label: "Paint",
    windowTitle: "untitled - Paint",
    componentKey: "mspaintApp",
    icon: <Mspaint variant="32x32_4" width={42} height={42} />,
    size: { width: 720, height: 560 },
  },
];
