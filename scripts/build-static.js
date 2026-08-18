/**
 * Static export for REG.RU (or any plain shared hosting without Node.js).
 *
 * The real site is the static bundle in `public/site/` (HTML/CSS/JS + images).
 * On Vercel it's served through a rewrite that maps "/" -> "/site/index.html",
 * so its asset paths are written as "/site/...". Plain shared hosting has no
 * such rewrite: the uploaded folder IS the document root. So this script
 * copies public/site/* into dist-reghru/ and strips the "/site/" prefix from
 * asset references in index.html, producing a fully self-contained,
 * upload-as-is static folder.
 *
 * It does not touch anything under src/ or the Vercel/Nitro build — both
 * deployment targets keep working independently from the same source files.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "public", "site");
const OUT = path.join(ROOT, "dist-reghru");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error("public/site not found — nothing to export");
    process.exit(1);
  }

  fs.rmSync(OUT, { recursive: true, force: true });
  copyDir(SRC, OUT);

  // index.html on Vercel uses root-absolute "/site/..." paths because the
  // real document root there is the TanStack app, not this folder. Here this
  // folder itself becomes the document root, so strip the "/site" segment.
  const indexPath = path.join(OUT, "index.html");
  let html = fs.readFileSync(indexPath, "utf8");
  const before = html;
  html = html.split('"/site/').join('"/');
  fs.writeFileSync(indexPath, html, "utf8");

  // Root-level files referenced as absolute paths ("/favicon.png", "/robots.txt").
  const faviconSrc = path.join(ROOT, "public", "favicon.png");
  if (fs.existsSync(faviconSrc)) fs.copyFileSync(faviconSrc, path.join(OUT, "favicon.png"));

  const robotsSrc = path.join(ROOT, "public", "robots.txt");
  if (fs.existsSync(robotsSrc)) fs.copyFileSync(robotsSrc, path.join(OUT, "robots.txt"));

  // Minimal static sitemap (the server-generated /sitemap.xml route has no
  // equivalent on plain static hosting).
  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    "  <url>\n" +
    "    <loc>https://dagrov.ru/</loc>\n" +
    "    <changefreq>weekly</changefreq>\n" +
    "    <priority>1.0</priority>\n" +
    "  </url>\n" +
    "</urlset>\n";
  fs.writeFileSync(path.join(OUT, "sitemap.xml"), sitemap, "utf8");

  const changed = before !== html;
  console.log(`Static export ready: ${path.relative(ROOT, OUT)}/`);
  console.log(`  index.html asset paths rewritten: ${changed ? "yes" : "no changes needed"}`);
  console.log("  contents:", fs.readdirSync(OUT).join(", "));
}

main();
