import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';

/**
 * Yıkama senaryosunu gösteren modal.
 * react-markdown ile **bold** sözdizimini gerçek HTML olarak render eder.
 */
export function ScenarioModal({
    show, onClose,
    aktifMakine, alanInput, zemin, kirTuru, kirYogunlugu,
    scenarioText,
}) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Başlığı */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                🧼 Adım Adım Yıkama Senaryosu
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-white/70 hover:text-white transition-colors text-2xl leading-none"
                                aria-label="Kapat"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal İçeriği */}
                        <div className="flex-1 overflow-y-auto modal-scroll p-6 bg-slate-50/30">
                            <h1 className="text-2xl font-extrabold text-slate-900 text-center border-b border-gray-200 pb-3 mb-5">
                                Otomat Zemin Yıkama Senaryosu
                            </h1>

                            {/* Özet Bilgiler */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                                {[
                                    { label: 'Makine',       value: `${aktifMakine.marka} ${aktifMakine.model}` },
                                    { label: 'Alan',         value: `${alanInput} m²` },
                                    { label: 'Zemin',        value: zemin },
                                    { label: 'Kir Türü',     value: kirTuru },
                                    { label: 'Kir Yoğunluğu', value: kirYogunlugu },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                                        <p className="font-semibold text-slate-800 text-sm">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Senaryo Adımları — Markdown ile render edilir */}
                            <div className="scenario-markdown">
                                <Markdown>{scenarioText}</Markdown>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
