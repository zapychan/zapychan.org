import { useRef, useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { Button, Toolbar, MenuList, MenuListItem, Separator, Frame } from "react95";
import { useIsMobile } from "../../hooks/useIsMobile";
import {
  type PaintTool,
  MS_PAINT_COLORS,
  BRUSH_SIZES,
} from "./paintConstants";

interface MSPaintWindowProps {
  windowId: string;
  props?: Record<string, unknown>;
}

// --- Styled Components ---

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  margin: -8px;
  user-select: none;
  -webkit-user-select: none;
`;

const MenuBar = styled(Toolbar)`
  flex-shrink: 0;
  padding: 0 4px;
  gap: 2px;
  min-height: 24px;
`;

const MainArea = styled.div<{ $isMobile: boolean }>`
  display: flex;
  flex-direction: ${({ $isMobile }) => ($isMobile ? "column" : "row")};
  flex: 1;
  min-height: 0;
`;

const ToolPanel = styled.div<{ $isMobile: boolean }>`
  ${({ $isMobile, theme }) =>
    $isMobile
      ? `
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    overflow-x: auto;
    padding: 2px 4px;
    gap: 2px;
    border-bottom: 2px solid ${theme.borderDark};
  `
      : `
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    padding: 4px 8px 4px 4px;
    width: 64px;
    flex-shrink: 0;
    align-content: start;
    border-right: 2px solid ${theme.borderDark};
  `}
`;

const ToolBtn = styled(Button)`
  width: 24px;
  height: 24px;
  min-width: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
`;

const BrushSizeSelector = styled.div<{ $isMobile: boolean }>`
  ${({ $isMobile, theme }) =>
    $isMobile
      ? `
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2px;
    margin-left: 4px;
    padding-left: 4px;
    border-left: 1px solid ${theme.borderDark};
  `
      : `
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    margin-top: 8px;
    padding-top: 4px;
    border-top: 1px solid ${theme.borderDark};
  `}
`;

const BrushDotBtn = styled(Button)`
  width: 20px;
  height: 20px;
  min-width: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BrushDotInner = styled.span<{ $size: number }>`
  display: block;
  width: ${({ $size }) => Math.min($size + 1, 12)}px;
  height: ${({ $size }) => Math.min($size + 1, 12)}px;
  border-radius: 50%;
  background: currentColor;
`;

const CanvasArea = styled(Frame)`
  flex: 1;
  min-height: 0;
  min-width: 0;
  position: relative;
  overflow: hidden;
`;

const CanvasEl = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  touch-action: none;
`;

const BottomBar = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
`;

const ColorPalette = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 4px;
  gap: 4px;
`;

const ActiveColors = styled.div`
  position: relative;
  width: 28px;
  height: 28px;
  margin-right: 4px;
  flex-shrink: 0;
`;

const FgSwatch = styled(Frame)<{ $color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 18px;
  height: 18px;
  background: ${({ $color }) => $color};
  z-index: 1;
`;

const BgSwatch = styled(Frame)<{ $color: string }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 18px;
  height: 18px;
  background: ${({ $color }) => $color};
`;

const PaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(14, 16px);
  grid-template-rows: 16px 16px;
  gap: 1px;
`;

const PaletteColor = styled.button<{ $color: string }>`
  width: 16px;
  height: 16px;
  padding: 0;
  background: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.borderDark};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.borderLightest};
  }
`;

const StatusBarFrame = styled(Frame)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 11px;
  gap: 16px;
  min-height: 20px;
`;

const DropdownMenu = styled(MenuList)`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  min-width: 140px;
  font-size: 12px;
`;

const MenuBarItem = styled.div`
  position: relative;
  display: inline-block;
`;

// --- Tool icons (emoji stand-ins, compact) ---

const TOOL_ICONS: Record<PaintTool, string> = {
  pencil: "✏️",
  eraser: "🧹",
  fill: "🪣",
  line: "╱",
  rectangle: "▭",
  ellipse: "◯",
  colorPicker: "💧",
};

const TOOL_LABELS: Record<PaintTool, string> = {
  pencil: "Pencil",
  eraser: "Eraser",
  fill: "Fill",
  line: "Line",
  rectangle: "Rectangle",
  ellipse: "Ellipse",
  colorPicker: "Color Picker",
};

const ALL_TOOLS: PaintTool[] = [
  "pencil",
  "eraser",
  "fill",
  "line",
  "rectangle",
  "ellipse",
  "colorPicker",
];

// --- Flood fill (iterative, no recursion) ---

function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string,
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Parse fill color
  const tmp = document.createElement("canvas");
  tmp.width = tmp.height = 1;
  const tmpCtx = tmp.getContext("2d")!;
  tmpCtx.fillStyle = fillColor;
  tmpCtx.fillRect(0, 0, 1, 1);
  const fc = tmpCtx.getImageData(0, 0, 1, 1).data;

  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  if (sx < 0 || sx >= w || sy < 0 || sy >= h) return;

  const startIdx = (sy * w + sx) * 4;
  const sr = data[startIdx]!;
  const sg = data[startIdx + 1]!;
  const sb = data[startIdx + 2]!;
  const sa = data[startIdx + 3]!;

  // Don't fill if target === fill color
  if (sr === fc[0] && sg === fc[1] && sb === fc[2] && sa === fc[3]) return;

  const match = (i: number) =>
    data[i] === sr &&
    data[i + 1] === sg &&
    data[i + 2] === sb &&
    data[i + 3] === sa;

  const stack = [sx, sy];
  while (stack.length > 0) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    const idx = (y * w + x) * 4;
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    if (!match(idx)) continue;

    data[idx] = fc[0]!;
    data[idx + 1] = fc[1]!;
    data[idx + 2] = fc[2]!;
    data[idx + 3] = fc[3]!;

    stack.push(x + 1, y);
    stack.push(x - 1, y);
    stack.push(x, y + 1);
    stack.push(x, y - 1);
  }

  ctx.putImageData(imageData, 0, 0);
}

// --- Main Component ---

export function MSPaintWindow({ windowId: _windowId }: MSPaintWindowProps) {
  const isMobile = useIsMobile();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tool, setTool] = useState<PaintTool>("pencil");
  const [brushSize, setBrushSize] = useState(isMobile ? 3 : 2);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Undo stack
  const undoStackRef = useRef<ImageData[]>([]);
  const MAX_UNDO = 20;

  // Drawing state refs
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

  // Initialize canvas with white background
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    undoStackRef.current = [];
  }, []);

  // Resize canvas to match container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!container || !canvas || !overlay) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const w = Math.floor(width);
        const h = Math.floor(height);
        if (w <= 0 || h <= 0) continue;

        // Save current drawing
        const ctx = canvas.getContext("2d");
        let savedData: ImageData | null = null;
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          savedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        canvas.width = w;
        canvas.height = h;
        overlay.width = w;
        overlay.height = h;

        // Restore: fill white first, then put saved data back
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, w, h);
          if (savedData) {
            ctx.putImageData(savedData, 0, 0);
          }
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // First-time init
  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const saveUndoState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(data);
    if (undoStackRef.current.length > MAX_UNDO) {
      undoStackRef.current.shift();
    }
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    const data = stack.pop()!;
    ctx.putImageData(data, 0, 0);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo]);

  const getCanvasCoords = useCallback(
    (e: React.PointerEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [],
  );

  const getDrawColor = useCallback(
    (e: React.PointerEvent) => {
      // Right click = bg color, left click = fg color
      if (tool === "eraser") return bgColor;
      return e.button === 2 ? bgColor : fgColor;
    },
    [tool, fgColor, bgColor],
  );

  const clearOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
  }, []);

  // --- Pointer handlers ---

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);

      const pos = getCanvasCoords(e);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      isDrawingRef.current = true;
      lastPosRef.current = pos;
      startPosRef.current = pos;

      const color = getDrawColor(e);

      if (tool === "pencil" || tool === "eraser") {
        saveUndoState();
        ctx.strokeStyle = color;
        ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        // Draw a dot for single click
        ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
        ctx.stroke();
      } else if (tool === "fill") {
        saveUndoState();
        floodFill(ctx, pos.x, pos.y, color);
        isDrawingRef.current = false;
      } else if (tool === "colorPicker") {
        const pixel = ctx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data;
        const hex = `#${(pixel[0] ?? 0).toString(16).padStart(2, "0")}${(pixel[1] ?? 0).toString(16).padStart(2, "0")}${(pixel[2] ?? 0).toString(16).padStart(2, "0")}`.toUpperCase();
        if (e.button === 2) {
          setBgColor(hex);
        } else {
          setFgColor(hex);
        }
        isDrawingRef.current = false;
      } else if (tool === "line" || tool === "rectangle" || tool === "ellipse") {
        saveUndoState();
      }
    },
    [tool, brushSize, getCanvasCoords, getDrawColor, saveUndoState],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const pos = getCanvasCoords(e);
      setMousePos({ x: Math.floor(pos.x), y: Math.floor(pos.y) });

      if (!isDrawingRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (tool === "pencil" || tool === "eraser") {
        const color = tool === "eraser" ? bgColor : (e.buttons === 2 ? bgColor : fgColor);
        ctx.strokeStyle = color;
        ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastPosRef.current = pos;
      } else if (tool === "line" || tool === "rectangle" || tool === "ellipse") {
        // Draw preview on overlay
        const overlay = overlayRef.current;
        if (!overlay) return;
        const oCtx = overlay.getContext("2d");
        if (!oCtx) return;
        oCtx.clearRect(0, 0, overlay.width, overlay.height);

        const color = e.buttons === 2 ? bgColor : fgColor;
        oCtx.strokeStyle = color;
        oCtx.lineWidth = brushSize;
        oCtx.lineCap = "round";

        const start = startPosRef.current;

        if (tool === "line") {
          oCtx.beginPath();
          oCtx.moveTo(start.x, start.y);
          oCtx.lineTo(pos.x, pos.y);
          oCtx.stroke();
        } else if (tool === "rectangle") {
          oCtx.strokeRect(
            start.x,
            start.y,
            pos.x - start.x,
            pos.y - start.y,
          );
        } else if (tool === "ellipse") {
          const cx = (start.x + pos.x) / 2;
          const cy = (start.y + pos.y) / 2;
          const rx = Math.abs(pos.x - start.x) / 2;
          const ry = Math.abs(pos.y - start.y) / 2;
          oCtx.beginPath();
          oCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          oCtx.stroke();
        }
      }
    },
    [tool, brushSize, fgColor, bgColor, getCanvasCoords],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (tool === "line" || tool === "rectangle" || tool === "ellipse") {
        // Commit shape from overlay to main canvas
        const pos = getCanvasCoords(e);
        const color = e.button === 2 ? bgColor : fgColor;
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";

        const start = startPosRef.current;

        if (tool === "line") {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        } else if (tool === "rectangle") {
          ctx.strokeRect(
            start.x,
            start.y,
            pos.x - start.x,
            pos.y - start.y,
          );
        } else if (tool === "ellipse") {
          const cx = (start.x + pos.x) / 2;
          const cy = (start.y + pos.y) / 2;
          const rx = Math.abs(pos.x - start.x) / 2;
          const ry = Math.abs(pos.y - start.y) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        clearOverlay();
      }
    },
    [tool, brushSize, fgColor, bgColor, getCanvasCoords, clearOverlay],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // --- Menu actions ---

  const handleNew = useCallback(() => {
    saveUndoState();
    initCanvas();
    setOpenMenu(null);
  }, [saveUndoState, initCanvas]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "masterpiece.png";
    a.click();
    setOpenMenu(null);
  }, []);

  const handleUndo = useCallback(() => {
    undo();
    setOpenMenu(null);
  }, [undo]);

  // Close menu on click outside
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menu]")) {
        setOpenMenu(null);
      }
    };
    // Delay to avoid closing immediately on the click that opened it
    const timer = setTimeout(() => {
      document.addEventListener("click", handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handler);
    };
  }, [openMenu]);

  return (
    <Wrapper>
      {/* Menu Bar */}
      <MenuBar>
        <MenuBarItem data-menu>
          <Button
            variant="thin"
            size="sm"
            active={openMenu === "file"}
            onClick={() => setOpenMenu(openMenu === "file" ? null : "file")}
          >
            File
          </Button>
          {openMenu === "file" && (
            <DropdownMenu>
              <MenuListItem size="sm" onClick={handleNew}>New</MenuListItem>
              <Separator />
              <MenuListItem size="sm" onClick={handleSave}>Save As PNG</MenuListItem>
            </DropdownMenu>
          )}
        </MenuBarItem>
        <MenuBarItem data-menu>
          <Button
            variant="thin"
            size="sm"
            active={openMenu === "edit"}
            onClick={() => setOpenMenu(openMenu === "edit" ? null : "edit")}
          >
            Edit
          </Button>
          {openMenu === "edit" && (
            <DropdownMenu>
              <MenuListItem size="sm" onClick={handleUndo}>
                Undo{" "}
                <span style={{ opacity: 0.6, fontSize: 10 }}>Ctrl+Z</span>
              </MenuListItem>
            </DropdownMenu>
          )}
        </MenuBarItem>
      </MenuBar>

      {/* Main area: tools + canvas */}
      <MainArea $isMobile={isMobile}>
        <ToolPanel $isMobile={isMobile}>
          {ALL_TOOLS.map((t) => (
            <ToolBtn
              key={t}
              square
              active={tool === t}
              onClick={() => setTool(t)}
              title={TOOL_LABELS[t]}
            >
              {TOOL_ICONS[t]}
            </ToolBtn>
          ))}
          <BrushSizeSelector $isMobile={isMobile}>
            {BRUSH_SIZES.map((size) => (
              <BrushDotBtn
                key={size}
                square
                active={brushSize === size}
                onClick={() => setBrushSize(size)}
                title={`${size}px`}
              >
                <BrushDotInner $size={size} />
              </BrushDotBtn>
            ))}
          </BrushSizeSelector>
        </ToolPanel>

        <CanvasArea variant="field" ref={containerRef}>
          <CanvasEl ref={canvasRef} style={{ zIndex: 1 }} />
          <CanvasEl
            ref={overlayRef}
            style={{ zIndex: 2 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onContextMenu={handleContextMenu}
          />
        </CanvasArea>
      </MainArea>

      {/* Bottom: palette + status */}
      <BottomBar>
        <ColorPalette>
          <ActiveColors>
            <FgSwatch variant="field" $color={fgColor} title={`Foreground: ${fgColor}`} />
            <BgSwatch variant="field" $color={bgColor} title={`Background: ${bgColor}`} />
          </ActiveColors>
          <PaletteGrid>
            {MS_PAINT_COLORS.map((color) => (
              <PaletteColor
                key={color}
                $color={color}
                title={color}
                onClick={() => setFgColor(color)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setBgColor(color);
                }}
              />
            ))}
          </PaletteGrid>
        </ColorPalette>
        <StatusBarFrame variant="status">
          <span>{TOOL_LABELS[tool]}</span>
          <span>
            {mousePos.x}, {mousePos.y}
          </span>
        </StatusBarFrame>
      </BottomBar>
    </Wrapper>
  );
}
