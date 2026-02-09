Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>`
- Use `bunx <package>` instead of `npx <package>`
- Bun automatically loads .env, so don't use dotenv.
- Use `Bun.serve()` (not express), `Bun.file` (not node:fs readFile/writeFile)
- Use HTML imports with `Bun.serve()` (not vite)
- Run dev server: `bun --hot ./src/index.ts`

## Project Overview

Geocities-maximalist, all-pink Windows 95-themed artist portfolio for zapychan. Built with React 19, react95, and styled-components on Bun.

## Architecture

```
src/
  index.html              # Entry HTML
  index.ts                # Bun.serve() - routes /, /api/hits, /gallery/*
  frontend.tsx             # React root + ThemeProvider
  App.tsx                  # Root component
  styles/
    GlobalStyles.ts        # Global CSS, fonts, cursors
    theme.ts               # react95 pink theme
  hooks/
    useWindowManager.tsx   # Window state context + useReducer (open/close/focus/minimize/move)
    useIsMobile.ts         # Responsive breakpoint hook (768px)
    useEasterEgg.ts        # Hidden icon discovery + localStorage persistence
  components/
    desktop/
      Desktop.tsx          # Main layout: wallpaper, icons, windows, taskbar
      DesktopIcon.tsx      # Double-click to open window
      Taskbar.tsx          # Bottom bar: Start button, window list, clock
      StartMenu.tsx        # Navigation menu
    window/
      ManagedWindow.tsx    # Draggable win95 window (fullscreen on mobile)
      windowRegistry.ts    # Maps component keys to React components
    gallery/
      GalleryWindow.tsx    # Gallery shell with toolbar (View/Sort) + grid
      GalleryGrid.tsx      # 3-col (desktop) / 2-col (mobile) CSS grid of thumbnails
      ArtworkViewer.tsx    # Full image view with metadata
    pages/
      AboutWindow.tsx      # About me page
      GuestbookWindow.tsx  # Fake guestbook with entries
      LinksWindow.tsx      # Cool links page
      ContactWindow.tsx    # Contact/commissions info
      SecretVideosWindow.tsx  # YouTube videos (easter egg reward)
    decorative/
      Marquee.tsx          # CSS-animated scrolling welcome text
      Sparkles.tsx         # Random sparkle animations on desktop
      HitCounter.tsx       # Retro visitor counter (fetches /api/hits)
      CursorTrail.tsx      # Sparkle trail following mouse (desktop only)
  data/
    paintings.ts           # Painting artwork metadata (Acrylic on Canvas)
    digitalWorks.ts        # Digital artwork metadata (MS Paint works)
    ipadWorks.ts           # iPad artwork metadata
    gifWorks.ts            # Animated GIF artwork metadata
    selfPortraits.ts       # Self portrait artwork metadata
    videos.ts              # YouTube video list (easter egg)
    desktopIcons.ts        # Desktop icon configs
    guestbookEntries.ts    # Fake guestbook entries
public/
  gallery/
    digital/
      full/               # Original MS Paint artworks (filenames have spaces)
      thumbs/             # 300px thumbnails (slugified filenames)
    ipad/
      full/               # iPad artworks
      thumbs/             # 300px thumbnails
    paintings/
      full/               # Acrylic on canvas paintings
      thumbs/             # 300px thumbnails
    gif/
      full/               # Animated GIF artworks
      thumbs/             # 300px thumbnails
    self portraits/
      full/               # Self portrait artworks
      thumbs/             # 300px thumbnails
```

## Key Patterns

- **Window management**: useReducer in useWindowManager.tsx dispatches OPEN/CLOSE/FOCUS/MINIMIZE/MOVE actions. Windows registered in windowRegistry.ts.
- **Flexbox scroll chain**: StyledWindow (flex column, explicit height, overflow: hidden) > ContentWrapper (flex: 1, min-height: 0) > inner scroll containers (overflow-y: auto, flex: 1, min-height: 0). Every flex container in the chain needs `min-height: 0` to allow shrinking.
- **Static file serving**: Gallery images served via explicit `/gallery/*` route with `decodeURIComponent()` for filenames with spaces. The `fetch()` handler serves index.html as fallback for client-side routing. Do NOT use `"/*"` in routes — it intercepts all requests.
- **Mobile**: Breakpoint at 768px. Windows go fullscreen, icons hidden (Start Menu for nav), gallery grid 2-col, no drag/cursor trail.
- **Thumbnails**: Run `bun run scripts/generate-gallery.ts` to auto-generate thumbnails and data files. Uses sharp to resize to 300px. Filenames are slugified (spaces/special chars to hyphens, lowercase).
