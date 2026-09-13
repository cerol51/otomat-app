import { getYasFaktoru, calculateChemicalInfo, getAkilliPedOnerisi, parseSolusyonTuketimi, calculateWearFactor } from '../utils/calculations';
import { isTwisterPad, isMelaminePad, isMicrofiberPad, normalizeString, getIncompatibilityReason } from '../utils/helpers';

/**
 * Aktif makine, aparat ve form girdilerine göre tüm operasyonel hesaplamaları yapar.
 * Dashboard'daki hesaplama mantığını bağımsız, test edilebilir bir hook'a taşır.
 */
export function useCalculations({
    aktifMakine, aktifAparat, alanInput,
    sektor, zemin, kirYogunlugu, makineYasi, isCilaliZemin
}) {
    if (!aktifMakine) return null;

    const yasFaktoru = getYasFaktoru(makineYasi);
    const pratikFaktor = 0.8;
    const teorik = parseFloat(aktifMakine.teorikPerformans) || parseFloat(aktifMakine.m2) || 0;
    const pratikM2_normal = parseFloat(aktifMakine.pratikPerformans) || (teorik * pratikFaktor);
    
    let akuKapasitesi;
    if (aktifMakine.surus === 'Kablolu') {
        akuKapasitesi = 99;
    } else {
        akuKapasitesi = parseFloat(aktifMakine.tekSarjSure?.toString().replace(',', '.')) || parseFloat(aktifMakine.aku?.toString().replace(',', '.')) || 1;
    }

    // Makinenin yaşı büyük olsa da (yıpranmış bataryasıyla) bu alanı tek şarjda yıkayabiliyorsa hızını düşürme
    const yipranmisAku = akuKapasitesi >= 99 ? 99 : (akuKapasitesi * yasFaktoru);
    const maxYikamaKapasitesi = pratikM2_normal * yipranmisAku;
    
    const uygulanacakYasFaktoru = (alanInput <= maxYikamaKapasitesi) ? 1 : yasFaktoru;
    const pratikM2 = Math.round(pratikM2_normal); // Ekranda gösterilen pratik kapasite her zaman sabit kalır
    
    const tuketimOraniLitre = parseSolusyonTuketimi(aktifMakine.solusyonTuketimi, zemin, kirYogunlugu);
    const kaynakSuTuketimi = Math.round(alanInput * tuketimOraniLitre);
    
    const seciliPedAdi = aktifAparat?.ad || '';
    const pedAdiLower = normalizeString(seciliPedAdi);

    const isTwister = isTwisterPad(pedAdiLower);

    let kimyasal = calculateChemicalInfo(sektor, zemin, kirYogunlugu, kaynakSuTuketimi, isCilaliZemin);
    if (pedAdiLower.includes('twister')) {
        if (pedAdiLower.includes('beyaz') || pedAdiLower.includes('sarı') || pedAdiLower.includes('sari') || pedAdiLower.includes('hibrit')) {
            kimyasal = { aciklama: 'Kullanılmaz (Sadece Su ile Restorasyon)', litre: '0', dozajYuzdesi: 0 };
        } else if (pedAdiLower.includes('gri')) {
            kimyasal = { aciklama: 'Kuru veya Nötr (Kimyasal Önerilmez)', litre: '0', dozajYuzdesi: 0 };
        } else {
            kimyasal = { aciklama: 'Su veya Nötr (Genelde Sadece Su Yeterlidir)', litre: '0', dozajYuzdesi: 0 };
        }
    } else if (isMelaminePad(pedAdiLower)) {
        kimyasal = { aciklama: 'Sadece Su (Aşırı asit/alkali süngeri eritir)', litre: '0', dozajYuzdesi: 0 };
    } else if (isMicrofiberPad(pedAdiLower)) {
        kimyasal.aciklama = `Nötr veya Su (Ağır kimyasal dokuyu bozar) - ${kimyasal.aciklama}`;
    } else if (pedAdiLower.includes('siyah')) {
        kimyasal.aciklama = `Sadece Sert Zeminlerde! - ${kimyasal.aciklama}`;
    } else if (pedAdiLower.includes('yeşil') || pedAdiLower.includes('yesil')) {
        kimyasal.aciklama = `Hassas Zeminlerde Kullanılmaz! - ${kimyasal.aciklama}`;
    }

    const sureCarpani = 1 / uygulanacakYasFaktoru; // Eğer kapasite aşılırsa, süre orantısal olarak uzar
    const netYikamaDk = pratikM2 > 0 ? Math.round(((alanInput / pratikM2) * 60) * sureCarpani) : 0;
    const temizSuKapasitesi = aktifMakine.temizSuTanki || aktifMakine.tank || 1;
    const kirliSuKapasitesi = aktifMakine.kirliSuTanki || temizSuKapasitesi;
    
    // Tek tank ile yıkanabilecek maksimum alan
    const tekTankYikamaAlani = temizSuKapasitesi / tuketimOraniLitre;
    // Alan, makinenin tek tankla yıkayabileceği alandan küçük veya eşitse sefer sayısı (ekstra dolum) 0'dır.
    const seferSayisi = alanInput <= tekTankYikamaAlani ? 0 : Math.ceil(alanInput / tekTankYikamaAlani) - 1;
    
    // 1. Ulaşım Süresi (Ortalama 100m gidiş-dönüş mesafesi varsayımı = 0.1 km)
    // Binicili ise makine hızı, İtmeli/Kablolu ise insan gücü ortalama itme hızı (yaklaşık 3 km/s)
    const makineHizi = (aktifMakine.surus === 'Binicili' && aktifMakine.hiz > 0) ? aktifMakine.hiz : 3;
    const ulasimSuresiDk = (0.1 / makineHizi) * 60;
    
    // 2. Doldurma ve Boşaltma Süresi
    // Ortalama şebeke suyu dolum hızı 15 L/dk, kirli su tahliye hızı 20 L/dk
    const suDoldurmaSuresi = temizSuKapasitesi / 15;
    const suBosaltmaSuresi = kirliSuKapasitesi / 20;
    
    // 3. Toplam Sefer Süresi ve Fiziki Yapı Zorlukları (%10 Kayıp Zaman)
    const hamSeferSuresi = ulasimSuresiDk + suDoldurmaSuresi + suBosaltmaSuresi;
    const tankDoldurmaSuresi = Math.round(hamSeferSuresi * 1.10); // %10 fiziki yapı kayıp zamanı
    
    let doldurBosaltDk = seferSayisi * tankDoldurmaSuresi;

    const toplamOperasyonDk = netYikamaDk + doldurBosaltDk;
    // Akü sadece yıkama yaparken ve su doldurmaya giderken (sürüş) harcanır. Suyu doldururken/boşaltırken makine kapalıdır.
    const netMotorCalismaDk = netYikamaDk + (seferSayisi * ulasimSuresiDk);
    const harcananSaat = netMotorCalismaDk / 60;
    const kullanilabilirAku =
        akuKapasitesi >= 99
            ? 99
            : Math.round(akuKapasitesi * yasFaktoru * 10) / 10;

    let akuDurumText = '';
    let akuDurumTipi = 'success';
    if (akuKapasitesi >= 99) {
        akuDurumText = 'Kablolu sistem, şarj sorunu yok.';
    } else if (harcananSaat <= kullanilabilirAku) {
        akuDurumText = `Kapasite yeterli (Kullanılabilir: ${kullanilabilirAku.toString().replace('.', ',')} sa)`;
    } else {
        akuDurumText = `YETERSİZ! İhtiyaç ${harcananSaat.toFixed(1).replace('.', ',')} sa, Kullanılabilir: ${kullanilabilirAku.toString().replace('.', ',')} sa`;
        akuDurumTipi = 'danger';
    }

    const onerilenPedler = getAkilliPedOnerisi(zemin, kirYogunlugu);
    const zeminBilgisi = zemin || 'Belirtilmemiş Zemin';
    const kirBilgisi = kirYogunlugu || 'Belirtilmemiş Yoğunluk';
    const secilenBasitAd = seciliPedAdi || 'Ped seçilmedi';
    const onerilenlerText = onerilenPedler.length > 0 ? onerilenPedler.join(' veya ') : '';

    let uyumDurumu = 'warning';
    let uyumMesaji = 'Önerilen pedler ile seçiminizi karşılaştırın.';
    
    if (!seciliPedAdi) {
        uyumDurumu = 'warning';
        uyumMesaji = 'Lütfen makineye uygun bir ped seçiniz.';
    } else if (onerilenPedler.length === 0) {
        uyumDurumu = 'warning';
        uyumMesaji = 'Bu kombinasyon için özel bir sistem önerimiz bulunmuyor, kendi uzmanlığınıza göre seçim yapabilirsiniz.';
    } else if (
        seciliPedAdi &&
        onerilenPedler.some(
            p =>
                seciliPedAdi.includes(p.split(' ')[0]) ||
                p.includes(seciliPedAdi.split(' ')[0])
        )
    ) {
        uyumDurumu = 'success';
        uyumMesaji = `✅ Seçiminiz mükemmel uyumlu! (${zeminBilgisi} üzerinde ${kirBilgisi} kir için ${secilenBasitAd} idealdir.)`;
    } else if (
        onerilenPedler.some(p => !p.includes('Twister') && !seciliPedAdi.includes('Twister')) ||
        onerilenPedler.some(p => p.includes('Twister') && seciliPedAdi.includes('Twister'))
    ) {
        uyumDurumu = 'info';
        uyumMesaji = `⚠️ Kısmi uyum. (${zeminBilgisi} zemin / ${kirBilgisi} kir için asıl önerimiz: ${onerilenlerText}. Sizin seçiminiz: ${secilenBasitAd}.)`;
    } else {
        uyumDurumu = 'danger';
        const sebep = getIncompatibilityReason(secilenBasitAd, zemin, kirYogunlugu);
        uyumMesaji = `❌ Uyumsuz seçim! (${sebep} Tavsiye edilen: ${onerilenlerText})`;
    }

    let teorikOmur = 10000; // Standart ped

    if (pedAdiLower.includes('twister')) {
        if (pedAdiLower.includes('hibrit')) teorikOmur = 5000;
        else if (pedAdiLower.includes('kırmızı') || pedAdiLower.includes('kirmizi')) teorikOmur = 15000;
        else if (pedAdiLower.includes('beyaz') || pedAdiLower.includes('sarı') || pedAdiLower.includes('sari')) teorikOmur = 25000;
        else if (pedAdiLower.includes('gri')) teorikOmur = 40000;
        else teorikOmur = 30000; // Yeşil, Mavi, Pembe, Mor vb.
    } else if (isMelaminePad(pedAdiLower)) {
        teorikOmur = 1000;
    } else if (isMicrofiberPad(pedAdiLower)) {
        teorikOmur = 50000;
    }
    
    // Yıpranma çarpanı (Zemin, Kir Yoğunluğu ve Fırça Basıncına göre)
    const yipranmaCarpani = calculateWearFactor(aktifMakine.fircaBasinci || aktifMakine.basinc, zemin, kirYogunlugu);
    
    // Gerçek Kullanım Oranı
    const kullanimOrani = (alanInput / teorikOmur) * yipranmaCarpani;
    const yipranmaOrani = (kullanimOrani * 100).toFixed(1).replace('.', ',');
    
    let fircaSayisi = Number(aktifMakine.fircaSayisi);
    if (!fircaSayisi || fircaSayisi < 1 || isNaN(fircaSayisi)) {
        const ebatMatch = (aktifMakine.ebat || '').match(/^(\d+)\s*x/i);
        fircaSayisi = ebatMatch ? parseInt(ebatMatch[1], 10) : 1;
    }

    const calismaGenisligi = Number(aktifMakine.calismaGenisligi) || 0;
    let hesaplananEbat = aktifMakine.ebat;
    if (!hesaplananEbat && calismaGenisligi > 0) {
        const tekFircaCm = calismaGenisligi / fircaSayisi;
        const tekFircaInch = Math.round(tekFircaCm / 2.54);
        hesaplananEbat = `${fircaSayisi} x ${tekFircaInch} inç (${Math.round(tekFircaCm)} cm)`;
    } else if (!hesaplananEbat) {
        hesaplananEbat = 'Bilinmiyor';
    }

    const setSayisi = Math.max(1, Math.ceil(kullanimOrani));
    const gerekliAdet = setSayisi * fircaSayisi;
    const gerekliMakineSayisi = pratikM2 > 0 ? Math.ceil(alanInput / pratikM2) : 1;

    return {
        pratikM2, kaynakSuTuketimi, kimyasal, isTwister,
        netYikamaDk, doldurBosaltDk, toplamOperasyonDk,
        harcananSaat, akuDurumText, akuDurumTipi,
        onerilenPedler, uyumDurumu, uyumMesaji,
        teorikOmur, yipranmaOrani, gerekliAdet,
        seferSayisi, tankDoldurmaSuresi,
        yasFaktoru, kullanilabilirAku, gerekliMakineSayisi,
        maxYikamaKapasitesi, hesaplananEbat
    };
}
