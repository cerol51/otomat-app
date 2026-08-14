import { motion } from 'framer-motion';
import { InputWrap } from '../InputWrap';
import { MachineRecommendation } from './MachineRecommendation';

/**
 * Dashboard'un sol sütunu: alan/tesis bilgileri ve makine/aparat seçimi.
 * Tüm form girdilerini ve dropdown'ları barındırır.
 */
export function InputPanel({
    // Veri listeleri
    zeminTipleri, sektorelVeriler, kirYogunluklari, yasSecenekleri,
    markalar, surusTipleri, kategoriler, aparatVeritabani, makineVeritabani,
    filtrelenmisMakineler, onerilenPedler,
    // Form değerleri
    alanInput, sektor, zemin, kirTuru, kirYogunlugu,
    seciliMarka, seciliSurus, seciliMakineId, makineYasi,
    seciliKategori, seciliAparatId,
    // Event handler'lar
    handleAlanChange, handleSektorChange,
    setZemin, setKirTuru, setKirYogunlugu,
    setSeciliMarka, setSeciliSurus, setSeciliMakineId,
    setMakineYasi, setSeciliKategori, setSeciliAparatId,
    onSelectRecommendedMachine
}) {
    const selectBase =
        'w-full border border-gray-200/80 bg-white/60 rounded-xl p-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 outline-none cursor-pointer shadow-sm appearance-none transition-all';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 flex flex-col gap-6 no-print"
        >
            {/* ── Alan ve Tesis Bilgileri ── */}
            <div className="glass-card rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 border-t-4 border-t-indigo-500">
                <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100/80 px-5 py-4 font-bold text-slate-800 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-lg">🏢</span>
                    <span>1. Alan ve Tesis Bilgileri</span>
                </div>
                <div className="p-5">
                    <InputWrap label="Alan (m²)">
                        <input
                            type="number"
                            min="1"
                            max="1000000"
                            value={alanInput}
                            onChange={handleAlanChange}
                            className="w-full border border-gray-200/80 bg-white/60 rounded-xl p-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
                        />
                    </InputWrap>

                    <div className="grid grid-cols-2 gap-4">
                        <InputWrap label="Sektör">
                            <select
                                value={sektor}
                                onChange={e => handleSektorChange(e.target.value)}
                                className={`${selectBase} focus:border-indigo-500 focus:ring-indigo-500/20`}
                            >
                                <option value="">Seçiniz...</option>
                                {Object.keys(sektorelVeriler || {}).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </InputWrap>
                        <InputWrap label="Zemin Türü">
                            <select
                                value={zemin}
                                onChange={e => setZemin(e.target.value)}
                                className={`${selectBase} focus:border-indigo-500 focus:ring-indigo-500/20`}
                            >
                                <option value="">Seçiniz...</option>
                                {zeminTipleri.map(z => <option key={z} value={z}>{z}</option>)}
                            </select>
                        </InputWrap>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-1">
                        <InputWrap label="Kir Türü">
                            <select
                                value={kirTuru}
                                onChange={e => setKirTuru(e.target.value)}
                                className={`${selectBase} focus:border-indigo-500 focus:ring-indigo-500/20`}
                            >
                                <option value="">Seçiniz...</option>
                                {(sektorelVeriler[sektor]?.kirler || []).map(k => (
                                    <option key={k} value={k}>{k}</option>
                                ))}
                            </select>
                        </InputWrap>
                        <InputWrap label="Kir Yoğunluğu">
                            <select
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
                alanInput={alanInput}
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
                        <InputWrap label="Marka">
                            <select
                                value={seciliMarka}
                                onChange={e => setSeciliMarka(e.target.value)}
                                className={`${selectBase} focus:border-emerald-500 focus:ring-emerald-500/20`}
                            >
                                <option value="">Seçiniz...</option>
                                {markalar.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </InputWrap>
                        <InputWrap label="Sürüş Tipi">
                            <select
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
                        <InputWrap label="Kullanılacak Makine">
                            {filtrelenmisMakineler.length > 0 ? (
                                <select
                                    value={seciliMakineId ?? ''}
                                    onChange={e => setSeciliMakineId(e.target.value)}
                                    className="w-full border-2 border-emerald-400/60 bg-emerald-50/50 text-slate-900 rounded-xl p-2.5 text-sm font-bold focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 outline-none cursor-pointer shadow-sm"
                                >
                                    <option value="">Seçiniz...</option>
                                    {filtrelenmisMakineler.map(m => (
                                        <option key={m.id} value={m.id}>{m.model}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-2.5 border border-rose-200 bg-rose-50/50 text-rose-600 text-sm font-medium rounded-xl">
                                    Filtreye uygun makine bulunamadı.
                                </div>
                            )}
                        </InputWrap>
                        <InputWrap label="Makine Yaşı">
                            <select
                                value={makineYasi}
                                onChange={e => setMakineYasi(e.target.value)}
                                className={`${selectBase} focus:border-emerald-500 focus:ring-emerald-500/20`}
                            >
                                <option value="">Seçiniz...</option>
                                {yasSecenekleri.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </InputWrap>
                    </div>

                    {/* Akıllı Ped Önerisi */}
                    {(zemin && kirTuru && kirYogunlugu) && (
                        <motion.div
                            key={onerilenPedler.join(',')}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-5 mb-5 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-start gap-3 shadow-sm"
                        >
                            <span className="text-xl mt-0.5">💡</span>
                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-2">Akıllı Sistem Önerisi</p>
                                <div className="flex flex-wrap gap-2">
                                    {onerilenPedler.length > 0 ? (
                                        onerilenPedler.map(ped => {
                                            const normalizedPed = (ped || '').toLowerCase().replace(/ı/g, 'i');
                                            const aparat = aparatVeritabani.find(a => {
                                                const normalizedAd = (a.ad || '').toLowerCase().replace(/ı/g, 'i');
                                                return normalizedAd.includes(normalizedPed) || normalizedPed.includes(normalizedAd);
                                            });
                                            
                                            const isSelected = aparat && seciliAparatId === aparat.id;
                                            
                                            return (
                                                <button
                                                    key={ped}
                                                    onClick={() => {
                                                        if (aparat) {
                                                            setSeciliKategori(aparat.kategori);
                                                            setSeciliAparatId(aparat.id);
                                                        }
                                                    }}
                                                    type="button"
                                                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition-all ${
                                                        isSelected
                                                            ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                                                            : aparat 
                                                                ? 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400 cursor-pointer shadow-sm'
                                                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    }`}
                                                    disabled={!aparat}
                                                >
                                                    {ped}
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
                        <InputWrap label="Ped Kategorisi">
                            <select
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
                        <InputWrap label="Ped Türleri">
                            <select
                                value={seciliAparatId ?? ''}
                                onChange={e => setSeciliAparatId(e.target.value)}
                                className="w-full border-2 border-emerald-400/60 bg-white/80 text-slate-900 rounded-xl p-2.5 text-sm font-bold focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 outline-none cursor-pointer shadow-sm"
                            >
                                <option value="">Seçiniz...</option>
                                {aparatVeritabani
                                    .filter(a => a.kategori === seciliKategori)
                                    .map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.ad.replace('Klasik ', '')}
                                        </option>
                                    ))}
                            </select>
                        </InputWrap>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
