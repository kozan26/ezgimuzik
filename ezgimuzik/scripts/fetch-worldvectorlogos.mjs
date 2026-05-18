/**
 * WorldVectorLogo — resmi API (docs: https://worldvectorlogo.com/docs/)
 * Arama veya doğrudan slug ile svg_url indirir.
 *
 * PowerShell:
 *   $env:WORLDVECTORLOGO_API_KEY = "YOUR_KEY"
 *   $env:WORLDVECTORLOGO_TLS_INSECURE = "1"
 *   node scripts/fetch-worldvectorlogos.mjs
 *
 * WORLDVECTORLOGO_LIGHT_SVG=1 (varsayılan): SVG’de koyu dolguları açık tona çevir (koyu zemin).
 * WORLDVECTORLOGO_SKIP_WIKIDATA=1: Resmi site araştırmasını atla (sadece WVL).
 *
 * API anahtarını repoya yazmayın; .env.local gitignore içinde kullanılabilir:
 *   WORLDVECTORLOGO_API_KEY=...
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'brand-logos-svg');
const OFFICIAL_URLS_JSON = path.join(OUT, 'official-homepages.json');
const API = 'https://worldvectorlogo.com/api/v1';
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';

const lightSvgDefault = process.env.WORLDVECTORLOGO_LIGHT_SVG !== '0';
const skipWikidata = process.env.WORLDVECTORLOGO_SKIP_WIKIDATA === '1';

function loadLocalEnv() {
    for (const name of ['.env.local', '.env']) {
        const p = path.join(ROOT, name);
        if (!fs.existsSync(p)) continue;
        const text = fs.readFileSync(p, 'utf8');
        for (const raw of text.split('\n')) {
            const line = raw.trim();
            if (!line || line.startsWith('#')) continue;
            const keyM = line.match(/^WORLDVECTORLOGO_API_KEY\s*=\s*(.+)$/);
            if (keyM && !process.env.WORLDVECTORLOGO_API_KEY) {
                process.env.WORLDVECTORLOGO_API_KEY = keyM[1].trim().replace(/^["']|["']$/g, '');
            }
            const tlsM = line.match(/^WORLDVECTORLOGO_TLS_INSECURE\s*=\s*(.+)$/);
            if (tlsM && process.env.WORLDVECTORLOGO_TLS_INSECURE == null) {
                process.env.WORLDVECTORLOGO_TLS_INSECURE = tlsM[1].trim();
            }
        }
    }
}

loadLocalEnv();

if (process.env.WORLDVECTORLOGO_TLS_INSECURE === '1') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const apiKey = process.env.WORLDVECTORLOGO_API_KEY || '';

function apiHeaders() {
    const h = { Accept: 'application/json' };
    if (apiKey) h.Authorization = `Bearer ${apiKey}`;
    return h;
}

/**
 * @typedef {object} BrandSpec
 * @property {string} key
 * @property {string} file
 * @property {string[]} [queries] Tek kelimeli arama tercih (API boşluklu sorguda sık sık 0 sonuç veriyor)
 * @property {string} [slug] GET /logos/{slug} ile doğrudan çek
 * @property {string[]} [preferTags]
 * @property {string[]} [avoidTags]
 * @property {RegExp[]} [avoidSlug]
 * @property {string} [preferExactSlug] Örn. zoom → "zoom" (Zoom Video değil)
 * @property {boolean} [skipFetch] Doğru logo yok veya yanlış eşleşme: atla (site PNG kullanır)
 * @property {string} [wikidataSearch] Wikidata varlık araması (mizanpaj / lastik / eyalet karışmasın diye)
 * @property {string} [officialHomepage] Wikidata kapalıysa resmi site (manuel yedek)
 */

/** script.js .brand-name ile uyumlu */
/** @type {BrandSpec[]} */
const BRANDS = [
    { key: 'YAMAHA', file: 'yamaha', wikidataSearch: 'Yamaha Corporation', officialHomepage: 'https://www.yamaha.com/', queries: ['Yamaha'], preferTags: ['music', 'instruments'], avoidTags: ['motors', 'motorcycle'], avoidSlug: [/motor/i, /team/i] },
    { key: 'KAWAI', file: 'kawai', wikidataSearch: 'Kawai Musical Instruments', officialHomepage: 'https://kawai.com/', queries: ['Kawai'], avoidSlug: [/kawaijuku/i] },
    { key: 'CASIO', file: 'casio', wikidataSearch: 'Casio', officialHomepage: 'https://www.casio.com/', queries: ['Casio'] },
    {
        key: 'PEARL RIVER',
        file: 'pearl-river',
        wikidataSearch: 'Pearl River Piano Group',
        officialHomepage: 'https://www.pearlriverpiano.com/',
        skipFetch: true,
    },
    { key: 'IBANEZ', file: 'ibanez', wikidataSearch: 'Ibanez', officialHomepage: 'https://www.ibanez.com/', queries: ['Ibanez'] },
    { key: 'MARSHALL', file: 'marshall', wikidataSearch: 'Marshall Amplification', officialHomepage: 'https://www.marshall.com/', queries: ['Marshall'], avoidSlug: [/university/i] },
    { key: 'TAKAMINE', file: 'takamine', wikidataSearch: 'Takamine', officialHomepage: 'https://www.takamine.com/', queries: ['Takamine'] },
    { key: 'WASHBURN', file: 'washburn', wikidataSearch: 'Washburn Guitars', officialHomepage: 'https://washburn.com/', queries: ['Washburn'] },
    { key: 'CÓRDOBA', file: 'cordoba', wikidataSearch: 'Cordoba Guitars', officialHomepage: 'https://www.cordobaguitars.com/', slug: 'cordoba', queries: ['CordobaGuitars', 'Cordoba'], avoidSlug: [/gobierno/i, /government/i, /university/i] },
    { key: 'PRS GUITARS', file: 'prs-guitars', wikidataSearch: 'PRS Guitars', officialHomepage: 'https://www.prsguitars.com/', queries: ['PRS'], avoidSlug: [/seattle/i] },
    { key: 'SCHECTER', file: 'schecter', wikidataSearch: 'Schecter Guitar Research', officialHomepage: 'https://www.schecterguitars.com/', queries: ['Schecter'] },
    { key: 'BLACKSTAR', file: 'blackstar', wikidataSearch: 'Blackstar Amplification', officialHomepage: 'https://www.blackstaramps.com/', queries: ['Blackstar'] },
    { key: 'ORANGE', file: 'orange', wikidataSearch: 'Orange Music Electronic Company', officialHomepage: 'https://orangeamps.com/', slug: 'orange-2' },
    { key: 'GRETSCH', file: 'gretsch', wikidataSearch: 'Gretsch', officialHomepage: 'https://www.gretschguitars.com/', queries: ['Gretsch'] },
    { key: 'AMPEG', file: 'ampeg', wikidataSearch: 'Ampeg', officialHomepage: 'https://ampeg.com/', queries: ['Ampeg'] },
    { key: 'FISHMAN', file: 'fishman', wikidataSearch: 'Fishman Transducers', officialHomepage: 'https://www.fishman.com/', queries: ['Fishman'] },
    { key: 'ERNIE BALL', file: 'ernie-ball', wikidataSearch: 'Ernie Ball', officialHomepage: 'https://www.ernieball.com/', slug: 'ernie-ball', queries: ['ErnieBall'], avoidSlug: [/entertainment/i, /vernier/i] },
    {
        key: 'DUNLOP',
        file: 'dunlop',
        wikidataSearch: 'Jim Dunlop Company',
        officialHomepage: 'https://www.jimdunlop.com/',
        queries: ['JimDunlop', 'DunlopManufacturing', 'Dunlop'],
        avoidSlug: [/sport/i, /tire/i, /golf/i, /badminton/i],
    },
    { key: 'ZILDJIAN', file: 'zildjian', queries: ['Zildjian'] },
    { key: 'TOCA PERCUSSION', file: 'toca-percussion', slug: 'toca-percussion', queries: ['TocaPercussion'], avoidSlug: [/autocad/i, /bell/i] },
    { key: 'SONOR', file: 'sonor', slug: 'sonor', queries: ['Sonor'] },
    { key: 'HOHNER', file: 'hohner', queries: ['Hohner'] },
    {
        key: 'SUZUKI',
        file: 'suzuki',
        skipFetch: true,
    },
    { key: 'GODIN', file: 'godin', queries: ['Godin'] },
    { key: 'GUILD', file: 'guild', queries: ['Guild'], avoidSlug: [/wars/i, /gaming/i] },
    {
        key: 'ZOOM',
        file: 'zoom',
        queries: ['Zoom'],
        avoidSlug: [/communications/i, /zoom-app/i, /zoominfo/i, /air-zoom/i, /zoom-media/i, /zoom-ed/i, /nzoom/i, /flazoom/i],
        preferExactSlug: 'zoom',
    },
    { key: 'DIGITECH', file: 'digitech', queries: ['Digitech'] },
];

function scoreLogo(logo, brand) {
    let s = 0;
    const tags = (logo.tags || []).map((t) => String(t).toLowerCase());
    const name = String(logo.name || '').toLowerCase();
    const slug = String(logo.slug || '').toLowerCase();

    if (brand.preferExactSlug && slug === brand.preferExactSlug.toLowerCase()) s += 12;

    for (const t of brand.preferTags || []) {
        const tl = t.toLowerCase();
        if (tags.some((tag) => tag.includes(tl)) || name.includes(tl)) s += 4;
    }
    for (const t of brand.avoidTags || []) {
        const tl = t.toLowerCase();
        if (tags.some((tag) => tag.includes(tl))) s -= 6;
    }
    for (const rx of brand.avoidSlug || []) {
        if (rx.test(slug) || rx.test(name)) s -= 10;
    }
    s += Math.log1p(Number(logo.downloads) || 0) * 0.002;
    return s;
}

function pickBest(data, brand) {
    if (!data?.length) return null;
    let best = data[0];
    let bestScore = scoreLogo(best, brand);
    for (let i = 1; i < data.length; i++) {
        const sc = scoreLogo(data[i], brand);
        if (sc > bestScore) {
            best = data[i];
            bestScore = sc;
        }
    }
    return best;
}

async function getBySlug(slug) {
    const url = `${API}/logos/${encodeURIComponent(slug)}`;
    const res = await fetch(url, { headers: apiHeaders() });
    const text = await res.text();
    if (!res.ok) return null;
    const json = JSON.parse(text);
    return json.data || null;
}

async function searchFirst(q) {
    const url = new URL(`${API}/logos/search`);
    url.searchParams.set('q', q);
    url.searchParams.set('per_page', '16');
    const res = await fetch(url, { headers: apiHeaders() });
    const text = await res.text();
    if (!res.ok) throw new Error(`search ${res.status}: ${text.slice(0, 240)}`);
    return JSON.parse(text);
}

async function downloadSvg(svgUrl, dest) {
    const res = await fetch(svgUrl, {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    });
    if (!res.ok) throw new Error(`svg download ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function resolveLogo(brand) {
    if (brand.skipFetch) return { picked: null, via: 'skipFetch' };
    if (brand.slug) {
        const direct = await getBySlug(brand.slug);
        if (direct?.svg_url) return { picked: direct, via: `slug:${brand.slug}` };
    }
    const queries = brand.queries || [];
    for (const q of queries) {
        const json = await searchFirst(q);
        const picked = pickBest(json.data, brand);
        if (picked?.svg_url) return { picked, via: `q:${q}` };
    }
    return { picked: null, via: '' };
}

async function main() {
    if (!apiKey) {
        console.warn('Uyarı: WORLDVECTORLOGO_API_KEY yok. Günlük anonim kota ~10 istek.\n');
    }
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    const summary = [];
    for (const brand of BRANDS) {
        try {
            const { picked, via } = await resolveLogo(brand);
            if (via === 'skipFetch') {
                summary.push(`SKIP|${brand.key}`);
                continue;
            }
            if (!picked?.svg_url) {
                summary.push(`MISS|${brand.key}`);
                continue;
            }
            const dest = path.join(OUT, `${brand.file}.svg`);
            await downloadSvg(picked.svg_url, dest);
            const size = fs.statSync(dest).size;
            summary.push(`OK|${brand.key}|${picked.slug}|${via}|${size}b`);
        } catch (e) {
            summary.push(`ERR|${brand.key}|${e.message}`);
        }
        await sleep(150);
    }
    console.log(summary.join('\n'));
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
