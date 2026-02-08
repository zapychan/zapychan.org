import { lazy } from "react";

// Lazy-load window content components
export const windowRegistry: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<{ windowId: string; props?: Record<string, unknown> }>>
> = {
  gallery: lazy(() =>
    import("../gallery/GalleryWindow").then((m) => ({ default: m.GalleryWindow })),
  ),
  about: lazy(() =>
    import("../pages/AboutWindow").then((m) => ({ default: m.AboutWindow })),
  ),
  guestbook: lazy(() =>
    import("../pages/GuestbookWindow").then((m) => ({
      default: m.GuestbookWindow,
    })),
  ),
  links: lazy(() =>
    import("../pages/LinksWindow").then((m) => ({ default: m.LinksWindow })),
  ),
  contact: lazy(() =>
    import("../pages/ContactWindow").then((m) => ({
      default: m.ContactWindow,
    })),
  ),
  artworkViewer: lazy(() =>
    import("../gallery/ArtworkViewer").then((m) => ({
      default: m.ArtworkViewer,
    })),
  ),
  secretVideos: lazy(() =>
    import("../pages/SecretVideosWindow").then((m) => ({
      default: m.SecretVideosWindow,
    })),
  ),
  mspaintApp: lazy(() =>
    import("../paint/MSPaintWindow").then((m) => ({
      default: m.MSPaintWindow,
    })),
  ),
};
