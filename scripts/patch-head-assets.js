/**
 * One-time helper to standardize non-blocking CSS/font loading in HTML heads.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Inter:wght@400;500;600;700;800;900&display=swap";

function buildHeadAssets(cssPrefix, includeSwiper) {
  const swiperBlock = includeSwiper
    ? `
    <link href="${cssPrefix}css/vendors/swiper-bundle.min.css" rel="stylesheet" media="print" onload="this.media='all'" />
    <noscript><link href="${cssPrefix}css/vendors/swiper-bundle.min.css" rel="stylesheet" /></noscript>`
    : "";

  return `    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="${cssPrefix}style.css" rel="stylesheet" />
    <link rel="stylesheet" href="${FONT_URL}" media="print" onload="this.media='all'" />
    <noscript><link rel="stylesheet" href="${FONT_URL}" /></noscript>
    <link href="${cssPrefix}css/vendors/aos.css" rel="stylesheet" media="print" onload="this.media='all'" />
    <noscript><link href="${cssPrefix}css/vendors/aos.css" rel="stylesheet" /></noscript>${swiperBlock}
`;
}

const replacements = [
  {
    file: "index.html",
    pattern:
      /    <link href="\.\/css\/vendors\/aos\.css" rel="stylesheet" \/>\n    <link href="\.\/css\/vendors\/swiper-bundle\.min\.css" rel="stylesheet" \/>\n    <link href="\.\/style\.css" rel="stylesheet" \/>\n/,
    replacement: buildHeadAssets("./", true) + "\n",
  },
  {
    file: "404.html",
    pattern:
      /    <link href="\.\/css\/vendors\/aos\.css" rel="stylesheet" \/>\n    <link href="\.\/style\.css" rel="stylesheet" \/>\n/,
    replacement: buildHeadAssets("./", false) + "\n",
  },
  {
    files: "nested",
    pattern:
      /    <link href="\.\.\/css\/vendors\/aos\.css" rel="stylesheet">\n    <link href="\.\.\/style\.css" rel="stylesheet">\n/,
    replacement: buildHeadAssets("../", false) + "\n",
  },
  {
    files: "nested-slash",
    pattern:
      /    <link href="\.\.\/css\/vendors\/aos\.css" rel="stylesheet" \/>\n    <link href="\.\.\/style\.css" rel="stylesheet" \/>\n/,
    replacement: buildHeadAssets("../", false) + "\n",
  },
];

function walkHtmlFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "shared") {
      walkHtmlFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

let updated = 0;

for (const htmlPath of walkHtmlFiles(ROOT)) {
  const relPath = path.relative(ROOT, htmlPath);
  if (relPath === "index.html") {
    const content = fs.readFileSync(htmlPath, "utf8");
    const next = content.replace(replacements[0].pattern, replacements[0].replacement);
    if (next !== content) {
      fs.writeFileSync(htmlPath, next);
      updated += 1;
      console.log(`Updated ${relPath}`);
    }
    continue;
  }

  if (relPath === "404.html") {
    const content = fs.readFileSync(htmlPath, "utf8");
    const next = content.replace(replacements[1].pattern, replacements[1].replacement);
    if (next !== content) {
      fs.writeFileSync(htmlPath, next);
      updated += 1;
      console.log(`Updated ${relPath}`);
    }
    continue;
  }

  let content = fs.readFileSync(htmlPath, "utf8");
  let next = content.replace(replacements[2].pattern, replacements[2].replacement);
  if (next === content) {
    next = content.replace(replacements[3].pattern, replacements[3].replacement);
  }
  if (next !== content) {
    fs.writeFileSync(htmlPath, next);
    updated += 1;
    console.log(`Updated ${relPath}`);
  }
}

console.log(`Done. Updated ${updated} files.`);
