/**
 * BRANDFETCH_API_KEY ile her markanın domain'ini Brand API'de sorgular.
 * Çekilebilir = 200 + logos dizisinde indirilebilir asset (script seçim kurallarına uygun).
 *
 *   node scripts/probe-brandfetch-domains.mjs
 *   node scripts/probe-brandfetch-domains.mjs --json > probe.json
 *
 * .env.local: BRANDFETCH_API_KEY, isteğe bağlı BRANDFETCH_TLS_INSECURE=1
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BRANDS } from './brand-list.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const API = 'https://api.brandfetch.io';

const FORMAT_PRIORITY = ['svg', 'png', 'jpeg', 'jpg', 'webp'];
const TYPE_PRIORITY = ['logo', 'symbol', 'icon'];
const THEME_STEPS = [
    { filter: (l) => l.theme === 'light' },
    { filter: (l) => l.theme == null },
    { filter: (l) => l.theme === 'dark' },
    { filter: () => true },
];

function loadLocalEnv() {
    for (const name of ['.env.local', '.env']) {
        const p = path.join(ROOT, name);
        if (!fs.existsSync(p)) continue;
        for (const raw of fs.readFileSync(p, 'utf8').split('\n')) {
            const line = raw.trim();
            if (!line || line.startsWith('#')) continue;
            const keyM = line.match(/^BRANDFETCH_API_KEY\s*=\s*(.+)$/);
            if (keyM && !process.env.BRANDFETCH_API_KEY) {
                process.env.BRANDFETCH_API_KEY = keyM[1].trim().replace(/^["']|['"]$/g, '');
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
const asJson = process.argv.includes('--json');

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
        if (picked) return picked;
    }
    return null;
}

async function fetchBrandJson(domain) {
    const url = `${API}/v2/brands/domain/${encodeURIComponent(domain)}`;
    const res = await fetch(url, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    if (!res.ok) {
        let msg = text.slice(0, 160);
        try {
            const j = JSON.parse(text);
            if (j.message) msg = j.message;
        } catch {
            /* ignore */
        }
        const err = new Error(msg);
        err.status = res.status;
        throw err;
    }
    return JSON.parse(text);
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function main() {
    if (!token) {
        console.error(
            'BRANDFETCH_API_KEY yok (.env.local). Brandfetch’te hangi domain’lerin olduğu ancak API ile görülebilir.',
        );
        process.exit(1);
    }

    /** @type {object[]} */
    const rows = [];
    const lines = ['key\tdomain\tstatus\tlogoAssets\tfetchable\tnote'];

    for (const b of BRANDS) {
        const row = { key: b.key, domain: b.domain, status: 0, logoCount: 0, fetchable: false, note: '' };
        try {
            const brand = await fetchBrandJson(b.domain);
            row.status = 200;
            row.brandName = brand.name || '';
            const logos = brand.logos || [];
            row.logoCount = logos.length;
            const sel = selectAsset(logos);
            row.fetchable = !!(sel?.format?.src);
            if (!row.fetchable) row.note = logos.length ? 'no matching format/theme' : 'empty logos';
        } catch (e) {
            row.status = e.status || 'err';
            row.note = String(e.message || e).replace(/\s+/g, ' ').slice(0, 120);
        }
        rows.push(row);
        lines.push(
            `${b.key}\t${b.domain}\t${row.status}\t${row.logoCount}\t${row.fetchable ? 'yes' : 'no'}\t${row.note}`,
        );
        await sleep(150);
    }

    if (asJson) {
        console.log(JSON.stringify({ probedAt: new Date().toISOString(), brands: rows }, null, 2));
        return;
    }

    console.log(lines.join('\n'));
    const ok = rows.filter((r) => r.fetchable).map((r) => r.key);
    const bad = rows.filter((r) => !r.fetchable).map((r) => r.key);
    console.log(`\n---\nFETCHABLE (${ok.length}): ${ok.join(', ') || '(yok)'}`);
    console.log(`NOT_FETCHABLE (${bad.length}): ${bad.join(', ') || '(yok)'}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
