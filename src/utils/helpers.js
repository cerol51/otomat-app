/**
 * Ortak metin normalizasyon ve kontrol fonksiyonları.
 * Kod tekrarını önlemek ve bakımı kolaylaştırmak için kullanılır.
 */

export const normalizeString = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/ı/g, 'i');
};

export const isTwisterPad = (padName) => {
    const normalized = normalizeString(padName);
    return normalized.includes('twister') || 
           normalized.includes('melamin') || 
           normalized.includes('mikrofiber');
};

export const isMelaminePad = (padName) => {
    return normalizeString(padName).includes('melamin');
};

export const isMicrofiberPad = (padName) => {
    return normalizeString(padName).includes('mikrofiber');
};

export const hasHeavyDirt = (kirYogunlugu) => {
    const kirLower = normalizeString(kirYogunlugu);
    return kirLower.includes('çok ağır') || 
           kirLower.includes('cok agir') || 
           kirLower.includes('çok yoğun') || 
           kirLower.includes('cok yogun') ||
           kirLower.includes('restorasyon');
};

export const hasMediumDirt = (kirYogunlugu) => {
    const kirLower = normalizeString(kirYogunlugu);
    // Eğer çok ağır değilse ve sadece ağır/yoğun ise
    if (hasHeavyDirt(kirYogunlugu)) return false;
    return kirLower.includes('ağır') || 
           kirLower.includes('agir') || 
           kirLower.includes('yoğun') || 
           kirLower.includes('yogun');
};

export const hasLightDirt = (kirYogunlugu) => {
    const kirLower = normalizeString(kirYogunlugu);
    return kirLower.includes('hafif');
};

export const isConcreteOrAsphalt = (zemin) => {
    const zeminLower = normalizeString(zemin);
    return zeminLower.includes('beton') || zeminLower.includes('asfalt');
};

export const isNaturalStone = (zemin) => {
    const zeminLower = normalizeString(zemin);
    return zeminLower.includes('mermer') || 
           zeminLower.includes('doğal taş') || 
           zeminLower.includes('dogal tas') || 
           zeminLower.includes('granit');
};

export const isPvcOrVinyl = (zemin) => {
    const zeminLower = normalizeString(zemin);
    return zeminLower.includes('pvc') || 
           zeminLower.includes('linolyum') || 
           zeminLower.includes('linoleum') || 
           zeminLower.includes('vinil') || 
           zeminLower.includes('epoksi');
};

export const isCeramic = (zemin) => {
    const zeminLower = normalizeString(zemin);
    return zeminLower.includes('seramik') || 
           zeminLower.includes('fayans') || 
           zeminLower.includes('porselen');
};

export const isSafetyFloor = (zemin) => {
    const zeminLower = normalizeString(zemin);
    return zeminLower.includes('kaymaz') || 
           zeminLower.includes('tırtıklı') ||
           zeminLower.includes('tirtikli') ||
           zeminLower.includes('safety');
};

export const getIncompatibilityReason = (padName, zemin, kirYogunlugu) => {
    const padLower = normalizeString(padName);
    const zeminLower = normalizeString(zemin);
    
    // Güvenlik/Kaymaz zeminler
    if (isSafetyFloor(zemin)) {
        if (padLower.includes('siyah') || padLower.includes('kahverengi')) {
            return "Sert pedler kaymaz/tırtıklı zeminlerin dokusuna zarar verir ve zemin özelliğini kaybettirir.";
        }
        if (padLower.includes('beyaz') || padLower.includes('kırmızı') || padLower.includes('kirmizi')) {
            return "Yumuşak pedler tırtıklı zeminlerde anında parçalanır ve temizlik sağlayamaz.";
        }
    }
    
    // Doğal taş, mermer, seramik
    if (isNaturalStone(zemin) || isCeramic(zemin)) {
        if (padLower.includes('siyah') || padLower.includes('kahverengi')) {
            return "Sert/aşındırıcı pedler mermer, granit veya seramik gibi parlak yüzeyleri çizer ve matlaştırır.";
        }
        if (padLower.includes('tynex')) {
            return "Tynex fırça hassas parlak yüzeyler için çok serttir, ciddi çizilmelere yol açabilir.";
        }
    }
    
    // PVC / Epoksi / Vinil
    if (isPvcOrVinyl(zemin)) {
        if (padLower.includes('siyah') || padLower.includes('tynex')) {
            return "Çok sert pedler ve fırçalar epoksi veya PVC kaplamaları çizer, kaplama ömrünü kısaltır.";
        }
    }
    
    // Kir yoğunluğu uyumsuzlukları
    if (hasHeavyDirt(kirYogunlugu) && !padLower.includes('twister')) {
        if (padLower.includes('beyaz') || padLower.includes('kırmızı') || padLower.includes('kirmizi')) {
            return "Ağır/çok yoğun kirlerde beyaz veya kırmızı gibi yumuşak pedler kiri sökemez, sadece yüzeye yayar.";
        }
        if (padLower.includes('mikrofiber')) {
            return "Mikrofiber pedler ağır kirlerde anında tıkanır ve işlevini yitirir.";
        }
    }
    
    if (hasLightDirt(kirYogunlugu)) {
        if (padLower.includes('siyah') || padLower.includes('kahverengi') || padLower.includes('tynex')) {
            return "Hafif kirler için çok sert ve aşındırıcı bir seçim. Zemin gereksiz yere yıpranır.";
        }
    }
    
    // Genel
    if (padLower.includes('melamin')) {
        return "Melamin pedler çok çabuk erir ve ağır kirli, pürüzlü alanlarda kullanılması uygun değildir.";
    }

    return "Seçilen pedin yapısı bu zemin dokusuna veya kir yoğunluğuna uygun değildir.";
};
