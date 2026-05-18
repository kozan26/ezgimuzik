/**
 * Tüm logoların beyaz monochrome (dark theme) versiyonlarını üretir.
 * Orijinaller korunur. Çıktı: brand-logos-all/light/{file}.svg|.png
 *
 * SVG  → tüm fill/stroke renkleri #fff, width/height kaldırılır (viewBox yeterli)
 * PNG-3 → tüm opak palette girişleri RGB(255,255,255)
 * PNG-6 → alpha > 0 olan her piksel RGB(255,255,255,alpha)
 *
 * Çalıştırma:
 *   node scripts/make-light-logos.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'brand-logos-all');
const OUT = path.join(SRC, 'light');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

// ─── CRC32 ──────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c;
    }
    return t;
})();
function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xFF];
    return ((c ^ 0xFFFFFFFF) >>> 0);
}
function writeU32BE(b, o, v) { b[o]=(v>>>24)&0xFF; b[o+1]=(v>>>16)&0xFF; b[o+2]=(v>>>8)&0xFF; b[o+3]=v&0xFF; }
function readU32BE(b, o) { return (b[o]<<24|b[o+1]<<16|b[o+2]<<8|b[o+3])>>>0; }

// ─── PNG chunk I/O ──────────────────────────────────────────────────────────
function parseChunks(buf) {
    const chunks = []; let off = 8;
    while (off + 12 <= buf.length) {
        const len = readU32BE(buf, off);
        const type = buf.slice(off+4, off+8).toString('ascii');
        const data = buf.slice(off+8, off+8+len);
        chunks.push({ type, data });
        off += 12 + len;
        if (type === 'IEND') break;
    }
    return chunks;
}
function buildPng(chunks) {
    const sig = Buffer.from([137,80,78,71,13,10,26,10]);
    const parts = [sig];
    for (const ch of chunks) {
        const tb = Buffer.from(ch.type,'ascii');
        const lb = Buffer.allocUnsafe(4); writeU32BE(lb, 0, ch.data.length);
        const cb = Buffer.allocUnsafe(4); writeU32BE(cb, 0, crc32(Buffer.concat([tb, ch.data])));
        parts.push(lb, tb, ch.data, cb);
    }
    return Buffer.concat(parts);
}

// ─── PNG-3 (Indexed) → beyaz monochrome ─────────────────────────────────────
function whitenIndexed(chunks) {
    const plteIdx = chunks.findIndex(c => c.type === 'PLTE');
    const trns = chunks.find(c => c.type === 'tRNS');
    if (plteIdx === -1) return chunks;

    const plte = Buffer.from(chunks[plteIdx].data);
    const entries = Math.floor(plte.length / 3);
    for (let i = 0; i < entries; i++) {
        const alpha = trns ? (trns.data[i] ?? 255) : 255;
        if (alpha < 20) continue; // tamamen şeffaf — dokunma
        plte[i*3] = 255; plte[i*3+1] = 255; plte[i*3+2] = 255;
    }
    chunks[plteIdx] = { ...chunks[plteIdx], data: plte };
    return chunks;
}

// ─── PNG-6 (RGBA) → beyaz monochrome ────────────────────────────────────────
function whitenRgba(chunks) {
    const ihdr = chunks.find(c => c.type === 'IHDR');
    if (!ihdr) return chunks;
    const width = readU32BE(ihdr.data, 0);
    const height = readU32BE(ihdr.data, 4);

    const compressed = Buffer.concat(chunks.filter(c => c.type === 'IDAT').map(c => c.data));
    let raw;
    try { raw = zlib.inflateSync(compressed); } catch { return chunks; }

    const rowSize = 1 + width * 4;
    for (let y = 0; y < height; y++) {
        const rs = y * rowSize + 1;
        for (let x = 0; x < width; x++) {
            const px = rs + x * 4;
            if (px + 3 >= raw.length) continue;
            if (raw[px+3] < 20) continue; // şeffaf piksel
            raw[px] = 255; raw[px+1] = 255; raw[px+2] = 255;
        }
    }

    const recomp = zlib.deflateSync(raw, { level: 9 });
    const idatIdx = chunks.findIndex(c => c.type === 'IDAT');
    const newChunks = chunks.filter(c => c.type !== 'IDAT');
    newChunks.splice(idatIdx, 0, { type: 'IDAT', data: recomp });
    return newChunks;
}

// ─── SVG → beyaz monochrome ──────────────────────────────────────────────────
// Renk eşleşmesi: hex, rgb(), named colors, currentColor
const COLOR_PATTERN = /#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|\b(?:black|navy|maroon|green|teal|olive|purple|gray|grey|darkblue|darkred|darkgreen)\b/g;

function toWhiteSvg(svgText) {
    let out = svgText;

    // CSS style bloklarındaki fill/stroke renkleri
    out = out.replace(/((?:fill|stroke)\s*:\s*)([^;}"']+)/gi, (m, prop, val) => {
        const trimmed = val.trim();
        if (/^none$/i.test(trimmed) || /^transparent$/i.test(trimmed) || /^url\(/i.test(trimmed)) return m;
        return prop + '#fff';
    });

    // Attribute fill/stroke
    out = out.replace(/((?:fill|stroke)\s*=\s*["'])([^"']+)(["'])/gi, (m, pre, val, post) => {
        if (/^none$/i.test(val) || /^transparent$/i.test(val) || /^url\(/i.test(val)) return m;
        return pre + '#fff' + post;
    });

    // stop-color
    out = out.replace(/(stop-color\s*[=:]\s*["']?)([^;"']+)/gi, (m, pre, val) => {
        if (/^none|transparent/i.test(val.trim())) return m;
        return pre + '#fff';
    });

    // viewBox yoksa width/height'tan üret, sonra kaldır
    if (!/viewBox/i.test(out)) {
        const wm = svgText.match(/\bwidth=["']([0-9.]+)/i);
        const hm = svgText.match(/\bheight=["']([0-9.]+)/i);
        if (wm && hm) {
            const vb = `viewBox="0 0 ${parseFloat(wm[1])} ${parseFloat(hm[1])}"`;
            out = out.replace(/(<svg\b)/, `$1 ${vb}`);
        }
    }
    out = out.replace(/(<svg[^>]*?)\s+width=["'][^"']*["']/i, '$1');
    out = out.replace(/(<svg[^>]*?)\s+height=["'][^"']*["']/i, '$1');

    // Kök <svg>'ye fill="#fff" ekle — attribute/CSS'siz path'ler cascade alır
    if (!/<svg[^>]+fill=/.test(out)) {
        out = out.replace(/(<svg\b)/, '$1 fill="#fff"');
    }

    return out;
}

// ─── Ana döngü ───────────────────────────────────────────────────────────────
const files = fs.readdirSync(SRC).filter(f => /\.(svg|png)$/i.test(f));
let ok = 0, skip = 0, err = 0;

console.log(`\n=== BEYAZ MONOCHROME LOGO ÜRETİCİ ===\nÇıktı: ${OUT}\n`);

for (const f of files.sort()) {
    const src = path.join(SRC, f);
    const dest = path.join(OUT, f);
    const buf = fs.readFileSync(src);
    const ext = path.extname(f).toLowerCase();

    try {
        if (ext === '.svg') {
            const text = buf.toString('utf8');
            const result = toWhiteSvg(text);
            fs.writeFileSync(dest, result, 'utf8');
            console.log(`SVG  ${f}`);
        } else if (ext === '.png') {
            if (buf[0] !== 0x89 || buf[1] !== 0x50) { skip++; console.log(`SKIP ${f}: PNG değil`); continue; }
            let chunks = parseChunks(buf);
            const colorType = chunks.find(c => c.type === 'IHDR')?.data[9];
            if (colorType === 3) chunks = whitenIndexed(chunks);
            else if (colorType === 6) chunks = whitenRgba(chunks);
            else { skip++; console.log(`SKIP ${f}: desteklenmeyen renk tipi ${colorType}`); continue; }
            fs.writeFileSync(dest, buildPng(chunks));
            console.log(`PNG  ${f}`);
        } else { skip++; continue; }
        ok++;
    } catch (e) {
        err++;
        console.log(`ERR  ${f}: ${e.message}`);
    }
}

console.log(`\nToplam: ${ok} OK, ${skip} atlandı, ${err} hata`);
console.log(`Klasör: ${OUT}`);
