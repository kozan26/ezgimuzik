/**
 * Resmi marka sitelerinden SVG logo çeker, light-theme için normalleştirir.
 *
 * Strateji (sırayla dener):
 *  1. SVG favicon (<link rel="icon" type="image/svg+xml">)
 *  2. Header/nav içindeki <img src="*.svg"> logo sınıflı elemanlar
 *  3. Header/nav içindeki inline <svg> (dosyaya yazar)
 *  4. Herhangi bir <img src="*.svg"> (ilk 5)
 *  5. Ortak URL tahminleri (/logo.svg, /assets/logo.svg, …)
 *
 * Light-theme normalleştirme:
 *  Ağırlıklı beyaz fill/stroke içeren SVG'leri (koyu arka plan için tasarlanmış)
 *  tespit eder ve fills'i #1a1a1a'ya çevirir.
 *
 * Çalıştırma:
 *   node scripts/fetch-official-svgs.mjs
 *   node scripts/fetch-official-svgs.mjs --overwrite   (varolan svg'lerin üstüne yaz)
 *   node scripts/fetch-official-svgs.mjs --audit       (sadece durum raporu)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const JSON_FILE = path.join(ROOT, 'brand-logos-all', 'official-homepages.json');
const OUT = path.join(ROOT, 'brand-logos-all');

const OVERWRITE = process.argv.includes('--overwrite');
const AUDIT_ONLY = process.argv.includes('--audit');

const UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const FETCH_HEADERS = {
    'User-Agent': UA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/svg+xml,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
};

const SVG_HEADERS = {
    'User-Agent': UA,
    Accept: 'image/svg+xml,*/*;q=0.8',
};

const COMMON_PATHS = [
    '/logo.svg',
    '/images/logo.svg',
    '/assets/logo.svg',
    '/img/logo.svg',
    '/static/logo.svg',
    '/assets/images/logo.svg',
    '/content/images/logo.svg',
    '/themes/default/logo.svg',
    '/media/logo.svg',
    '/resources/logo.svg',
];

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

/** SVG doğrulama */
function isSvg(buf) {
    const head = buf.slice(0, Math.min(512, buf.length)).toString('utf8').trimStart();
    return head.startsWith('<svg') || head.startsWith('<?xml') || head.includes('<svg');
}

/** Dosyanın uzantısına bak */
function existingSvgOrRaster(fileBase) {
    for (const ext of ['svg', 'png', 'webp', 'jpg', 'jpeg']) {
        const p = path.join(OUT, `${fileBase}.${ext}`);
        if (fs.existsSync(p) && fs.statSync(p).size > 200) return { ext, p };
    }
    return null;
}

/**
 * Light-theme normalleştirme:
 * SVG'de beyaz / neredeyse beyaz dolgu varsa ve karanlık dolgu yoksa
 * white → #1a1a1a dönüşümü uygular.
 */
function normalizeLightTheme(svgText) {
    const WHITE_RE =
        /(fill|stroke)=["'](?:#f{3,6}|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))["']|(?:fill|stroke):\s*(?:#f{3,6}|white|rgb\(255,\s*255,\s*255\))/gi;
    const DARK_RE =
        /(fill|stroke)=["'](?:#[0-2][0-9a-f]{5}|#[0-2][0-9a-f]{2}|black)["']|(?:fill|stroke):\s*(?:#[0-2][0-9a-f]{5}|#[0-2][0-9a-f]{2}|black)/gi;

    const whiteCount = (svgText.match(WHITE_RE) || []).length;
    const darkCount = (svgText.match(DARK_RE) || []).length;

    if (whiteCount === 0) return { svg: svgText, converted: false };
    if (darkCount >= whiteCount) return { svg: svgText, converted: false };

    // Ağırlıklı beyaz → dönüştür
    let out = svgText;
    out = out.replace(/#(?:fff|ffff|ffffff)\b/gi, '#1a1a1a');
    out = out.replace(/\bwhite\b/gi, '#1a1a1a');
    out = out.replace(/rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/gi, '#1a1a1a');
    return { svg: out, converted: true };
}

/** HTML'den SVG kaynak adaylarını çıkar, öncelik sırasıyla döndür */
function extractCandidates(html, baseUrl) {
    const results = [];

    // 1. SVG favicon
    for (const m of html.matchAll(/<link[^>]+>/gi)) {
        const tag = m[0];
        if (!/rel=["'][^"']*icon[^"']*["']/i.test(tag)) continue;
        if (!/type=["']image\/svg\+xml["']/i.test(tag)) continue;
        const hm = tag.match(/href=["']([^"']+)["']/i);
        if (hm) results.push({ raw: hm[1], priority: 10, source: 'svg-favicon' });
    }

    // 2. <img src="*.svg"> — logo sınıflı / id'li / alt'lı (header veya nav içinde)
    const LOGO_ATTR_RE =
        /(?:class|id|alt|title)=["'][^"']*(?:logo|brand|emblem|mark|header-img)[^"']*["']/i;
    for (const m of html.matchAll(/<img[^>]+>/gi)) {
        const tag = m[0];
        const srcm = tag.match(/src=["']([^"']+\.svg[^"']*?)["']/i);
        if (!srcm) continue;
        const prio = LOGO_ATTR_RE.test(tag) ? 9 : 5;
        results.push({ raw: srcm[1], priority: prio, source: 'img-svg' });
    }

    // 3. <use xlink:href> veya <use href> ile harici SVG sprite
    for (const m of html.matchAll(/<use[^>]+>/gi)) {
        const tag = m[0];
        const hm = tag.match(/(?:href|xlink:href)=["']([^"'#]+\.svg)/i);
        if (hm) results.push({ raw: hm[1], priority: 6, source: 'use-sprite' });
    }

    // URL'leri çözümle ve tekrarları kaldır
    const seen = new Set();
    return results
        .map((c) => {
            try {
                const resolved = new URL(c.raw, baseUrl).href;
                if (seen.has(resolved)) return null;
                seen.add(resolved);
                return { ...c, resolved };
            } catch {
                return null;
            }
        })
        .filter(Boolean)
        .sort((a, b) => b.priority - a.priority);
}

/**
 * HTML'deki ilk logo-benzeri inline <svg>'yi çıkarır.
 * header, nav veya "logo" sınıflı div içindekine öncelik verir.
 */
function extractInlineSvg(html) {
    // Header/nav bloğunu bul
    const CONTAINER_RE =
        /(<(?:header|nav)[^>]*>[\s\S]*?<\/(?:header|nav)>|<div[^>]*(?:class|id)=["'][^"']*logo[^"']*["'][^>]*>[\s\S]{0,4000}?<\/div>)/i;
    const containerM = html.match(CONTAINER_RE);
    const search = containerM ? containerM[1] : html;

    const svgM = search.match(/<svg[\s\S]*?<\/svg>/i);
    if (!svgM) return null;
    const candidate = svgM[0].trim();
    if (candidate.length < 50) return null;
    return candidate;
}

async function fetchHtml(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
        const res = await fetch(url, { headers: FETCH_HEADERS, signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.text();
    } finally {
        clearTimeout(timer);
    }
}

async function fetchSvgBuf(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
        const res = await fetch(url, { headers: SVG_HEADERS, signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        if (!isSvg(buf)) throw new Error('not an SVG');
        return buf;
    } finally {
        clearTimeout(timer);
    }
}

async function findSvg(brand) {
    const url = brand.primaryUrl || brand.officialUrl;

    // --- HTML çek ---
    let html;
    try {
        html = await fetchHtml(url);
    } catch (e) {
        return { ok: false, reason: `homepage fetch: ${e.message}` };
    }

    // --- Harici SVG adayları ---
    const candidates = extractCandidates(html, url);
    for (const c of candidates.slice(0, 6)) {
        try {
            const buf = await fetchSvgBuf(c.resolved);
            return { ok: true, buf, source: c.source, from: c.resolved };
        } catch {
            /* dene */
        }
        await sleep(120);
    }

    // --- Inline SVG ---
    const inline = extractInlineSvg(html);
    if (inline) {
        // Dosyaya yazmak için Buffer'a çevir
        const buf = Buffer.from(inline, 'utf8');
        return { ok: true, buf, source: 'inline-svg', from: url };
    }

    // --- Ortak yol tahminleri ---
    const origin = new URL(url).origin;
    for (const p of COMMON_PATHS) {
        try {
            const buf = await fetchSvgBuf(origin + p);
            return { ok: true, buf, source: 'common-path', from: origin + p };
        } catch {
            /* dene */
        }
        await sleep(80);
    }

    return { ok: false, reason: 'no SVG found' };
}

async function main() {
    if (!fs.existsSync(JSON_FILE)) {
        console.error(`JSON bulunamadı: ${JSON_FILE}`);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
    const brands = data.brands;

    if (AUDIT_ONLY) {
        console.log('=== AUDIT ===');
        for (const b of brands) {
            const found = existingSvgOrRaster(b.file);
            const status = found ? `${found.ext.toUpperCase()} ${Math.round(fs.statSync(found.p).size / 1024)}KB` : 'EKSİK';
            console.log(`${b.key}: ${status}`);
        }
        return;
    }

    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    const summary = [];
    let okCount = 0, missCount = 0, skipCount = 0;

    for (const brand of brands) {
        const destSvg = path.join(OUT, `${brand.file}.svg`);
        const existing = existingSvgOrRaster(brand.file);

        if (!OVERWRITE && existing?.ext === 'svg') {
            const kb = Math.round(fs.statSync(existing.p).size / 1024);
            summary.push(`SKIP  | ${brand.key.padEnd(20)} | zaten var (${kb}KB)`);
            skipCount++;
            continue;
        }

        process.stdout.write(`Çekiliyor: ${brand.key}…`);
        const result = await findSvg(brand);

        if (!result.ok) {
            process.stdout.write(` MISS (${result.reason})\n`);
            summary.push(`MISS  | ${brand.key.padEnd(20)} | ${result.reason}`);
            missCount++;
        } else {
            const svgText = result.buf.toString('utf8');
            const { svg: normalized, converted } = normalizeLightTheme(svgText);
            fs.writeFileSync(destSvg, normalized, 'utf8');
            const kb = Math.round(Buffer.byteLength(normalized, 'utf8') / 1024);
            const conv = converted ? ' [white→dark dönüştürüldü]' : '';
            process.stdout.write(` OK (${result.source}, ${kb}KB)${conv}\n`);
            summary.push(
                `OK    | ${brand.key.padEnd(20)} | ${result.source.padEnd(16)} | ${kb}KB${conv} | ${result.from}`,
            );
            okCount++;
        }

        await sleep(600);
    }

    console.log('\n' + '='.repeat(80));
    console.log(summary.join('\n'));
    console.log('='.repeat(80));
    console.log(`\nToplam: ${okCount} OK, ${missCount} MISS, ${skipCount} SKIP`);
    console.log(`SVG klasörü: ${OUT}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
