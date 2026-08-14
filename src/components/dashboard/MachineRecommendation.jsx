import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle } from 'lucide-react';

export function MachineRecommendation({ alanInput, makineVeritabani, onSelectMachine }) {

    const recommendations = useMemo(() => {
        // En az 30 dakika sürecek (pratik <= alan * 2) olan en hızlı (en yüksek kapasiteli) makineyi bul
        const maxMantikiKapasite = alanInput * 2; 

        const getOptimum = (marka) => {
            const makineler = makineVeritabani.filter(m => {
                if (m.marka.toLowerCase() !== marka.toLowerCase()) return false;
                if (marka.toLowerCase() === 'taski' && m.surus === 'Kablolu') return false;
                return true;
            });
            if (makineler.length === 0) return null;

            // Sıralama: Pratik Performans'a göre artan şekilde
            const sirali = [...makineler].sort((a, b) => {
                const pratikA = (a.teorikPerformans || a.m2 || 0) * 0.8;
                const pratikB = (b.teorikPerformans || b.m2 || 0) * 0.8;
                if (Math.abs(pratikA - pratikB) < 1) {
                    return (a.calismaGenisligi || 0) - (b.calismaGenisligi || 0);
                }
                return pratikA - pratikB;
            });

            // Uygun olanlar: Kapasitesi maxMantikiKapasite'den küçük veya eşit olanlar
            const uygunMakineler = sirali.filter(m => ((m.teorikPerformans || m.m2 || 0) * 0.8) <= maxMantikiKapasite);

            // Eğer uygun makine varsa, içlerinden en yüksek kapasitelisini (en hızlı olanı, yani listenin sonundakini) al
            if (uygunMakineler.length > 0) {
                return uygunMakineler[uygunMakineler.length - 1];
            }

            // Eğer tüm makineler çok büyükse (alan çok küçükse), o zaman en küçük makineyi ver
            return sirali[0];
        };

        return {
            taski: getOptimum('Taski'),
            karcher: getOptimum('Karcher')
        };
    }, [alanInput, makineVeritabani]);

    // Eğer alan çok küçükse (örneğin boş veya < 10) tavsiye göstermeye gerek yok
    if (!alanInput || alanInput < 10) return null;
    if (!recommendations.taski && !recommendations.karcher) return null;

    const renderCard = (machine, brandColor, gradient) => {
        if (!machine) return null;
        
        const pratik = Math.round((machine.teorikPerformans || machine.m2 || 0) * 0.8);
        const estimatedTime = (alanInput / pratik).toFixed(1);

        return (
            <div className={`p-4 rounded-xl border ${brandColor} ${gradient} shadow-sm flex flex-col justify-between`}>
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{machine.marka}</span>
                        <span className="text-xs bg-white/80 px-2 py-0.5 rounded text-slate-700 font-medium shadow-sm">{machine.surus}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{machine.model}</h4>
                    
                    <div className="flex flex-col gap-1 mb-3 text-sm">
                        <div className="flex justify-between text-slate-600">
                            <span>Kapasite:</span>
                            <b className="text-slate-800">{pratik.toLocaleString('tr-TR')} m²/s</b>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Fırça Genişliği:</span>
                            <b className="text-slate-800">{machine.calismaGenisligi ? `${machine.calismaGenisligi} cm` : '-'}</b>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Tahmini Süre:</span>
                            <b className="text-slate-800">{estimatedTime} saat</b>
                        </div>
                    </div>
                </div>
                
                <button
                    onClick={() => onSelectMachine(machine)}
                    className="mt-2 w-full bg-white/90 hover:bg-white text-slate-800 border border-slate-200/60 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                    <CheckCircle size={16} className="text-emerald-500" />
                    Bunu Seç
                </button>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 border-t-4 border-t-cyan-500 mt-6 mb-2"
        >
            <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100/80 px-5 py-4 font-bold text-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600">
                        <Zap size={18} />
                    </span>
                    <span>Yapay Zeka Makine Önerisi (En Hızlı Temizlik)</span>
                </div>
            </div>
            
            <div className="p-5">
                <p className="text-sm text-slate-500 mb-4 font-medium">
                    <b className="text-slate-700">{alanInput} m²</b> alan için seçilebilecek <b>en hızlı</b> ve en uygun makineler:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderCard(recommendations.taski, 'border-orange-200', 'bg-gradient-to-br from-orange-50/50 to-orange-100/30')}
                    {renderCard(recommendations.karcher, 'border-yellow-200', 'bg-gradient-to-br from-yellow-50/50 to-yellow-100/30')}
                </div>
            </div>
        </motion.div>
    );
}
