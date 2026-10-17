import React, { useState, useEffect } from 'react';
import { Save, Trash2, Pencil, X, List } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { invalidateDbCache } from '../../hooks/useDbData';

export function ApparatusTab({ confirmDelete }) {
    const [mevcutAparatlar, setMevcutAparatlar] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    const emptyAparat = { ad: '', kategori: 'Klasik Sistem Pedler', aciklama: '', uygunZeminler: '', uygunMakineler: '' };
    const [aparat, setAparat] = useState(emptyAparat);

    useEffect(() => {
        const unSub = onSnapshot(collection(db, 'aparatlar'), snapshot => {
            setMevcutAparatlar(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
        });
        return () => unSub();
    }, []);

    const cancelEdit = () => {
        setEditingId(null);
        setAparat(emptyAparat);
    };

    const handleEditAparat = (a) => {
        setEditingId(a.id);
        setAparat({
            ad: a.ad || '',
            kategori: a.kategori || 'Klasik Sistem Pedler',
            aciklama: a.aciklama || '',
            uygunZeminler: a.uygunZeminler?.join(', ') || '',
            uygunMakineler: a.uygunMakineler?.join(', ') || '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteAparat = (id, ad) => {
        confirmDelete(ad, async () => {
            try {
                await deleteDoc(doc(db, 'aparatlar', String(id)));
                invalidateDbCache();
                toast.success(`"${ad}" ped/fırçası silindi.`);
            } catch (err) {
                console.error('Silme hatası:', err);
                toast.error('Ped/Fırça silinirken hata oluştu.');
            }
        });
    };

    const handleAparatChange = e => setAparat({ ...aparat, [e.target.name]: e.target.value });

    const handleAparatSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSave = {
                ad: aparat.ad.trim(),
                kategori: aparat.kategori.trim() || 'Klasik Sistem Pedler',
                aciklama: aparat.aciklama.trim(),
                uygunZeminler:  aparat.uygunZeminler.split(',').map(s => s.trim()).filter(Boolean),
                uygunMakineler: aparat.uygunMakineler.split(',').map(s => s.trim()).filter(Boolean),
            };
            if (editingId) {
                await setDoc(doc(db, 'aparatlar', editingId), dataToSave, { merge: true });
                toast.success(`Ped/Fırça '${aparat.ad}' başarıyla güncellendi!`);
            } else {
                await addDoc(collection(db, 'aparatlar'), dataToSave);
                toast.success(`Ped/Fırça '${aparat.ad}' başarıyla eklendi!`);
            }
            invalidateDbCache();
            cancelEdit();
        } catch (err) {
            console.error('Hata:', err);
            toast.error('Ped/Fırça kaydedilirken hata oluştu: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const inputCls = 'w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-rose-500 outline-none transition-colors';

    return (
        <div>
            <form onSubmit={handleAparatSubmit} className="flex flex-col gap-4">
                <h3 className="font-black text-slate-800 text-lg mb-2">
                    {editingId ? 'Ped/Fırçayı Düzenle' : 'Yeni Ped/Fırça Detayları'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Ped/Fırça Adı (Örn: Twister Yeşil Ped)</label>
                        <input required name="ad" value={aparat.ad} onChange={handleAparatChange} placeholder="Kırmızı Ped, Tynex Fırça vb." className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                        <select name="kategori" value={aparat.kategori} onChange={handleAparatChange} className={inputCls}>
                            <option value="Klasik Sistem Pedler">Standart (Klasik) Pedler</option>
                            <option value="Twister Elmas Pedler">Twister Elmas Pedler</option>
                            <option value="Özel Pedler ve Fırçalar">Özel Pedler ve Fırçalar</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Kullanım Senaryosu / Açıklama</label>
                    <input required name="aciklama" value={aparat.aciklama} onChange={handleAparatChange} placeholder="Örn: Günlük rutin temizlik ve hafif kirler için idealdir." className={inputCls} />
                </div>
                {[
                    { name: 'uygunZeminler', label: 'Uygun Zeminler (Virgülle ayırın)',  placeholder: 'Epoksi, Beton, Seramik...' },
                    { name: 'uygunMakineler',label: 'Uygun Makineler (Virgülle ayırın)', placeholder: 'Taski Swingo 455B, Karcher BD...' },
                ].map(({ name, label, placeholder }) => (
                    <div key={name}>
                        <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
                        <input name={name} value={aparat[name]} onChange={handleAparatChange} placeholder={placeholder} className={inputCls} />
                    </div>
                ))}
                <div className="mt-4 flex items-center gap-3">
                    <button type="submit" disabled={isSaving} className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-colors">
                        <Save size={18} /> {isSaving ? 'Kaydediliyor...' : (editingId ? 'Güncelle' : 'Ped/Fırçayı Kaydet')}
                    </button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors">
                            <X size={18} /> İptal
                        </button>
                    )}
                </div>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <List size={20} className="text-slate-400" />
                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                        Mevcut Kayıtlar
                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{mevcutAparatlar.length}</span>
                    </h3>
                </div>
                <div className="flex flex-col gap-3">
                    {mevcutAparatlar.length === 0 && <p className="text-sm text-slate-500">Henüz ped/fırça bulunmuyor.</p>}
                    {mevcutAparatlar.map(a => (
                        <div key={a.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-800">{a.ad}</h4>
                                    {a.kategori && (
                                        <span className="text-[11px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                            {a.kategori}
                                        </span>
                                    )}
                                </div>
                                {a.aciklama && <p className="text-xs text-slate-600 mt-1">{a.aciklama}</p>}
                                <p className="text-xs font-medium text-slate-400 mt-0.5 max-w-md truncate">Uyumlu: {a.uygunMakineler?.join(', ') || 'Tüm Makineler'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEditAparat(a)} className="p-2 text-indigo-500 hover:bg-indigo-100 rounded-lg transition-colors" title="Düzenle">
                                    <Pencil size={18} />
                                </button>
                                <button onClick={() => handleDeleteAparat(a.id, a.ad)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors" title="Sil">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
