const normalizeString = (str) => {
    return (str || '')
        .replace(/İ/g, 'i')
        .replace(/I/g, 'i')
        .toLowerCase()
        .replace(/ç/g, 'c')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ı/g, 'i');
};

const seciliPedAdi = "Kırmızı Ped (Hafif Kir)";
const seciliPedAdi2 = "Kırmızı Ped";
const p1 = "Klasik Kırmızı Ped";
const p2 = "Kırmızı";

console.log("Normalized 1:", normalizeString(seciliPedAdi));
console.log("Normalized 2:", normalizeString(seciliPedAdi2));
console.log("Normalized p1:", normalizeString(p1));

const seciliLower = normalizeString(seciliPedAdi);
const pLower = normalizeString(p1);
console.log(seciliLower.includes(pLower) || pLower.includes(seciliLower));
