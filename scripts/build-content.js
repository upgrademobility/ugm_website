/**
 * Generate js/hero-carousel.js from content/hero-carousel.json.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const config = JSON.parse(
  fs.readFileSync(path.join(ROOT, "content/hero-carousel.json"), "utf8")
);

const itemsJson = JSON.stringify(config.slides, null, 4)
  .split("\n")
  .map((line, i) => (i === 0 ? line : `    ${line}`))
  .join("\n");

const js = `document.addEventListener('alpine:init', () => {
  Alpine.data('heroCarousel', () => ({
    active: 0,
    autorotate: true,
    autorotateTiming: ${config.autorotateTiming},
    items: ${itemsJson},
    init() {
      if (this.autorotate) {
        this.autorotateInterval = setInterval(() => {
          this.active = this.active + 1 === this.items.length ? 0 : this.active + 1;
        }, this.autorotateTiming);
      }
    },
    stopAutorotate() {
      clearInterval(this.autorotateInterval);
      this.autorotateInterval = null;
    },
  }));
});
`;

fs.writeFileSync(path.join(ROOT, "js/hero-carousel.js"), js);
console.log("Generated js/hero-carousel.js");
