/**
 * Add crawlable href attributes to author links missing destinations.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const AUTHOR_URLS = {
  "Martin Sommer": "https://www.itiv.kit.edu/21_6289.php",
  "Clemens Kurz": "https://www.fast.kit.edu/lff/HMI_13265.php",
  "Houssem Guissouma": "https://www.itiv.kit.edu/english/21_5343.php",
  "Matthias Vollat": "https://www.fast.kit.edu/lff/Team_10658.php",
};

const AUTHOR_IMAGES = {
  "Sommer.jpg": AUTHOR_URLS["Martin Sommer"],
  "news-kurz.jpg": AUTHOR_URLS["Clemens Kurz"],
  "news-author-02.jpg": AUTHOR_URLS["Houssem Guissouma"],
  "news-author-01.jpg": AUTHOR_URLS["Matthias Vollat"],
};

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

function fixAuthorNameLinks(content) {
  let changed = false;

  for (const [name, url] of Object.entries(AUTHOR_URLS)) {
    const patterns = [
      new RegExp(
        `(<a class="text-gray-200 hover:text-gray-100 transition duration-150 ease-in-out")\\s*href=""\\s*target="_blank" rel="noopener noreferrer">${name}</a>`,
        "g"
      ),
      new RegExp(
        `(<a class="text-gray-200 hover:text-gray-100 transition duration-150 ease-in-out")\\s*target="_blank" rel="noopener noreferrer">${name}</a>`,
        "g"
      ),
      new RegExp(
        `(<a class="font-medium text-gray-200 hover:text-gray-100 transition duration-150 ease-in-out")\\s*target="_blank" rel="noopener noreferrer">${name}</a>`,
        "g"
      ),
    ];

    for (const pattern of patterns) {
      const next = content.replace(
        pattern,
        `$1 href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>`
      );
      if (next !== content) {
        content = next;
        changed = true;
      }
    }
  }

  return { content, changed };
}

function fixAuthorAvatarLinks(content) {
  let changed = false;

  for (const [image, url] of Object.entries(AUTHOR_IMAGES)) {
    const escapedImage = image.replace(".", "\\.");
    const pattern = new RegExp(
      `<a([^>]*)>\\s*<img\\b[^>]*\\bsrc="[^"]*${escapedImage}"[^>]*>`,
      "g"
    );

    const next = content.replace(pattern, (match, aAttrs) => {
      const hrefMatch = aAttrs.match(/\bhref="([^"]*)"/);
      if (hrefMatch && hrefMatch[1] && hrefMatch[1] !== "#0" && hrefMatch[1] !== "") {
        return match;
      }

      changed = true;
      return match.replace(
        /<a([^>]*)>/,
        `<a href="${url}" target="_blank" rel="noopener noreferrer">`
      );
    });

    content = next;
  }

  return { content, changed };
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  ({ content } = fixAuthorNameLinks(content));
  ({ content } = fixAuthorAvatarLinks(content));

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed author links in ${path.relative(ROOT, filePath)}`);
  }
}

for (const filePath of walkHtmlFiles(ROOT)) {
  fixFile(filePath);
}
