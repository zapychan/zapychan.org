/**
 * Gallery build script
 *
 * Scans public/gallery/digital/full/ for images, generates 300px thumbnails
 * using sharp, and writes src/data/digitalWorks.ts.
 *
 * Usage: bun run scripts/generate-gallery.ts
 */

import { readdir, exists, mkdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const FULL_DIR = "public/gallery/digital/full";
const THUMB_DIR = "public/gallery/digital/thumbs";
const OUTPUT_FILE = "src/data/digitalWorks.ts";
const THUMB_SIZE = 300;

function slugify(filename: string): string {
  const ext = extname(filename);
  const name = basename(filename, ext);
  return (
    name
      .toLowerCase()
      .replace(/['']/g, "") // remove apostrophes
      .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphen
      .replace(/^-|-$/g, "") + // trim leading/trailing hyphens
    ext.toLowerCase()
  );
}

function titleFromFilename(filename: string): string {
  return basename(filename, extname(filename));
}

async function generateThumbnail(
  fullPath: string,
  thumbPath: string
): Promise<void> {
  await sharp(fullPath)
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: "inside", withoutEnlargement: true })
    .toFile(thumbPath);
}

async function main() {
  // Ensure thumbs directory exists
  if (!(await exists(THUMB_DIR))) {
    await mkdir(THUMB_DIR, { recursive: true });
  }

  // Read all image files from full/
  const allFiles = await readdir(FULL_DIR);
  const imageExts = new Set([".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"]);
  const imageFiles = allFiles
    .filter((f) => imageExts.has(extname(f).toLowerCase()))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  console.log(`Found ${imageFiles.length} images in ${FULL_DIR}`);

  // Generate thumbnails
  let generated = 0;
  let skipped = 0;
  for (const file of imageFiles) {
    const slug = slugify(file);
    const thumbPath = join(THUMB_DIR, slug);
    if (await exists(thumbPath)) {
      skipped++;
      continue;
    }
    const fullPath = join(FULL_DIR, file);
    console.log(`  Generating thumbnail: ${slug}`);
    await generateThumbnail(fullPath, thumbPath);
    generated++;
  }
  console.log(
    `Thumbnails: ${generated} generated, ${skipped} already existed`
  );

  // Build digitalWorks entries
  const entries = imageFiles.map((file, i) => {
    const slug = slugify(file);
    const title = titleFromFilename(file);
    return {
      id: `d${i + 1}`,
      title,
      thumbnail: `/gallery/digital/thumbs/${slug}`,
      fullImage: `/gallery/digital/full/${file}`,
    };
  });

  // Write digitalWorks.ts
  const lines: string[] = [];
  lines.push(`import type { Artwork } from "./paintings";`);
  lines.push(``);
  lines.push(`export const digitalWorks: Artwork[] = [`);
  for (const entry of entries) {
    lines.push(`  {`);
    lines.push(`    id: ${JSON.stringify(entry.id)},`);
    lines.push(`    title: ${JSON.stringify(entry.title)},`);
    lines.push(`    year: 2024,`);
    lines.push(`    medium: "MS Paint",`);
    lines.push(
      `    thumbnail: ${JSON.stringify(entry.thumbnail)},`
    );
    lines.push(
      `    fullImage: ${JSON.stringify(entry.fullImage)},`
    );
    lines.push(`  },`);
  }
  // Append evil-only entries
  lines.push(`  // Evil-only hidden digital works`);
  lines.push(`  {`);
  lines.push(`    id: "d-evil1",`);
  lines.push(`    title: "glitch_portrait_FINAL_real.psd",`);
  lines.push(`    year: 2025,`);
  lines.push(`    medium: "Digital (???)",`);
  lines.push(
    `    thumbnail: "/gallery/digital/thumbs/glitch-portrait.jpg",`
  );
  lines.push(
    `    fullImage: "/gallery/digital/full/glitch-portrait.jpg",`
  );
  lines.push(`    description: "I don't remember making this.",`);
  lines.push(`    evilOnly: true,`);
  lines.push(`  },`);
  lines.push(`  {`);
  lines.push(`    id: "d-evil2",`);
  lines.push(`    title: "DO NOT OPEN",`);
  lines.push(`    year: 2023,`);
  lines.push(`    medium: "Digital (corrupted)",`);
  lines.push(
    `    thumbnail: "/gallery/digital/thumbs/do-not-open.jpg",`
  );
  lines.push(
    `    fullImage: "/gallery/digital/full/do-not-open.jpg",`
  );
  lines.push(
    `    description: "This file was found in a folder that shouldn't exist.",`
  );
  lines.push(`    evilOnly: true,`);
  lines.push(`  },`);
  lines.push(`];`);
  lines.push(``);

  await Bun.write(OUTPUT_FILE, lines.join("\n"));
  console.log(
    `Wrote ${entries.length} entries (+ 2 evil-only) to ${OUTPUT_FILE}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
