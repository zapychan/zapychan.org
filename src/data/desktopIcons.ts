import React from "react";
import { Mspaint, Pbrush1, Wangimg130, CurvesAndColors100 } from "@react95/icons";

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
    icon: React.createElement(Pbrush1, { variant: "32x32_4", width: 42, height: 42 }),
  },
  {
    id: "ipad",
    label: "iPad Art",
    windowTitle: "iPad Art",
    componentKey: "gallery",
    icon: React.createElement(CurvesAndColors100, { variant: "32x32_4", width: 42, height: 42 }),
  },
  {
    id: "paintings",
    label: "Paintings",
    windowTitle: "Paintings",
    componentKey: "gallery",
    icon: React.createElement(Wangimg130, { variant: "32x32_4", width: 42, height: 42 }),
  },
  {
    id: "gif",
    label: "GIFs",
    windowTitle: "GIFs",
    componentKey: "gallery",
    icon: React.createElement("img", { src: "/gallery/gif/thumbs/img-1222.gif", width: 42, height: 42, style: { objectFit: "cover" as const }, alt: "" }),
  },
  {
    id: "selfPortraits",
    label: "Self Portraits",
    windowTitle: "Self Portraits",
    componentKey: "gallery",
    icon: React.createElement("img", { src: "/gallery/self portraits/thumbs/photo-2026-02-08-1-22-45-am-1.jpg", width: 42, height: 42, style: { objectFit: "cover" as const, objectPosition: "center 20%" }, alt: "" }),
  },
  {
    id: "about",
    label: "About.txt",
    windowTitle: "About Me",
    componentKey: "about",
    icon: React.createElement("img", { src: "/images/pfp.png", width: 42, height: 42, style: { imageRendering: "pixelated" as const }, alt: "" }),
    size: { width: 480, height: 520 },
  },
  {
    id: "paintApp",
    label: "Paint",
    windowTitle: "untitled - Paint",
    componentKey: "mspaintApp",
    icon: React.createElement(Mspaint, { variant: "32x32_4", width: 42, height: 42 }),
    size: { width: 720, height: 560 },
  },
];
