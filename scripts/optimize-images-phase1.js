/**
 * Phase 1: Generate missing news preview images from header sources.
 * Previews are 704px wide (2x for ~352px display) as JPEG quality 82.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGES_DIR = path.join(__dirname, "..", "images");
const PREVIEW_WIDTH = 704;
const JPEG_QUALITY = 82;

const PREVIEWS = [
  { source: "2026-06-08-header.jpeg", output: "2026-06-08-preview.jpg" },
  { source: "2026-04-14-header.jpeg", output: "2026-04-14-preview.jpg" },
  { source: "2025-05-07-header.jpg", output: "2025-05-07-preview.jpg" },
  { source: "2022-11-30-header.jpg", output: "2022-11-30-preview.jpg" },
];

async function createPreview({ source, output }) {
  const inputPath = path.join(IMAGES_DIR, source);
  const outputPath = path.join(IMAGES_DIR, output);

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Source image not found: ${source}`);
  }

  const before = fs.statSync(inputPath).size;

  await sharp(inputPath)
    .rotate()
    .resize({ width: PREVIEW_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(outputPath);

  const after = fs.statSync(outputPath).size;
  const meta = await sharp(outputPath).metadata();

  console.log(
    `${source} -> ${output} (${meta.width}x${meta.height}, ${formatKiB(before)} -> ${formatKiB(after)})`
  );
}

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function main() {
  for (const preview of PREVIEWS) {
    await createPreview(preview);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
