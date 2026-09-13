import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, ShieldAlert, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
    const { currentUser } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2 text-indigo-600">
                    <Settings className="w-8 h-8" />
                    <span className="font-black text-2xl tracking-tight text-slate-800">Otomat<span className="text-indigo-600">Pro</span></span>
                </div>
                <div className="flex gap-4">
                    {currentUser ? (
                        <Link to="/app" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
                            Uygulamaya Git <ArrowRight size={18} />
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="px-5 py-2.5 text-slate-700 font-bold hover:bg-slate-100 rounded-xl transition-all">Giriş Yap</Link>
                            <Link to="/register" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all">Kayıt Ol</Link>
                        </>
                    )}
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center text-center p-6 mt-12 mb-24">
                <div className="max-w-3xl">
                    <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tight leading-tight mb-6">
                        Profesyonel Zemin Temizliği İçin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Akıllı Karar Destek Sistemi</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 font-medium mb-10 leading-relaxed">
                        Doğru makine, doğru ped ve doğru kimyasal. Temizlik operasyonlarınızı optimize edin, 
                        maliyetleri hesaplayın ve profesyonel PDF raporları oluşturun.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {currentUser ? (
                            <Link to="/app" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                                Panoya Dön <ArrowRight size={20} />
                            </Link>
                        ) : (
                            <Link to="/register" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-200 transition-all">
                                Hemen Ücretsiz Başlayın
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl text-left">
                    <div className="glass-card p-8 rounded-3xl shadow-lg shadow-slate-200/50 border-t-4 border-indigo-500">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                            <Settings size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Hassas Hesaplamalar</h3>
                        <p className="text-slate-600 font-medium">Alan büyüklüğü, kir türü ve makine özelliklerine göre su, kimyasal ve zaman analizini saniyeler içinde yapın.</p>
                    </div>
                    <div className="glass-card p-8 rounded-3xl shadow-lg shadow-slate-200/50 border-t-4 border-emerald-500">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                            <CheckCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Akıllı Ped Önerisi</h3>
                        <p className="text-slate-600 font-medium">Zemin ve kir tipine en uygun ped / fırça kombinasyonunu akıllı algoritma ile otomatik belirleyin.</p>
                    </div>
                    <div className="glass-card p-8 rounded-3xl shadow-lg shadow-slate-200/50 border-t-4 border-rose-500">
                        <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Profesyonel Raporlama</h3>
                        <p className="text-slate-600 font-medium">Tüm analizlerinizi ve adım adım yıkama senaryolarını PDF olarak müşterilerinize sunun veya geçmişinize kaydedin.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
