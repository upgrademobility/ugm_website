/**
 * Phase 3: Optimize remaining site images (previews, carousels, tabs, avatars, UI).
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "images");
const JPEG_QUALITY = 88;
const PREVIEW_JPEG_QUALITY = 85;
const INNER_MAX_WIDTH = 1536;
const INNER_WEBP_QUALITY = 88;
const TEAM_MEMBER_SIZE = 240;
const FLATTEN_BACKGROUND = { r: 17, g: 24, b: 39 }; // gray-900

// Avatars displayed at 40–48px; optimize at 2x retina.
const AVATAR_IMAGES = new Set([
  "news-author-01.jpg",
  "news-author-02.jpg",
  "news-kurz.jpg",
  "testimonial-01.jpg",
  "testimonial-02.jpg",
  "testimonial-03.jpg",
]);

// Members page portraits at 120px; keep at 240px (2x retina).
const TEAM_MEMBER_IMAGES = new Set([
  "Sommer.jpg",
  "team-member-01.jpg",
  "team-member-02.jpg",
  "team-member-kurz.jpg",
  "eva.jpg",
  "alexandra.jpg",
  "francesco.jpg",
]);

// Already correctly sized for their largest on-page display (2x retina).
// Do not recompress or downscale these.
const SKIP_IMAGES = new Set([
  "404.jpg",
  "about-hero.jpg",
  "members-hero.jpg",
  "team-mosaic-01.jpg",
  "team-mosaic-02.jpg",
  "team-mosaic-03.jpg",
  "team-mosaic-04.jpg",
]);

const TAB_IMAGES = new Set([
  "mapidap.jpg",
  "digital-infra-modeling.jpg",
  "methods-infra-simulation.jpg",
  "information-application-tech.jpg",
  "vehicle-concepts.jpg",
  "propulsion-system.jpg",
  "ps2.jpg",
  "lightweight-design.jpg",
  "chassis-body.jpg",
  "electrics-electronics.jpg",
]);

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
  if (SKIP_IMAGES.has(filename)) {
    return null;
  }

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

  if (filename === "2026-04-08-preview.png") {
    return {
      type: "preview-hero",
      output: "2026-04-08-preview.jpg",
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
    return {
      type: "inner",
      maxWidth: INNER_MAX_WIDTH,
      quality: JPEG_QUALITY,
      webp: true,
      webpQuality: INNER_WEBP_QUALITY,
    };
  }

  if (TAB_IMAGES.has(filename)) {
    return { type: "tab", maxWidth: 768, quality: JPEG_QUALITY, webp: true };
  }

  if (TEAM_MEMBER_IMAGES.has(filename)) {
    return {
      type: "team-member",
      size: TEAM_MEMBER_SIZE,
      quality: JPEG_QUALITY,
    };
  }

  if (AVATAR_IMAGES.has(filename)) {
    return { type: "avatar", maxWidth: 80, quality: PREVIEW_JPEG_QUALITY };
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

async function writeWebp(inputPath, outputPath, maxWidth, quality = 82) {
  await sharp(inputPath)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);
}

async function writeTeamMemberPortrait(inputPath, outputPath, size, quality) {
  await sharp(inputPath)
    .rotate()
    .resize(size, size, { fit: "cover", position: "centre" })
    .jpeg({ quality, mozjpeg: true })
    .toFile(outputPath);
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

  if (rule.type === "team-member") {
    await writeTeamMemberPortrait(inputPath, tempPath, rule.size, rule.quality);
    fs.renameSync(tempPath, outputPath);
  } else {
    let pipeline = sharp(inputPath).rotate();

    pipeline = pipeline.resize({
      width: rule.maxWidth,
      withoutEnlargement: true,
    });

    if (filename.toLowerCase().endsWith(".png")) {
      pipeline = pipeline.flatten({ background: FLATTEN_BACKGROUND });
    }

    await writeJpeg(pipeline, tempPath, rule.quality);
    fs.renameSync(tempPath, outputPath);
  }

  if (outputName !== filename) {
    fs.unlinkSync(inputPath);
    conversions.push({ from: filename, to: outputName });
  }

  const after = fs.statSync(outputPath).size;
  const outputMeta = await sharp(outputPath).metadata();

  console.log(
    `${filename}${outputName !== filename ? ` -> ${outputName}` : ""}: ${sourceMeta.width}x${sourceMeta.height} -> ${outputMeta.width}x${outputMeta.height}, ${formatKiB(before)} -> ${formatKiB(after)}`
  );

  if (rule.webp) {
    const webpPath = outputPath.replace(/\.jpe?g$/i, ".webp");
    const webpSource = rule.type === "inner" ? outputPath : inputPath;
    const webpMeta = await sharp(webpSource).metadata();
    const webpWidth = Math.min(webpMeta.width, rule.maxWidth);
    await writeWebp(webpSource, webpPath, webpWidth, rule.webpQuality || 82);
    const webpSize = fs.statSync(webpPath).size;
    console.log(`  -> ${path.basename(webpPath)}: ${formatKiB(webpSize)}`);
  }
}

async function regenerateInnerWebpOnly() {
  const innerJpegs = fs
    .readdirSync(IMAGES_DIR)
    .filter((filename) => isInnerImage(filename) && /\.jpe?g$/i.test(filename))
    .sort();

  for (const filename of innerJpegs) {
    const jpegPath = path.join(IMAGES_DIR, filename);
    const webpPath = jpegPath.replace(/\.jpe?g$/i, ".webp");
    const meta = await sharp(jpegPath).metadata();
    const webpWidth = Math.min(meta.width, INNER_MAX_WIDTH);
    await writeWebp(jpegPath, webpPath, webpWidth, INNER_WEBP_QUALITY);
    console.log(
      `Regenerated ${path.basename(webpPath)} from ${filename} (${webpWidth}px, ${formatKiB(fs.statSync(webpPath).size)})`
    );
  }
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
  const webpOnly = process.argv.includes("--webp-only");

  if (webpOnly) {
    await regenerateInnerWebpOnly();
    return;
  }

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
