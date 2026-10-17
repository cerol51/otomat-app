import { useMemo } from 'react';
import {
    getYasFaktoru,
    getOperasyonModu,
    calculateChemicalInfo,
    getAkilliPedOnerisi,
    parseSolusyonTuketimi,
    calculateSpecificPressure,
    calculateWearFactor
} from '../utils/calculations';
import {
    isTwisterPad,
    isMelaminePad,
    isMicrofiberPad,
    isBrush,
    isTynexBrush,
    isCylinderBrush,
    isStrippingPad,
    getMachineHeadType,
    isSafetyFloor,
    normalizeString,
    getIncompatibilityReason
} from '../utils/helpers';

/**
 * Aktif makine, aparat ve form girdilerine göre tüm operasyonel ve mühendislik hesaplamalarını yapar.
 */
export function useCalculations({
    aktifMakine, aktifAparat, alanInput,
    sektor, zemin, kirTuru, kirYogunlugu, makineYasi, isCilaliZemin
}) {
    return useMemo(() => {
        if (!aktifMakine) return null;

        const seciliPedAdi = aktifAparat?.ad || '';
        const pedAdiLower = normalizeString(seciliPedAdi);
        const kafaTipi = getMachineHeadType(aktifMakine);

        // 1. Operasyon Modu (Tek Geçiş vs Çift Geçiş / Cila Sökümü)
        const operasyonModu = getOperasyonModu(kirYogunlugu, seciliPedAdi, isCilaliZemin);

        // 2. Kapasite ve Akü Hesabı
        const yasFaktoru = getYasFaktoru(makineYasi);
        const pratikFaktor = 0.8;
        const teorik = parseFloat(aktifMakine.teorikPerformans) || parseFloat(aktifMakine.m2) || 0;
        const pratikM2_normal = parseFloat(aktifMakine.pratikPerformans) || (teorik * pratikFaktor);
        const pratikM2 = Math.round(pratikM2_normal);

        let akuKapasitesi;
        if (aktifMakine.surus === 'Kablolu') {
            akuKapasitesi = 99;
        } else {
            akuKapasitesi = parseFloat(aktifMakine.tekSarjSure?.toString().replace(',', '.')) || parseFloat(aktifMakine.aku?.toString().replace(',', '.')) || 1;
        }

        const yipranmisAku = akuKapasitesi >= 99 ? 99 : (akuKapasitesi * yasFaktoru);
        // Ağır kir veya Çift Geçiş modunda makine aynı alanı daha uzun sürede taradığı için tek şarjda bitirebileceği efektif m² düşer
        const efektifSaatlikM2 = pratikM2_normal / operasyonModu.sureCarpani;
        const maxYikamaKapasitesi = efektifSaatlikM2 * yipranmisAku;

        // 3. Solüsyon (Su) ve Kimyasal Reçetesi
        const tuketimOraniLitre = parseSolusyonTuketimi(aktifMakine.solusyonTuketimi, zemin, kirYogunlugu, operasyonModu.ciftGecisMi);
        const kaynakSuTuketimi = Math.round(alanInput * tuketimOraniLitre);

        const isTwister = isTwisterPad(pedAdiLower);
        const isFirca = isBrush(pedAdiLower);

        let kimyasal = calculateChemicalInfo(sektor, zemin, kirYogunlugu, kaynakSuTuketimi, isCilaliZemin, kirTuru);
        if (isTwister) {
            if (pedAdiLower.includes('beyaz') || pedAdiLower.includes('sari') || pedAdiLower.includes('hibrit') || pedAdiLower.includes('extreme')) {
                kimyasal = {
                    aciklama: 'Kullanılmaz (Sadece Su ile Elmas Restorasyon)',
                    litre: '0',
                    dozajYuzdesi: 0,
                    uyari: 'Adım 1 (Beyaz) sonrası gözenekleri kapatmak ve parlatmak için sırasıyla Adım 2 (Sarı) ve Adım 3 (Yeşil) uygulanmalıdır.'
                };
            } else {
                kimyasal = {
                    aciklama: 'Sadece Temiz Su (Elmas Kristal Günlük Bakım)',
                    litre: '0',
                    dozajYuzdesi: 0,
                    uyari: ''
                };
            }
        } else if (isMelaminePad(pedAdiLower)) {
            kimyasal = {
                aciklama: 'Sadece Su veya %0.5 Nötr (Güçlü asit/alkali melamin reçinesini eritir)',
                litre: '0',
                dozajYuzdesi: 0,
                uyari: 'Melamin pedi geniş derzli veya tırtıklı zeminlerde yüksek baskıyla kullanmayın.'
            };
        } else if (isMicrofiberPad(pedAdiLower)) {
            kimyasal.aciklama = `Nötr / Düşük Dozaj (Ağır alkali/çamaşır suyu mikrofiber lifi bozar) — ${kimyasal.aciklama}`;
        }

        // 4. Net Yıkama Süresi (Makine yaşlandığında hızı yavaşlamaz; süreyi uzatan şey Çift Geçiş / Ağır Kir modudur)
        const hamYikamaDk = pratikM2 > 0 ? ((alanInput / pratikM2) * 60) * operasyonModu.sureCarpani : 0;
        const netYikamaDk = Math.round(hamYikamaDk + (operasyonModu.beklemeSuresiDk || 0));

        const temizSuKapasitesi = aktifMakine.temizSuTanki || aktifMakine.tank || 1;
        const kirliSuKapasitesi = aktifMakine.kirliSuTanki || temizSuKapasitesi;

        const tekTankYikamaAlani = temizSuKapasitesi / tuketimOraniLitre;
        const seferSayisi = alanInput <= tekTankYikamaAlani ? 0 : Math.ceil(alanInput / tekTankYikamaAlani) - 1;

        const makineHizi = (aktifMakine.surus === 'Binicili' && aktifMakine.hiz > 0) ? aktifMakine.hiz : 3;
        const ulasimSuresiDk = (0.1 / makineHizi) * 60;
        const suDoldurmaSuresi = temizSuKapasitesi / 15;
        const suBosaltmaSuresi = kirliSuKapasitesi / 20;
        const hamSeferSuresi = ulasimSuresiDk + suDoldurmaSuresi + suBosaltmaSuresi;
        const tankDoldurmaSuresi = Math.round(hamSeferSuresi * 1.10);

        const doldurBosaltDk = seferSayisi * tankDoldurmaSuresi;
        const toplamOperasyonDk = netYikamaDk + doldurBosaltDk;

        // 5. Akü Deşarj (DoD) ve Vardiya / Şarj Analizi
        const aktifMotorDakika = Math.max(0, netYikamaDk - (operasyonModu.beklemeSuresiDk || 0)) + (seferSayisi * ulasimSuresiDk);
        const harcananSaat = aktifMotorDakika / 60;
        const kullanilabilirAku =
            akuKapasitesi >= 99
                ? 99
                : Math.round(akuKapasitesi * yasFaktoru * 10) / 10;

        let akuDurumText = '';
        let akuDurumTipi = 'success';
        let akuYeterliMi = true;
        let gerekenSarjSayisi = 0;

        if (akuKapasitesi >= 99) {
            akuDurumText = '⚡ Kablolu sistem — kesintisiz şebeke enerjisi (şarj sınırı yok).';
        } else if (harcananSaat <= kullanilabilirAku) {
            const dodYuzde = Math.min(100, Math.round((harcananSaat / Math.max(0.1, kullanilabilirAku)) * 100));
            akuDurumText = `✅ Tek Şarj Yeterli (Motor: ${harcananSaat.toFixed(1).replace('.', ',')} sa / Kapasite: ${kullanilabilirAku.toString().replace('.', ',')} sa — %${dodYuzde} Deşarj)`;
            if (dodYuzde > 85) {
                akuDurumTipi = 'warning';
                akuDurumText += ' ⚠️ Sınırda (%80 DoD üstü)';
            }
        } else {
            akuYeterliMi = false;
            akuDurumTipi = 'danger';
            gerekenSarjSayisi = Math.max(1, Math.ceil(harcananSaat / Math.max(0.2, kullanilabilirAku)) - 1);
            const sarjBilgisi = aktifMakine.tamSarjSure || '8-10 Saat';
            akuDurumText = `❌ Tek Şarjla Bitmez! İhtiyaç: ${harcananSaat.toFixed(1).replace('.', ',')} sa / Mevcut Akü: ${kullanilabilirAku.toString().replace('.', ',')} sa (${gerekenSarjSayisi} kez ara şarj [${sarjBilgisi}], Yedek Akü veya 2. Makine gerekir)`;
        }

        // 6. Akıllı Ped/Fırça Önerisi ve Mekanik/Zemin Uyumluluk Denetimi
        const onerilenPedler = getAkilliPedOnerisi(zemin, kirYogunlugu, aktifMakine, isCilaliZemin);
        const zeminBilgisi = zemin || 'Belirtilmemiş Zemin';
        const kirBilgisi = kirYogunlugu || 'Belirtilmemiş Yoğunluk';
        const secilenBasitAd = seciliPedAdi || 'Aparat seçilmedi';
        const onerilenlerText = onerilenPedler.length > 0 ? onerilenPedler.join(' veya ') : '';

        let uyumDurumu = 'warning';
        let uyumMesaji = 'Önerilen ped/fırçalar ile seçiminizi karşılaştırın.';

        // Mekanik ve Kritik Zemin Kontrolleri (Öncelikli)
        const mekanikUyumsuz =
            (kafaTipi === 'Silindirik' && seciliPedAdi && !isFirca) ||
            (kafaTipi === 'Disk' && seciliPedAdi && isCylinderBrush(seciliPedAdi));
        const cilaliZeminTehlikesi =
            isCilaliZemin &&
            seciliPedAdi &&
            (isStrippingPad(seciliPedAdi) || isTynexBrush(seciliPedAdi) || (pedAdiLower.includes('yesil') && !isTwister) || pedAdiLower.includes('twister kirmizi') || pedAdiLower.includes('twister beyaz'));
        const kaymazZeminMelaminTehlikesi =
            isSafetyFloor(zemin) && seciliPedAdi && (isMelaminePad(seciliPedAdi) || isMicrofiberPad(seciliPedAdi));

        if (!seciliPedAdi) {
            uyumDurumu = 'warning';
            uyumMesaji = 'Lütfen makineye ve zemine uygun bir ped veya fırça seçiniz.';
        } else if (mekanikUyumsuz || cilaliZeminTehlikesi || kaymazZeminMelaminTehlikesi) {
            uyumDurumu = 'danger';
            const sebep = getIncompatibilityReason(secilenBasitAd, zemin, kirYogunlugu, aktifMakine, isCilaliZemin);
            uyumMesaji = `❌ Kritik Uyumsuzluk! ${sebep} (Tavsiye edilen: ${onerilenlerText})`;
        } else if (onerilenPedler.length === 0) {
            uyumDurumu = 'warning';
            uyumMesaji = 'Bu kombinasyon için özel bir sistem önerimiz bulunmuyor.';
        } else if (
            onerilenPedler.some(p => {
                const pNorm = normalizeString(p);
                return pedAdiLower.includes(pNorm) || pNorm.includes(pedAdiLower);
            })
        ) {
            uyumDurumu = 'success';
            uyumMesaji = `✅ Seçiminiz tam uyumlu! (${zeminBilgisi} üzerinde ${kirBilgisi} kir için ${secilenBasitAd} idealdir.)`;
            if (isTwister && (pedAdiLower.includes('beyaz') || pedAdiLower.includes('sari'))) {
                uyumMesaji += ' 💎 Not: Twister restorasyonu Beyaz (Adım 1) → Sarı (Adım 2) → Yeşil (Adım 3) olarak sıralı uygulanmalıdır.';
            }
        } else if (
            isFirca && onerilenPedler.some(p => isBrush(p))
        ) {
            uyumDurumu = 'info';
            uyumMesaji = `⚠️ Alternatif Fırça Seçimi. (Birincil önerimiz: ${onerilenlerText}. Seçiminiz: ${secilenBasitAd}.)`;
        } else if (
            (isTwister && onerilenPedler.some(p => isTwisterPad(p))) ||
            (!isTwister && !isMelaminePad(pedAdiLower) && onerilenPedler.some(p => !isTwisterPad(p)))
        ) {
            // Eğer tehlikeli bir zemin çizme durumu varsa danger'a düşür
            const sebep = getIncompatibilityReason(secilenBasitAd, zemin, kirYogunlugu, aktifMakine, isCilaliZemin);
            if (sebep.includes('çizer') || sebep.includes('parçalanır') || sebep.includes('sökemez') || sebep.includes('tıkanır')) {
                uyumDurumu = 'danger';
                uyumMesaji = `❌ Uyumsuz seçim! (${sebep} Tavsiye edilen: ${onerilenlerText})`;
            } else {
                uyumDurumu = 'info';
                uyumMesaji = `⚠️ Kısmi uyum. (${zeminBilgisi} / ${kirBilgisi} kir için asıl önerimiz: ${onerilenlerText}. Seçiminiz: ${secilenBasitAd}.)`;
            }
        } else {
            uyumDurumu = 'danger';
            const sebep = getIncompatibilityReason(secilenBasitAd, zemin, kirYogunlugu, aktifMakine, isCilaliZemin);
            uyumMesaji = `❌ Uyumsuz seçim! (${sebep} Tavsiye edilen: ${onerilenlerText})`;
        }

        // 7. Gerçekçi Aparat Ömrü (Fırça vs Elmas Ped vs Polyester Ped vs Melamin)
        let teorikOmur = 10000; // Standart polyester ped varsayılanı
        if (isTynexBrush(pedAdiLower)) {
            teorikOmur = 350000; // Silisyum karbürlü Tynex fırça (300.000 - 500.000 m²)
        } else if (isFirca) {
            teorikOmur = 250000; // Polipropilen yıkama fırçası / rulo fırça (200.000 - 350.000 m²)
        } else if (isTwister) {
            if (pedAdiLower.includes('hibrit') || pedAdiLower.includes('extreme')) teorikOmur = 15000;
            else if (pedAdiLower.includes('kirmizi')) teorikOmur = 20000;
            else if (pedAdiLower.includes('beyaz') || pedAdiLower.includes('sari')) teorikOmur = 25000;
            else teorikOmur = 30000; // Twister Yeşil / Günlük bakım elmas ped
        } else if (isMelaminePad(pedAdiLower)) {
            teorikOmur = 3500; // Melamin ped düz zeminde 3.000 - 4.000 m²
        } else if (isMicrofiberPad(pedAdiLower)) {
            teorikOmur = 7500; // Mikrofiber ped (yıkanabilir toplam ömür)
        } else if (isStrippingPad(pedAdiLower)) {
            teorikOmur = 8000; // Siyah / Kahverengi cila sökme pedi
        } else if (pedAdiLower.includes('beyaz') || pedAdiLower.includes('kirmizi')) {
            teorikOmur = 12000; // Yumuşak bakım/parlatma pedi
        }

        // 8. Fırça Sayısı, Ebat ve Birim Yüzey Basıncı (g/cm²)
        let fircaSayisi = Number(aktifMakine.fircaSayisi);
        if (!fircaSayisi || fircaSayisi < 1 || isNaN(fircaSayisi)) {
            const ebatMatch = (aktifMakine.ebat || aktifMakine.fircaPedEbatlari || '').match(/^(\d+)\s*x/i);
            fircaSayisi = ebatMatch ? parseInt(ebatMatch[1], 10) : 1;
        }

        const calismaGenisligi = Number(aktifMakine.calismaGenisligi) || 43;
        let hesaplananEbat = aktifMakine.ebat || aktifMakine.fircaPedEbatlari;
        if (!hesaplananEbat && calismaGenisligi > 0) {
            const tekFircaCm = calismaGenisligi / fircaSayisi;
            const tekFircaInch = Math.round(tekFircaCm / 2.54);
            hesaplananEbat = `${fircaSayisi} x ${tekFircaInch} inç (${Math.round(tekFircaCm)} cm)`;
        } else if (!hesaplananEbat) {
            hesaplananEbat = 'Bilinmiyor';
        }

        const basincBilgisi = calculateSpecificPressure(
            aktifMakine.fircaBasinci || aktifMakine.basinc,
            calismaGenisligi,
            fircaSayisi,
            kafaTipi
        );

        const yipranmaCarpani = calculateWearFactor(
            aktifMakine.fircaBasinci || aktifMakine.basinc,
            zemin,
            kirYogunlugu,
            calismaGenisligi,
            fircaSayisi,
            kafaTipi,
            seciliPedAdi
        );

        const kullanimOrani = (alanInput / teorikOmur) * yipranmaCarpani;
        const yipranmaOrani = (kullanimOrani * 100).toFixed(1).replace('.', ',');

        const setSayisi = Math.max(1, Math.ceil(kullanimOrani));
        const gerekliAdet = setSayisi * fircaSayisi;
        const gerekliMakineSayisi = maxYikamaKapasitesi > 0 ? Math.max(1, Math.ceil(alanInput / maxYikamaKapasitesi)) : 1;

        return {
            pratikM2,
            kaynakSuTuketimi,
            kimyasal,
            isTwister,
            isFirca,
            kafaTipi,
            operasyonModu,
            basincBilgisi,
            netYikamaDk,
            doldurBosaltDk,
            toplamOperasyonDk,
            harcananSaat,
            akuDurumText,
            akuDurumTipi,
            akuYeterliMi,
            gerekenSarjSayisi,
            onerilenPedler,
            uyumDurumu,
            uyumMesaji,
            teorikOmur,
            yipranmaOrani,
            gerekliAdet,
            seferSayisi,
            tankDoldurmaSuresi,
            yasFaktoru,
            kullanilabilirAku,
            gerekliMakineSayisi,
            maxYikamaKapasitesi,
            hesaplananEbat
        };
    }, [aktifMakine, aktifAparat, alanInput, sektor, zemin, kirTuru, kirYogunlugu, makineYasi, isCilaliZemin]);
}
