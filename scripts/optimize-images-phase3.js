/**
 * Phase 3: Optimize remaining site images (previews, carousels, tabs, avatars, UI).
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "images");
const JPEG_QUALITY = 85;
const PREVIEW_JPEG_QUALITY = 82;
const FLATTEN_BACKGROUND = { r: 17, g: 24, b: 39 }; // gray-900

const TAB_IMAGES = new Set([
  "mapidap.jpg",
  "dim.jpg",
  "mis.jpg",
  "iat.jpg",
  "vc.jpg",
  "ps.jpg",
  "ps2.jpg",
  "ld.jpg",
  "cb.jpg",
  "ee.jpg",
]);

const AVATAR_SMALL = new Set([
  "Sommer.jpg",
  "news-author-01.jpg",
  "news-author-02.jpg",
  "news-kurz.jpg",
  "testimonial-01.jpg",
  "testimonial-02.jpg",
  "testimonial-03.jpg",
  "team-member-kurz.jpg",
]);

const AVATAR_LARGE = new Set([
  "team-member-01.jpg",
  "team-member-02.jpg",
  "eva.jpg",
  "alexandra.jpg",
  "francesco.jpg",
  "404.jpg",
]);

const PAGE_HEROES = new Set(["about-hero.jpg", "members-hero.jpg"]);

const TEAM_MOSAIC = /^team-mosaic-\d+\.jpg$/i;

const PNG_HEADERS = new Set([
  "2025-01-20-header.png",
  "2025-03-04-header.png",
  "2025-05-14_header.png",
]);

const UI_PNG = new Set([
  "application-1.png",
  "application-2.png",
  "info.png",
  "features-03-image-01.png",
]);

const conversions = [];

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function isHeaderImage(filename) {
  return /header/i.test(filename);
}

function isPreviewImage(filename) {
  return /preview/i.test(filename) || /^news-0[123]\.jpg$/i.test(filename);
}

function isInnerImage(filename) {
  return /inner/i.test(filename);
}

function getRule(filename) {
  if (isHeaderImage(filename)) {
    if (PNG_HEADERS.has(filename)) {
      return {
        type: "png-header",
        output: filename.replace(/\.png$/i, ".jpg"),
        maxWidth: 1600,
        quality: JPEG_QUALITY,
      };
    }
    return null;
  }

  if (filename === "2026-04-08-previewnew.png") {
    return {
      type: "preview-hero",
      output: "2026-04-08-previewnew.jpg",
      maxWidth: 1600,
      quality: JPEG_QUALITY,
    };
  }

  if (/preview.*\.png$/i.test(filename)) {
    return {
      type: "preview-png",
      output: filename.replace(/\.png$/i, ".jpg"),
      maxWidth: 704,
      quality: PREVIEW_JPEG_QUALITY,
    };
  }

  if (isPreviewImage(filename)) {
    return {
      type: "preview",
      maxWidth: 704,
      quality: PREVIEW_JPEG_QUALITY,
    };
  }

  if (isInnerImage(filename)) {
    return { type: "inner", maxWidth: 1408, quality: JPEG_QUALITY };
  }

  if (TAB_IMAGES.has(filename)) {
    return { type: "tab", maxWidth: 1032, quality: JPEG_QUALITY };
  }

  if (AVATAR_SMALL.has(filename)) {
    return { type: "avatar-small", size: 96, quality: JPEG_QUALITY };
  }

  if (AVATAR_LARGE.has(filename)) {
    return { type: "avatar-large", size: 240, quality: JPEG_QUALITY };
  }

  if (PAGE_HEROES.has(filename)) {
    return { type: "page-hero", maxWidth: 1600, quality: JPEG_QUALITY };
  }

  if (TEAM_MOSAIC.test(filename)) {
    return { type: "team-mosaic", maxWidth: 1200, quality: JPEG_QUALITY };
  }

  if (UI_PNG.has(filename)) {
    return {
      type: "ui-png",
      output: filename.replace(/\.png$/i, ".jpg"),
      maxWidth: 1080,
      quality: JPEG_QUALITY,
    };
  }

  return null;
}

async function writeJpeg(pipeline, outputPath, quality) {
  await pipeline.jpeg({ quality, mozjpeg: true }).toFile(outputPath);
}

async function optimizeImage(filename) {
  const rule = getRule(filename);
  if (!rule) {
    return;
  }

  const inputPath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(inputPath)) {
    return;
  }

  const before = fs.statSync(inputPath).size;
  const sourceMeta = await sharp(inputPath).metadata();
  const outputName = rule.output || filename;
  const outputPath = path.join(IMAGES_DIR, outputName);
  const tempPath = `${outputPath}.tmp`;

  let pipeline = sharp(inputPath).rotate();

  if (rule.type === "avatar-small" || rule.type === "avatar-large") {
    pipeline = pipeline.resize(rule.size, rule.size, {
      fit: "cover",
      position: "centre",
    });
  } else {
    pipeline = pipeline.resize({
      width: rule.maxWidth,
      withoutEnlargement: true,
    });
  }

  if (filename.toLowerCase().endsWith(".png")) {
    pipeline = pipeline.flatten({ background: FLATTEN_BACKGROUND });
  }

  await writeJpeg(pipeline, tempPath, rule.quality);
  fs.renameSync(tempPath, outputPath);

  if (outputName !== filename) {
    fs.unlinkSync(inputPath);
    conversions.push({ from: filename, to: outputName });
  }

  const after = fs.statSync(outputPath).size;
  const outputMeta = await sharp(outputPath).metadata();

  console.log(
    `${filename}${outputName !== filename ? ` -> ${outputName}` : ""}: ${sourceMeta.width}x${sourceMeta.height} -> ${outputMeta.width}x${outputMeta.height}, ${formatKiB(before)} -> ${formatKiB(after)}`
  );
}

function updateHtmlReferences() {
  if (conversions.length === 0) {
    return;
  }

  const htmlFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        htmlFiles.push(fullPath);
      }
    }
  }

  walk(ROOT);

  for (const htmlPath of htmlFiles) {
    let content = fs.readFileSync(htmlPath, "utf8");
    let changed = false;

    for (const { from, to } of conversions) {
      if (content.includes(from)) {
        content = content.split(from).join(to);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(htmlPath, content);
      console.log(`Updated references in ${path.relative(ROOT, htmlPath)}`);
    }
  }
}

async function main() {
  const files = fs.readdirSync(IMAGES_DIR).sort();

  for (const filename of files) {
    await optimizeImage(filename);
  }

  updateHtmlReferences();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
