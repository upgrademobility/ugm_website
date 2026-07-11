#!/usr/bin/env node
/**
 * Replace legacy placeholder alt text with meaningful descriptions.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const TAB_ALTS = {
  'alt="Tabs 01"': 'alt="Methods and processes in design and production"',
  'alt="Tabs 02"': 'alt="Digitalization in mobility research"',
  'alt="Tabs 03"': 'alt="Mobility and society research"',
  'alt="Tabs 04"': 'alt="Infrastructure and traffic research"',
  'alt="Tabs 05"': 'alt="Vehicle concepts research"',
  'alt="Tabs 06"': 'alt="Powertrain systems research"',
  'alt="Tabs 07"': 'alt="Production systems research"',
  'alt="Tabs 08"': 'alt="Lightweight design research"',
  'alt="Tabs 09"': 'alt="Chassis and body research"',
  'alt="Tabs 10"': 'alt="Electrics and electronics research"',
};

const STATIC_REPLACEMENTS = [
  ...Object.entries(TAB_ALTS),
  ['alt="Testimonial 01"', 'alt="Portrait of Daniel Bogdoll"'],
  ['alt="Testimonial 02"', 'alt="Portrait of Sofie Ehrhardt"'],
  ['alt="Testimonial 03"', 'alt="Portrait of Julia Gandert"'],
  ['alt="Features 01"', 'alt="General information about Graduate School membership"'],
  ['alt="Features 02"', 'alt="Application documents for Graduate School membership"'],
  ['alt="Team member 01"', 'alt="Portrait of Prof. Dr. Eric Sax"'],
  ['alt="Team member 03"', 'alt="Portrait of Dipl.-Ing. Eva-Maria Knoch"'],
  ["doctoral reasearcher", "doctoral researcher"],
  ["require-ments", "requirements"],
  ["<!-- Testimonials -->\n                <div class=\"relative flex items-start aspect-video w-full\" x-ref=\"imageCarousel\">", "<!-- Hero image carousel -->\n                <div class=\"relative flex items-start aspect-video w-full\" x-ref=\"imageCarousel\">"],
];

function applyStaticReplacements(content) {
  let next = content;
  for (const [from, to] of STATIC_REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  return next;
}

function extractAuthorName(block) {
  const patterns = [
    /<footer[\s\S]*?<a[^>]*class="[^"]*text-gray-200[^"]*"[^>]*>([\s\S]*?)<\/a>/,
    /<a class="font-medium text-gray-200[^"]*"[^>]*>([\s\S]*?)<\/a>/,
  ];

  for (const pattern of patterns) {
    const match = block.match(pattern);
    if (match) {
      return match[1].replace(/\s+/g, " ").trim();
    }
  }

  return null;
}

function fixNewsCarouselArticles(content) {
  return content.replace(/<article[\s\S]*?<\/article>/g, (article) => {
    const titleMatch = article.match(
      /<h3[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/,
    );

    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
      : null;
    const author = extractAuthorName(article);

    let updated = article;
    if (title) {
      updated = updated.replace(/alt="News \d\d"/g, `alt="${escapeAttr(title)}"`);
    }
    if (author) {
      updated = updated.replace(/alt="Author 01"/g, `alt="${escapeAttr(author)}"`);
    }
    return updated;
  });
}

function escapeAttr(value) {
  return value.replace(/"/g, "&quot;");
}

function fixNewsPage(filePath, content) {
  const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (!h1Match) {
    return content;
  }

  const title = h1Match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (!title) {
    return content;
  }

  let updated = content.replace(/alt="News single"/g, `alt="${escapeAttr(title)}"`);
  updated = updated.replace(/alt="News inner"/g, `alt="${escapeAttr(title)} — event photo"`);

  updated = updated.replace(
    /(<img[^>]*alt=")Author 01("[^>]*>[\s\S]{0,400}?<a class="font-medium text-gray-200[^"]*"[^>]*>)([\s\S]*?)(<\/a>)/g,
    (_, before, middle, author, after) =>
      `${before}${escapeAttr(author.replace(/\s+/g, " ").trim())}${middle}${author}${after}`,
  );

  return updated;
}

function processFile(relativePath, transform = applyStaticReplacements) {
  const filePath = path.join(ROOT, relativePath);
  const original = fs.readFileSync(filePath, "utf8");
  const updated = transform(original);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated);
    console.log(`Updated ${relativePath}`);
  }
}

function walkNewsPages(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkNewsPages(fullPath);
    } else if (entry.name.endsWith(".html")) {
      processFile(path.relative(ROOT, fullPath), (content) =>
        fixNewsPage(fullPath, applyStaticReplacements(content)),
      );
    }
  }
}

processFile("index.html");
processFile("pages/members.html");
processFile("pages/winterschool.html");
processFile("shared/sections/hero-carousel.html");
processFile("shared/sections/news-carousel-slides.html", (content) =>
  applyStaticReplacements(fixNewsCarouselArticles(content)),
);
walkNewsPages(path.join(ROOT, "news"));
