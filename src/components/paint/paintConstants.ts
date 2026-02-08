export type PaintTool =
  | "pencil"
  | "eraser"
  | "fill"
  | "line"
  | "rectangle"
  | "ellipse"
  | "colorPicker";

// Pastel palette matching the pink aesthetic (2 rows of 14)
export const MS_PAINT_COLORS = [
  // Row 1: deeper tones + essentials
  "#000000", "#808080", "#B03060", "#FF1493", "#FF69B4", "#CC8899", "#8B4513",
  "#D2691E", "#8B0045", "#4B0082", "#483D8B", "#2E4A62", "#2F4F4F", "#556B2F",
  // Row 2: pastels + lights
  "#FFFFFF", "#FFE4F0", "#FFB6C1", "#FFC0CB", "#FFDAB9", "#FFE4B5", "#FFFACD",
  "#E0FFE0", "#B5EAD7", "#C7CEEA", "#B8D4E3", "#E6CCFF", "#F0E0FF", "#F5F5DC",
];

export const BRUSH_SIZES = [1, 2, 3, 5, 8];
