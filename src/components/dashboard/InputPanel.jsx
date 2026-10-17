import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ArrowDown } from 'lucide-react';
import { InputWrap } from '../InputWrap';
import { MachineRecommendation } from './MachineRecommendation';
import {
    isPvcOrVinyl,
    isNaturalStone,
    hasHeavyDirt,
    getMachineHeadType,
    isBrush,
    normalizeString
} from '../../utils/helpers';

/**
 * Dashboard'un sol sütunu: alan/tesis bilgileri ve makine/aparat seçimi.
 * Tüm form girdilerini ve dropdown'ları barındırır.
 */
export function InputPanel({
    // Veri listeleri
    zeminTipleri, sektorelVeriler, kirYogunluklari, yasSecenekleri,
    markalar, surusTipleri, kategoriler, aparatVeritabani, makineVeritabani,
    filtrelenmisMakineler, aktifMakine, onerilenPedler,
    // Form değerleri
    musteriAdi, alanInput, sektor, zemin, kirTuru, kirYogunlugu, isCilaliZemin,
    seciliMarka, seciliSurus, seciliMakineId, makineYasi,
    seciliKategori, seciliAparatId,
    // Event handler'lar
    setMusteriAdi, handleAlanChange, handleSektorChange,
    setZemin, setKirTuru, setKirYogunlugu, setIsCilaliZemin,
    setSeciliMarka, setSeciliSurus, setSeciliMakineId,
    setMakineYasi, setSeciliKategori, setSeciliAparatId,
    onSelectRecommendedMachine,
    onScrollToResults
}) {
    const selectBase =
        'w-full border border-gray-200/80 bg-white/60 rounded-xl p-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 outline-none cursor-pointer shadow-sm appearance-none transition-all';

    // ── Memoized Options ──
    const sektorOptions = useMemo(() => Object.keys(sektorelVeriler || {}), [sektorelVeriler]);
    const kirTuruOptions = useMemo(() => sektorelVeriler[sektor]?.kirler || [], [sektorelVeriler, sektor]);
    const filtrelenmisAparatlar = useMemo(
        () => aparatVeritabani.filter(a => !seciliKategori || a.kategori === seciliKategori),
        [aparatVeritabani, seciliKategori]
    );
    const kafaTipi = useMemo(() => getMachineHeadType(aktifMakine), [aktifMakine]);
    const isSiraliRestorasyon = useMemo(
        () => isNaturalStone(zemin) && hasHeavyDirt(kirYogunlugu) && !isCilaliZemin,
        [zemin, kirYogunlugu, isCilaliZemin]
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 no-print"
        >
            {/* ── Alan ve Tesis Bilgileri ── */}
            <div className="glass-card rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 border-t-4 border-t-indigo-500">
                <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100/80 px-5 py-4 font-bold text-slate-800 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-lg">🏢</span>
                    <span>1. Alan ve Tesis Bilgileri</span>
                </div>
                <div className="p-5">
                    <InputWrap label="Müşteri / Tesis Adı (Opsiyonel)" htmlFor="musteriAdiInput">
                        <input
                            id="musteriAdiInput"
                            type="text"
                            maxLength={80}
                            placeholder="Örn: X Lojistik Merkez Depo"
                            value={musteriAdi || ''}
                            onChange={e => setMusteriAdi(e.target.value)}
                            className="w-full border border-gray-200/80 bg-white/60 rounded-xl p-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
                        />
                    </InputWrap>

                    <InputWrap label="Alan (m²)" htmlFor="alanInput">
                        <input
                            id="alanInput"
                            type="number"
                            min="1"
                            max="1000000"
                            value={alanInput}
                            onChange={handleAlanChange}
                            className="w-full border border-gray-200/80 bg-white/60 rounded-xl p-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
                        />
                    </InputWrap>

                    <div className="grid grid-cols-2 gap-4">
                        <InputWrap label="Sektör" htmlFor="sektorSelect">
                            <select
                                id="sektorSelect"
                                value={sektor}
                                onChange={e => handleSektorChange(e.target.value)}
                                className={`${selectBase} focus:border-indigo-500 focus:ring-indigo-500/20`}
                            >
                                <option value="">Seçiniz...</option>
                                {sektorOptions.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </InputWrap>
                        <div className="flex flex-col gap-2">
                            <InputWrap label="Zemin Türü" htmlFor="zeminSelect">
                                <select
                                    id="zeminSelect"
                                    value={zemin}
                                    onChange={e => setZemin(e.target.value)}
                                    className={`${selectBase} focus:border-indigo-500 focus:ring-indigo-500/20`}
                                >
                                    <option value="">Seçiniz...</option>
                                    {zeminTipleri.map(z => <option key={z} value={z}>{z}</option>)}
                                </select>
                            </InputWrap>
                            
                            {(isPvcOrVinyl(zemin) || isNaturalStone(zemin)) && (
                                <div className="mt-1 flex items-center justify-between p-2 rounded-xl bg-white/50 border border-indigo-100">
                                    <label htmlFor="cilaliZeminToggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                        Zemin Cilalı mı?
                                    </label>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            id="cilaliZeminToggle"
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={isCilaliZemin}
                                            onChange={(e) => setIsCilaliZemin(e.target.checked)}
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-1">
                        <InputWrap label="Kir Türü" htmlFor="kirTuruSelect">
                            <select
                                id="kirTuruSelect"
                                value={kirTuru}
                                onChange={e => setKirTuru(e.target.value)}
                                className={`${selectBase} focus:border-indigo-500 focus:ring-indigo-500/20`}
                            >
                                <option value="">Seçiniz...</option>
                                {kirTuruOptions.map(k => (
                                    <option key={k} value={k}>{k}</option>
                                ))}
                            </select>
                        </InputWrap>
                        <InputWrap label="Kir Yoğunluğu" htmlFor="kirYogunluguSelect">
                            <select
                                id="kirYogunluguSelect"
                                value={kirYogunlugu}
                                onChange={e => setKirYogunlugu(e.target.value)}
                                className={`${selectBase} focus:border-indigo-500 focus:ring-indigo-500/20`}
                            >
                                <option value="">Seçiniz...</option>
                                {kirYogunluklari.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </InputWrap>
                    </div>
                </div>
            </div>

            {/* ── Akıllı Makine Önerisi ── */}
            <MachineRecommendation
                alanInput={Number(alanInput)}
                kirYogunlugu={kirYogunlugu}
                makineYasi={makineYasi}
                makineVeritabani={makineVeritabani}
                onSelectMachine={onSelectRecommendedMachine}
            />

            {/* ── Makine ve Ped/Fırça Seçimi ── */}
            <div className="glass-card rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 border-t-4 border-t-emerald-500">
                <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100/80 px-5 py-4 font-bold text-slate-800 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 text-lg">⚙️</span>
                    <span>2. Makine ve Ped/Fırça Seçimi</span>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-2 gap-4">
                        <InputWrap label="Marka" htmlFor="markaSelect">
                            <select
                                id="markaSelect"
                                value={seciliMarka}
                                onChange={e => setSeciliMarka(e.target.value)}
                                className={`${selectBase} focus:border-emerald-500 focus:ring-emerald-500/20`}
                            >
                                <option value="">Seçiniz...</option>
                                {markalar.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </InputWrap>
                        <InputWrap label="Sürüş Tipi" htmlFor="surusSelect">
                            <select
                                id="surusSelect"
                                value={seciliSurus}
                                onChange={e => setSeciliSurus(e.target.value)}
                                className={`${selectBase} focus:border-emerald-500 focus:ring-emerald-500/20`}
                            >
                                <option value="">Seçiniz...</option>
                                {surusTipleri.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </InputWrap>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputWrap label="Kullanılacak Makine" htmlFor="makineSelect">
                            {filtrelenmisMakineler.length > 0 ? (
                                <select
                                    id="makineSelect"
                                    disabled={!seciliMarka || !seciliSurus}
                                    value={seciliMakineId ?? ''}
                                    onChange={e => setSeciliMakineId(e.target.value)}
                                    className={`w-full border-2 bg-emerald-50/50 text-slate-900 rounded-xl p-2.5 text-sm font-bold outline-none shadow-sm transition-all ${
                                        (!seciliMarka || !seciliSurus)
                                        ? 'border-gray-200 text-gray-400 bg-gray-50/50 cursor-not-allowed opacity-70'
                                        : 'border-emerald-400/60 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 cursor-pointer'
                                    }`}
                                >
                                    <option value="">{(!seciliMarka || !seciliSurus) ? 'Önce marka/sürüş seçin' : 'Seçiniz...'}</option>
                                    {filtrelenmisMakineler.map(m => (
                                        <option key={m.id} value={m.id}>{m.model}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-2.5 border border-rose-200 bg-rose-50/50 text-rose-600 text-sm font-medium rounded-xl">
                                    {(!seciliMarka || !seciliSurus) ? 'Önce marka/sürüş seçin' : 'Filtreye uygun makine bulunamadı.'}
                                </div>
                            )}
                        </InputWrap>
                        <InputWrap label="Makine Yaşı" htmlFor="makineYasiSelect">
                            <select
                                id="makineYasiSelect"
                                disabled={!seciliMakineId}
                                value={makineYasi}
                                onChange={e => setMakineYasi(e.target.value)}
                                className={`${selectBase} focus:border-emerald-500 focus:ring-emerald-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-70`}
                            >
                                <option value="">{!seciliMakineId ? 'Önce makine seçin' : 'Seçiniz...'}</option>
                                {yasSecenekleri.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </InputWrap>
                    </div>

                    {/* Makine Kafa Tipi (Disk vs Silindirik) Mühendislik Bildirimi */}
                    {aktifMakine && (
                        <div className={`mt-1 mb-3 px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                            kafaTipi === 'Silindirik'
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-800'
                        }`}>
                            <span>{kafaTipi === 'Silindirik' ? '⚠️' : '💿'}</span>
                            <span>
                                {kafaTipi === 'Silindirik'
                                    ? 'Silindirik (Rulo) Fırça Kafası: Yuvarlak ped takılamaz, sadece Rulo/Yıkama Fırçası seçilmelidir.'
                                    : 'Disk Fırça Kafası: Ped tutucu ile tüm yuvarlak pedler ve disk fırçalar kullanılabilir.'}
                            </span>
                        </div>
                    )}

                    {/* Akıllı Ped Önerisi */}
                    {(zemin && kirTuru && kirYogunlugu) && (
                        <motion.div
                            key={onerilenPedler.join(',')}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 mb-5 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-start gap-3 shadow-sm"
                        >
                            <span className="text-xl mt-0.5">💡</span>
                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1.5">
                                    Akıllı Sistem Önerisi {kafaTipi === 'Silindirik' ? '(Rulo Kafa Uyumlu)' : ''}
                                </p>
                                {isSiraliRestorasyon && kafaTipi !== 'Silindirik' && (
                                    <p className="text-[11px] font-semibold text-indigo-700 bg-indigo-50/90 border border-indigo-200 rounded-lg px-2.5 py-1 mb-2">
                                        💎 Doğal Taş Restorasyonu 3 Adımlı Sıralı İşlemdir: 1. Twister Beyaz → 2. Twister Sarı → 3. Twister Yeşil
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {onerilenPedler.length > 0 ? (
                                        onerilenPedler.map((ped, idx) => {
                                            const normalizedPed = normalizeString(ped || '');
                                            let aparat = aparatVeritabani.find(a => {
                                                const normalizedAd = normalizeString(a.ad || '');
                                                return normalizedAd === normalizedPed;
                                            });
                                            if (!aparat) {
                                                const matches = aparatVeritabani.filter(a => {
                                                    const normalizedAd = normalizeString(a.ad || '');
                                                    return normalizedAd.includes(normalizedPed) || normalizedPed.includes(normalizedAd);
                                                });
                                                if (matches.length > 0) {
                                                    const hasTwister = normalizedPed.includes('twister');
                                                    const bestMatch = matches.find(m => {
                                                        const mAd = normalizeString(m.ad || '');
                                                        return mAd.includes('twister') === hasTwister;
                                                    });
                                                    aparat = bestMatch || matches[0];
                                                }
                                            }
                                            
                                            const isSelected = aparat && seciliAparatId === aparat.id;
                                            
                                            // Dinamik Renklendirme
                                            let colorClass = 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400 shadow-sm';
                                            if (normalizedPed.includes('kirmizi')) colorClass = 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100 shadow-sm';
                                            else if (normalizedPed.includes('yesil')) colorClass = 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100 shadow-sm';
                                            else if (normalizedPed.includes('mavi')) colorClass = 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 shadow-sm';
                                            else if (normalizedPed.includes('siyah')) colorClass = 'bg-gray-800 text-white border-gray-900 hover:bg-gray-900 shadow-sm';
                                            else if (normalizedPed.includes('beyaz')) colorClass = 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm';
                                            else if (normalizedPed.includes('sari')) colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100 shadow-sm';
                                            else if (normalizedPed.includes('tynex') || normalizedPed.includes('firca')) colorClass = 'bg-stone-100 text-stone-700 border-stone-400 hover:bg-stone-200 shadow-sm font-bold';
                                            else if (normalizedPed.includes('melamin')) colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100 shadow-sm';
                                            
                                            return (
                                                <button
                                                    key={ped}
                                                    onClick={() => {
                                                        if (aparat) {
                                                            setSeciliKategori(aparat.kategori);
                                                            setSeciliAparatId(aparat.id);
                                                            toast.success(`Akıllı sistem önerisi uygulandı:\n${ped}`);
                                                        }
                                                    }}
                                                    type="button"
                                                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition-all ${
                                                        isSelected
                                                            ? 'ring-2 ring-offset-1 ring-amber-500 scale-105 shadow-md ' + colorClass.replace('bg-', 'bg-opacity-90 bg-')
                                                            : aparat 
                                                                ? colorClass + ' cursor-pointer'
                                                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    }`}
                                                    disabled={!aparat}
                                                >
                                                    {isSiraliRestorasyon && idx < 3 && normalizedPed.includes('twister') ? `${idx + 1}. ${ped}` : ped}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-amber-900 font-medium">Bu kombinasyon için özel bir öneri bulunamadı.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Ped/Fırça Seçimi */}
                    <div className="border-t border-gray-100/80 pt-4">
                        <InputWrap label="Ped / Fırça Kategorisi" htmlFor="pedKategoriSelect">
                            <select
                                id="pedKategoriSelect"
                                value={seciliKategori}
                                onChange={e => {
                                    setSeciliKategori(e.target.value);
                                    setSeciliAparatId('');
                                }}
                                className={`${selectBase} focus:border-indigo-500 focus:ring-indigo-500/20`}
                            >
                                <option value="">Tümü</option>
                                {kategoriler.map(k => (
                                    <option key={k} value={k}>
                                        {k === 'Klasik Sistem Pedler' ? 'Standart Pedler' : k}
                                    </option>
                                ))}
                            </select>
                        </InputWrap>
                        <InputWrap label="Ped / Fırça Türleri" htmlFor="pedTurleriSelect">
                            <select
                                id="pedTurleriSelect"
                                value={seciliAparatId ?? ''}
                                onChange={e => setSeciliAparatId(e.target.value)}
                                className="w-full border-2 border-emerald-400/60 bg-white/80 text-slate-900 rounded-xl p-2.5 text-sm font-bold focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 outline-none cursor-pointer shadow-sm"
                            >
                                <option value="">Seçiniz...</option>
                                {filtrelenmisAparatlar.map(a => {
                                    const ruloUyumsuz = kafaTipi === 'Silindirik' && !isBrush(a.ad);
                                    return (
                                        <option key={a.id} value={a.id}>
                                            {a.ad.replace('Klasik ', '')}{ruloUyumsuz ? ' (⚠️ Rulo Kafaya Uymaz)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </InputWrap>
                    </div>
                </div>
            </div>

            {/* Mobil Sonuçlara Kaydır Butonu */}
            {seciliMakineId && (
                <div className="md:hidden sticky bottom-4 z-50 mt-4 flex justify-center no-print">
                    <button
                        onClick={onScrollToResults}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 animate-bounce transition-all border border-indigo-500"
                    >
                        Sonuçları Gör <ArrowDown size={18} />
                    </button>
                </div>
            )}
        </motion.div>
    );
}
