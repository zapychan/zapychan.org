/**
 * Icon optimization script
 *
 * Generates small PNG icons from oversized source images for use as
 * desktop icons, menu icons, favicon, and apple-touch-icon.
 *
 * Usage: bun scripts/generate-icons.ts
 */

import { exists, mkdir } from "node:fs/promises";
import sharp from "sharp";

const OUTPUT_DIR = "public/images/icons";

interface IconConfig {
  source: string;
  output: string;
  size: number;
}

const icons: IconConfig[] = [
  // Desktop/menu icons (84x84 = 2x retina for 42px display)
  {
    source: "public/images/pfp.png",
    output: "pfp-icon.png",
    size: 84,
  },
  {
    source: "public/gallery/gif/thumbs/img-1222.gif",
    output: "gif-icon.png",
    size: 84,
  },
  {
    source: "public/gallery/self portraits/thumbs/wired.png",
    output: "wired-icon.png",
    size: 84,
  },
  // Favicon (32x32)
  {
    source: "public/images/pfp_small.png",
    output: "favicon-32.png",
    size: 32,
  },
  // Apple touch icon (180x180)
  {
    source: "public/images/pfp_small.png",
    output: "apple-touch-icon.png",
    size: 180,
  },
];

async function main() {
  if (!(await exists(OUTPUT_DIR))) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  for (const icon of icons) {
    const outputPath = `${OUTPUT_DIR}/${icon.output}`;
    console.log(`Generating ${icon.output} (${icon.size}x${icon.size}) from ${icon.source}`);
    await sharp(icon.source)
      .resize(icon.size, icon.size, { fit: "cover" })
      .png()
      .toFile(outputPath);
    const file = Bun.file(outputPath);
    console.log(`  → ${outputPath} (${(file.size / 1024).toFixed(1)}KB)`);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
