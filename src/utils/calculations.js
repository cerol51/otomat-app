import {
    hasHeavyDirt,
    hasMediumDirt,
    hasLightDirt,
    isConcreteOrAsphalt,
    isNaturalStone,
    isPvcOrVinyl,
    isTwisterPad,
    isMelaminePad,
    normalizeString,
    isCeramic,
    isSafetyFloor
} from './helpers';

export const getYasFaktoru = (yas) => {
    switch(yas) {
        case "0-1 Yaş": return 0.95;
        case "1-3 Yaş": return 0.80;
        case "3-5+ Yaş": return 0.70;
        default: return 0.80;
    }
};

export const calculateChemicalInfo = (sektor, zemin, kirYogunlugu, suTuketimi, isCilaliZemin = false) => {
    let dozajYuzdesi = 1.0;
    let aciklama = "Nötr Genel Yüzey Temizleyici (pH 7-8)";
    
    if (hasHeavyDirt(kirYogunlugu)) {
        if (isCilaliZemin) {
            aciklama = "Hafif Alkali Cila Dostu Temizleyici (Max pH 9)";
            dozajYuzdesi = 3.0; // Yüksek pH kullanamadığımız için dozajı biraz artırıyoruz
        } else {
            aciklama = "Güçlü Alkali Cila Sökücü veya Endüstriyel Sökücü (pH 12-14)";
            dozajYuzdesi = 5.0;
        }
    } else if (sektor === "Sağlık ve Hastane") {
        aciklama = "Nötr Dezenfektan Bazlı Temizleyici (pH 7.0-7.5)";
        dozajYuzdesi = 1.0;
    } else if (sektor === "Endüstri ve Fabrika" || hasMediumDirt(kirYogunlugu) || isConcreteOrAsphalt(zemin)) {
        aciklama = "Alkali Ağır Kir ve Yağ Sökücü (pH 10-12)";
        dozajYuzdesi = 2.5;
    }
    
    // Mermer ve Doğal Taşlar aside/alkaliye hassastır, normal kirlerde her zaman Nötr tavsiye edilir
    if (isNaturalStone(zemin)) {
        if (!hasHeavyDirt(kirYogunlugu)) {
            aciklama = "Nötr Doğal Taş Temizleyici (pH 7.0)";
            dozajYuzdesi = 1.0;
        }
    }

    const litre = (suTuketimi * (dozajYuzdesi / 100)).toFixed(1);
    return { aciklama, dozajYuzdesi, litre };
};

export const parseSolusyonTuketimi = (solusyonStr, zemin, kirYogunlugu) => {
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
    if (hasLightDirt(kirYogunlugu)) factor = 0.0;
    else if (hasHeavyDirt(kirYogunlugu)) factor = 1.0;
    else if (hasMediumDirt(kirYogunlugu)) factor = 0.66;
    else factor = 0.33; // Normal/Orta
    
    let rateMl = min + (max - min) * factor;
    
    if (isConcreteOrAsphalt(zemin)) {
        rateMl *= 1.30;
    } else if (isPvcOrVinyl(zemin)) {
        rateMl *= 0.85;
    }
    
    return rateMl / 1000;
};

export const calculateWearFactor = (fircaBasinciStr, zemin, kirYogunlugu) => {
    let factor = 1.0;
    
    if (isSafetyFloor(zemin)) {
        factor *= 5.0; // Kaymaz zeminler ped ömrünü %80 civarında düşürür (5 kat sarfiyat)
    } else if (isConcreteOrAsphalt(zemin)) {
        factor *= 1.30;
    } else if (normalizeString(zemin).includes('epoksi')) {
        factor *= 1.15;
    } else if (isNaturalStone(zemin)) {
        factor *= 0.90;
    } else if (isPvcOrVinyl(zemin)) {
        factor *= 0.95;
    }
    
    if (hasHeavyDirt(kirYogunlugu)) {
        factor *= 1.40;
    } else if (hasMediumDirt(kirYogunlugu)) {
        factor *= 1.20;
    } else if (hasLightDirt(kirYogunlugu)) {
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
    const isHafif = hasLightDirt(kirYogunlugu);
    const isCokYogun = hasHeavyDirt(kirYogunlugu);
    const isYogun = hasMediumDirt(kirYogunlugu);

    if (isSafetyFloor(zemin)) {
        if (isHafif) oneriler = ["Melamin Ped"];
        else if (isYogun) oneriler = ["Tynex Fırça", "Melamin Ped"];
        else if (isCokYogun) oneriler = ["Tynex Fırça"];
        else oneriler = ["Tynex Fırça", "Melamin Ped"];
    }
    else if (isCeramic(zemin)) {
        if (isHafif) oneriler = ["Mikrofiber Ped", "Kırmızı Ped"];
        else if (isYogun) oneriler = ["Melamin Ped", "Yeşil Ped"];
        else if (isCokYogun) oneriler = ["Melamin Ped", "Tynex Fırça"];
        else oneriler = ["Mikrofiber Ped", "Melamin Ped"];
    }
    else if (isConcreteOrAsphalt(zemin) || normalizeString(zemin).includes("epoksi")) {
        if (isHafif) oneriler = ["Twister Yeşil", "Kırmızı Ped"];
        else if (isYogun) oneriler = ["Twister Kırmızı", "Tynex Fırça", "Siyah Ped"]; // Tynex ve siyah ped beton için ideal
        else if (isCokYogun) oneriler = ["Twister Extreme", "Twister Hibrit Siyah", "Tynex Fırça"];
        else oneriler = ["Twister Sarı", "Twister Mavi", "Yeşil Ped"]; // Orta kir
    }
    else if (isNaturalStone(zemin)) {
        if (isCokYogun) oneriler = ["Twister Extreme", "Twister Hibrit Kırmızı", "Twister Beyaz", "Twister Sarı"]; // Restorasyon sırası
        else if (isYogun) oneriler = ["Twister Turuncu", "Twister Kırmızı", "Kırmızı Ped"]; // Mermeri çizmemek için Kırmızı ped
        else oneriler = ["Twister Pembe", "Twister Yeşil", "Beyaz Ped"]; // Parlatma için pembe twister ve beyaz ped
    }
    else {
        // PVC, Lino, Vinil vb.
        if (isHafif) oneriler = ["Twister Mor", "Twister Yeşil", "Beyaz Ped"]; // Twister Mor (Yeni) cilalı yüzey parlatıcı
        else if (isYogun) oneriler = ["Twister Mavi", "Yeşil Ped", "Mavi Ped"];
        else if (isCokYogun) oneriler = ["Siyah Ped", "Kahverengi Ped"]; // Cila sökücü
        else oneriler = ["Twister Yeşil", "Kırmızı Ped"]; // Normal bakım
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
    kaynakSuTuketimi, gerekliAdet, teorikOmur, isCilaliZemin = false
) => {
    const isCokYogun = hasHeavyDirt(kirYogunlugu);
    const isYogun = hasMediumDirt(kirYogunlugu);

    let steps = [];
    
    steps.push(`### 🦺 1. İş Sağlığı ve Güvenliği (İSG)`);
    steps.push(`- Çalışma alanının görünür yerlerine **Kaygan Zemin Uyarı Tabelalarını** yerleştirin.`);
    if (!isTwister) {
        steps.push(`- Kimyasal dozajlaması yaparken mutlaka uygun koruyucu eldiven kullanın.`);
    }

    steps.push(``);
    steps.push(`### 🔋 2. Hazırlık ve Makine Kontrolü`);
    if (surus === 'Kablolu') {
        steps.push(`- Makinenin çalışacağı güzergahtaki uygun prizleri tespit edin. Kabloyu takılma tehlikesi yaratmayacak ve fırçanın altından geçmeyecek şekilde konumlandırın.`);
    } else {
        steps.push(`- İşe başlamadan önce akü/şarj göstergesini kontrol edin. Planlanan iş için bataryanın yeterli olduğundan emin olun.`);
        steps.push(`- ⚠️ **Önemli Uyarı:** Akülü makinelerde, akü seviyesinin %20'nin altına düşmemesine özen gösterin. Lityum-İyon dışındaki (Jel/Sulu) aküleri tamamen bitirmek akü ömrünü ciddi şekilde kısaltır.`);
    }
    steps.push(`- Makineyi çalışma alanına getirin.`);
    steps.push(`- Temiz su tankını doldurun (toplam ${kaynakSuTuketimi} L su kullanılacak).`);
    
    if (isTwister) {
        steps.push(`- Twister/Elmas ped kullanıldığı için **kimyasal eklemenize gerek yoktur**, sadece temiz su yeterlidir.`);
    } else {
        steps.push(`- Kimyasal dozajı: ${kimyasalAciklama} (Max. %${kimyasalDozaj.toFixed(1)} oranında).`);
        if (isCilaliZemin) {
            steps.push(`- 💡 **Not:** Zemin cilalı olduğu için cilanın zarar görmemesi adına düşük pH'lı koruyucu kimyasal seçilmiştir.`);
        }
        steps.push(`- Suya uygun miktarda kimyasal ekleyin ve iyice karıştırın.`);
        if (isCokYogun || isYogun) {
            steps.push(`- ⚠️ **Uyarı:** Endüstriyel veya ağır kir sökücü kimyasallar kullanıldığı için aşırı köpüklenmeyi önlemek amacıyla kirli su tankına yarım çay bardağı **Köpük Kesici** ilave etmeniz tavsiye edilir.`);
        }
    }
    
    steps.push(`- Makinenin fırça/pedini takın: **${aparatAdi || 'Ped Seçilmedi'}**. (${aparatAciklama})`);
    if (isMelaminePad(aparatAdi)) {
        steps.push(`- ⚠️ **Dikkat:** Melamin sünger yapıdadır. Pürüzlü ve geniş derzli alanlarda makine baskısını/hızını çok yüksek tutmayın, aksi halde sünger hızla parçalanabilir.`);
    } else if (isTwister) {
        steps.push(`- 💡 **İpucu:** Twister elmas pedler temizliği elmas partiküllerle yapar. Sadece suyla, düzenli ve yavaş geçişler yaparak zemini parlatın.`);
    }
    steps.push(`- Kirli su tankının boş olduğundan emin olun.`);

    steps.push(``);
    steps.push(`### 🧹 3. Ön Süpürme (Kaba Temizlik)`);
    steps.push(`- Zemindeki büyük parçaları (taş, ambalaj, kalın toz yığınları) mop veya süpürge ile alın.`);
    steps.push(`- Bu işlem, yıkama sırasında vakum motorunun tıkanmasını ve pedin zarar görmesini önler.`);

    steps.push(``);
    steps.push(`### 💧 4. Ana Yıkama Operasyonu`);
    steps.push(`- Makineyi çalıştırın ve ${marka} ${makineModel} (${surus}) ile ${zemin} zemin üzerinde temizliğe başlayın.`);
    if (isCokYogun) {
        steps.push(`> [!IMPORTANT]`);
        steps.push(`> **🔄 Çift Geçiş (Indirect Washing) Önerilir:** Alan çok kirli olduğu için, önce vakum motorunu (emiciyi) kapalı tutarak zemine sadece solüsyon püskürtüp fırçalayın.`);
        steps.push(`> Solüsyonun kiri çözmesi için kurumasına izin vermeden **5-10 dakika bekleyin**.`);
        steps.push(`> Ardından vakum motorunu açıp aynı hattan ikinci kez geçerek çözülen kirli suyu emdirin.`);
    } else if (isYogun) {
        steps.push(`- Ağır kir için, makineyi daha yavaş (yaklaşık 3 km/s) sürün ve gerektiğinde kirli bölgelerden ikinci bir geçiş yapın.`);
        steps.push(`- Yıkama sırasında su zemine püskürtülür, fırça ile kir çözülür ve anında kirli su tankına emilir.`);
    } else {
        steps.push(`- Normal hızda (4-5 km/s) tek geçiş yeterlidir.`);
        steps.push(`- Yıkama sırasında su zemine püskürtülür, fırça ile kir çözülür ve anında kirli su tankına emilir.`);
    }

    steps.push(``);
    steps.push(`### 🚰 5. Tank Doldurma ve Boşaltma`);
    steps.push(`- Toplam su tüketimi ${kaynakSuTuketimi} L olduğu için, tank kapasitesine bağlı olarak sefer (doldurma/boşaltma) yapmanız gerekebilir.`);
    steps.push(`- Her seferinde temiz su doldurup, kirli suyu boşaltın. Bu işlem toplam operasyon sürenize yaklaşık ${dakikaFormatla(doldurBosaltDk)} ekleyecektir.`);

    steps.push(``);
    steps.push(`### 🛠️ 6. Son Kontrol ve Günlük Makine Bakımı (After-Care)`);
    steps.push(`- Yıkama bittikten sonra zemini kontrol edin. Leke kalan bölgeleri lokal olarak tekrar geçin.`);
    steps.push(`- Makineyi durdurun ve **kirli su tankını boşaltın**.`);
    steps.push(`- ⚠️ Koku ve bakteri oluşumunu engellemek için **kirli su tankının kapağını açık bırakarak** havalanmasını sağlayın.`);
    steps.push(`- Silecek lastiklerini (vakum başlığını) ıslak bir bezle silin. Lastik aşınmışsa iz bırakmaması için ters çevirin veya yenileyin.`);
    steps.push(`- Filtre süzgeçlerini temiz suyla durulayın.`);
    steps.push(`- Ped/Fırçayı söküp temizleyin ve kurutun.`);

    steps.push(``);
    steps.push(`### 🛒 7. Operasyonel Sarfiyat ve Satın Alma Özeti (BOM)`);
    steps.push(`- **Toplam Tahmini Süre:** ${dakikaFormatla(toplamOperasyonDk)}`);
    steps.push(`- **Gerekli Ped/Fırça Adedi:** Toplam ${gerekliAdet} adet ${aparatAdi || 'Ped'} (Ped ömrü: ${teorikOmur.toLocaleString('tr-TR')} m² / adet)`);
    if (!isTwister) {
        const kimyasalMiktari = (kaynakSuTuketimi * (kimyasalDozaj / 100)).toFixed(1);
        steps.push(`- **Kimyasal Tüketimi:** ${kimyasalMiktari} Litre ${kimyasalAciklama}`);
    }

    return steps.join('\n');
};
