/**
 * Fix uncrawlable news category tags: add real hrefs or convert to spans.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const TAG_URLS = {
  "news-tag--winter-school": "/pages/winterschool.html",
  "news-tag--lecture": "/pages/program.html#topic_lecture",
  "news-tag--team": "/pages/members.html",
};

const TAG_SPANS = new Set(["news-tag--content", "news-tag--think-tank"]);

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

function getTagModifier(classAttr) {
  const match = classAttr.match(/news-tag--[\w-]+/);
  return match ? match[0] : null;
}

function fixNewsTags(content) {
  let changed = false;

  const tagPattern =
    /<a class="(news-tag news-tag--[\w-]+)" href="([^"]*)"([^>]*)>([^<]+)<\/a>/g;

  content = content.replace(tagPattern, (match, classes, href, extraAttrs, label) => {
    const modifier = getTagModifier(classes);
    if (!modifier) {
      return match;
    }

    if (TAG_SPANS.has(modifier)) {
      if (href === "" || href === "#0") {
        changed = true;
        return `<span class="${classes}">${label}</span>`;
      }
      return match;
    }

    const targetUrl = TAG_URLS[modifier];
    if (!targetUrl) {
      return match;
    }

    const isBrokenHref = href === "" || href === "#0";
    const isRelativeWinterSchool =
      modifier === "news-tag--winter-school" && href === "pages/winterschool.html";

    if (!isBrokenHref && !isRelativeWinterSchool) {
      return match;
    }

    changed = true;
    return `<a class="${classes}" href="${targetUrl}">${label}</a>`;
  });

  return { content, changed };
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;
  ({ content } = fixNewsTags(content));

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed news tags in ${path.relative(ROOT, filePath)}`);
  }
}

for (const filePath of walkHtmlFiles(ROOT)) {
  fixFile(filePath);
}
