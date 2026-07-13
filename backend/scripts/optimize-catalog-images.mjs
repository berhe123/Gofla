/**
 * Compress catalog images for web deploy (keeps filenames so product slugs stay in sync).
 * Run from backend/: npm run catalog:optimize
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'uploads', 'products');
const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 82;

async function optimizeFile(filePath) {
  const before = fs.statSync(filePath).size;
  const ext = path.extname(filePath).toLowerCase();
  const tmp = `${filePath}.opt`;

  const pipeline = sharp(filePath).rotate().resize({
    width: MAX_WIDTH,
    height: MAX_WIDTH,
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (ext === '.png') {
    await pipeline.png({ quality: 80, compressionLevel: 9 }).toFile(tmp);
  } else if (ext === '.webp') {
    await pipeline.webp({ quality: JPEG_QUALITY }).toFile(tmp);
  } else {
    await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(tmp);
  }

  const after = fs.statSync(tmp).size;
  if (after < before) {
    fs.renameSync(tmp, ext === '.jpg' || ext === '.jpeg' ? filePath.replace(/\.(jpe?g)$/i, '.jpg') : filePath);
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    return { before, after, saved: true };
  }

  fs.unlinkSync(tmp);
  return { before, after: before, saved: false };
}

async function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let totalBefore = 0;
  let totalAfter = 0;
  let count = 0;

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await walk(full);
      totalBefore += sub.before;
      totalAfter += sub.after;
      count += sub.count;
      continue;
    }

    if (!IMG_EXT.has(path.extname(entry.name).toLowerCase())) continue;

    const result = await optimizeFile(full);
    totalBefore += result.before;
    totalAfter += result.saved ? result.after : result.before;
    count++;
    const pct = result.saved ? Math.round((1 - result.after / result.before) * 100) : 0;
    console.log(
      `  ${path.relative(ROOT, full)} — ${(result.before / 1024).toFixed(0)}KB → ${(result.after / 1024).toFixed(0)}KB${result.saved ? ` (-${pct}%)` : ' (kept)'}`,
    );
  }

  return { before: totalBefore, after: totalAfter, count };
}

if (!fs.existsSync(ROOT)) {
  console.error(`No catalog images at ${ROOT}`);
  process.exit(1);
}

console.log(`Optimizing images in ${ROOT}...`);
const summary = await walk(ROOT);
console.log(
  `\nDone: ${summary.count} files, ${(summary.before / 1024 / 1024).toFixed(1)}MB → ${(summary.after / 1024 / 1024).toFixed(1)}MB`,
);
