/**
 * Marquee markaları — script.js brandLogoMap ile uyumlu.
 * domain: Brandfetch / teknik kimlik
 * officialUrl: kurumsal kanon URL (logo & iletişim); yoksa resolveOfficialUrl() https://{domain}/ üretir.
 * @type {{ key: string, file: string, domain: string, officialUrl?: string, wikidataSearch?: string }[]}
 */
export const BRANDS = [
    { key: 'YAMAHA', file: 'yamaha', domain: 'yamaha.com', officialUrl: 'https://www.yamaha.com/' },
    { key: 'KAWAI', file: 'kawai', domain: 'kawai-global.com', officialUrl: 'https://www.kawai.com/' },
    { key: 'CASIO', file: 'casio', domain: 'casio.com', officialUrl: 'https://www.casio.com/' },
    { key: 'PEARL RIVER', file: 'pearl-river', domain: 'pearlriverpiano.com', officialUrl: 'https://www.pearlriverpiano.com/' },
    { key: 'IBANEZ', file: 'ibanez', domain: 'ibanez.com', officialUrl: 'https://www.ibanez.com/' },
    { key: 'MARSHALL', file: 'marshall', domain: 'marshall.com', officialUrl: 'https://www.marshall.com/' },
    { key: 'TAKAMINE', file: 'takamine', domain: 'takamine.com', officialUrl: 'https://www.takamine.com/' },
    { key: 'WASHBURN', file: 'washburn', domain: 'washburn.com', officialUrl: 'https://washburn.com/' },
    { key: 'CÓRDOBA', file: 'cordoba', domain: 'cordobaguitars.com', officialUrl: 'https://www.cordobaguitars.com/' },
    { key: 'PRS GUITARS', file: 'prs-guitars', domain: 'prsguitars.com', officialUrl: 'https://www.prsguitars.com/' },
    { key: 'SCHECTER', file: 'schecter', domain: 'schecterguitars.com', officialUrl: 'https://www.schecterguitars.com/' },
    { key: 'BLACKSTAR', file: 'blackstar', domain: 'blackstaramps.com', officialUrl: 'https://www.blackstaramps.com/' },
    { key: 'ORANGE', file: 'orange', domain: 'orangeamps.com', officialUrl: 'https://orangeamps.com/' },
    { key: 'GRETSCH', file: 'gretsch', domain: 'gretschguitars.com', officialUrl: 'https://www.gretschguitars.com/' },
    { key: 'AMPEG', file: 'ampeg', domain: 'ampeg.com', officialUrl: 'https://ampeg.com/' },
    { key: 'FISHMAN', file: 'fishman', domain: 'fishman.com', officialUrl: 'https://www.fishman.com/' },
    { key: 'ERNIE BALL', file: 'ernie-ball', domain: 'ernieball.com', officialUrl: 'https://www.ernieball.com/' },
    { key: 'DUNLOP', file: 'dunlop', domain: 'jimdunlop.com', officialUrl: 'https://www.jimdunlop.com/' },
    { key: 'ZILDJIAN', file: 'zildjian', domain: 'zildjian.com', officialUrl: 'https://zildjian.com/' },
    { key: 'TOCA PERCUSSION', file: 'toca-percussion', domain: 'tocapercussion.com', officialUrl: 'https://tocapercussion.com/' },
    { key: 'SONOR', file: 'sonor', domain: 'sonor.com', officialUrl: 'https://www.sonor.com/' },
    {
        key: 'HOHNER',
        file: 'hohner',
        domain: 'hohner.com',
        officialUrl: 'https://www.hohner.de/',
        wikidataSearch: 'Hohner musical instruments',
    },
    { key: 'SUZUKI', file: 'suzuki', domain: 'suzukimusic.com', officialUrl: 'https://www.suzukimusic.com/' },
    { key: 'GODIN', file: 'godin', domain: 'godinguitars.com', officialUrl: 'https://www.godinguitars.com/' },
    { key: 'GUILD', file: 'guild', domain: 'guildguitars.com', officialUrl: 'https://guildguitars.com/' },
    { key: 'ZOOM', file: 'zoom', domain: 'zoomcorp.com', officialUrl: 'https://www.zoomcorp.com/' },
    { key: 'DIGITECH', file: 'digitech', domain: 'digitech.com', officialUrl: 'https://www.digitech.com/' },
    { key: 'L&G', file: 'l-and-g', domain: 'lagguitars.com', officialUrl: 'https://www.lagguitars.com/' },
    { key: 'RÖSLER', file: 'rosler', domain: 'roslerpiano.com', officialUrl: 'https://www.roslerpiano.com/' },
    { key: 'R RAIMUNDO', file: 'r-raimundo', domain: 'guitarrasraimundo.com', officialUrl: 'https://guitarrasraimundo.com/' },
    { key: 'ASHTON', file: 'ashton', domain: 'ashtonmusic.com.au', officialUrl: 'https://www.ashtonmusic.com.au/' },
    { key: 'TOLEDO GUITARRAS', file: 'toledo-guitarras', domain: 'guitarrastoledo.com', officialUrl: 'https://guitarrastoledo.com/' },
    { key: 'GIBRALTAR', file: 'gibraltar', domain: 'gibraltarhardware.com', officialUrl: 'https://www.gibraltarhardware.com/' },
    { key: 'SX', file: 'sx', domain: 'sx-guitars.com', officialUrl: 'https://www.sx-guitars.com/' },
    { key: 'JP JOHN PACKER', file: 'jp-john-packer', domain: 'johnpacker.co.uk', officialUrl: 'https://www.johnpacker.co.uk/' },
    {
        key: 'STENOR',
        file: 'stenor',
        domain: 'stentor-music.com',
        officialUrl: 'https://www.stentor-music.com/',
        wikidataSearch: 'Stentor Music',
    },
];

/** @param {{ officialUrl?: string, domain: string }} b */
export function resolveOfficialUrl(b) {
    if (b.officialUrl) return b.officialUrl.replace(/\/?$/, '/');
    const host = String(b.domain).replace(/^www\./i, '');
    return `https://${host}/`;
}
