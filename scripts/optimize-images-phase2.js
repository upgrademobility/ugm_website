/**
 * Phase 2: Resize and compress news article header images in place.
 * Headers are capped at 1600px wide (2x for 1024px article display).
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGES_DIR = path.join(__dirname, "..", "images");
const HEADER_MAX_WIDTH = 1600;
const JPEG_QUALITY = 85;

function isHeaderImage(filename) {
  return /header/i.test(filename);
}

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function optimizeHeader(filename) {
  const inputPath = path.join(IMAGES_DIR, filename);
  const tempPath = `${inputPath}.tmp`;
  const before = fs.statSync(inputPath).size;
  const sourceMeta = await sharp(inputPath).metadata();

  let pipeline = sharp(inputPath).rotate().resize({
    width: HEADER_MAX_WIDTH,
    withoutEnlargement: true,
  });

  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") {
    await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(tempPath);
  } else {
    await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(tempPath);
  }

  fs.renameSync(tempPath, inputPath);

  const after = fs.statSync(inputPath).size;
  const outputMeta = await sharp(inputPath).metadata();

  console.log(
    `${filename}: ${sourceMeta.width}x${sourceMeta.height} -> ${outputMeta.width}x${outputMeta.height}, ${formatKiB(before)} -> ${formatKiB(after)}`
  );
}

async function main() {
  const headers = fs
    .readdirSync(IMAGES_DIR)
    .filter(isHeaderImage)
    .sort();

  if (headers.length === 0) {
    throw new Error("No header images found");
  }

  for (const filename of headers) {
    await optimizeHeader(filename);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
