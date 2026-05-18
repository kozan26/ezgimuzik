/**
 * Beyaz/açık renkli PNG logolarını light-theme için düzeltir.
 *
 * Indexed PNG (type 3): PLTE chunk'taki beyaz/açık girişleri koyu renge çevirir.
 * RGBA PNG (type 6): opak piksellerde çok açık olanları koyu renge çevirir.
 *
 * Çalıştırma:
 *   node scripts/fix-white-logos.mjs              -- sadece sorunluları düzelt
 *   node scripts/fix-white-logos.mjs --all        -- tüm PNG'leri tara
 *   node scripts/fix-white-logos.mjs --dry-run    -- değişiklik yapma, sadece raporla
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '..', 'brand-logos-all');

const DRY_RUN = process.argv.includes('--dry-run');
const ALL = process.argv.includes('--all');

// Beyaz olarak sayılacak eşik (R,G,B hepsi bu değerin üzerindeyse beyaz)
const WHITE_THRESH = 210;
// Dönüştürülen renk: dark charcoal
const DARK_R = 26, DARK_G = 26, DARK_B = 26;

// ─── CRC32 ───────────────────────────────────────────────────────────────────
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
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xFF];
    return ((crc ^ 0xFFFFFFFF) >>> 0);
}

function writeU32BE(buf, off, val) {
    buf[off] = (val >>> 24) & 0xFF;
    buf[off + 1] = (val >>> 16) & 0xFF;
    buf[off + 2] = (val >>> 8) & 0xFF;
    buf[off + 3] = val & 0xFF;
}

function readU32BE(buf, off) {
    return (buf[off] << 24 | buf[off + 1] << 16 | buf[off + 2] << 8 | buf[off + 3]) >>> 0;
}

// ─── PNG Chunk Parser ─────────────────────────────────────────────────────────
function parseChunks(buf) {
    const chunks = [];
    let off = 8;
    while (off + 12 <= buf.length) {
        const len = readU32BE(buf, off);
        const typeBytes = buf.slice(off + 4, off + 8);
        const type = typeBytes.toString('ascii');
        const data = buf.slice(off + 8, off + 8 + len);
        const crc = readU32BE(buf, off + 8 + len);
        chunks.push({ type, data, crc, offset: off });
        off += 12 + len;
        if (type === 'IEND') break;
    }
    return chunks;
}

function buildPng(chunks) {
    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const parts = [sig];
    for (const ch of chunks) {
        const typeBuf = Buffer.from(ch.type, 'ascii');
        const lenBuf = Buffer.allocUnsafe(4);
        writeU32BE(lenBuf, 0, ch.data.length);
        const forCrc = Buffer.concat([typeBuf, ch.data]);
        const crcBuf = Buffer.allocUnsafe(4);
        writeU32BE(crcBuf, 0, crc32(forCrc));
        parts.push(lenBuf, typeBuf, ch.data, crcBuf);
    }
    return Buffer.concat(parts);
}

// ─── Fix: Indexed PNG (type 3) ────────────────────────────────────────────────
function fixIndexedPng(chunks) {
    const plte = chunks.find(c => c.type === 'PLTE');
    const trns = chunks.find(c => c.type === 'tRNS');
    if (!plte) return { changed: 0 };

    const newPlte = Buffer.from(plte.data);
    const entries = Math.floor(newPlte.length / 3);
    let changed = 0;

    for (let i = 0; i < entries; i++) {
        const alpha = trns ? (trns.data[i] ?? 255) : 255;
        if (alpha < 64) continue; // şeffaf giriş, dokunma

        const r = newPlte[i * 3];
        const g = newPlte[i * 3 + 1];
        const b = newPlte[i * 3 + 2];

        if (r >= WHITE_THRESH && g >= WHITE_THRESH && b >= WHITE_THRESH) {
            newPlte[i * 3] = DARK_R;
            newPlte[i * 3 + 1] = DARK_G;
            newPlte[i * 3 + 2] = DARK_B;
            changed++;
        }
    }

    if (changed > 0) {
        const idx = chunks.findIndex(c => c.type === 'PLTE');
        chunks[idx] = { ...chunks[idx], data: newPlte };
    }
    return { changed };
}

// ─── Fix: RGBA PNG (type 6) ───────────────────────────────────────────────────
function fixRgbaPng(chunks) {
    const ihdr = chunks.find(c => c.type === 'IHDR');
    if (!ihdr) return { changed: 0 };
    const width = readU32BE(ihdr.data, 0);
    const height = readU32BE(ihdr.data, 4);

    const idatBufs = chunks.filter(c => c.type === 'IDAT').map(c => c.data);
    const compressed = Buffer.concat(idatBufs);
    let raw;
    try { raw = zlib.inflateSync(compressed); } catch { return { changed: 0, error: 'inflate failed' }; }

    const rowSize = 1 + width * 4;
    let changed = 0;

    for (let y = 0; y < height; y++) {
        const rowStart = y * rowSize + 1; // +1 for filter byte
        for (let x = 0; x < width; x++) {
            const px = rowStart + x * 4;
            if (px + 3 >= raw.length) continue;
            const a = raw[px + 3];
            if (a < 64) continue; // şeffaf piksel

            const r = raw[px], g = raw[px + 1], b = raw[px + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            if (lum > 200) {
                raw[px] = DARK_R;
                raw[px + 1] = DARK_G;
                raw[px + 2] = DARK_B;
                changed++;
            }
        }
    }

    if (changed === 0) return { changed: 0 };

    // Re-deflate (filter bytes sıfırlanmış, None filter varsayılır)
    const recompressed = zlib.deflateSync(raw, { level: 9 });

    // Eski IDAT chunk'larını tek yeni chunk ile değiştir
    const newChunks = chunks.filter(c => c.type !== 'IDAT');
    const idatIdx = chunks.findIndex(c => c.type === 'IDAT');
    newChunks.splice(idatIdx, 0, { type: 'IDAT', data: recompressed });

    // Chunks array'ini in-place güncelle
    chunks.length = 0;
    newChunks.forEach(c => chunks.push(c));
    return { changed };
}

// ─── İşlem gereken dosyalar (analiz sonucundan) ───────────────────────────────
const PROBLEM_FILES = [
    'ashton.png',
    'hohner.png',
    'takamine.png',
    'Pearl-River-Logotype-White.png',
    'l-and-g.png',
    'sonor.png',
    'toca-percussion.png',
];

async function main() {
    const targetFiles = ALL
        ? fs.readdirSync(DIR).filter(f => f.endsWith('.png'))
        : PROBLEM_FILES;

    console.log(`\n=== WHITE LOGO DÜZELTİCİ${DRY_RUN ? ' (DRY RUN)' : ''} ===\n`);

    for (const f of targetFiles) {
        const fullPath = path.join(DIR, f);
        if (!fs.existsSync(fullPath)) { console.log(`SKIP ${f}: dosya yok`); continue; }

        const buf = fs.readFileSync(fullPath);
        if (buf[0] !== 0x89 || buf[1] !== 0x50) { console.log(`SKIP ${f}: PNG değil`); continue; }

        const chunks = parseChunks(buf);
        const ihdr = chunks.find(c => c.type === 'IHDR');
        if (!ihdr) { console.log(`SKIP ${f}: IHDR yok`); continue; }

        const colorType = ihdr.data[9];

        let result;
        if (colorType === 3) {
            result = fixIndexedPng(chunks);
        } else if (colorType === 6) {
            result = fixRgbaPng(chunks);
        } else {
            console.log(`SKIP ${f}: desteklenmeyen renk tipi ${colorType}`);
            continue;
        }

        if (result.error) { console.log(`ERR  ${f}: ${result.error}`); continue; }
        if (result.changed === 0) { console.log(`OK   ${f}: zaten koyu, değişiklik gerekmedi`); continue; }

        if (!DRY_RUN) {
            const newBuf = buildPng(chunks);
            fs.writeFileSync(fullPath, newBuf);
            console.log(`FIX  ${f}: ${result.changed} beyaz giriş/piksel → #1a1a1a dönüştürüldü`);
        } else {
            console.log(`DRY  ${f}: ${result.changed} beyaz giriş/piksel dönüştürülecek`);
        }
    }

    console.log('\nTamamlandı.');
}

main().catch(console.error);
