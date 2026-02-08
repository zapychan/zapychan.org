import React from "react";
import { Mspaint, Pbrush1, Notepad } from "@react95/icons";

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
    icon: React.createElement(Mspaint, { variant: "32x32_4" }),
  },
  {
    id: "ipad",
    label: "iPad Art",
    windowTitle: "iPad Art",
    componentKey: "gallery",
    icon: React.createElement(Pbrush1, { variant: "32x32_4" }),
  },
  {
    id: "about",
    label: "About.txt",
    windowTitle: "About Me",
    componentKey: "about",
    icon: React.createElement(Notepad, { variant: "32x32_4" }),
    size: { width: 480, height: 520 },
  },
  {
    id: "paintApp",
    label: "Paint",
    windowTitle: "untitled - Paint",
    componentKey: "mspaintApp",
    icon: React.createElement(Mspaint, { variant: "32x32_4" }),
    size: { width: 720, height: 560 },
  },
];
