import {
    hasHeavyDirt,
    hasMediumDirt,
    hasLightDirt,
    isConcreteOrAsphalt,
    isEpoxyFloor,
    isNaturalStone,
    isAcidSensitiveFloor,
    isPvcOrVinyl,
    isMelaminePad,
    isMicrofiberPad,
    isTwisterPad,
    isBrush,
    isTynexBrush,
    isStrippingPad,
    getMachineHeadType,
    isMineralOrScaleDirt,
    isGreaseOrOilDirt,
    isTireMarkDirt,
    normalizeString,
    isCeramic,
    isSafetyFloor
} from './helpers';

export const getYasFaktoru = (yas) => {
    switch (yas) {
        case "0-1 Yaş": return 0.95;
        case "1-3 Yaş": return 0.80;
        case "3-5+ Yaş": return 0.70;
        default: return 0.80;
    }
};

/**
 * Kir yoğunluğu ve seçilen aparata göre operasyon modunu (Tek Geçiş vs Çift Geçiş) ve süre çarpanını hesaplar.
 */
export const getOperasyonModu = (kirYogunlugu, padName = '', isCilaliZemin = false) => {
    const isCokYogun = hasHeavyDirt(kirYogunlugu);
    const isYogun = hasMediumDirt(kirYogunlugu);
    const isHafif = hasLightDirt(kirYogunlugu);
    const isStrip = isStrippingPad(padName) && isCokYogun && !isCilaliZemin;

    if (isStrip) {
        return {
            modAdi: "Cila Sökümü + Çift Geçiş (Stripping & Rinse)",
            sureCarpani: 1.90,
            ciftGecisMi: true,
            beklemeSuresiDk: 10,
            aciklama: "Vakum kapalı cila sökücü serimi + 10 dk kimyasal reaksiyon + vakumlu kazıma ve nötralizasyon geçişi"
        };
    }
    if (isCokYogun) {
        return {
            modAdi: "Çift Geçişli Yıkama (Indirect / Double Scrubbing)",
            sureCarpani: 1.75,
            ciftGecisMi: true,
            beklemeSuresiDk: 8,
            aciklama: "1. Geçiş: Vakum kapalı solüsyon yayma ve fırçalama | 5-10 dk bekleme | 2. Geçiş: Vakum açık fırçalama ve çekiş"
        };
    }
    if (isYogun) {
        return {
            modAdi: "Yoğun Tek Geçiş (Yavaş Sürüş ~3 km/s)",
            sureCarpani: 1.25,
            ciftGecisMi: false,
            beklemeSuresiDk: 0,
            aciklama: "Ağır kirleri çözmek için azaltılmış yürüyüş hızı ve yüksek fırça teması"
        };
    }
    if (isHafif) {
        return {
            modAdi: "Rutin Bakım Geçişi (~4.5 km/s)",
            sureCarpani: 0.95,
            ciftGecisMi: false,
            beklemeSuresiDk: 0,
            aciklama: "Günlük hafif toz ve ayak izleri için standart seri tek geçiş"
        };
    }
    return {
        modAdi: "Standart Tek Geçiş (Direct Scrubbing ~4 km/s)",
        sureCarpani: 1.0,
        ciftGecisMi: false,
        beklemeSuresiDk: 0,
        aciklama: "Tek geçişte eşzamanlı solüsyon verme, fırçalama ve vakumlama"
    };
};

/**
 * Sektör, zemin, kir türü, kir yoğunluğu ve cila durumuna göre profesyonel kimyasal reçetesi üretir.
 */
export const calculateChemicalInfo = (sektor, zemin, kirYogunlugu, suTuketimi, isCilaliZemin = false, kirTuru = '') => {
    let dozajYuzdesi = 1.0;
    let aciklama = "Köpüğü Ayarlı Nötr Yüzey Temizleyici (pH 7-8)";
    let uyari = "";

    const isCokYogun = hasHeavyDirt(kirYogunlugu);
    const isYogun = hasMediumDirt(kirYogunlugu);
    const isHafif = hasLightDirt(kirYogunlugu);

    // 1. İnorganik / Mineral / Kireç / Çimento / Pas Kiri Kontrolü
    if (isMineralOrScaleDirt(kirTuru)) {
        if (isAcidSensitiveFloor(zemin)) {
            aciklama = "⚠️ ASİT YASAK! Nötr/Hafif Alkali Taş Temizleyici (pH 7.5-9.0)";
            dozajYuzdesi = isCokYogun ? 3.0 : (isYogun ? 2.0 : 1.0);
            uyari = `${zemin} kalsiyum karbonat içerdiğinden asidik kireç/çimento sökücüler yüzeyi yakar! Kireç ve harç kalıntılarını Twister elmas ped veya mekanik fırçalama ile temizleyin.`;
        } else if (isCilaliZemin) {
            aciklama = "Cila Dostu Nötr/Hafif Alkali Temizleyici (pH 7.5-8.5)";
            dozajYuzdesi = 2.0;
            uyari = "Zemin cilalı olduğu için asidik kireç sökücü cila filmini bozar.";
        } else {
            aciklama = "Asidik Kireç, Pas ve Çimento Sökücü (pH 1.5-3.5 Fosforik/Sülfamik Bazlı)";
            dozajYuzdesi = isCokYogun ? 5.0 : (isYogun ? 3.0 : 1.5);
            uyari = "Asidik ürün kullandıktan sonra otomatın temiz su tankını ve selenoid valf/pompa hattını mutlaka temiz su ile durulayın.";
        }
    }
    // 2. Kauçuk / Forklift / Lastik İzi Kontrolü
    else if (isTireMarkDirt(kirTuru)) {
        if (isCilaliZemin) {
            aciklama = "Solvent/Alkol Destekli Cila Dostu İz Sökücü (pH 8.5-9.5)";
            dozajYuzdesi = isCokYogun ? 3.5 : 2.0;
        } else if (isNaturalStone(zemin)) {
            aciklama = "Doğal Taş Uyumlu Hafif Alkali İz Sökücü (pH 9.5-10.5)";
            dozajYuzdesi = isCokYogun ? 4.0 : 2.5;
        } else {
            aciklama = "Solvent Destekli Ağır Alkali Lastik ve Forklift İzi Sökücü (pH 11.5-13.0)";
            dozajYuzdesi = isCokYogun ? 5.0 : (isYogun ? 3.5 : 2.0);
        }
    }
    // 3. Yağ / Gres / Gıda / Protein Kiri Kontrolü
    else if (isGreaseOrOilDirt(kirTuru)) {
        if (isCilaliZemin) {
            aciklama = "Hafif Alkali Cila Dostu Yağ Çözücü (Max pH 9.0)";
            dozajYuzdesi = isCokYogun ? 3.0 : 2.0;
        } else if (sektor === "Sağlık ve Hastane") {
            aciklama = "QAC / Aktif Oksijen Bazlı Alkali Dezenfektan Temizleyici (pH 9.5-11.0)";
            dozajYuzdesi = isCokYogun ? 3.0 : 1.5;
        } else {
            aciklama = "Köpüğü Ayarlı Endüstriyel Ağır Yağ ve Gres Sökücü (pH 11.5-13.5)";
            dozajYuzdesi = isCokYogun ? 5.0 : (isYogun ? 3.0 : 1.5);
        }
    }
    // 4. Çok Ağır Kir / Cila Sökümü veya Derin Restorasyon
    else if (isCokYogun) {
        if (isCilaliZemin) {
            aciklama = "Hafif Alkali Cila Dostu Derin Temizleyici (Max pH 9.0)";
            dozajYuzdesi = 3.0;
        } else if (isNaturalStone(zemin)) {
            aciklama = "Doğal Taş Ağır Kir Sökücü (pH 9.5-10.5 - Asitsiz)";
            dozajYuzdesi = 3.5;
        } else if (isPvcOrVinyl(zemin) && !isEpoxyFloor(zemin)) {
            aciklama = "Güçlü Alkali Cila ve Polimer Sökücü - Stripper (pH 12-14)";
            dozajYuzdesi = 8.0;
            uyari = "Cila sökümü (Stripping) sonrasında zeminde pH kalıntısı bırakmamak için temiz su ile nötralizasyon durulaması yapılmalıdır.";
        } else {
            aciklama = "Endüstriyel Güçlü Alkali Ağır Kir Sökücü (pH 12-13.5)";
            dozajYuzdesi = 5.0;
        }
    }
    // 5. Sağlık ve Hastane Hijyen Protokolü
    else if (sektor === "Sağlık ve Hastane") {
        aciklama = "Kuaterner Amonyum (QAC) Bazlı Nötr Dezenfektan Temizleyici (pH 7.0-7.5)";
        dozajYuzdesi = isYogun ? 2.0 : 1.0;
    }
    // 6. Endüstriyel Tesis veya Orta/Ağır Kir
    else if (sektor === "Endüstri ve Fabrika" || isYogun || isConcreteOrAsphalt(zemin)) {
        if (isCilaliZemin) {
            aciklama = "Nötr / Cila Koruyucu Bakım Temizleyicisi (pH 7.5-8.5)";
            dozajYuzdesi = 1.5;
        } else if (isNaturalStone(zemin)) {
            aciklama = "Nötr Doğal Taş ve Mermer Temizleyici (pH 7.0-8.0)";
            dozajYuzdesi = 1.5;
        } else {
            aciklama = "Alkali Endüstriyel Zemin ve Yağ Temizleyici (pH 10-12)";
            dozajYuzdesi = isYogun ? 2.5 : 1.5;
        }
    }
    // 7. Mermer / Doğal Taş Rutin Bakım
    else if (isNaturalStone(zemin)) {
        aciklama = "Nötr Doğal Taş ve Mermer Bakım Temizleyicisi (pH 7.0)";
        dozajYuzdesi = isHafif ? 0.5 : 1.0;
    }
    // 8. Cilalı Zemin Rutin Bakım
    else if (isCilaliZemin) {
        aciklama = "Nötr Cila Bakım ve Parlatıcı Otomat Deterjanı (pH 7.0-8.0)";
        dozajYuzdesi = isHafif ? 0.5 : 1.0;
    }
    // 9. Standart Günlük Bakım
    else {
        aciklama = "Köpüğü Ayarlı Nötr Genel Yüzey Temizleyici (pH 7-8)";
        dozajYuzdesi = isHafif ? 0.5 : 1.0;
    }

    const litre = (suTuketimi * (dozajYuzdesi / 100)).toFixed(1);
    return { aciklama, dozajYuzdesi, litre, uyari };
};

export const parseSolusyonTuketimi = (solusyonStr, zemin, kirYogunlugu, ciftGecisMi = false) => {
    if (!solusyonStr) return 0.03;

    let min = 20;
    let max = 40;

    const rangeMatch = solusyonStr.match(/(\d+)\s*-\s*(\d+)/);
    if (rangeMatch) {
        min = parseInt(rangeMatch[1], 10);
        max = parseInt(rangeMatch[2], 10);
    } else {
        const singleMatch = solusyonStr.match(/(\d+)/);
        if (singleMatch) {
            min = parseInt(singleMatch[1], 10);
            max = parseInt(singleMatch[1], 10);
        }
    }

    let factor = 0.5;
    if (hasLightDirt(kirYogunlugu)) factor = 0.0;
    else if (hasHeavyDirt(kirYogunlugu)) factor = 1.0;
    else if (hasMediumDirt(kirYogunlugu)) factor = 0.66;
    else factor = 0.33; // Normal/Orta

    let rateMl = min + (max - min) * factor;

    // Gözenekli beton ve kaymaz zeminler daha fazla su tutar
    if (isConcreteOrAsphalt(zemin) || isSafetyFloor(zemin)) {
        rateMl *= 1.25;
    } else if (isPvcOrVinyl(zemin)) {
        rateMl *= 0.90;
    }

    // Çift geçiş (Indirect Washing) uygulamasında zeminin 5-10 dk kurumaması için ek solüsyon gerekir
    if (ciftGecisMi) {
        rateMl = Math.max(rateMl * 1.35, 35);
    }

    return rateMl / 1000;
};

/**
 * Makinenin fırça baskısını (kg veya g/cm²) gerçek birim yüzey basıncına (g/cm²) dönüştürür.
 */
export const calculateSpecificPressure = (fircaBasinciStr, calismaGenisligi = 43, fircaSayisi = 1, headType = 'Disk') => {
    if (!fircaBasinciStr) {
        return { toplamKg: 30, birimBasincGcm2: 22, etiket: '30 kg (~22 g/cm²)' };
    }

    const strLower = fircaBasinciStr.toString().toLowerCase();
    let maxVal = 30;
    const rangeMatch = strLower.match(/\d+\s*-\s*(\d+)/);
    if (rangeMatch) {
        maxVal = parseInt(rangeMatch[1], 10);
    } else {
        const singleMatch = strLower.match(/(\d+)/);
        if (singleMatch) {
            maxVal = parseInt(singleMatch[1], 10);
        }
    }

    const genislik = Number(calismaGenisligi) > 0 ? Number(calismaGenisligi) : 43;
    const adet = Number(fircaSayisi) > 0 ? Number(fircaSayisi) : 1;

    // Eğer veri doğrudan g/cm² olarak girilmişse
    if (strLower.includes('g/cm')) {
        return {
            toplamKg: null,
            birimBasincGcm2: maxVal,
            etiket: `${maxVal} g/cm²`
        };
    }

    // Silindirik (Rulo) fırçalarda temas alanı dar bir şerittir (~2.5 cm x çalışma genişliği), bu yüzden birim basınç yüksektir
    if (headType === 'Silindirik') {
        const temasAlaniCm2 = genislik * 2.5;
        const gcm2 = Math.round((maxVal * 1000) / temasAlaniCm2);
        return {
            toplamKg: maxVal,
            birimBasincGcm2: gcm2,
            etiket: `${maxVal} kg (~${gcm2} g/cm² Rulo Teması)`
        };
    }

    // Disk fırçalarda tek diskin çapı: çalışma genişliği / fırça sayısı
    const tekDiskCapCm = genislik / adet;
    const yaricapCm = tekDiskCapCm / 2;
    const toplamDiskAlaniCm2 = adet * Math.PI * (yaricapCm * yaricapCm);
    const gcm2 = toplamDiskAlaniCm2 > 0 ? Math.round((maxVal * 1000) / toplamDiskAlaniCm2) : 25;

    return {
        toplamKg: maxVal,
        birimBasincGcm2: gcm2,
        etiket: `${fircaBasinciStr} (~${gcm2} g/cm²)`
    };
};

export const calculateWearFactor = (
    fircaBasinciStr,
    zemin,
    kirYogunlugu,
    calismaGenisligi = 43,
    fircaSayisi = 1,
    headType = 'Disk',
    padName = ''
) => {
    let factor = 1.0;
    const isFirca = isBrush(padName);
    const isMelamin = isMelaminePad(padName);

    // 1. Zemin pürüzlülüğü etkisi (Fırçalar tırtıklı zemine dayanıklıdır, pedler ve melamin rendelenir)
    if (isSafetyFloor(zemin)) {
        if (isMelamin) factor *= 8.0; // Melamin tırtıklı zeminde anında erir
        else if (isFirca) factor *= 1.35; // Kıl/Tynex fırça kaymaz zemine dayanıklıdır
        else factor *= 4.0; // Standart polyester/elmas ped kaymaz zeminde hızlı aşınır
    } else if (isConcreteOrAsphalt(zemin)) {
        factor *= isFirca ? 1.15 : 1.30;
    } else if (isEpoxyFloor(zemin)) {
        factor *= 1.05;
    } else if (isNaturalStone(zemin)) {
        factor *= 0.90;
    } else if (isPvcOrVinyl(zemin)) {
        factor *= 0.90;
    }

    // 2. Kir yoğunluğu ve Çift Geçiş etkisi
    if (hasHeavyDirt(kirYogunlugu)) {
        factor *= 1.50; // Çift geçiş ve ağır kir aşınmayı artırır
    } else if (hasMediumDirt(kirYogunlugu)) {
        factor *= 1.20;
    } else if (hasLightDirt(kirYogunlugu)) {
        factor *= 0.85;
    }

    // 3. Normalize edilmiş birim yüzey basıncı (g/cm²) etkisi
    const { birimBasincGcm2 } = calculateSpecificPressure(fircaBasinciStr, calismaGenisligi, fircaSayisi, headType);
    if (headType !== 'Silindirik') {
        if (birimBasincGcm2 >= 45) factor *= 1.35;
        else if (birimBasincGcm2 >= 32) factor *= 1.20;
        else if (birimBasincGcm2 >= 22) factor *= 1.05;
        else if (birimBasincGcm2 < 16) factor *= 0.85;
    }

    return factor;
};

export const getAkilliPedOnerisi = (zemin, kirYogunlugu, makine = null, isCilaliZemin = false) => {
    const isHafif = hasLightDirt(kirYogunlugu);
    const isCokYogun = hasHeavyDirt(kirYogunlugu);
    const isYogun = hasMediumDirt(kirYogunlugu);

    // Silindirik (Rulo) kafalı makinelerde yuvarlak ped kullanılamaz, sadece fırça önerilir
    if (makine && getMachineHeadType(makine) === 'Silindirik') {
        if (isCokYogun || isYogun) return ["Tynex Fırça", "Yıkama Fırçası"];
        return ["Yıkama Fırçası"];
    }

    // 1. Kaymaz / Tırtıklı / Güvenlikli Zeminler (R11-R12) -> KESİNLİKLE Melamin veya Yumuşak Ped Önerilmez!
    if (isSafetyFloor(zemin)) {
        if (isCokYogun) return ["Tynex Fırça", "Yıkama Fırçası"];
        if (isYogun) return ["Tynex Fırça", "Yıkama Fırçası"];
        return ["Yıkama Fırçası", "Tynex Fırça"];
    }

    // 2. Seramik, Fayans, Porselen (Derzli veya Mikro-gözenekli)
    if (isCeramic(zemin)) {
        if (isHafif) return ["Mikrofiber Ped", "Kırmızı Ped", "Yıkama Fırçası"];
        if (isYogun) return ["Melamin Ped", "Yeşil Ped", "Yıkama Fırçası"];
        if (isCokYogun) return ["Tynex Fırça", "Melamin Ped", "Yeşil Ped"];
        return ["Kırmızı Ped", "Mikrofiber Ped", "Melamin Ped"];
    }

    // 3. Epoksi ve Poliüretan Kaplamalar (Siyah Ped ve Tynex çizdiği için önerilmez!)
    if (isEpoxyFloor(zemin)) {
        if (isCilaliZemin) {
            return isHafif ? ["Twister Yeşil", "Beyaz Ped"] : ["Twister Yeşil", "Kırmızı Ped"];
        }
        if (isHafif) return ["Twister Yeşil", "Kırmızı Ped", "Mikrofiber Ped"];
        if (isYogun) return ["Twister Kırmızı", "Mavi Ped", "Melamin Ped"];
        if (isCokYogun) return ["Twister Kırmızı", "Yeşil Ped", "Melamin Ped"];
        return ["Twister Yeşil", "Kırmızı Ped", "Mavi Ped"];
    }

    // 4. Endüstriyel Beton, Şap ve Asfalt
    if (isConcreteOrAsphalt(zemin)) {
        if (isHafif) return ["Twister Yeşil", "Yıkama Fırçası", "Kırmızı Ped"];
        if (isYogun) return ["Tynex Fırça", "Twister Kırmızı", "Siyah Ped"];
        if (isCokYogun) return ["Tynex Fırça", "Twister Extreme", "Siyah Ped"];
        return ["Twister Sarı", "Yeşil Ped", "Yıkama Fırçası"];
    }

    // 5. Mermer, Traverten, Terrazzo ve Doğal Taşlar
    if (isNaturalStone(zemin)) {
        if (isCilaliZemin) {
            return isHafif ? ["Twister Yeşil", "Beyaz Ped"] : ["Twister Yeşil", "Kırmızı Ped"];
        }
        if (isCokYogun) {
            // 3 Adımlı Sıralı Restorasyon: Beyaz (Adım 1) -> Sarı (Adım 2) -> Yeşil (Adım 3)
            return ["Twister Beyaz", "Twister Sarı", "Twister Yeşil", "Twister Kırmızı"];
        }
        if (isYogun) return ["Twister Kırmızı", "Twister Sarı", "Kırmızı Ped"];
        if (isHafif) return ["Twister Yeşil", "Beyaz Ped"];
        return ["Twister Yeşil", "Kırmızı Ped", "Beyaz Ped"];
    }

    // 6. PVC, Linolyum, Vinil
    if (isCilaliZemin) {
        if (isHafif) return ["Twister Yeşil", "Beyaz Ped"];
        if (isYogun || isCokYogun) return ["Kırmızı Ped", "Mavi Ped", "Twister Yeşil"];
        return ["Twister Yeşil", "Kırmızı Ped", "Beyaz Ped"];
    }

    if (isHafif) return ["Twister Yeşil", "Beyaz Ped", "Kırmızı Ped"];
    if (isYogun) return ["Mavi Ped", "Yeşil Ped", "Twister Kırmızı"];
    if (isCokYogun) return ["Siyah Ped", "Kahverengi Ped", "Yeşil Ped"]; // Cila sökümü / Derin temizlik
    return ["Twister Yeşil", "Kırmızı Ped"];
};

export const dakikaFormatla = (dk) => {
    if (dk < 60) return `${Math.round(dk)} dk`;
    const s = Math.floor(dk / 60);
    const d = Math.round(dk % 60);
    return `${s} sa ${d} dk`;
};

export const generateScenario = (
    sektor, zemin, kirTuru, kirYogunlugu,
    makineModel, marka, surus,
    aparatAdi, aparatAciklama,
    kimyasalAciklama, kimyasalDozaj, isTwister,
    netYikamaDk, doldurBosaltDk, toplamOperasyonDk,
    kaynakSuTuketimi, gerekliAdet, teorikOmur, isCilaliZemin = false,
    ekBilgiler = {}
) => {
    const isCokYogun = hasHeavyDirt(kirYogunlugu);
    const isYogun = hasMediumDirt(kirYogunlugu);
    const padLower = normalizeString(aparatAdi);
    const isKimyasalsiz = isTwister || isMelaminePad(aparatAdi);
    const isRestorasyonTwister = isTwister && (padLower.includes('beyaz') || padLower.includes('sari') || padLower.includes('kirmizi') || padLower.includes('extreme') || padLower.includes('hibrit'));

    let steps = [];

    steps.push(`### 🦺 1. İş Sağlığı ve Güvenliği (İSG)`);
    steps.push(`- Çalışma alanının giriş ve çıkışlarına **Kaygan Zemin Uyarı Tabelalarını** yerleştirin.`);
    if (!isKimyasalsiz && kimyasalDozaj > 0) {
        steps.push(`- Kimyasal dozajlaması yaparken KKD (Koruyucu Eldiven ve Gözlük) kullanın.`);
    }

    steps.push(``);
    steps.push(`### 🔋 2. Hazırlık, Akü ve Ekipman Kontrolü`);
    if (surus === 'Kablolu') {
        steps.push(`- Makinenin çalışacağı güzergahtaki prizleri tespit edin. Kabloyu fırça ve vakum lastiğinin altından geçmeyecek şekilde omuz üzerinden yönlendirin.`);
    } else {
        steps.push(`- İşe başlamadan önce akü şarj seviyesini kontrol edin.`);
        if (ekBilgiler.akuYeterliMi === false) {
            steps.push(`- 🚨 **KRİTİK VARDİYA UYARISI:** Bu operasyon **${ekBilgiler.harcananSaat?.toFixed(1) || ''} saat** kesintisiz motor çalışması gerektirir, ancak makinenin mevcut kullanılabilir akü süresi **${ekBilgiler.kullanilabilirAku || ''} saattir**.`);
            steps.push(`- Operasyonu tek vardiyada tamamlamak için **${ekBilgiler.gerekenSarjSayisi || 1} kez ara şarj (${ekBilgiler.tamSarjSure || '8-10 Saat'})**, yedek akü seti veya 2. bir makine planlayın.`);
        }
        steps.push(`- ⚠️ **Akü Koruma Kuralı (DoD):** Jel ve sulu akülerde şarj seviyesini %20'nin altına düşürmeyin; ara şarj (fırsat şarjı) yapmayın, tam şarj döngüsünü tamamlayın.`);
    }
    steps.push(`- Temiz su tankını doldurun (Operasyon toplam su ihtiyacı: **${kaynakSuTuketimi} L**).`);

    if (isKimyasalsiz || kimyasalDozaj <= 0) {
        steps.push(`- **${aparatAdi}** kullanıldığı için **kimyasal eklemenize gerek yoktur**, sadece temiz su ile çalışın.`);
    } else {
        steps.push(`- **Kimyasal Reçetesi:** ${kimyasalAciklama} (**%${kimyasalDozaj.toFixed(1)}** seyreltme oranıyla toplam **${(kaynakSuTuketimi * (kimyasalDozaj / 100)).toFixed(1)} L** konsantre ürün).`);
        if (ekBilgiler.kimyasalUyari) {
            steps.push(`- ⚠️ **Kimyasal Mühendislik Uyarısı:** ${ekBilgiler.kimyasalUyari}`);
        }
        if (isCilaliZemin) {
            steps.push(`- 💡 **Cila Koruma:** Zemin cilalı olduğu için polimer filmi matlaştırmayan pH dengeli reçete seçilmiştir.`);
        }
        if (isCokYogun || isYogun) {
            steps.push(`- ⚠️ **Köpük Kontrolü:** Yoğun kir/alkali kimyasal kaynaklı türbin arızasını önlemek için kirli su tankına **Köpük Kesici (Defoamer)** ekleyin.`);
        }
    }

    steps.push(`- Makinenin kafasına uygun aparatı takın: **${aparatAdi || 'Aparat Seçilmedi'}** (${ekBilgiler.kafaTipi || 'Disk'} Sistem — Birim Baskı: **${ekBilgiler.basincEtiketi || 'Standart'}**).`);
    if (isMelaminePad(aparatAdi)) {
        steps.push(`- ⚠️ **Melamin Uyarısı:** Melamin ped mikro-aşındırıcı reçine köpüktür. Keskin derz kenarları veya tırtıklı bölgelerde ekstra fırça baskısını (ekstra ağırlık modunu) kapatın ve bol su ile çalışın.`);
    } else if (isRestorasyonTwister) {
        steps.push(`- 💎 **Twister Sıralı Restorasyon Kuralı:** Elmas pedlerle yüzey yenileme tek adımlı değildir! **Twister Beyaz (Adım 1 - 800 grit)** sonrası gözenekleri kapatmak ve parlaklığı çıkarmak için sırasıyla **Twister Sarı (Adım 2 - 1500 grit)** ve **Twister Yeşil (Adım 3 - 3000 grit)** uygulanmalıdır.`);
    } else if (isTwister) {
        steps.push(`- 💎 **Twister Bakım İpucu:** Mikroskobik elmas kristaller mekanik parlatma yapar; sadece temiz su kullanarak düzenli hızda geçin.`);
    }

    steps.push(``);
    steps.push(`### 🧹 3. Ön Süpürme (Kuru Hazırlık)`);
    steps.push(`- Yıkama öncesi zemindeki kaba partikülleri (kum, taş, palet kıymığı) kuru paspas veya süpürücü ile uzaklaştırın.`);
    steps.push(`- Bu adım, döner disk/fırça altına sıkışacak sert parçacıkların zemini çizmesini ve vakum lastiğinin iz bırakmasını önler.`);

    steps.push(``);
    steps.push(`### 💧 4. Ana Yıkama Operasyonu (${ekBilgiler.operasyonModuAdi || 'Standart Mod'})`);
    steps.push(`- **${marka} ${makineModel} (${surus})** ile **${zemin}** zemin üzerinde operasyona başlayın.`);
    if (ekBilgiler.ciftGecisMi) {
        steps.push(`> **🔄 ÇİFT GEÇİŞ (Indirect Washing / Double Scrubbing) PROTOKOLÜ:**`);
        steps.push(`> 1. **1. Geçiş (Islatma & Fırçalama):** Vakum başlığını (emici lastiği) yukarıda/kapalı tutun. Solüsyonu zemine bolca vererek fırçalayın.`);
        steps.push(`> 2. **Reaksiyon Süresi (Dwell Time):** Kimyasalın ağır kiri/cilayı çözmesi için solüsyonun kurumasına izin vermeden **${ekBilgiler.beklemeSuresiDk || 8} dakika** bekleyin.`);
        steps.push(`> 3. **2. Geçiş (Fırçalama & Vakumlama):** Vakum başlığını indirin, aynı alandan ikinci kez fırçalayarak geçin ve çözülen çamuru (slurry) tamamen çekin.`);
        if (isStrippingPad(aparatAdi) && !isCilaliZemin) {
            steps.push(`> 4. **Nötralizasyon Durulaması:** Cila sökümü sonrasında yeni cila uygulanacaksa zemini sadece temiz su ile bir kez durulayıp pH'ı nötrleyin.`);
        }
    } else if (isYogun) {
        steps.push(`- Ağır kir yoğunluğu nedeniyle yürüyüş/sürüş hızını **~3 km/s** seviyesine düşürün (Süre hesabına **%25 yoğun yıkama payı** eklenmiştir).`);
        steps.push(`- Tek geçişte solüsyon serimi, fırçalama ve vakumlamayı eşzamanlı uygulayın.`);
    } else {
        steps.push(`- Normal yürüyüş hızında (**4 - 4.5 km/s**) tek geçişte yıkama ve vakumlama yapın.`);
    }

    steps.push(``);
    steps.push(`### 🚰 5. Tank Doldurma ve Tahliye Lojistiği`);
    steps.push(`- Toplam **${kaynakSuTuketimi} L** solüsyon ihtiyacı için operasyon boyunca **${ekBilgiler.seferSayisi ?? 0} kez** ara dolum/boşaltım seferi yapılacaktır (Toplam ek süre: **${dakikaFormatla(doldurBosaltDk)}**).`);

    steps.push(``);
    steps.push(`### 🛠️ 6. Operasyon Sonu Makine Bakımı (After-Care)`);
    steps.push(`- Kirli su tankını tahliye hortumundan boşaltın ve içini temiz suyla yıkayın.`);
    steps.push(`- ⚠️ Bakteri ve koku oluşumunu önlemek için **kirli su tankı kapağını açık** bırakın.`);
    steps.push(`- Vakum (silecek) lastiklerini ıslak bezle silin; kenarları yuvarlanmışsa lastiği ters yüz edin.`);
    steps.push(`- Temiz su filtresini ve şamandıra süzgecini kontrol edin.`);
    steps.push(`- Ped/fırçayı makineden söküp basınçlı suyla yıkayın (fırçayı makine üzerinde bırakmak kılları ezer).`);

    steps.push(``);
    steps.push(`### 🛒 7. Operasyonel Sarfiyat ve Mühendislik Özeti (BOM)`);
    steps.push(`- **Operasyon Modu:** ${ekBilgiler.operasyonModuAdi || 'Standart Tek Geçiş'}`);
    steps.push(`- **Net Yıkama + Dolum Süresi:** ${dakikaFormatla(netYikamaDk)} + ${dakikaFormatla(doldurBosaltDk)} = **${dakikaFormatla(toplamOperasyonDk)}**`);
    steps.push(`- **Gerekli ${isBrush(aparatAdi) ? 'Fırça' : 'Ped'} Adedi:** Toplam **${gerekliAdet} adet** ${aparatAdi || 'Aparat'} (Birim teorik ömür: **${teorikOmur.toLocaleString('tr-TR')} m²**)`);
    if (!isKimyasalsiz && kimyasalDozaj > 0) {
        const kimyasalMiktari = (kaynakSuTuketimi * (kimyasalDozaj / 100)).toFixed(1);
        steps.push(`- **Kimyasal Tüketimi:** **${kimyasalMiktari} Litre** ${kimyasalAciklama}`);
    }

    return steps.join('\n');
};
