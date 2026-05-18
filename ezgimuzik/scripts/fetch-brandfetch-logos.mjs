/**
 * Brandfetch Brand API — logoları lokale kaydeder.
 * Docs: https://docs.brandfetch.com/reference/brand-api
 *
 * Öncelik: theme "light" (koyu zemin) → tema yok → en son "dark"
 * Tüm çıktılar tek klasörde: brand-logos-all/{dosya-adı}.svg|.png|.webp|.jpg
 *
 * Logo API CDN (cdn.brandfetch.io) yalnızca sitede <img src="…"> ile hotlink içindir;
 * Node ile toplu indirme politikada yasak ve yönlendirme ile HTML döner.
 *
 * .env.local (gitignore) — indirme scripti:
 *   BRANDFETCH_API_KEY=...
 *   BRANDFETCH_TLS_INSECURE=1
 *
 * Cursor MCP (.cursor/mcp.json): BRANDFETCH_API_KEY ve BRANDFETCH_CLIENT_ID
 * (Logo API / dashboard client id) sistem ortamında olmalı; ${env:...} ile okunur.
 * Uzak MCP .env.local yüklemez — Windows kullanıcı ortamı veya Cursor’u bu değişkenlerle başlatın.
 *
 * Çalıştırma:
 *   node scripts/collect-brand-logos-all.mjs   — mevcut svg/raster → brand-logos-all
 *   node scripts/fetch-brandfetch-logos.mjs   — Brand API → brand-logos-all (BRANDFETCH_API_KEY)
 *   node scripts/fetch-brandfetch-logos.mjs --audit-only
 *   node scripts/probe-brandfetch-domains.mjs — hangi domain'lerde logo var (özet)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const _jsonPath = path.join(ROOT, 'brand-logos-all', 'official-homepages.json');
const _json = JSON.parse(fs.readFileSync(_jsonPath, 'utf8'));
const BRANDS = _json.brands.map((b) => ({ key: b.key, file: b.file, domain: b.domain }));
const OUT_ALL = path.join(ROOT, 'brand-logos-all');
const API = 'https://api.brandfetch.io';

const FORMAT_PRIORITY = ['svg', 'png', 'jpeg', 'jpg', 'webp'];
const TYPE_PRIORITY = ['logo', 'symbol', 'icon'];
/** Açık arka plan (light theme): Brandfetch "dark" (koyu logolar) → temasız → "light" */
const THEME_STEPS = [
    { label: 'dark', filter: (l) => l.theme === 'dark' },
    { label: 'neutral', filter: (l) => l.theme == null },
    { label: 'light', filter: (l) => l.theme === 'light' },
    { label: 'any', filter: () => true },
];

function loadLocalEnv() {
    for (const name of ['.env.local', '.env']) {
        const p = path.join(ROOT, name);
        if (!fs.existsSync(p)) continue;
        const text = fs.readFileSync(p, 'utf8');
        for (const raw of text.split('\n')) {
            const line = raw.trim();
            if (!line || line.startsWith('#')) continue;
            const keyM = line.match(/^BRANDFETCH_API_KEY\s*=\s*(.+)$/);
            if (keyM && !process.env.BRANDFETCH_API_KEY) {
                process.env.BRANDFETCH_API_KEY = keyM[1].trim().replace(/^["']|["']$/g, '');
            }
            const tlsM = line.match(/^BRANDFETCH_TLS_INSECURE\s*=\s*(.+)$/);
            if (tlsM && process.env.BRANDFETCH_TLS_INSECURE == null) {
                process.env.BRANDFETCH_TLS_INSECURE = tlsM[1].trim();
            }
        }
    }
}

loadLocalEnv();

if (process.env.BRANDFETCH_TLS_INSECURE === '1') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const token = process.env.BRANDFETCH_API_KEY || '';
const auditOnly = process.argv.includes('--audit-only');

/** @returns {boolean} */
function looksLikeSvg(buf) {
    const head = buf.slice(0, Math.min(256, buf.length)).toString('utf8').trimStart();
    return head.startsWith('<svg') || head.startsWith('<?xml');
}

function assertValidDownload(buf, ext) {
    const head = buf.slice(0, Math.min(64, buf.length)).toString('utf8');
    if (head.trimStart().startsWith('<!DOCTYPE') || head.trimStart().toLowerCase().startsWith('<html')) {
        throw new Error('yanıt HTML — Logo CDN Node ile kullanılamaz; Brand API anahtarı kullanın');
    }
    const e = String(ext || '').toLowerCase();
    if (e === 'svg' && !looksLikeSvg(buf)) throw new Error('svg imzası yok');
    if (e === 'png' && !(buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)) {
        throw new Error('png imzası yok');
    }
    if (e === 'webp' && !(buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP')) {
        throw new Error('webp imzası yok');
    }
    if ((e === 'jpg' || e === 'jpeg') && !(buf[0] === 0xff && buf[1] === 0xd8)) {
        throw new Error('jpeg imzası yok');
    }
}

/**
 * Altkümede önce SVG’yi tüm tiplerde dene, sonra bir sonraki format (light’ta png
 * varken başka entry’de svg olmasını kaçırmamak için format dış döngüde).
 * @param {object[]} logos Brand API logos dizisi
 * @param {(l: object) => boolean} inSubset
 */
function pickBestInSubset(logos, inSubset) {
    const subset = logos.filter(inSubset);
    if (!subset.length) return null;
    for (const fmt of FORMAT_PRIORITY) {
        for (const typ of TYPE_PRIORITY) {
            const entry = subset.find((l) => l.type === typ);
            if (!entry?.formats?.length) continue;
            const f = entry.formats.find((x) => x.format === fmt && x.src);
            if (f) return { entry, format: f, type: typ, theme: entry.theme };
        }
    }
    return null;
}

function selectAsset(logos) {
    if (!logos?.length) return null;
    for (const step of THEME_STEPS) {
        const picked = pickBestInSubset(logos, step.filter);
        if (picked) return { ...picked, themeLabel: step.label };
    }
    return null;
}

async function fetchBrandJson(domain) {
    const url = `${API}/v2/brands/domain/${encodeURIComponent(domain)}`;
    const res = await fetch(url, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    const text = await res.text();
    if (!res.ok) {
        let msg = text.slice(0, 200);
        try {
            const j = JSON.parse(text);
            if (j.message) msg = j.message;
        } catch {
            /* ignore */
        }
        throw new Error(`${res.status} ${msg}`);
    }
    return JSON.parse(text);
}

async function downloadTo(srcUrl, dest, ext) {
    const res = await fetch(srcUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`download ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    assertValidDownload(buf, ext);
    fs.writeFileSync(dest, buf);
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function main() {
    if (!fs.existsSync(OUT_ALL)) fs.mkdirSync(OUT_ALL, { recursive: true });

    if (auditOnly) {
        printLocalAudit();
        return;
    }

    if (!token) {
        console.error(
            'BRANDFETCH_API_KEY gerekli (.env.local).\nLogo API CDN yalnızca tarayıcıda <img> ile kullanılır; toplu kayıt için Brand API şart.\n',
        );
        printLocalAudit();
        process.exit(1);
    }

    const summary = [];
    for (const b of BRANDS) {
        try {
            const brand = await fetchBrandJson(b.domain);
            const sel = selectAsset(brand.logos);
            if (!sel?.format?.src) {
                summary.push(`MISS|${b.key}|no asset`);
                await sleep(180);
                continue;
            }
            const fmt = sel.format.format;
            const extOut = fmt === 'jpeg' ? 'jpg' : fmt;
            const dest = path.join(OUT_ALL, `${b.file}.${extOut}`);
            await downloadTo(sel.format.src, dest, fmt === 'jpeg' ? 'jpg' : fmt);
            const size = fs.statSync(dest).size;
            summary.push(
                `OK|${b.key}|${brand.name || b.domain}|${sel.type}|theme:${sel.themeLabel}/${sel.theme ?? '—'}|${fmt}|${path.basename(dest)}|${size}b`,
            );
        } catch (e) {
            summary.push(`ERR|${b.key}|${e.message}`);
        }
        await sleep(180);
    }
    console.log(summary.join('\n'));
    printLocalAudit();
}

function printLocalAudit() {
    const missing = [];
    const rasterOnly = [];
    for (const b of BRANDS) {
        const exts = ['svg', 'png', 'webp', 'jpg'];
        let foundExt = null;
        for (const ext of exts) {
            const p = path.join(OUT_ALL, `${b.file}.${ext}`);
            if (fs.existsSync(p) && fs.statSync(p).size > 0) {
                foundExt = ext;
                break;
            }
        }
        if (!foundExt) missing.push(b.key);
        else if (foundExt !== 'svg') rasterOnly.push(b.key);
    }
    if (missing.length) console.log(`GAP|${missing.join('|')}`);
    else console.log('AUDIT|tüm markalarda brand-logos-all altında dosya var');
    if (rasterOnly.length) {
        console.log(`RASTER_ONLY|${rasterOnly.join('|')} (isteğe bağlı: svg)`);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
