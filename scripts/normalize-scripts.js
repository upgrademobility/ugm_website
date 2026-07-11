/**
 * Normalize deferred script loading and replace jQuery mailto handler with vanilla JS.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const MAILTO_HANDLER = `    <script>
      document.querySelectorAll('a[href^="mailto"]').forEach(function (link) {
        link.addEventListener('click', function () {
          var timer;
          var onBlur = function () {
            clearTimeout(timer);
            window.removeEventListener('blur', onBlur);
          };
          window.addEventListener('blur', onBlur);
          timer = setTimeout(function () {
            window.removeEventListener('blur', onBlur);
            alert(
              'No email client was detected. Please apply via upgrademobility@kit.edu.'
            );
          }, 1000);
        });
      });
    </script>`;

const JQUERY_MAILTO_PATTERN =
  /\s*<script>\s*\(function\s*\(\$\)\s*\{[\s\S]*?\}\)\(jQuery\);\s*<\/script>/;

const JQUERY_TAGS = [
  /\s*<script src="https:\/\/ajax\.googleapis\.com\/ajax\/libs\/jquery\/[^"]+"><\/script>\n?/g,
  /\s*<script src="(\.\/|\.\.\/)js\/vendors\/jquery\.min\.js"><\/script>\n?/g,
  /\s*<script src="(\.\/|\.\.\/)js\/vendors\/swiper-bundle\.min\.js" defer><\/script>\n?/g,
];

function getScriptPrefix(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");
  if (rel === "index.html" || rel === "404.html") {
    return "./";
  }
  return "../";
}

function buildScriptBlock(prefix, includeMailto) {
  const lines = [
    `    <script src="${prefix}js/vendors/aos.js" defer></script>`,
    `    <script src="${prefix}js/main.js" defer></script>`,
    `    <script src="${prefix}js/vendors/alpinejs.min.js" defer></script>`,
  ];

  if (includeMailto) {
    lines.push("");
    lines.push(MAILTO_HANDLER.trim());
  }

  return lines.join("\n");
}

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

function normalizeFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const prefix = getScriptPrefix(filePath);
  const hadMailto = JQUERY_MAILTO_PATTERN.test(content);
  let changed = false;

  for (const pattern of JQUERY_TAGS) {
    if (pattern.test(content)) {
      content = content.replace(pattern, "\n");
      changed = true;
    }
  }

  if (JQUERY_MAILTO_PATTERN.test(content)) {
    content = content.replace(JQUERY_MAILTO_PATTERN, "");
    changed = true;
  }

  const scriptBlockPattern =
    /[ \t]*<script src="(?:\.\/|\.\.\/)js\/vendors\/alpinejs\.min\.js" defer><\/script>[\s\S]*?<script src="(?:\.\/|\.\.\/)js\/main\.js"(?: defer)?><\/script>/;

  if (scriptBlockPattern.test(content)) {
    const replacement = buildScriptBlock(prefix, hadMailto);
    content = content.replace(scriptBlockPattern, replacement);
    changed = true;
  } else if (
    content.includes('src="./js/vendors/aos.js"') ||
    content.includes('src="../js/vendors/aos.js"')
  ) {
    // Fallback: ensure aos.js and main.js have defer
    const before = content;
    content = content.replace(
      /(<script src="(?:\.\/|\.\.\/)js\/vendors\/aos\.js")><\/script>/g,
      '$1 defer></script>'
    );
    content = content.replace(
      /(<script src="(?:\.\/|\.\.\/)js\/main\.js")><\/script>/g,
      '$1 defer></script>'
    );
    changed = changed || content !== before;
  }

  if (hadMailto && !content.includes('querySelectorAll(\'a[href^="mailto"]\')')) {
    content = content.replace(
      /(<script src="(?:\.\/|\.\.\/)js\/vendors\/alpinejs\.min\.js" defer><\/script>)\s*(?=<\/body>)/,
      `$1\n\n${MAILTO_HANDLER}\n`
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${path.relative(ROOT, filePath)}`);
  }
}

for (const filePath of walkHtmlFiles(ROOT)) {
  normalizeFile(filePath);
}
