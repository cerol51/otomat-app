/**
 * Ortak metin normalizasyon ve kontrol fonksiyonları.
 * Kod tekrarını önlemek ve bakımı kolaylaştırmak için kullanılır.
 */

export const normalizeString = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
};

export const isTwisterPad = (padName) => {
    const normalized = normalizeString(padName);
    return normalized.includes('twister') || normalized.includes('elmas');
};

export const isMelaminePad = (padName) => {
    return normalizeString(padName).includes('melamin');
};

export const isMicrofiberPad = (padName) => {
    return normalizeString(padName).includes('mikrofiber');
};

export const isTynexBrush = (padName) => {
    const normalized = normalizeString(padName);
    return normalized.includes('tynex') || normalized.includes('karpit') || normalized.includes('karbur') || normalized.includes('asindirici firca');
};

export const isCylinderBrush = (padName) => {
    const normalized = normalizeString(padName);
    return normalized.includes('rulo') || normalized.includes('silindirik');
};

export const isBrush = (padName) => {
    const normalized = normalizeString(padName);
    return normalized.includes('firca') || isTynexBrush(padName) || isCylinderBrush(padName) || normalized.includes('polipropilen');
};

export const isStrippingPad = (padName) => {
    const normalized = normalizeString(padName);
    return normalized.includes('siyah') || normalized.includes('kahverengi');
};

/**
 * Makinenin fırça kafası tipini ('Silindirik' veya 'Disk') tespit eder.
 */
export const getMachineHeadType = (makine) => {
    if (!makine) return 'Disk';
    const explicitType = normalizeString(makine.fircaTipi || '');
    if (explicitType.includes('silindir') || explicitType.includes('rulo')) {
        return 'Silindirik';
    }
    if (explicitType.includes('disk')) {
        return 'Disk';
    }
    const modelNorm = normalizeString(makine.model || '');
    const ebatNorm = normalizeString(makine.fircaPedEbatlari || makine.ebat || '');
    if (
        modelNorm.includes('swingo 150') ||
        modelNorm.includes('swingo 350') ||
        modelNorm.includes('/ r ') ||
        modelNorm.endsWith('/ r') ||
        modelNorm.startsWith('br ') ||
        ebatNorm.includes('rulo') ||
        ebatNorm.includes('silindir')
    ) {
        return 'Silindirik';
    }
    return 'Disk';
};

export const hasHeavyDirt = (kirYogunlugu) => {
    const kirLower = normalizeString(kirYogunlugu);
    return kirLower.includes('cok agir') || 
           kirLower.includes('cok yogun') ||
           kirLower.includes('restorasyon');
};

export const hasMediumDirt = (kirYogunlugu) => {
    const kirLower = normalizeString(kirYogunlugu);
    if (hasHeavyDirt(kirYogunlugu)) return false;
    return kirLower.includes('agir') || 
           kirLower.includes('yogun');
};

export const hasLightDirt = (kirYogunlugu) => {
    const kirLower = normalizeString(kirYogunlugu);
    return kirLower.includes('hafif');
};

export const isConcreteOrAsphalt = (zemin) => {
    const zeminLower = normalizeString(zemin);
    return zeminLower.includes('beton') || zeminLower.includes('asfalt') || zeminLower.includes('sap');
};

export const isEpoxyFloor = (zemin) => {
    const zeminLower = normalizeString(zemin);
    return zeminLower.includes('epoksi') || zeminLower.includes('poliuretan');
};

export const isNaturalStone = (zemin) => {
    const zeminLower = normalizeString(zemin);
    return zeminLower.includes('mermer') || 
           zeminLower.includes('dogal tas') || 
           zeminLower.includes('traverten') ||
           zeminLower.includes('terrazzo') ||
           zeminLower.includes('mozaik') ||
           zeminLower.includes('granit');
};

export const isAcidSensitiveFloor = (zemin) => {
    const zeminLower = normalizeString(zemin);
    // Granit aside dayanıklıdır; ancak mermer, traverten, terrazzo/mozaik ve beton kalsiyum karbonat içerdiğinden asitle yanar
    if (zeminLower.includes('granit')) return false;
    return isNaturalStone(zemin) || isConcreteOrAsphalt(zemin);
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
           zeminLower.includes('tirtikli') ||
           zeminLower.includes('safety') ||
           zeminLower.includes('antislip');
};

export const isMineralOrScaleDirt = (kirTuru) => {
    const kirLower = normalizeString(kirTuru);
    return kirLower.includes('kirec') ||
           kirLower.includes('cimento') ||
           kirLower.includes('derz') ||
           kirLower.includes('insaat') ||
           kirLower.includes('pas') ||
           kirLower.includes('su tasi') ||
           kirLower.includes('mineral');
};

export const isGreaseOrOilDirt = (kirTuru) => {
    const kirLower = normalizeString(kirTuru);
    return kirLower.includes('yag') ||
           kirLower.includes('gres') ||
           kirLower.includes('gida') ||
           kirLower.includes('mutfak') ||
           kirLower.includes('kan') ||
           kirLower.includes('protein') ||
           kirLower.includes('organik');
};

export const isTireMarkDirt = (kirTuru) => {
    const kirLower = normalizeString(kirTuru);
    return kirLower.includes('lastik') ||
           kirLower.includes('kaucuk') ||
           kirLower.includes('forklift') ||
           kirLower.includes('palet') ||
           kirLower.includes('tekerlek');
};

export const getIncompatibilityReason = (padName, zemin, kirYogunlugu, makine = null, isCilaliZemin = false) => {
    const padLower = normalizeString(padName);
    
    // 1. Mekanik Kafa Uyumsuzluğu (Silindirik vs Disk)
    if (makine) {
        const headType = getMachineHeadType(makine);
        if (headType === 'Silindirik' && !isBrush(padName)) {
            return `${makine.model} silindirik (rulo) fırça kafasına sahiptir. Yuvarlak zemin pedleri ve ped tutucu bu makineye mekanik olarak takılamaz; rulo fırça seçilmelidir.`;
        }
        if (headType === 'Disk' && isCylinderBrush(padName)) {
            return `${makine.model} disk fırça kafasına sahiptir; silindirik rulo fırça takılamaz.`;
        }
    }

    // 2. Cilalı Zemin Uyarısı
    if (isCilaliZemin && (isStrippingPad(padName) || isTynexBrush(padName) || padLower.includes('yesil') || padLower.includes('twister kirmizi') || padLower.includes('twister beyaz'))) {
        return "Zemin 'Cilalı' olarak işaretlendi! Seçilen aşındırıcı ped/fırça mevcut polimer cilayı tamamen kazır (cila sökümü yapar). Cilayı korumak için Beyaz, Kırmızı veya Twister Yeşil ped seçin.";
    }
    
    // 3. Güvenlik/Kaymaz (Safety) zeminler
    if (isSafetyFloor(zemin)) {
        if (isMelaminePad(padName) || isMicrofiberPad(padName)) {
            return "Melamin ve mikrofiber pedler kaymaz/tırtıklı (R11-R12) zeminlerde rende etkisiyle 150-200 m² içinde parçalanır. Sadece kıl fırça (Yıkama Fırçası) veya Tynex fırça kullanılmalıdır.";
        }
        if (padLower.includes('siyah') || padLower.includes('kahverengi')) {
            return "Sert polyester pedler kaymaz/tırtıklı zeminlerin kuvars dokusuna takılarak parçalanır ve derz/doku dibine inemez.";
        }
        if (padLower.includes('beyaz') || padLower.includes('kirmizi')) {
            return "Yumuşak pedler tırtıklı zeminlerde hızla rendelenir ve girintilerdeki kiri temizleyemez.";
        }
    }
    
    // 4. Doğal taş, mermer, seramik
    if (isNaturalStone(zemin) || isCeramic(zemin)) {
        if (padLower.includes('siyah') || padLower.includes('kahverengi')) {
            return "Siyah/Kahverengi aşındırıcı pedler mermer, granit veya sırlı seramik gibi parlak yüzeyleri derin çizer ve matlaştırır.";
        }
        if (isTynexBrush(padName) && isNaturalStone(zemin)) {
            return "Silisyum karbürlü Tynex fırça mermer ve doğal taş yüzeyler için aşırı serttir, kalıcı çizilmelere yol açar.";
        }
    }
    
    // 5. Epoksi / PVC / Vinil
    if (isPvcOrVinyl(zemin)) {
        if (isEpoxyFloor(zemin) && (padLower.includes('siyah') || isTynexBrush(padName))) {
            return "Siyah ped ve Tynex fırça epoksi/poliüretan kaplamanın parlak film tabakasını çizer ve matlaştırır.";
        }
        if (!hasHeavyDirt(kirYogunlugu) && (padLower.includes('siyah') || isTynexBrush(padName))) {
            return "Çok sert pedler ve Tynex fırçalar PVC/Vinil kaplamaları çizer (Siyah ped sadece ağır cila sökümünde kullanılır).";
        }
    }
    
    // 6. Kir yoğunluğu uyumsuzlukları
    if (hasHeavyDirt(kirYogunlugu) && !isTwisterPad(padName)) {
        if (padLower.includes('beyaz') || padLower.includes('kirmizi')) {
            return "Ağır/çok yoğun kirlerde Beyaz veya Kırmızı gibi yumuşak pedler mekanik kazıma yapamaz, kiri sadece yüzeye yayar.";
        }
        if (isMicrofiberPad(padName)) {
            return "Mikrofiber pedler çok ağır/yağlı kirlerde ilk birkaç metrede tıkanır ve işlevini yitirir.";
        }
    }
    
    if (hasLightDirt(kirYogunlugu)) {
        if (padLower.includes('siyah') || padLower.includes('kahverengi') || isTynexBrush(padName) || padLower.includes('twister extreme') || padLower.includes('twister kirmizi')) {
            return "Hafif günlük kirler için aşırı agresif/aşındırıcı bir seçim. Zemin kaplaması gereksiz yere aşındırılır.";
        }
    }
    
    // 7. Melamin genel kısıt
    if (isMelaminePad(padName)) {
        return "Melamin sünger pedler sadece düz/mikro-gözenekli seramik, porselen ve epokside etkilidir; kaba ve pürüzlü yüzeylerde hızla erir.";
    }

    return "Seçilen aparatın aşındırıcılık seviyesi bu zemin dokusuna veya kir yoğunluğuna uygun değildir.";
};
