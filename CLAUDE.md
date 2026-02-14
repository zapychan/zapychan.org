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

Geocities-maximalist, all-pink Windows 95-themed artist portfolio for zapychan. Built with React 19, react95, and styled-components on Bun. Deployed on Cloudflare Pages with D1 database.

## Architecture

```
src/
  index.html              # Entry HTML
  index.ts                # Bun.serve() - routes /, /api/*, /gallery/*, /images/*, /audio/*
  frontend.tsx             # React root + ThemeProvider
  App.tsx                  # Root component
  styles/
    GlobalStyles.ts        # Global CSS, fonts, cursors
    theme.ts               # react95 pink theme
  hooks/
    useWindowManager.tsx   # Window state context + useReducer (open/close/focus/minimize/move)
    useIsMobile.ts         # Responsive breakpoint hook (768px)
  components/
    desktop/
      Desktop.tsx          # Main layout: wallpaper, icons, windows, taskbar, icon positions
      DesktopIcon.tsx      # Draggable icon, double-click to open window
      Taskbar.tsx          # Bottom bar: Start button, window list, clock, weather
      StartMenu.tsx        # Navigation menu (galleries, paint, about, guestbook)
    window/
      ManagedWindow.tsx    # Draggable win95 window (fullscreen on mobile)
      windowRegistry.ts    # Maps component keys to lazy-loaded React components
    gallery/
      GalleryWindow.tsx    # Gallery shell with toolbar (View/Sort) + grid
      GalleryGrid.tsx      # 3-col (desktop) / 2-col (mobile) CSS grid of thumbnails
      ArtworkViewer.tsx    # Full image view with metadata
    paint/
      MSPaintWindow.tsx    # Full drawing app (pencil/eraser/fill/line/rect/ellipse/picker/text)
      paintConstants.ts    # Tool definitions and 28-color palette
    pages/
      AboutWindow.tsx      # About me page
      GuestbookWindow.tsx  # Real guestbook with D1 backend
      LinksWindow.tsx      # Cool links page
      ContactWindow.tsx    # Contact/commissions info
    decorative/
      Marquee.tsx          # CSS-animated scrolling welcome text
      Sparkles.tsx         # Random sparkle animations on desktop
      HitCounter.tsx       # Retro visitor counter (fetches /api/hits)
      CursorTrail.tsx      # Sparkle trail following mouse (desktop only)
  data/
    types.ts               # Shared artwork type definitions
    paintings.ts           # Painting artwork metadata (Acrylic on Canvas)
    msPaintWorks.ts        # MS Paint artwork metadata
    ipadWorks.ts           # iPad artwork metadata
    gifWorks.ts            # Animated GIF artwork metadata
    selfPortraits.ts       # Self portrait artwork metadata
    desktopIcons.tsx       # Desktop icon configs (JSX for icon elements)
functions/                 # Cloudflare Workers (production API handlers)
  api/
    hits.js                # Hit counter - D1 persistence
    guestbook.js           # Guestbook - D1 + rate limiting + OpenAI moderation
scripts/
  generate-gallery.ts      # Auto-generate thumbnails + data files from source images
  generate-icons.ts        # Generate favicon, apple-touch-icon, desktop icons
schema.sql                 # D1 database schema (views + guestbook tables)
wrangler.toml              # Cloudflare Pages config + D1 binding
public/
  gallery/
    msPaint/
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

- **Window management**: useReducer in useWindowManager.tsx dispatches OPEN/CLOSE/FOCUS/MINIMIZE/MOVE actions. Windows registered in windowRegistry.ts with lazy imports.
- **Flexbox scroll chain**: StyledWindow (flex column, explicit height, overflow: hidden) > ContentWrapper (flex: 1, min-height: 0) > inner scroll containers (overflow-y: auto, flex: 1, min-height: 0). Every flex container in the chain needs `min-height: 0` to allow shrinking.
- **Static file serving**: Gallery/images/audio served via explicit `/gallery/*`, `/images/*`, `/audio/*` routes with `decodeURIComponent()` for filenames with spaces. The `fetch()` handler serves index.html as fallback for client-side routing. Do NOT use `"/*"` in routes — it intercepts all requests.
- **Mobile**: Breakpoint at 768px. Windows go fullscreen, icons use default grid positions (not draggable), gallery grid 2-col, no cursor trail. Start Menu is primary nav on mobile.
- **Thumbnails**: Run `bun run scripts/generate-gallery.ts` to auto-generate thumbnails and data files. Uses sharp to resize to 300px. Filenames are slugified (spaces/special chars to hyphens, lowercase).
- **Draggable desktop icons**: Icons use `react-draggable`. Positions saved to localStorage under key `"zapychan-icon-positions"`. DEFAULT_POSITIONS in Desktop.tsx provides fallback grid layout. On mobile, dragging is disabled and default positions are always used. Click vs. drag distinguished by 4px distance threshold in DesktopIcon.tsx.

## Guestbook

Real guestbook backed by Cloudflare D1. Two implementations:
- **Dev** (`src/index.ts`): In-memory array, no rate limiting or moderation.
- **Production** (`functions/api/guestbook.js`): D1 database with IP-based rate limiting (10s cooldown, 5 posts/day per IP hash) and optional OpenAI Moderation API content filtering (requires `OPENAI_API_KEY` env var). IP addresses stored as SHA-256 hashes.

API: `GET /api/guestbook` (fetch entries, limit 100) | `POST /api/guestbook` (submit entry, fields: name max 30 chars, message max 500 chars).

## Deployment

Cloudflare Pages + Workers. Config in `wrangler.toml`. D1 database binding `DB` → `zapychan-views`. Schema in `schema.sql` (tables: `views`, `guestbook`). Build output: `dist/`.
