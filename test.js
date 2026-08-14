const onerilen = "Klasik Kırmızı Ped";
const secili1 = "KLASİK KIRMIZI PED";
const secili2 = "Kırmızı Ped";
const secili3 = "Klasik Kırmızı Ped";

function check(secili) {
    const seciliLower = secili.toLowerCase();
    const pLower = onerilen.toLowerCase();
    
    console.log("seciliLower:", seciliLower);
    console.log("pLower:", pLower);
    console.log("Includes?", seciliLower.includes(pLower) || pLower.includes(seciliLower));
}

check(secili1);
check(secili2);
check(secili3);
