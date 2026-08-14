import React, { useState } from 'react';
import { ShieldAlert, Users } from 'lucide-react';
import toast from 'react-hot-toast';

import { MachineTab } from '../components/admin/MachineTab';
import { ApparatusTab } from '../components/admin/ApparatusTab';
import { UsersTab } from '../components/admin/UsersTab';

export default function Admin() {
    const [activeTab, setActiveTab] = useState('makine');

    // ── Onaylı silme — toast içinde inline confirm ──
    const confirmDelete = (label, onConfirm) => {
        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-slate-100">
                        <span className="text-amber-300">"{label}"</span> silinsin mi?
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { toast.dismiss(t.id); onConfirm(); }}
                            className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                            Evet, Sil
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            ),
            { duration: Infinity }
        );
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto font-sans">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                    <ShieldAlert size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Yönetici Paneli</h1>
                    <p className="text-slate-500 font-medium mt-1">Ortak veritabanına yeni makine veya ped/fırça ekleyin.</p>
                </div>
            </div>

            <div className="glass-card rounded-3xl shadow-lg shadow-slate-200/50 border-t-4 border-rose-500 overflow-hidden">
                {/* Sekme Başlıkları */}
                <div className="flex border-b border-gray-100">
                    {[
                        { key: 'makine',    label: 'Yeni Makine Ekle' },
                        { key: 'aparat',    label: 'Yeni Ped/Fırça Ekle' },
                        { key: 'kullanici', label: 'Kullanıcılar',     icon: <Users size={18} /> },
                    ].map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex-1 py-4 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                                activeTab === key
                                    ? key === 'kullanici'
                                        ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500'
                                        : 'bg-rose-50 text-rose-600 border-b-2 border-rose-500'
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {icon}{label}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {activeTab === 'makine' && <MachineTab confirmDelete={confirmDelete} />}
                    {activeTab === 'aparat' && <ApparatusTab confirmDelete={confirmDelete} />}
                    {activeTab === 'kullanici' && <UsersTab />}
                </div>
            </div>
        </div>
    );
}
