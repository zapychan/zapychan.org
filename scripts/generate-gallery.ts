/**
 * Gallery build script
 *
 * Scans gallery source directories for images, generates 300px thumbnails
 * using sharp, and writes TypeScript data files.
 *
 * Usage: bun run scripts/generate-gallery.ts
 */

import { readdir, exists, mkdir, stat, readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const THUMB_SIZE = 300;

interface GalleryConfig {
  fullDir: string;
  thumbDir: string;
  outputFile: string;
  exportName: string;
  medium: string;
  idPrefix: string;
  evilEntries?: string[];
}

const galleries: GalleryConfig[] = [
  {
    fullDir: "public/gallery/digital/full",
    thumbDir: "public/gallery/digital/thumbs",
    outputFile: "src/data/digitalWorks.ts",
    exportName: "digitalWorks",
    medium: "MS Paint",
    idPrefix: "d",
    evilEntries: [
      `  // Evil-only hidden digital works`,
      `  {`,
      `    id: "d-evil1",`,
      `    title: "glitch_portrait_FINAL_real.psd",`,
      `    year: 2025,`,
      `    medium: "Digital (???)",`,
      `    thumbnail: "/gallery/digital/thumbs/glitch-portrait.jpg",`,
      `    fullImage: "/gallery/digital/full/glitch-portrait.jpg",`,
      `    description: "I don't remember making this.",`,
      `    date: "2025-01-01",`,
      `    evilOnly: true,`,
      `  },`,
      `  {`,
      `    id: "d-evil2",`,
      `    title: "DO NOT OPEN",`,
      `    year: 2023,`,
      `    medium: "Digital (corrupted)",`,
      `    thumbnail: "/gallery/digital/thumbs/do-not-open.jpg",`,
      `    fullImage: "/gallery/digital/full/do-not-open.jpg",`,
      `    description: "This file was found in a folder that shouldn't exist.",`,
      `    date: "2023-06-15",`,
      `    evilOnly: true,`,
      `  },`,
    ],
  },
  {
    fullDir: "public/gallery/ipad/full",
    thumbDir: "public/gallery/ipad/thumbs",
    outputFile: "src/data/ipadWorks.ts",
    exportName: "ipadWorks",
    medium: "iPad",
    idPrefix: "ip",
  },
];

function slugify(filename: string): string {
  const ext = extname(filename);
  const name = basename(filename, ext);
  return (
    name
      .toLowerCase()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    ext.toLowerCase()
  );
}

function titleFromFilename(filename: string): string {
  return basename(filename, extname(filename));
}

/** Try to extract date from "Photo YYYY-MM-DD, ..." filenames */
function dateFromFilename(filename: string): string | null {
  const match = filename.match(/^Photo (\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

async function generateThumbnail(
  fullPath: string,
  thumbPath: string
): Promise<void> {
  await sharp(fullPath)
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: "inside", withoutEnlargement: true })
    .toFile(thumbPath);
}

/** Read existing data file and build a map of fullImage path → date */
async function loadExistingDates(
  outputFile: string
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!(await exists(outputFile))) return map;
  const content = await readFile(outputFile, "utf-8");
  // Match pairs of fullImage and date lines
  const re = /fullImage:\s*"([^"]+)"[\s\S]*?date:\s*"(\d{4}-\d{2}-\d{2})"/g;
  let m;
  while ((m = re.exec(content))) {
    map.set(m[1]!, m[2]!);
  }
  return map;
}

async function processGallery(config: GalleryConfig): Promise<void> {
  console.log(`\n=== Processing ${config.exportName} ===`);

  // Load existing dates so we don't lose them when file mtimes change
  const existingDates = await loadExistingDates(config.outputFile);

  if (!(await exists(config.thumbDir))) {
    await mkdir(config.thumbDir, { recursive: true });
  }

  const allFiles = await readdir(config.fullDir);
  const imageExts = new Set([".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"]);
  const imageFiles = allFiles
    .filter((f) => imageExts.has(extname(f).toLowerCase()))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  console.log(`Found ${imageFiles.length} images in ${config.fullDir}`);

  // Generate thumbnails
  let generated = 0;
  let skipped = 0;
  for (const file of imageFiles) {
    const slug = slugify(file);
    const thumbPath = join(config.thumbDir, slug);
    if (await exists(thumbPath)) {
      skipped++;
      continue;
    }
    const fullPath = join(config.fullDir, file);
    console.log(`  Generating thumbnail: ${slug}`);
    await generateThumbnail(fullPath, thumbPath);
    generated++;
  }
  console.log(
    `Thumbnails: ${generated} generated, ${skipped} already existed`
  );

  // Build entries with dates
  const entries = await Promise.all(
    imageFiles.map(async (file, i) => {
      const slug = slugify(file);
      const title = titleFromFilename(file);
      const fullPath = join(config.fullDir, file);
      const fullImagePath = `/${config.fullDir.replace("public/", "")}/${file}`;
      // Prefer: 1) date from filename, 2) existing date from data file, 3) file mtime
      const filenameDate = dateFromFilename(file);
      const existingDate = existingDates.get(fullImagePath);
      const fileStat = await stat(fullPath);
      const date =
        filenameDate || existingDate || fileStat.mtime.toISOString().split("T")[0]!;
      const year = parseInt(date.slice(0, 4), 10);
      return {
        id: `${config.idPrefix}${i + 1}`,
        title,
        year,
        date,
        thumbnail: `/${config.thumbDir.replace("public/", "")}/${slug}`,
        fullImage: `/${config.fullDir.replace("public/", "")}/${file}`,
      };
    })
  );

  // Write data file
  const lines: string[] = [];
  lines.push(`import type { Artwork } from "./paintings";`);
  lines.push(``);
  lines.push(`export const ${config.exportName}: Artwork[] = [`);
  for (const entry of entries) {
    lines.push(`  {`);
    lines.push(`    id: ${JSON.stringify(entry.id)},`);
    lines.push(`    title: ${JSON.stringify(entry.title)},`);
    lines.push(`    year: ${entry.year},`);
    lines.push(`    medium: ${JSON.stringify(config.medium)},`);
    lines.push(`    thumbnail: ${JSON.stringify(entry.thumbnail)},`);
    lines.push(`    fullImage: ${JSON.stringify(entry.fullImage)},`);
    lines.push(`    date: ${JSON.stringify(entry.date)},`);
    lines.push(`  },`);
  }
  if (config.evilEntries) {
    lines.push(...config.evilEntries);
  }
  lines.push(`];`);
  lines.push(``);

  await Bun.write(config.outputFile, lines.join("\n"));
  const evilCount = config.evilEntries
    ? config.evilEntries.filter((l) => l.includes("evilOnly")).length
    : 0;
  const suffix = evilCount ? ` (+ ${evilCount} evil-only)` : "";
  console.log(
    `Wrote ${entries.length} entries${suffix} to ${config.outputFile}`
  );
}

async function main() {
  for (const gallery of galleries) {
    await processGallery(gallery);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
