/**
 * Inline shared header and footer into HTML pages at build time.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SHARED_DIR = path.join(ROOT, "shared");

const HEADER_INIT_SCRIPT = `      <script>
        document.addEventListener("alpine:init", () => {
          Alpine.data("handleHeader", () => ({
            top: true,
            isTop() {
              this.top = window.pageYOffset < 10;
            },
            init() {
              this.isTop();
            },
          }));
        });
      </script>`;

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

function loadPartials() {
  const header = stripPartialWrapper(
    fs.readFileSync(path.join(SHARED_DIR, "header.html"), "utf8")
  );
  const footer = stripPartialWrapper(
    fs.readFileSync(path.join(SHARED_DIR, "footer.html"), "utf8")
  );
  return { header, footer };
}

const HEADER_BLOCK_PATTERN =
  /<!-- Site header -->\s*<div id="header-placeholder"><\/div>\s*<script>[\s\S]*?shared\/header\.html[\s\S]*?<\/script>/;

const FOOTER_BLOCK_PATTERN =
  /<!-- Site footer -->\s*<script>[\s\S]*?shared\/footer\.html[\s\S]*?<\/script>/;

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

function inlinePartials(filePath, { header, footer }) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  if (HEADER_BLOCK_PATTERN.test(content)) {
    const replacement = [
      "<!-- Site header -->",
      indentBlock(header, 6),
      HEADER_INIT_SCRIPT,
    ].join("\n");
    content = content.replace(HEADER_BLOCK_PATTERN, replacement);
    changed = true;
  }

  if (FOOTER_BLOCK_PATTERN.test(content)) {
    const replacement = ["<!-- Site footer -->", indentBlock(footer, 6)].join("\n");
    content = content.replace(FOOTER_BLOCK_PATTERN, replacement);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Inlined partials in ${path.relative(ROOT, filePath)}`);
  }
}

const partials = loadPartials();

for (const filePath of walkHtmlFiles(ROOT)) {
  inlinePartials(filePath, partials);
}
