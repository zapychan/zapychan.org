export interface DesktopIconConfig {
  id: string;
  label: string;
  windowTitle: string;
  componentKey: string;
  icon: string;
}

export const desktopIcons: DesktopIconConfig[] = [
  {
    id: "paintings",
    label: "My Paintings",
    windowTitle: "My Paintings",
    componentKey: "gallery",
    icon: "🎨",
  },
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
    label: "About Me.txt",
    windowTitle: "About Me",
    componentKey: "about",
    icon: "📝",
  },
  {
    id: "guestbook",
    label: "Guestbook",
    windowTitle: "Guestbook",
    componentKey: "guestbook",
    icon: "📖",
  },
  {
    id: "links",
    label: "Cool Links",
    windowTitle: "Cool Links",
    componentKey: "links",
    icon: "🔗",
  },
  {
    id: "contact",
    label: "Contact Me",
    windowTitle: "Contact Me",
    componentKey: "contact",
    icon: "💌",
  },
];
