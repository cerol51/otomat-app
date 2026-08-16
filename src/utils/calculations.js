export const getYasFaktoru = (yas) => {
    switch(yas) {
        case "0-1 Yaş": return 0.95;
        case "1-3 Yaş": return 0.80;
        case "3-5+ Yaş": return 0.70;
        default: return 0.80;
    }
};

export const calculateChemicalInfo = (sektor, kirYogunlugu, suTuketimi) => {
    let dozajYuzdesi = 1.0;
    let aciklama = "Nötr Genel Yüzey Temizleyici (pH 7-8)";
    if (kirYogunlugu === "Çok Ağır / Restorasyon") {
        aciklama = "Güçlü Alkali Cila Sökücü veya Endüstriyel Sökücü (pH 12-14)";
        dozajYuzdesi = 5.0;
    } else if (sektor === "Sağlık ve Hastane") {
        aciklama = "Nötr Dezenfektan Bazlı Temizleyici (pH 7.0-7.5)";
        dozajYuzdesi = 1.0;
    } else if (sektor === "Endüstri ve Fabrika" || kirYogunlugu === "Ağır Kirli") {
        aciklama = "Alkali Ağır Kir ve Yağ Sökücü (pH 10-12)";
        dozajYuzdesi = 2.5;
    }
    const litre = (suTuketimi * (dozajYuzdesi / 100)).toFixed(1);
    return { aciklama, dozajYuzdesi, litre };
};

export const parseSolusyonTuketimi = (solusyonStr, kirYogunlugu) => {
    if (!solusyonStr) return 0.07;
    
    let min = 70;
    let max = 70;
    
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
    const lowerKir = (kirYogunlugu || '').toLowerCase();
    
    if (lowerKir.includes('hafif')) factor = 0.0;
    else if (lowerKir.includes('çok ağır') || lowerKir.includes('cok agir') || lowerKir.includes('restorasyon')) factor = 1.0;
    else if (lowerKir.includes('ağır') || lowerKir.includes('agir')) factor = 0.66;
    else if (lowerKir.includes('normal')) factor = 0.33;
    
    const rateMl = min + (max - min) * factor;
    return rateMl / 1000;
};

export const calculateWearFactor = (fircaBasinciStr, zemin, kirYogunlugu) => {
    let factor = 1.0;
    
    const zeminLower = (zemin || '').toLowerCase();
    if (zeminLower.includes('beton') || zeminLower.includes('asfalt')) {
        factor *= 1.30;
    } else if (zeminLower.includes('epoksi')) {
        factor *= 1.15;
    } else if (zeminLower.includes('mermer') || zeminLower.includes('doğal taş') || zeminLower.includes('granit')) {
        factor *= 0.90;
    } else if (zeminLower.includes('pvc') || zeminLower.includes('linolyum') || zeminLower.includes('vinil')) {
        factor *= 0.95;
    }
    
    const kirLower = (kirYogunlugu || '').toLowerCase();
    if (kirLower.includes('çok ağır') || kirLower.includes('restorasyon')) {
        factor *= 1.40;
    } else if (kirLower.includes('ağır')) {
        factor *= 1.20;
    } else if (kirLower.includes('hafif')) {
        factor *= 0.85;
    }
    
    if (fircaBasinciStr) {
        let maxBasinc = 30;
        const rangeMatch = fircaBasinciStr.match(/\d+\s*-\s*(\d+)/);
        if (rangeMatch) {
            maxBasinc = parseInt(rangeMatch[1], 10);
        } else {
            const singleMatch = fircaBasinciStr.match(/(\d+)/);
            if (singleMatch) {
                maxBasinc = parseInt(singleMatch[1], 10);
            }
        }
        
        if (maxBasinc > 100) factor *= 1.50;
        else if (maxBasinc >= 70) factor *= 1.30;
        else if (maxBasinc >= 45) factor *= 1.15;
        else if (maxBasinc < 20) factor *= 0.85;
    }
    
    return factor;
};


export const getAkilliPedOnerisi = (zemin, kirYogunlugu) => {
    let oneriler = [];
    if (zemin.includes("Epoksi") || zemin.includes("Beton")) {
        if (kirYogunlugu === "Hafif Kirli") oneriler = ["Twister Yeşil", "Kırmızı Ped"];
        else if (kirYogunlugu === "Ağır Kirli") oneriler = ["Twister Kırmızı", "Tynex Fırça"];
        else if (kirYogunlugu === "Çok Ağır / Restorasyon") oneriler = ["Twister Hibrit Siyah", "Twister Hibrit Kırmızı", "Tynex Fırça"];
        else oneriler = ["Twister Mavi", "Yeşil Ped"];
    }
    else if (zemin.includes("Mermer") || zemin.includes("Doğal Taş") || zemin.includes("Granit")) {
        if (kirYogunlugu === "Çok Ağır / Restorasyon") oneriler = ["Twister Hibrit Kırmızı", "Twister Ekstrem Kırmızı", "Twister Beyaz", "Twister Sarı"];
        else if (kirYogunlugu === "Ağır Kirli") oneriler = ["Twister Turuncu", "Yeşil Ped"];
        else oneriler = ["Twister Pembe", "Twister Yeşil", "Kırmızı Ped"];
    }
    else {
        if (kirYogunlugu === "Hafif Kirli") oneriler = ["Twister Yeşil", "Twister Gri", "Kırmızı Ped"];
        else if (kirYogunlugu === "Ağır Kirli") oneriler = ["Twister Mavi", "Yeşil Ped"];
        else if (kirYogunlugu === "Çok Ağır / Restorasyon") oneriler = ["Siyah Ped", "Kahverengi Ped"];
        else oneriler = ["Twister Mavi", "Kırmızı Ped"];
    }
    return oneriler;
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
    kaynakSuTuketimi, gerekliAdet, teorikOmur
) => {
    let steps = [];
    steps.push(`**1. Hazırlık**`);
    steps.push(`- Makineyi çalışma alanına getirin.`);
    steps.push(`- Temiz su tankını doldurun (toplam ${kaynakSuTuketimi} L su kullanılacak).`);
    if (isTwister) {
        steps.push(`- Twister ped kullanıldığı için **kimyasal eklemenize gerek yok**, sadece su yeterlidir.`);
    } else {
        steps.push(`- Kimyasal dozajı: ${kimyasalAciklama} (Max. %${kimyasalDozaj.toFixed(1)} oranında).`);
        steps.push(`- Suya uygun miktarda kimyasal ekleyin ve iyice karıştırın.`);
    }
    steps.push(`- Makinenin fırça/pedini takın: **${aparatAdi}**. (${aparatAciklama})`);
    steps.push(`- Kirli su tankının boş olduğundan emin olun.`);

    steps.push(``);
    steps.push(`**2. Ön Süpürme (Kaba temizlik)**`);
    steps.push(`- Zemindeki büyük parçaları (taş, ambalaj, toz yığınları) manuel olarak süpürün.`);
    steps.push(`- Bu işlem, yıkama sırasında pedin zarar görmesini önler.`);

    steps.push(``);
    steps.push(`**3. Ana Yıkama**`);
    steps.push(`- Makineyi çalıştırın ve zemine uygun hızda (genellikle 3-5 km/s) sürün.`);
    steps.push(`- ${marka} ${makineModel} (${surus}) ile ${zemin} zemin üzerinde temizliğe başlayın.`);
    if (kirYogunlugu === "Çok Ağır / Restorasyon") {
        steps.push(`- Bu alan çok kirli olduğu için, **önce bir kez kimyasal solüsyonu uygulayıp birkaç dakika bekleyin**, ardından yıkayın.`);
    } else if (kirYogunlugu === "Ağır Kirli") {
        steps.push(`- Ağır kir için, makineyi daha yavaş (3 km/s) sürün ve gerektiğinde ikinci bir geçiş yapın.`);
    } else {
        steps.push(`- Normal hızda (4-5 km/s) tek geçiş yeterlidir.`);
    }
    steps.push(`- Yıkama sırasında su ve kimyasal karışımı zemine püskürtülür, ped/fırça ile kir çözülür ve kirli su tankına emilir.`);

    steps.push(``);
    steps.push(`**4. Tank Doldurma ve Boşaltma**`);
    steps.push(`- Toplam su tüketimi ${kaynakSuTuketimi} L olduğu için, tank kapasitesine bağlı olarak birkaç kez doldurma/boşaltma yapmanız gerekebilir.`);
    steps.push(`- Her seferinde temiz su doldurun, kirli suyu boşaltın. Bu işlem toplam ${dakikaFormatla(doldurBosaltDk)} sürer.`);

    steps.push(``);
    steps.push(`**5. Kurutma ve Son Kontrol**`);
    steps.push(`- Yıkama bittikten sonra zemini kontrol edin.`);
    steps.push(`- Eğer leke veya çizgi kaldıysa, gerekli bölgeleri tekrar geçin.`);
    steps.push(`- Makineyi durdurun, kirli su tankını boşaltın ve temiz su tankını durulayın.`);
    steps.push(`- Ped/Fırçayı söküp temizleyin ve kurutun.`);
    steps.push(`- (Ped ömrü: ${teorikOmur.toLocaleString('tr-TR')} m²; bu alan için ${gerekliAdet} adet ped/fırça kullanılacaktır.)`);

    steps.push(``);
    steps.push(`**Toplam Tahmini Süre:** ${dakikaFormatla(toplamOperasyonDk)}`);

    return steps.join('\n');
};
