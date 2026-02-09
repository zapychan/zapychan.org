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
}

const galleries: GalleryConfig[] = [
  {
    fullDir: "public/gallery/digital/full",
    thumbDir: "public/gallery/digital/thumbs",
    outputFile: "src/data/digitalWorks.ts",
    exportName: "digitalWorks",
    medium: "MS Paint Art",
    idPrefix: "d",
  },
  {
    fullDir: "public/gallery/ipad/full",
    thumbDir: "public/gallery/ipad/thumbs",
    outputFile: "src/data/ipadWorks.ts",
    exportName: "ipadWorks",
    medium: "iPad",
    idPrefix: "ip",
  },
  {
    fullDir: "public/gallery/paintings/full",
    thumbDir: "public/gallery/paintings/thumbs",
    outputFile: "src/data/paintings.ts",
    exportName: "paintings",
    medium: "Acrylic on Canvas",
    idPrefix: "p",
  },
  {
    fullDir: "public/gallery/gif/full",
    thumbDir: "public/gallery/gif/thumbs",
    outputFile: "src/data/gifWorks.ts",
    exportName: "gifWorks",
    medium: "Animated GIF",
    idPrefix: "g",
  },
  {
    fullDir: "public/gallery/self portraits/full",
    thumbDir: "public/gallery/self portraits/thumbs",
    outputFile: "src/data/selfPortraits.ts",
    exportName: "selfPortraits",
    medium: "Self Portrait",
    idPrefix: "sp",
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
  let name = basename(filename, extname(filename));
  name = name.replace(/_\d{4}-\d{2}-\d{2}$/, "");
  return name;
}

/** Try to extract date from "Photo YYYY-MM-DD, ..." or "title_YYYY-MM-DD.ext" filenames */
function dateFromFilename(filename: string): string | null {
  // iPad: "Photo YYYY-MM-DD, ..."
  const photoMatch = filename.match(/^Photo (\d{4}-\d{2}-\d{2})/);
  if (photoMatch) return photoMatch[1]!;
  // General: "title_YYYY-MM-DD.ext"
  const dateMatch = basename(filename, extname(filename)).match(/_(\d{4}-\d{2}-\d{2})$/);
  return dateMatch?.[1] ?? null;
}

async function generateThumbnail(
  fullPath: string,
  thumbPath: string
): Promise<void> {
  const isGif = extname(fullPath).toLowerCase() === ".gif";
  const pipeline = sharp(fullPath, isGif ? { animated: true } : undefined)
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: "inside", withoutEnlargement: true });
  if (isGif) pipeline.gif();
  await pipeline.toFile(thumbPath);
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

  if (!(await exists(config.fullDir))) {
    console.log(`  Directory ${config.fullDir} does not exist, writing empty data file`);
    const lines = [
      `import type { Artwork } from "./types";`,
      ``,
      `export const ${config.exportName}: Artwork[] = [];`,
      ``,
    ];
    await Bun.write(config.outputFile, lines.join("\n"));
    return;
  }

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
  lines.push(`import type { Artwork } from "./types";`);
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
  lines.push(`];`);
  lines.push(``);

  await Bun.write(config.outputFile, lines.join("\n"));
  console.log(
    `Wrote ${entries.length} entries to ${config.outputFile}`
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
