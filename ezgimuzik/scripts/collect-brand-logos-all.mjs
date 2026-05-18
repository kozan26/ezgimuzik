/**
 * Mevcut brand-logos-svg + brand-logos dosyalarını tek klasörde birleştirir:
 *   brand-logos-all/{file}.svg|.png|.webp|.jpg
 *
 * Çalıştırma: node scripts/collect-brand-logos-all.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BRANDS } from './brand-list.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'brand-logos-all');
const SVG_DIR = path.join(ROOT, 'brand-logos-svg');
const RASTER_DIR = path.join(ROOT, 'brand-logos');

function domainSlug(domain) {
    return domain.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}

function copyIfExists(src, dest) {
    if (!fs.existsSync(src) || !fs.statSync(src).size) return false;
    fs.copyFileSync(src, dest);
    return true;
}

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const lines = [];
for (const b of BRANDS) {
    const destSvg = path.join(OUT, `${b.file}.svg`);
    if (copyIfExists(path.join(SVG_DIR, `${b.file}.svg`), destSvg)) {
        lines.push(`OK|${b.key}|svg`);
        continue;
    }
    const slug = domainSlug(b.domain);
    let ok = false;
    for (const ext of ['png', 'webp', 'jpg']) {
        const src = path.join(RASTER_DIR, `${slug}.${ext}`);
        const dest = path.join(OUT, `${b.file}.${ext}`);
        if (copyIfExists(src, dest)) {
            lines.push(`OK|${b.key}|${ext}|raster`);
            ok = true;
            break;
        }
    }
    if (!ok) lines.push(`MISS|${b.key}`);
}

console.log(lines.join('\n'));
console.log(`\n→ ${OUT}`);
