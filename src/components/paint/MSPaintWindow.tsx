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

  .emoji {
    font-size: 11px;
  }
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

const TextInputOverlay = styled.textarea<{ $fontSize: number }>`
  position: absolute;
  z-index: 3;
  background: transparent;
  border: 1px dashed #000;
  outline: none;
  resize: none;
  font-family: Arial, sans-serif;
  font-size: ${({ $fontSize }) => $fontSize}px;
  line-height: 1.2;
  padding: 2px;
  min-width: 20px;
  min-height: ${({ $fontSize }) => $fontSize * 1.2 + 4}px;
  overflow: hidden;
  color: inherit;
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
  cursor: pointer;
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
  text: "A",
};

const TOOL_LABELS: Record<PaintTool, string> = {
  pencil: "Pencil",
  eraser: "Eraser",
  fill: "Fill",
  line: "Line",
  rectangle: "Rectangle",
  ellipse: "Ellipse",
  colorPicker: "Color Picker",
  text: "Text",
};

const EMOJI_TOOLS = new Set<PaintTool>(["pencil", "eraser", "fill", "colorPicker"]);

const ALL_TOOLS: PaintTool[] = [
  "pencil",
  "eraser",
  "fill",
  "line",
  "rectangle",
  "ellipse",
  "colorPicker",
  "text",
];

const TEXT_SIZE_MULTIPLIER = 6;

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

  // Scanline flood fill
  const visited = new Uint8Array(w * h);
  const stack = [sx, sy];
  while (stack.length > 0) {
    const y = stack.pop()!;
    let x = stack.pop()!;
    if (y < 0 || y >= h) continue;

    // Walk left to find the start of this scanline segment
    while (x > 0 && match((y * w + x - 1) * 4) && !visited[y * w + x - 1]) {
      x--;
    }

    // Fill rightward, pushing neighbors above and below
    let abovePushed = false;
    let belowPushed = false;
    while (x < w) {
      const pi = y * w + x;
      const idx = pi * 4;
      if (visited[pi] || !match(idx)) break;

      visited[pi] = 1;
      data[idx] = fc[0]!;
      data[idx + 1] = fc[1]!;
      data[idx + 2] = fc[2]!;
      data[idx + 3] = fc[3]!;

      // Check pixel above
      if (y > 0) {
        const aboveMatch = match((pi - w) * 4) && !visited[pi - w];
        if (aboveMatch && !abovePushed) {
          stack.push(x, y - 1);
          abovePushed = true;
        } else if (!aboveMatch) {
          abovePushed = false;
        }
      }

      // Check pixel below
      if (y < h - 1) {
        const belowMatch = match((pi + w) * 4) && !visited[pi + w];
        if (belowMatch && !belowPushed) {
          stack.push(x, y + 1);
          belowPushed = true;
        } else if (!belowMatch) {
          belowPushed = false;
        }
      }

      x++;
    }
  }

  // Edge cleanup: fill anti-aliased fringe pixels that border the filled region.
  // Any non-filled pixel with ≥2 filled neighbors gets filled too.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pi = y * w + x;
      if (visited[pi]) continue;
      let filledNeighbors = 0;
      if (x > 0 && visited[pi - 1]) filledNeighbors++;
      if (x < w - 1 && visited[pi + 1]) filledNeighbors++;
      if (y > 0 && visited[pi - w]) filledNeighbors++;
      if (y < h - 1 && visited[pi + w]) filledNeighbors++;
      if (filledNeighbors >= 2) {
        const idx = pi * 4;
        data[idx] = fc[0]!;
        data[idx + 1] = fc[1]!;
        data[idx + 2] = fc[2]!;
        data[idx + 3] = fc[3]!;
      }
    }
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
  const [textInput, setTextInput] = useState<{
    visible: boolean;
    x: number;
    y: number;
    value: string;
  } | null>(null);
  const textInputRef = useRef(textInput);
  textInputRef.current = textInput;

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

  const commitText = useCallback(
    (input: { x: number; y: number; value: string } | null) => {
      if (!input || !input.value.trim()) {
        setTextInput(null);
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      saveUndoState();
      const fontSize = brushSize * TEXT_SIZE_MULTIPLIER;
      ctx.font = `${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = fgColor;
      ctx.textBaseline = "top";
      const lines = input.value.split("\n");
      for (const [i, line] of lines.entries()) {
        ctx.fillText(line, input.x, input.y + i * fontSize * 1.2);
      }
      setTextInput(null);
    },
    [brushSize, fgColor, saveUndoState],
  );

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

  // Commit text input when switching away from text tool
  useEffect(() => {
    if (tool !== "text" && textInputRef.current) {
      commitText(textInputRef.current);
    }
  }, [tool, commitText]);

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
      } else if (tool === "text") {
        // Commit existing text first if it has content
        if (textInputRef.current && textInputRef.current.value.trim()) {
          commitText(textInputRef.current);
        }
        setTextInput({ visible: true, x: pos.x, y: pos.y, value: "" });
        isDrawingRef.current = false;
      } else if (tool === "line" || tool === "rectangle" || tool === "ellipse") {
        saveUndoState();
      }
    },
    [tool, brushSize, getCanvasCoords, getDrawColor, saveUndoState, commitText],
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

  // --- Image menu handlers ---

  const handleFlipHorizontal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveUndoState();
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const tCtx = tmp.getContext("2d")!;
    tCtx.scale(-1, 1);
    tCtx.drawImage(canvas, -canvas.width, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tmp, 0, 0);
    setOpenMenu(null);
  }, [saveUndoState]);

  const handleFlipVertical = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveUndoState();
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const tCtx = tmp.getContext("2d")!;
    tCtx.scale(1, -1);
    tCtx.drawImage(canvas, 0, -canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tmp, 0, 0);
    setOpenMenu(null);
  }, [saveUndoState]);

  const handleRotate90CW = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveUndoState();
    const w = canvas.width;
    const h = canvas.height;
    const tmp = document.createElement("canvas");
    tmp.width = w;
    tmp.height = h;
    const tCtx = tmp.getContext("2d")!;
    tCtx.fillStyle = "#FFFFFF";
    tCtx.fillRect(0, 0, w, h);
    tCtx.translate(w / 2, h / 2);
    tCtx.rotate(Math.PI / 2);
    tCtx.drawImage(canvas, -w / 2, -h / 2);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(tmp, 0, 0);
    setOpenMenu(null);
  }, [saveUndoState]);

  const handleRotate180 = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveUndoState();
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const tCtx = tmp.getContext("2d")!;
    tCtx.scale(-1, -1);
    tCtx.drawImage(canvas, -canvas.width, -canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tmp, 0, 0);
    setOpenMenu(null);
  }, [saveUndoState]);

  const handleInvertColors = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveUndoState();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]!;
      data[i + 1] = 255 - data[i + 1]!;
      data[i + 2] = 255 - data[i + 2]!;
    }
    ctx.putImageData(imageData, 0, 0);
    setOpenMenu(null);
  }, [saveUndoState]);

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
        <MenuBarItem data-menu>
          <Button
            variant="thin"
            size="sm"
            active={openMenu === "image"}
            onClick={() => setOpenMenu(openMenu === "image" ? null : "image")}
          >
            Image
          </Button>
          {openMenu === "image" && (
            <DropdownMenu>
              <MenuListItem size="sm" onClick={handleFlipHorizontal}>Flip Horizontal</MenuListItem>
              <MenuListItem size="sm" onClick={handleFlipVertical}>Flip Vertical</MenuListItem>
              <Separator />
              <MenuListItem size="sm" onClick={handleRotate90CW}>Rotate 90° CW</MenuListItem>
              <MenuListItem size="sm" onClick={handleRotate180}>Rotate 180°</MenuListItem>
              <Separator />
              <MenuListItem size="sm" onClick={handleInvertColors}>Invert Colors</MenuListItem>
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
              {EMOJI_TOOLS.has(t) ? <span className="emoji">{TOOL_ICONS[t]}</span> : TOOL_ICONS[t]}
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
          {textInput?.visible && (
            <TextInputOverlay
              $fontSize={brushSize * TEXT_SIZE_MULTIPLIER}
              style={{
                left: textInput.x,
                top: textInput.y,
                color: fgColor,
              }}
              value={textInput.value}
              autoFocus
              onChange={(e) =>
                setTextInput((prev) =>
                  prev ? { ...prev, value: e.target.value } : null,
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  commitText(textInput);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setTextInput(null);
                }
              }}
              onBlur={() => commitText(textInput)}
            />
          )}
        </CanvasArea>
      </MainArea>

      {/* Bottom: palette + status */}
      <BottomBar>
        <ColorPalette>
          <ActiveColors onClick={() => { setFgColor(bgColor); setBgColor(fgColor); }}>
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
