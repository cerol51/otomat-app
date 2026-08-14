import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Calculator, Settings, Battery, Droplets, BookOpen, Zap, Clock, ShieldCheck } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function Guide() {
    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto font-sans pb-24"
        >
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                    <BookOpen size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kullanım Kılavuzu</h1>
                    <p className="text-slate-500 font-medium mt-1 text-lg">OtomatPro analiz motorunun detaylı kullanım rehberi</p>
                </div>
            </motion.div>

            <div className="flex flex-col gap-10">
                {/* 1. Amacımız */}
                <motion.section variants={itemVariants} className="glass-card rounded-3xl p-8 shadow-xl shadow-slate-200/50 border-t-4 border-indigo-500 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 text-indigo-50 opacity-50 pointer-events-none">
                        <ShieldCheck size={200} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4 text-indigo-600">
                            <HelpCircle size={28} />
                            <h2 className="text-2xl font-extrabold text-slate-800">Uygulamanın Amacı Nedir?</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-medium text-lg">
                            OtomatPro, endüstriyel temizlik operasyonlarında makine kapasitelerini, zaman analizlerini ve tüketim (su, kimyasal, ped/fırça) maliyetlerini 
                            otomatik olarak hesaplayarak operasyonel verimliliği artırmayı amaçlar. Seçtiğiniz alan ve makine özelliklerine göre size 
                            <strong className="text-indigo-700"> saniyeler içinde detaylı bir zaman etüdü ve kaynak analizi </strong> sunar.
                        </p>
                    </div>
                </motion.section>

                {/* 2. Nasıl Kullanılır */}
                <motion.section variants={itemVariants} className="glass-card rounded-3xl p-8 shadow-xl shadow-slate-200/50 border-t-4 border-blue-500">
                    <div className="flex items-center gap-3 mb-8 text-blue-600">
                        <Settings size={28} />
                        <h2 className="text-2xl font-extrabold text-slate-800">Adım Adım Kullanım</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-3 text-lg">
                                <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-xl flex items-center justify-center font-black">1</span> 
                                Temel Bilgiler
                            </h3>
                            <p className="text-slate-600 font-medium">
                                Zemin Türü, Sektör ve Kir Yoğunluğunu seçin. Ardından temizlenecek net <strong>M² alanını</strong> girin. Bu bilgiler su tüketimi ve kimyasal dozajı için hayati önem taşır.
                            </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-cyan-50 to-white p-6 rounded-2xl border border-cyan-100 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-3 text-lg">
                                <span className="bg-cyan-100 text-cyan-700 w-8 h-8 rounded-xl flex items-center justify-center font-black"><Zap size={16}/></span> 
                                Yapay Zeka Önerisi
                            </h3>
                            <p className="text-slate-600 font-medium">
                                Alanı girdiğiniz anda sistem, o alana uygun (gereksiz büyük olmayan) ve <strong>en kısa temizlik süresini</strong> sunacak makineyi Taski ve Karcher markaları arasından otomatik olarak önerir.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-3 text-lg">
                                <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-xl flex items-center justify-center font-black">3</span> 
                                Makine & Ped/Fırça Seçimi
                            </h3>
                            <p className="text-slate-600 font-medium">
                                İsterseniz manuel olarak farklı bir makine ve buna uygun fırça/ped seçebilirsiniz. Zemin uyumsuzluğu durumunda sistem sizi uyarır.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-3 text-lg">
                                <span className="bg-orange-100 text-orange-700 w-8 h-8 rounded-xl flex items-center justify-center font-black">4</span> 
                                Makine Yaşı ve Performans (Yeni Mantık)
                            </h3>
                            <p className="text-slate-600 font-medium">
                                Makinenin yaşlanması fırça hızını düşürmez, <strong>batarya ömrünü (Tek Şarj Kapasitesini) azaltır.</strong> Eğer girdiğiniz alan makinenin yıpranmış bataryasıyla bile tek seferde yıkanabiliyorsa temizlik süresi uzamaz. Ancak alan tek şarj kapasitesini aşıyorsa, ilave şarj molaları gerekeceği için <strong>toplam operasyon süresine ceza çarpanı</strong> uygulanır.
                            </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-3 text-lg">
                                <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-xl flex items-center justify-center font-black">5</span> 
                                Raporlama
                            </h3>
                            <p className="text-slate-600 font-medium">
                                Sonuçlar sayfanın sağ tarafında anında oluşur. <strong>"PDF İndir"</strong> butonuna tıklayarak kurumsal formatta şık bir rapor indirebilirsiniz.
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* 3. Analiz Sonuçlarını Okuma */}
                <motion.section variants={itemVariants} className="glass-card rounded-3xl p-8 shadow-xl shadow-slate-200/50 border-t-4 border-emerald-500">
                    <div className="flex items-center gap-3 mb-8 text-emerald-600">
                        <Calculator size={28} />
                        <h2 className="text-2xl font-extrabold text-slate-800">Analiz Sonuçları Nasıl Okunur?</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="mt-1 p-3 bg-sky-100 text-sky-600 rounded-xl h-fit"><Droplets size={24} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Su ve Kimyasal Tüketimi</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    Hesaplamalar metrekare başına standart veya kir yoğunluğuna göre uyarlanmış su tüketimi üzerinden yapılır. 
                                    Seçtiğiniz ped/fırçada <strong>Twister</strong> veya <strong>Melamin</strong> geçiyorsa kimyasal kullanılmadığı varsayılır. Aksi halde sektör bazlı dozajlama hesabı yapılır.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="mt-1 p-3 bg-indigo-100 text-indigo-600 rounded-xl h-fit"><Clock size={24} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Zaman Etüdü (Yeni)</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    Makinenin Pratik Hızı (m²/s) <strong>sabittir</strong>. Ancak temizlenecek alan, makinenin <strong>Tek Şarj Kapasitesini</strong> aşıyorsa araya giren zorunlu duraklamalar yüzünden toplam temizlik süresi otomatik olarak uzar.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="mt-1 p-3 bg-amber-100 text-amber-600 rounded-xl h-fit"><Settings size={24} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Fiziki Yapı Kayıpları</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    Sadece makinenin zemini yıkaması değil; temiz su doldurma, kirli su boşaltma, deşarj noktasına yürüme süresi ve bu işlemler sırasındaki <strong>%10'luk çevresel zorluk kayıpları</strong> (koridor dönüşleri vb.) tamamen hesaplamaya dahildir.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="mt-1 p-3 bg-emerald-100 text-emerald-600 rounded-xl h-fit"><Battery size={24} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Akü Durumu Analizi</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    Toplam operasyon saati, makinenin batarya kapasitesi ile karşılaştırılır. İşiniz batarya ömrünü aşıyorsa sistem kırmızı bir uyarı verir. Kablolu makineler için Tek Şarj Kapasitesi <strong>Sınırsız</strong> kabul edilir.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.section>
                
                <motion.div variants={itemVariants} className="text-center text-slate-400 text-sm mt-4 font-semibold tracking-wide uppercase">
                    OtomatPro Analiz Sistemi • Verimlilik İçin Tasarlandı
                </motion.div>
            </div>
        </motion.div>
    );
}
