const normalizeString = (str) => {
    return (str || '')
        .replace(/İ/g, 'i')
        .replace(/I/g, 'i') // I to i as well
        .toLowerCase()
        .replace(/ç/g, 'c')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ı/g, 'i');
};

const onerilen = "Klasik Kırmızı Ped";
const secili1 = "KLASİK KIRMIZI PED";
const secili2 = "Kırmızı Ped";
const secili3 = "Klasik Kirmizi Ped";

function check(secili) {
    const seciliLower = normalizeString(secili);
    const pLower = normalizeString(onerilen);
    
    console.log("seciliLower:", seciliLower);
    console.log("pLower:", pLower);
    console.log("Includes?", seciliLower.includes(pLower) || pLower.includes(seciliLower));
}

check(secili1);
check(secili2);
check(secili3);
