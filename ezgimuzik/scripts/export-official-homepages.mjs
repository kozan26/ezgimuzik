/**
 * Tüm markalar için resmi / kanonik ana sayfa listesi üretir.
 *
 * Çıktı: brand-logos-all/official-homepages.json
 *
 * Çalıştırma:
 *   node scripts/export-official-homepages.mjs
 *   node scripts/export-official-homepages.mjs --wikidata   (P856 doğrulama; ağ gerekir)
 *
 * .env.local:
 *   WIKIDATA_TLS_INSECURE=1   (Windows sertifika sorununda)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BRANDS, resolveOfficialUrl } from './brand-list.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_JSON = path.join(ROOT, 'brand-logos-all', 'official-homepages.json');
const WIKI = 'https://www.wikidata.org/w/api.php';

function loadLocalEnv() {
    for (const name of ['.env.local', '.env']) {
        const p = path.join(ROOT, name);
        if (!fs.existsSync(p)) continue;
        for (const raw of fs.readFileSync(p, 'utf8').split('\n')) {
            const line = raw.trim();
            if (!line || line.startsWith('#')) continue;
            const tls = line.match(/^WIKIDATA_TLS_INSECURE\s*=\s*(.+)$/);
            if (tls && process.env.WIKIDATA_TLS_INSECURE == null) {
                process.env.WIKIDATA_TLS_INSECURE = tls[1].trim();
            }
        }
    }
}

loadLocalEnv();
if (process.env.WIKIDATA_TLS_INSECURE === '1') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const useWikidata = process.argv.includes('--wikidata');

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

/** @param {string} search */
async function wikidataOfficialWebsite(search) {
    const u = new URL(WIKI);
    u.searchParams.set('action', 'wbsearchentities');
    u.searchParams.set('search', search);
    u.searchParams.set('language', 'en');
    u.searchParams.set('limit', '10');
    u.searchParams.set('format', 'json');
    u.searchParams.set('origin', '*');
    const res = await fetch(u);
    if (!res.ok) throw new Error(`wikidata search ${res.status}`);
    const data = await res.json();
    const hits = data.search || [];
    for (const hit of hits) {
        const id = hit.id;
        const u2 = new URL(WIKI);
        u2.searchParams.set('action', 'wbgetentities');
        u2.searchParams.set('ids', id);
        u2.searchParams.set('format', 'json');
        u2.searchParams.set('props', 'claims');
        u2.searchParams.set('origin', '*');
        const er = await fetch(u2);
        if (!er.ok) continue;
        const ed = await er.json();
        const claims = ed.entities?.[id]?.claims?.P856;
        if (!claims?.length) continue;
        for (const c of claims) {
            const v = c.mainsnak?.datavalue?.value;
            if (typeof v === 'string' && v.startsWith('http')) {
                return {
                    qid: id,
                    label: hit.label,
                    description: hit.description,
                    url: v.replace(/\/?$/, '/'),
                };
            }
        }
    }
    return null;
}

function normalizeHost(url) {
    try {
        const h = new URL(url).hostname.replace(/^www\./i, '');
        return h.toLowerCase();
    } catch {
        return '';
    }
}

async function main() {
    const generatedAt = new Date().toISOString();
    /** @type {object[]} */
    const rows = [];

    for (const b of BRANDS) {
        const primaryUrl = resolveOfficialUrl(b);
        const entry = {
            key: b.key,
            file: b.file,
            domain: b.domain,
            officialUrl: b.officialUrl || primaryUrl,
            primaryUrl,
        };

        if (useWikidata) {
            const q = b.wikidataSearch || b.key;
            try {
                const wd = await wikidataOfficialWebsite(q);
                if (wd) {
                    entry.wikidata = wd;
                    entry.urlsAgree =
                        normalizeHost(wd.url) === normalizeHost(entry.officialUrl) ||
                        normalizeHost(wd.url) === normalizeHost(`https://${b.domain}/`);
                } else {
                    entry.wikidata = null;
                }
            } catch (e) {
                entry.wikidataError = String(e.message || e);
            }
            await sleep(220);
        }

        rows.push(entry);
    }

    const doc = { generatedAt, useWikidata, count: rows.length, brands: rows };
    const dir = path.dirname(OUT_JSON);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(OUT_JSON, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
    console.log(`Yazıldı: ${OUT_JSON}`);
    if (!useWikidata) {
        console.log('İpucu: Wikidata ile karşılaştırmak için: node scripts/export-official-homepages.mjs --wikidata');
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
