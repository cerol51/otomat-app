import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Calendar, MapPin, Loader2, Trash2 } from 'lucide-react';
import { dakikaFormatla } from '../utils/calculations';
import toast from 'react-hot-toast';

export default function Reports() {
    const { currentUser } = useAuth();
    const [reports, setReports]               = useState([]);
    const [loading, setLoading]               = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [deletingId, setDeletingId]         = useState(null);
    const [confirmId, setConfirmId]           = useState(null); // inline onay

    useEffect(() => {
        async function fetchReports() {
            if (!currentUser) return;
            try {
                let data = [];
                const cache = sessionStorage.getItem('otomatReportsCache');
                if (cache) {
                    data = JSON.parse(cache);
                } else {
                    const q = query(
                        collection(db, 'reports'),
                        where('userId', '==', currentUser.uid)
                    );
                    const querySnapshot = await getDocs(q);
                    data = querySnapshot.docs.map(d => {
                        const docData = d.data();
                        return {
                            id: d.id,
                            ...docData,
                            createdAt: docData.createdAt ? docData.createdAt.toMillis() : null,
                        };
                    });
                    data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                    sessionStorage.setItem('otomatReportsCache', JSON.stringify(data));
                }
                setReports(data);
            } catch (error) {
                console.error('Raporlar yüklenemedi:', error);
                toast.error('Raporlar yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        }
        fetchReports();
    }, [currentUser]);

    const handleDeleteClick = (e, reportId) => {
        e.stopPropagation();
        setConfirmId(reportId); // kartın üzerinde onay göster
    };

    const handleConfirmDelete = async (e) => {
        e.stopPropagation();
        if (!confirmId) return;
        try {
            setDeletingId(confirmId);
            setConfirmId(null);
            await deleteDoc(doc(db, 'reports', confirmId));
            setReports(prev => prev.filter(r => r.id !== confirmId));
            sessionStorage.removeItem('otomatReportsCache');
            if (selectedReport?.id === confirmId) setSelectedReport(null);
            toast.success('Rapor silindi.');
        } catch (err) {
            console.error('Silme hatası:', err);
            toast.error('Rapor silinirken hata oluştu.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleCancelDelete = (e) => {
        e.stopPropagation();
        setConfirmId(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto font-sans">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                    <FileText size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Geçmiş Raporlarım</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Daha önce kaydettiğiniz tüm analizleri buradan görüntüleyebilir veya silebilirsiniz.
                    </p>
                </div>
            </div>

            {reports.length === 0 ? (
                <div className="glass-card p-12 rounded-3xl shadow-lg shadow-slate-200/50 flex flex-col items-center justify-center text-center">
                    <FileText size={48} className="text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Henüz rapor kaydetmediniz.</h3>
                    <p className="text-slate-500 font-medium max-w-md">
                        Hesaplayıcı ekranında analizlerinizi tamamladıktan sonra "Raporu Kaydet" butonuna
                        tıklayarak geçmiş analizlerinizi burada saklayabilirsiniz.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => {
                        const isConfirming = confirmId === report.id;
                        const isDeleting   = deletingId === report.id;

                        return (
                            <div
                                key={report.id}
                                onClick={() => !isConfirming && setSelectedReport(report)}
                                className={`bg-white cursor-pointer border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col h-full relative ${
                                    isConfirming ? 'ring-2 ring-rose-400' : ''
                                }`}
                            >
                                {/* Başlık Satırı */}
                                <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
                                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-lg">
                                        <MapPin size={16} /> {report.alan} m²
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                                        <Calendar size={14} />
                                        {report.createdAt
                                            ? new Date(report.createdAt).toLocaleDateString('tr-TR')
                                            : 'Bilinmeyen Tarih'
                                        }
                                    </div>
                                </div>

                                {/* İçerik */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 mb-1">
                                        {report.makine?.marka} {report.makine?.model}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-500 mb-4">{report.aparat?.ad}</p>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <span className="block text-slate-400 font-medium">Sektör</span>
                                            <span className="font-bold text-slate-700">{report.sektor || '-'}</span>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <span className="block text-slate-400 font-medium">Zemin</span>
                                            <span className="font-bold text-slate-700">{report.zemin || '-'}</span>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <span className="block text-slate-400 font-medium">Pratik m²</span>
                                            <span className="font-bold text-emerald-600">{report.sonuclar?.pratikM2}</span>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <span className="block text-slate-400 font-medium">Süre</span>
                                            <span className="font-bold text-indigo-600">
                                                {report.sonuclar?.toplamOperasyonDk
                                                    ? dakikaFormatla(report.sonuclar.toplamOperasyonDk)
                                                    : '-'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Silme Aksiyonları */}
                                <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">
                                    {isConfirming ? (
                                        <div className="flex items-center gap-2 animate-in fade-in">
                                            <span className="text-xs font-semibold text-rose-600">Emin misiniz?</span>
                                            <button
                                                onClick={handleConfirmDelete}
                                                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Sil
                                            </button>
                                            <button
                                                onClick={handleCancelDelete}
                                                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                                            >
                                                İptal
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={e => handleDeleteClick(e, report.id)}
                                            disabled={isDeleting}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Raporu Sil"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Rapor Detay Modalı */}
            {selectedReport && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                    onClick={() => setSelectedReport(null)}
                >
                    <div
                        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Rapor Detayı</h2>
                                <p className="text-xs font-semibold text-slate-500 mt-1">
                                    {selectedReport.createdAt
                                        ? new Date(selectedReport.createdAt).toLocaleString('tr-TR')
                                        : ''}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Makine */}
                            <div className="p-4 bg-indigo-50 rounded-2xl flex justify-between items-center">
                                <div>
                                    <span className="block text-xs font-bold text-indigo-400 uppercase">Makine Modeli</span>
                                    <span className="text-lg font-black text-indigo-700">
                                        {selectedReport.makine?.marka} {selectedReport.makine?.model}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs font-bold text-indigo-400 uppercase">Ped/Fırça</span>
                                    <span className="text-sm font-bold text-indigo-700">{selectedReport.aparat?.ad}</span>
                                </div>
                            </div>

                            {/* Girdiler */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Analiz Girdileri
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {[
                                        { label: 'Alan',   value: `${selectedReport.alan} m²` },
                                        { label: 'Sektör', value: selectedReport.sektor || '-' },
                                        { label: 'Zemin',  value: selectedReport.zemin  || '-' },
                                        { label: 'Kir',    value: `${selectedReport.kirTuru || '-'} — ${selectedReport.kirYogunlugu || '-'}` },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="text-slate-500 font-medium">{label}</span>
                                            <span className="font-bold text-slate-700">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sonuçlar */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Performans Sonuçları
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="flex justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <span className="text-emerald-700 font-medium">Pratik m²</span>
                                        <span className="font-bold text-emerald-800">{selectedReport.sonuclar?.pratikM2} m²/sa</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <span className="text-emerald-700 font-medium">Gerekli Adet</span>
                                        <span className="font-bold text-emerald-800">{selectedReport.sonuclar?.gerekliAdet} Makine</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                                        <span className="text-blue-700 font-medium">Su Tüketimi</span>
                                        <span className="font-bold text-blue-800">{selectedReport.sonuclar?.kaynakSuTuketimi} Lt</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                                        <span className="text-orange-700 font-medium">Operasyon Süresi</span>
                                        <span className="font-bold text-orange-800">
                                            {selectedReport.sonuclar?.toplamOperasyonDk
                                                ? dakikaFormatla(selectedReport.sonuclar.toplamOperasyonDk)
                                                : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
