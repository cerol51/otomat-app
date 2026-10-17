import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calculator, CheckCircle, Download, Coins, ChevronDown, ChevronUp } from 'lucide-react';
import { TableRow } from '../TableRow';
import { dakikaFormatla } from '../../utils/calculations';

const STATUS_COLORS = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger:  'bg-rose-50  text-rose-700  border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info:    'bg-sky-50   text-sky-700   border-sky-200',
};

/**
 * Dashboard'un sağ sütunu: hesaplama sonuçları, maliyet analizi ve aksiyon butonları.
 * id="report-content" div'i PDF export için burada tanımlanmıştır.
 */
export function ResultPanel({
    musteriAdi, alanInput,
    aktifMakine, aktifAparat, hesaplamalar,
    birimMaliyetler, onMaliyetChange,
    isSaving, saveSuccess, onSaveReport,
    isExporting, onExportPDF, onOpenScenario,
}) {
    const [showCostInputs, setShowCostInputs] = useState(false);

    const {
        pratikM2, kaynakSuTuketimi, kimyasal, isTwister, isFirca,
        kafaTipi, operasyonModu, basincBilgisi,
        netYikamaDk, doldurBosaltDk, toplamOperasyonDk,
        akuDurumText, akuDurumTipi, uyumDurumu, uyumMesaji,
        teorikOmur, yipranmaOrani, gerekliAdet,
        seferSayisi, tankDoldurmaSuresi,
        maxYikamaKapasitesi, hesaplananEbat
    } = hesaplamalar;

    const toplamSureDk   = netYikamaDk + doldurBosaltDk;
    const yikamaYuzde    = toplamSureDk > 0 ? Math.round((netYikamaDk    / toplamSureDk) * 100) : 0;
    const bosaltYuzde    = toplamSureDk > 0 ? (100 - yikamaYuzde) : 0;

    // ── Finansal Maliyet Hesaplamaları (TL) ──
    const suMaliyeti       = (kaynakSuTuketimi / 1000) * (birimMaliyetler?.suM3Fiyat || 0);
    const kimyasalLitreNum = parseFloat(kimyasal.litre) || 0;
    const kimyasalMaliyeti = kimyasalLitreNum * (birimMaliyetler?.kimyasalLtFiyat || 0);
    // Ped maliyeti: Bu operasyondaki yıpranma oranına düşen amortisman maliyeti
    const yipranmaOraniNum = parseFloat((yipranmaOrani || '0').replace(',', '.')) / 100;
    const fircaSayisi      = Number(aktifMakine.fircaSayisi) || 1;
    const pedAmortismanMaliyeti = Math.min(gerekliAdet, Math.max(yipranmaOraniNum * fircaSayisi, 0.005)) * (birimMaliyetler?.pedAdetFiyat || 0);
    const iscilikMaliyeti  = (toplamOperasyonDk / 60) * (birimMaliyetler?.iscilikSaatFiyat || 0);
    const toplamOperasyonMaliyeti = suMaliyeti + kimyasalMaliyeti + pedAmortismanMaliyeti + iscilikMaliyeti;
    const aylikMaliyet     = toplamOperasyonMaliyeti * 26; // Ayda 26 iş günü varsayımı

    const formatTL = (val) => val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';

    return (
        <div className="lg:col-span-8 flex flex-col gap-6">

            {/* ── Başlık + Butonlar ── */}
            <div className="flex justify-between items-center no-print mb-2">
                <h1 className="text-2xl font-extrabold text-slate-800 hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    {musteriAdi ? `${musteriAdi} — Operasyonel Rapor` : 'Operasyonel Rapor'}
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={onSaveReport}
                        disabled={isSaving || saveSuccess}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 ${
                            saveSuccess
                                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        {saveSuccess
                            ? <><CheckCircle size={16} /> Kaydedildi</>
                            : <><FileText size={16} /> {isSaving ? 'Kaydediliyor...' : 'Raporu Kaydet'}</>
                        }
                    </button>
                    <button
                        onClick={onExportPDF}
                        disabled={isExporting}
                        className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <Download size={16} /> {isExporting ? 'Hazırlanıyor...' : 'PDF İndir'}
                    </button>
                </div>
            </div>

            {/* ── PDF İçeriği ── */}
            <div id="report-content" className="flex flex-col gap-6">

                {/* Müşteri / Tesis Kurumsal Başlık Kartı (Varsa gösterilir) */}
                {musteriAdi && (
                    <div className="glass-card rounded-2xl px-6 py-4 shadow-sm border-l-4 border-l-indigo-600 flex justify-between items-center bg-white/90">
                        <div>
                            <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">Müşteri / Tesis Analiz Raporu</p>
                            <h2 className="text-xl font-black text-slate-800">{musteriAdi}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold text-slate-400">{new Date().toLocaleDateString('tr-TR')}</p>
                            <p className="text-sm font-bold text-slate-700">{Number(alanInput).toLocaleString('tr-TR')} m² Temizlik Alanı</p>
                        </div>
                    </div>
                )}

                {/* Ekipman Özeti */}
                <motion.div
                    key={`equip-${aktifMakine.id}-${pratikM2}-${Math.round(maxYikamaKapasitesi)}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-6 shadow-lg shadow-slate-200/50 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 relative overflow-hidden border-t-4 border-t-indigo-500"
                >
                    <div className="absolute right-0 top-0 w-40 h-40 bg-indigo-50/50 rounded-bl-full -mr-12 -mt-12" />
                    <div className="z-10 text-center sm:text-left">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1.5">Seçilen Ekipman</p>
                        <h2 className="text-3xl font-black text-slate-900">{aktifMakine.model}</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                            {aktifMakine.marka} <span className="text-slate-300 mx-1">|</span> {aktifMakine.surus} <span className="text-slate-300 mx-1">|</span> <span className="text-indigo-600 font-semibold">{kafaTipi} Kafa</span>
                        </p>
                    </div>
                    <div className="z-10 flex gap-3 text-center sm:text-right">
                        <div className="bg-white/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-blue-100/80 shadow-sm">
                            <p className="text-[10px] text-blue-600 uppercase tracking-wider font-bold mb-0.5">Efektif Tek Şarj Alanı</p>
                            <p className="text-2xl font-mono font-bold text-blue-700">
                                {aktifMakine.surus === 'Kablolu' ? 'Sınırsız' : Math.round(maxYikamaKapasitesi).toLocaleString('tr-TR')} <span className="text-sm font-sans text-blue-500 font-semibold">{aktifMakine.surus !== 'Kablolu' ? 'm²' : ''}</span>
                            </p>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-green-100/80 shadow-sm">
                            <p className="text-[10px] text-green-600 uppercase tracking-wider font-bold mb-0.5">Pratik Kapasite</p>
                            <p className="text-2xl font-mono font-bold text-green-700">
                                {pratikM2} <span className="text-sm font-sans text-green-500 font-semibold">m²/s</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Kalite Kontrol */}
                <div className="glass-card rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 border-t-4 border-t-blue-500">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4 text-[14px] font-bold flex items-center tracking-wide shadow-sm">
                        <CheckCircle className="mr-3 text-blue-400" size={20} />
                        KALİTE KONTROL VE KİMYASAL DOZAJLAMA
                    </div>
                    <div className="flex flex-col divide-y divide-gray-100/80">
                        <TableRow label="Fırça/Ped Ebadı ve Birim Basınç:">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-slate-900 bg-indigo-50/80 px-3 py-1 rounded-full border border-indigo-100 text-xs">
                                    {hesaplananEbat} ({kafaTipi})
                                </span>
                                {basincBilgisi && (
                                    <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-xs">
                                        Baskı: {basincBilgisi.etiket}
                                    </span>
                                )}
                            </div>
                        </TableRow>
                        <TableRow label="Ped/Fırça Kullanım Senaryosu:" bg="bg-slate-50/30">
                            <span className="font-bold text-slate-900">{aktifAparat.ad || 'Aparat Seçilmedi'}:</span>{' '}
                            <span className="text-slate-600">{aktifAparat.aciklama}</span>
                        </TableRow>
                        <TableRow label="Kimyasal Türü ve Dozajı:">
                            <div className="flex flex-col gap-1.5">
                                <div>
                                    <span className={`inline-block font-medium px-3 py-1 rounded-full text-xs border ${
                                        kimyasal.aciklama.includes('YASAK')
                                            ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                                            : kimyasal.litre === '0'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        {kimyasal.litre === '0'
                                            ? kimyasal.aciklama
                                            : `Max. %${kimyasal.dozajYuzdesi.toFixed(1)} – ${kimyasal.aciklama}`
                                        }
                                    </span>
                                </div>
                                {kimyasal.uyari && (
                                    <p className="text-xs font-semibold text-amber-800 bg-amber-50/70 border border-amber-200/70 rounded-lg px-3 py-1.5">
                                        💡 {kimyasal.uyari}
                                    </p>
                                )}
                            </div>
                        </TableRow>
                        <TableRow label="Aparat & Zemin Uyumluluk Durumu:" bg="bg-slate-50/30">
                            <span className={`inline-block px-4 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${STATUS_COLORS[uyumDurumu]}`}>
                                {uyumMesaji}
                            </span>
                        </TableRow>
                    </div>
                </div>

                {/* Operasyonel Analiz */}
                <div className="glass-card rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 border-t-4 border-t-amber-500">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4 text-[14px] font-bold flex items-center tracking-wide shadow-sm">
                        <Calculator className="mr-3 text-amber-400" size={20} />
                        OPERASYONEL ZAMAN VE KAYNAK ANALİZİ
                    </div>
                    <div className="flex flex-col divide-y divide-gray-100/80">
                        {operasyonModu && (
                            <TableRow label="Operasyon Yıkama Modu:" bg="bg-slate-50/30">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                            operasyonModu.ciftGecisMi
                                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                : 'bg-sky-50 text-sky-700 border-sky-200'
                                        }`}>
                                            {operasyonModu.modAdi}
                                        </span>
                                        {operasyonModu.sureCarpani !== 1.0 && (
                                            <span className="text-xs text-slate-500 font-semibold">
                                                (Süre Çarpanı: {operasyonModu.sureCarpani}x{operasyonModu.beklemeSuresiDk > 0 ? ` + ${operasyonModu.beklemeSuresiDk} dk reaksiyon` : ''})
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-500">{operasyonModu.aciklama}</span>
                                </div>
                            </TableRow>
                        )}
                        <TableRow label="Kaynak Tüketimi (Su/Kimyasal):">
                            <span className="text-blue-500 mr-1.5 text-lg leading-none">💧</span>
                            <span className="text-slate-700">Su: <b className="text-slate-900">{kaynakSuTuketimi} L</b></span>
                            <span className="mx-4 text-slate-300">|</span>
                            <span className="text-emerald-500 mr-1.5 text-lg leading-none">🧪</span>
                            <span className="text-slate-700">Kimyasal: <b className="text-slate-900">{kimyasal.litre} L</b></span>
                        </TableRow>
                        <TableRow label="Ped/Fırça Aşınma / Yıpranma Oranı:" bg="bg-slate-50/30">
                            <span className="text-slate-500 mr-1.5 text-lg leading-none">🔄</span>
                            <span className="text-slate-700">Teorik Ömür: <b className="text-slate-900">{teorikOmur.toLocaleString('tr-TR')} m²</b></span>
                            <span className="mx-4 text-slate-300">|</span>
                            <span className="text-slate-500 mr-1.5 text-lg leading-none">📉</span>
                            <span className="text-slate-700">Yıpranma: <b className="text-slate-900">%{yipranmaOrani}</b></span>
                            <span className="mx-4 text-slate-300">|</span>
                            <span className="text-blue-500 mr-1.5 text-lg leading-none">🧽</span>
                            <span className="text-slate-700">
                                Tüketim: <b className="text-slate-900">{gerekliAdet} adet</b>{' '}
                                {isFirca ? 'fırça' : 'ped'}
                            </span>
                        </TableRow>
                        <TableRow label="Akü (Şarj) ve Vardiya Uygunluğu:">
                            <span className={`inline-block px-4 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${STATUS_COLORS[akuDurumTipi]}`}>
                                {akuDurumText}
                            </span>
                        </TableRow>
                        <TableRow label="Doldur/Boşalt Detayı" bg="bg-slate-50/30">
                            <span className="text-slate-500 text-sm">Toplam Su:</span>{' '}
                            <span className="font-bold text-slate-900">{kaynakSuTuketimi} L</span>
                            <span className="mx-2 text-slate-300">|</span>
                            <span className="text-slate-500 text-sm">Tank:</span>{' '}
                            <span className="font-bold text-slate-900">{aktifMakine.temizSuTanki || aktifMakine.tank || 0} L</span>
                            <span className="mx-2 text-slate-300">|</span>
                            <span className="text-slate-500 text-sm">Sefer:</span>{' '}
                            <span className="font-bold text-slate-900">{seferSayisi}</span>
                            <span className="mx-2 text-slate-300">|</span>
                            <span className="text-slate-500 text-sm">Süre/Sefer:</span>{' '}
                            <span className="font-bold text-slate-900">{tankDoldurmaSuresi} dk</span>
                        </TableRow>
                        <TableRow label="Zaman Etüdü (Görsel)">
                            <div className="w-full">
                                <div className="flex justify-between text-xs text-slate-500 font-medium mb-1">
                                    <span>Net Yıkama: <b className="text-slate-800">{dakikaFormatla(netYikamaDk)}</b></span>
                                    <span>Doldur/Boşalt: <b className="text-slate-800">{dakikaFormatla(doldurBosaltDk)}</b></span>
                                    <span className="font-bold text-slate-900 bg-slate-200/50 px-2 py-0.5 rounded">
                                        Toplam: {dakikaFormatla(toplamOperasyonDk)}
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill bg-gradient-to-r from-blue-500 to-indigo-500"
                                        style={{ width: `${yikamaYuzde}%` }}
                                    />
                                    <div
                                        className="progress-fill bg-gradient-to-r from-emerald-500 to-teal-500"
                                        style={{ width: `${bosaltYuzde}%` }}
                                    />
                                </div>
                            </div>
                        </TableRow>
                    </div>
                </div>

                {/* ── Finansal Maliyet ve Tasarruf Analizi ── */}
                <div className="glass-card rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 border-t-4 border-t-emerald-500">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4 text-[14px] font-bold flex justify-between items-center tracking-wide shadow-sm">
                        <div className="flex items-center">
                            <Coins className="mr-3 text-emerald-400" size={20} />
                            TAHMİNİ OPERASYONEL MALİYET ANALİZİ
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowCostInputs(prev => !prev)}
                            className="text-xs bg-white/10 hover:bg-white/20 text-emerald-300 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors no-print"
                        >
                            Birim Fiyatları Düzenle {showCostInputs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>

                    {showCostInputs && (
                        <div className="p-4 bg-emerald-50/40 border-b border-emerald-100 grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
                            {[
                                { key: 'suM3Fiyat',        label: 'Su (m³ / 1000L ₺)' },
                                { key: 'kimyasalLtFiyat',  label: 'Kimyasal (1 Lt ₺)' },
                                { key: 'pedAdetFiyat',     label: 'Ped/Fırça (Adet ₺)' },
                                { key: 'iscilikSaatFiyat', label: 'İşçilik (Saatlik ₺)' },
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">{label}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={birimMaliyetler?.[key] ?? 0}
                                        onChange={e => onMaliyetChange(key, e.target.value)}
                                        className="w-full border border-emerald-200 bg-white rounded-lg p-2 text-xs font-bold text-slate-800 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="p-5 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[11px] font-bold text-slate-400 uppercase">Su + Kimyasal</p>
                            <p className="text-sm font-extrabold text-slate-800 mt-1">{formatTL(suMaliyeti + kimyasalMaliyeti)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[11px] font-bold text-slate-400 uppercase">Ped Amortismanı</p>
                            <p className="text-sm font-extrabold text-slate-800 mt-1">{formatTL(pedAmortismanMaliyeti)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[11px] font-bold text-slate-400 uppercase">Personel / İşçilik</p>
                            <p className="text-sm font-extrabold text-slate-800 mt-1">{formatTL(iscilikMaliyeti)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                            <p className="text-[11px] font-bold text-emerald-700 uppercase">Tek Temizlik</p>
                            <p className="text-base font-black text-emerald-800 mt-1">{formatTL(toplamOperasyonMaliyeti)}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                            <p className="text-[11px] font-bold text-indigo-700 uppercase">Aylık (26 Gün)</p>
                            <p className="text-base font-black text-indigo-800 mt-1">{formatTL(aylikMaliyet)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Senaryo Butonu ── */}
            <div className="glass-card rounded-2xl p-6 shadow-lg shadow-slate-200/50 border-t-4 border-t-rose-500 flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">🧼 Yıkama Senaryosu</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Seçtiğiniz parametrelere göre adım adım yıkama talimatlarını görüntüleyin.
                    </p>
                </div>
                <button
                    onClick={onOpenScenario}
                    className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-500/30 flex items-center gap-2"
                >
                    <FileText size={18} /> Senaryoyu Aç
                </button>
            </div>
        </div>
    );
}
