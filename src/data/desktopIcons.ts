export interface DesktopIconConfig {
  id: string;
  label: string;
  windowTitle: string;
  componentKey: string;
  icon: string;
  size?: { width: number; height: number };
}

export const desktopIcons: DesktopIconConfig[] = [
  {
    id: "mspaint",
    label: "MS Paint",
    windowTitle: "MS Paint",
    componentKey: "gallery",
    icon: "💻",
  },
  {
    id: "ipad",
    label: "iPad Art",
    windowTitle: "iPad Art",
    componentKey: "gallery",
    icon: "🎨",
  },
  {
    id: "about",
    label: "About.txt",
    windowTitle: "About Me",
    componentKey: "about",
    icon: "📝",
    size: { width: 480, height: 520 },
  },
];
