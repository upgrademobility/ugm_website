#!/usr/bin/env node
/**
 * Rename legacy image assets to a consistent scheme and update all references.
 *
 * Portraits: firstname_lastname.jpg
 * Page heroes: hero-{page}.jpg
 * Research topics: topic-{slug}.jpg (existing descriptive names kept)
 * News assets: YYYY-MM-DD-{header|preview|inner-N}.jpg
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const IMAGES = path.join(ROOT, "images");

/** @type {Record<string, string>} old basename -> new basename */
const RENAMES = {
  // Portraits
  "Sommer.jpg": "martin_sommer.jpg",
  "eva.jpg": "eva_maria_knoch.jpg",
  "alexandra.jpg": "alexandra_nick.jpg",
  "francesco.jpg": "francesco_pio_urbano.jpg",
  "team-member-01.jpg": "eric_sax.jpg",
  "news-author-01.jpg": "matthias_vollat.jpg",
  "news-author-02.jpg": "houssem_guissouma.jpg",
  "news-kurz.jpg": "clemens_kurz.jpg",
  "testimonial-01.jpg": "daniel_bogdoll.jpg",
  "testimonial-02.jpg": "sofie_ehrhardt.jpg",
  "testimonial-03.jpg": "julia_gandert.jpg",

  // Page & section imagery
  "about-hero.jpg": "hero-subpage.jpg",
  "members-hero.jpg": "hero-members.jpg",
  "info.jpg": "application-overview.jpg",
  "application-1.jpg": "application-requirements.jpg",
  "application-2.jpg": "application-documents.jpg",
  "features-03-image-01.jpg": "winterschool-2026.jpg",
  "404.jpg": "error-not-found.jpg",

  // Research topic tabs
  "mapidap.jpg": "topic-design-production.jpg",
  "mapidap.webp": "topic-design-production.webp",
  "ps2.jpg": "topic-production-systems.jpg",
  "ps2.webp": "topic-production-systems.webp",

  // Legacy news article images
  "news-02.jpg": "2022-08-18-header.jpg",
  "news-03.jpg": "2022-07-04-preview.jpg",

  // Winter school mosaic
  "team-mosaic-01.jpg": "winterschool-mosaic-01.jpg",
  "team-mosaic-02.jpg": "winterschool-mosaic-02.jpg",
  "team-mosaic-03.jpg": "winterschool-mosaic-03.jpg",
  "team-mosaic-04.jpg": "winterschool-mosaic-04.jpg",

  // Date typos / inconsistent separators
  "2022-30-11-inner-1.jpg": "2022-11-30-inner-1.jpg",
  "2022-30-11-inner-1.webp": "2022-11-30-inner-1.webp",
  "2022-30-11-inner-2.jpg": "2022-11-30-inner-2.jpg",
  "2022-30-11-inner-2.webp": "2022-11-30-inner-2.webp",
  "2022-30-11-inner-3.jpg": "2022-11-30-inner-3.jpg",
  "2022-30-11-inner-3.webp": "2022-11-30-inner-3.webp",
  "2022-30-11-inner-4.jpg": "2022-11-30-inner-4.jpg",
  "2022-30-11-inner-4.webp": "2022-11-30-inner-4.webp",
  "2022-30-11-inner-5.jpg": "2022-11-30-inner-5.jpg",
  "2022-30-11-inner-5.webp": "2022-11-30-inner-5.webp",
  "2025-05-14_header.jpg": "2025-05-14-header.jpg",
  "2025-05-14_preview.jpg": "2025-05-14-preview.jpg",
  "2025-06-30_header.jpg": "2025-06-30-header.jpg",
  "2025-06-30_preview.jpg": "2025-06-30-preview.jpg",
  "2025-08-26_header.jpg": "2025-08-26-header.jpg",
  "2025-08-26_preview.jpg": "2025-08-26-preview.jpg",
};

function walkFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    if (entry.isDirectory()) walkFiles(full, acc);
    else if (/\.(html|js|json|css|md|xml)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

function renameFiles() {
  let renamed = 0;
  for (const [from, to] of Object.entries(RENAMES)) {
    const fromPath = path.join(IMAGES, from);
    const toPath = path.join(IMAGES, to);
    if (!fs.existsSync(fromPath)) continue;
    if (fs.existsSync(toPath)) {
      console.warn(`Skip rename ${from}: target ${to} already exists`);
      continue;
    }
    fs.renameSync(fromPath, toPath);
    renamed += 1;
    console.log(`Renamed ${from} -> ${to}`);
  }
  return renamed;
}

function updateReferences() {
  const files = walkFiles(ROOT);
  let updated = 0;

  for (const file of files) {
    if (file.includes(`${path.sep}scripts${path.sep}rename-images.js`)) continue;

    let content = fs.readFileSync(file, "utf8");
    let next = content;

    for (const [from, to] of Object.entries(RENAMES)) {
      next = next.split(from).join(to);
    }

    if (next !== content) {
      fs.writeFileSync(file, next);
      updated += 1;
      console.log(`Updated refs in ${path.relative(ROOT, file)}`);
    }
  }

  return updated;
}

const renamed = renameFiles();
const updated = updateReferences();
console.log(`Done: ${renamed} files renamed, ${updated} files updated.`);
