[![pages-build-deployment](https://github.com/upgrademobility/ugm_website/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/upgrademobility/ugm_website/actions/workflows/pages/pages-build-deployment)

# UGM Website

Welcome to the codebase of the HTML website of the UGM. 

## Details

Bootstrap Icons: https://icons.getbootstrap.com/    
Nucleo Icons: https://nucleoapp.com/free-icons    
KIT Colors: https://raw.githubusercontent.com/camminady/kitcolors/master/example.png

## Add News Articles

Each news item is a standalone HTML page plus a carousel card on the homepage. The workflow: copy an existing article, rename it, edit the content, add images, and update `index.html`.

### Overview

| What | Where |
|------|-------|
| Article page | `news/YYYY-MM-DD.html` |
| Article images | `images/` |
| Homepage carousel card | `index.html` (News section) |

The filename date (`YYYY-MM-DD`) is the article's publication date and should match the image filenames. New articles appear **first** in the carousel (newest on the left).

### Step 1 — Pick a template article

Open the `news/` folder and copy an existing article that is closest to what you need:

- **Simple text article** (title, one header image, a few paragraphs): use e.g. `news/2025-12-05.html`
- **Article with an image gallery** at the bottom: use e.g. `news/2025-01-29.html` or `news/2024-11-30.html`
- **Article with links** in the body text: use e.g. `news/2025-01-29.html`

Duplicate the file and rename it to the new publication date, for example:

```
news/2025-12-05.html  →  news/2026-07-15.html
```

### Step 2 — Add images

Place new image files in the `images/` folder. Use this naming pattern (replace the date with yours):

| File | Purpose | Used on |
|------|---------|---------|
| `2026-07-15-header.jpg` | Large hero image at the top of the article | Article page |
| `2026-07-15-preview.jpg` | Thumbnail in the homepage carousel | `index.html` |
| `2026-07-15-inner-1.jpg`, `inner-2.jpg`, … | Optional extra photos in a gallery carousel | Article page (if needed) |

#### Image size and quality

All news images should be **JPEG** (`.jpg`). The site displays them at fixed aspect ratios.

| Image type | Aspect ratio | Export width | JPEG quality | Target file size | Displayed at |
|------------|--------------|--------------|--------------|------------------|--------------|
| **Header** (`*-header.jpg`) | 16:9 (landscape) | **1600 px** wide (height follows, e.g. 1600 × 900) | 80–85% | roughly **70–250 KB** | Full width on the article page (~1024 px) |
| **Preview** (`*-preview.jpg`) | 16:9 (landscape) | **704 px** wide (704 × 396) | 80–82% | roughly **50–80 KB** | Homepage carousel thumbnail (~352 px wide) |
| **Gallery** (`*-inner-N.jpg`) | 16:9 (landscape) | **1536 px** wide max | 85–88% | roughly **150–400 KB** each | Gallery carousel on the article page (~768 px wide) |
| **Author photo** (`firstname_lastname.jpg`) | 1:1 (square) | **240 × 240 px** | 85–90% | under **15 KB** | Small circle next to the author name (40 px) |

### Step 3 — Edit the article HTML

Open your new file in `news/` and search for text from the old article to find every place that still needs updating. You do **not** need to change the page header, navigation, or footer.

#### Title and excerpt

Find the `<header>` block inside `<article>` and update:

1. **`<h1>`** — article headline
2. **The `<p class="text-xl …">` below it** — short summary (one or two sentences)

#### Author and date

In the "Author meta" block, update:

1. **Author photo** — `src="../images/…"` and `alt="Author Name"`
2. **Author name** — the linked text next to the photo
3. **Author link** — the `href` on the photo and name (usually a KIT profile URL); use `target="_blank" rel="noopener noreferrer"` for external links
4. **Date** — the `<span class="text-gray-400">` after the author name, e.g. `July 15, 2026`

#### Category tag

In the "Article tags" block, choose **one** category and copy the matching line from the table below. Some tags link to another page; others are plain labels.

| Category | HTML to use |
|----------|-------------|
| Winter School | `<a class="news-tag news-tag--winter-school" href="/pages/winterschool.html">Winter School</a>` |
| Lecture | `<a class="news-tag news-tag--lecture" href="/pages/program.html#topic_lecture">Lecture</a>` |
| Team | `<a class="news-tag news-tag--team" href="/pages/members.html">Team</a>` |
| Content | `<span class="news-tag news-tag--content">Content</span>` |
| Think Tank | `<span class="news-tag news-tag--think-tank">Think Tank</span>` |

Use the **same tag** on the article page and in `index.html` (Step 4).

#### Header image

Find the `<figure>` block with the large image and update:

- `src="../images/YYYY-MM-DD-header.jpg"`
- `alt="…"` — short description of the image (usually the article title)

#### Body text

Inside `<div class="text-lg text-gray-400">`, replace the `<p class="mb-8">` paragraphs with your article text.

- Each paragraph is wrapped in `<p class="mb-8">…</p>`.
- For links inside a paragraph, use: `<a href="https://…" class="text-kitgreen-600 hover:text-kitgreen-700">link text</a>`
- For superscript ordinals (1st, 2nd), use `<sup>st</sup>` etc., as in existing articles.

#### Image gallery (optional)

Only if your template article has an "Image gallery" section near the bottom:

1. Keep the gallery HTML structure as-is.
2. Export each gallery photo as a 16:9 JPEG, **1536 px** wide max (see the image size table in Step 2).
3. In the `<script>` block at the bottom of the gallery, update the `items` array — one entry per photo:

```javascript
items: [
  { img: '2026-07-15-inner-1.jpg' },
  { img: '2026-07-15-inner-2.jpg' },
],
```

Add or remove `{ img: '…' }` lines to match the number of photos you uploaded. If you do not need a gallery, delete the entire `<!-- Image gallery -->` section (from that comment through its closing `</script>`).

### Step 4 — Add a carousel card to `index.html`

The homepage News carousel is in `index.html`. Search for `id="news"` or `<!-- @section:news-carousel-slides -->`.

1. Copy the entire first `<!-- article -->` block (from `<!-- article -->` through the closing `</div>` of that slide — the block ends just before the next `<!-- article -->`).
2. Paste it **immediately after** the line `<!-- @section:news-carousel-slides -->`, so the new article is first.
3. In the pasted block, update every occurrence of the old article:

| Element | What to change |
|---------|----------------|
| Links to the article | `href="./news/OLD-DATE.html"` → `href="./news/2026-07-15.html"` (appears on the image and the title) |
| Preview image | `src="./images/OLD-preview.jpg"` and `alt="…"` |
| Category tag | Same tag as on the article page (see table in Step 3) |
| Title (`<h3>`) | Article headline |
| Summary (`<p class="text-lg text-gray-400 grow">`) | Short teaser — can match the excerpt on the article page |
| Author photo | `src`, `alt`, and profile `href` |
| Author name | Linked name in the footer of the card |
| Date | `<span class="text-gray-400">` in the card footer |
