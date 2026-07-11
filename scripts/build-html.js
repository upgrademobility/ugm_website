/**
 * Sync shared header and footer partials into HTML pages.
 * Run after editing shared/header.html or shared/footer.html.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SHARED_DIR = path.join(ROOT, "shared");

const HEADER_BLOCK_PATTERN =
  /<!-- Site header -->[\s\S]*?(?=<!-- Page content -->|<main)/;

const FOOTER_BLOCK_PATTERN =
  /<!-- Site footer -->[\s\S]*?<\/footer>\s*/;

const PLACEHOLDER_HEADER_PATTERN =
  /<!-- Site header -->\s*<div id="header-placeholder"><\/div>\s*<script>[\s\S]*?shared\/header\.html[\s\S]*?<\/script>/;

const PLACEHOLDER_FOOTER_PATTERN =
  /<!-- Site footer -->\s*<script>[\s\S]*?shared\/footer\.html[\s\S]*?<\/script>/;

function stripPartialWrapper(content) {
  return content.replace(/^<!DOCTYPE html>\s*/i, "").trim();
}

function indentBlock(content, spaces) {
  const pad = " ".repeat(spaces);
  return content
    .split("\n")
    .map((line) => (line.length ? pad + line : line))
    .join("\n");
}

function assetPrefix(filePath) {
  const relativeDir = path.relative(ROOT, path.dirname(filePath));
  if (!relativeDir || relativeDir === ".") {
    return "./";
  }
  const depth = relativeDir.split(path.sep).length;
  return "../".repeat(depth);
}

function headerScriptTag(prefix) {
  return `${" ".repeat(6)}<script src="${prefix}js/site-header.js" defer></script>\n`;
}

function loadPartials() {
  const header = stripPartialWrapper(
    fs.readFileSync(path.join(SHARED_DIR, "header.html"), "utf8")
  );
  const footer = stripPartialWrapper(
    fs.readFileSync(path.join(SHARED_DIR, "footer.html"), "utf8")
  );
  return { header, footer };
}

function walkHtmlFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (
      entry.isDirectory() &&
      entry.name !== "node_modules" &&
      entry.name !== "shared"
    ) {
      walkHtmlFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

function syncSections(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;
  const sectionPattern =
    /<!-- @section:([\w-]+) -->[\s\S]*?<!-- @end:\1 -->/g;

  const sectionEndIndent = {
    "hero-carousel": "              ",
    "news-carousel-slides": "                  ",
  };

  content = content.replace(sectionPattern, (match, name) => {
    const sectionPath = path.join(SHARED_DIR, "sections", `${name}.html`);
    if (!fs.existsSync(sectionPath)) {
      throw new Error(`Missing section partial: shared/sections/${name}.html`);
    }
    const sectionContent = fs.readFileSync(sectionPath, "utf8").trimEnd();
    const endIndent = sectionEndIndent[name] || "              ";
    changed = true;
    return `<!-- @section:${name} -->\n${sectionContent}\n${endIndent}<!-- @end:${name} -->`;
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Synced sections in ${path.relative(ROOT, filePath)}`);
  }
}

function syncAccessibility(content) {
  let changed = false;

  if (!content.includes('class="skip-link"')) {
    content = content.replace(
      /(<body[^>]*>)\s*/,
      '$1\n    <a href="#main" class="skip-link">Skip to main content</a>\n'
    );
    changed = true;
  }

  if (content.includes('<main class="grow">')) {
    content = content.replace(
      /<main class="grow">/g,
      '<main id="main" class="grow">'
    );
    changed = true;
  }

  return { content, changed };
}

function syncPartials(filePath, { header, footer }) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;
  const prefix = assetPrefix(filePath);

  const headerReplacement = [
    "<!-- Site header -->",
    indentBlock(header, 6),
    headerScriptTag(prefix).trimEnd(),
  ].join("\n");

  if (PLACEHOLDER_HEADER_PATTERN.test(content)) {
    content = content.replace(PLACEHOLDER_HEADER_PATTERN, headerReplacement);
    changed = true;
  } else if (HEADER_BLOCK_PATTERN.test(content)) {
    content = content.replace(HEADER_BLOCK_PATTERN, `${headerReplacement}\n\n      `);
    changed = true;
  }

  const footerReplacement = ["<!-- Site footer -->", indentBlock(footer, 6)].join(
    "\n"
  );

  if (PLACEHOLDER_FOOTER_PATTERN.test(content)) {
    content = content.replace(PLACEHOLDER_FOOTER_PATTERN, footerReplacement);
    changed = true;
  } else if (FOOTER_BLOCK_PATTERN.test(content)) {
    content = content.replace(FOOTER_BLOCK_PATTERN, `${footerReplacement}\n`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Synced partials in ${path.relative(ROOT, filePath)}`);
  }

  const accessibility = syncAccessibility(fs.readFileSync(filePath, "utf8"));
  if (accessibility.changed) {
    fs.writeFileSync(filePath, accessibility.content);
    console.log(`Synced accessibility in ${path.relative(ROOT, filePath)}`);
  }
}

const partials = loadPartials();

for (const filePath of walkHtmlFiles(ROOT)) {
  syncSections(filePath);
  syncPartials(filePath, partials);
}
