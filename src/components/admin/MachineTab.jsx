import React, { useState, useEffect } from 'react';
import { Save, Trash2, Pencil, X, List } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { invalidateDbCache } from '../../hooks/useDbData';
import { taskiMachines } from './taskiData';
import { karcherMachines } from './karcherData';

export function MachineTab({ confirmDelete }) {
    const [mevcutMakineler, setMevcutMakineler] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [sortOrder, setSortOrder] = useState('marka-asc');
    
    const emptyMakine = {
        marka: '', model: '', surus: '', fircaSayisi: '1', calismaGenisligi: '',
        siliciLastikGenisligi: '', fircaPedEbatlari: '', fircaBasinci: '', solusyonTuketimi: '',
        boyutlar: '', temizSuTanki: '', kirliSuTanki: '',
        teorikPerformans: '', pratikPerformans: '', tekSarjSure: '', tamSarjSure: '',
        tekSarjPratikAlan: '', onerilenAlan: '', akim: '', akusuzAgirlik: '',
        calismayaHazirAgirlik: '', hiz: '', sesSeviyesi: '',
    };

    const [makine, setMakine] = useState(emptyMakine);

    useEffect(() => {
        const unSub = onSnapshot(collection(db, 'makineler'), snapshot => {
            setMevcutMakineler(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
        });
        return () => unSub();
    }, []);

    const cancelEdit = () => {
        setEditingId(null);
        setMakine(emptyMakine);
    };

    const handleEditMakine = (m) => {
        setEditingId(m.id);
        setMakine({
            marka: m.marka || '', model: m.model || '',
            surus: m.surus || '',
            fircaSayisi: m.fircaSayisi?.toString() || '1',
            calismaGenisligi: m.calismaGenisligi || '',
            siliciLastikGenisligi: m.siliciLastikGenisligi || '',
            fircaPedEbatlari: m.fircaPedEbatlari || '',
            fircaBasinci: m.fircaBasinci || '',
            solusyonTuketimi: m.solusyonTuketimi || '',
            boyutlar: m.boyutlar || '',
            temizSuTanki: m.temizSuTanki || m.tank || '',
            kirliSuTanki: m.kirliSuTanki || '',
            teorikPerformans: m.teorikPerformans || m.m2 || '',
            pratikPerformans: m.pratikPerformans || '',
            tekSarjSure: m.tekSarjSure || '',
            tamSarjSure: m.tamSarjSure || '',
            tekSarjPratikAlan: m.tekSarjPratikAlan || '',
            onerilenAlan: m.onerilenAlan || '',
            akim: m.akim || '', akusuzAgirlik: m.akusuzAgirlik || '',
            calismayaHazirAgirlik: m.calismayaHazirAgirlik || '',
            hiz: m.hiz || '', sesSeviyesi: m.sesSeviyesi || '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteMakine = (id, ad) => {
        confirmDelete(ad, async () => {
            try {
                await deleteDoc(doc(db, 'makineler', String(id)));
                invalidateDbCache();
                toast.success(`"${ad}" makinesi silindi.`);
            } catch (err) {
                console.error('Silme hatası:', err);
                toast.error('Makine silinirken hata oluştu.');
            }
        });
    };

    const handleMakineChange = e => setMakine({ ...makine, [e.target.name]: e.target.value });

    const handleMakineSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSave = {
                ...makine,
                fircaSayisi:          Number(makine.fircaSayisi),
                calismaGenisligi:     Number(makine.calismaGenisligi),
                siliciLastikGenisligi: Number(makine.siliciLastikGenisligi),
                temizSuTanki:         Number(makine.temizSuTanki),
                kirliSuTanki:         Number(makine.kirliSuTanki),
                teorikPerformans:     Number(makine.teorikPerformans),
                pratikPerformans:     Number(makine.pratikPerformans) || 0,
                tekSarjPratikAlan:    Number(makine.tekSarjPratikAlan) || 0,
                akim:                 Number(makine.akim) || 0,
                akusuzAgirlik:        Number(makine.akusuzAgirlik) || 0,
                calismayaHazirAgirlik: Number(makine.calismayaHazirAgirlik) || 0,
                hiz:                  Number(makine.hiz) || 0,
                sesSeviyesi:          Number(makine.sesSeviyesi) || 0,
            };
            if (editingId) {
                await setDoc(doc(db, 'makineler', editingId), dataToSave, { merge: true });
                toast.success(`${makine.marka} ${makine.model} başarıyla güncellendi!`);
            } else {
                await addDoc(collection(db, 'makineler'), dataToSave);
                toast.success(`${makine.marka} ${makine.model} başarıyla eklendi!`);
            }
            invalidateDbCache();
            cancelEdit();
        } catch (err) {
            console.error('Hata:', err);
            toast.error('Makine kaydedilirken hata oluştu: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const importMachineBatch = async (machineList, brandLabel) => {
        setIsSaving(true);
        try {
            const batch = writeBatch(db);
            const colRef = collection(db, 'makineler');
            for (const m of machineList) {
                const newDocRef = doc(colRef);
                batch.set(newDocRef, {
                    ...m,
                    fircaSayisi: Number(m.fircaSayisi) || 1,
                    calismaGenisligi: Number(m.calismaGenisligi) || 0,
                    siliciLastikGenisligi: Number(m.siliciLastikGenisligi) || 0,
                    temizSuTanki: Number(m.temizSuTanki) || 0,
                    kirliSuTanki: Number(m.kirliSuTanki) || 0,
                    teorikPerformans: Number(m.teorikPerformans) || 0,
                    akim: Number(m.akim) || 0,
                    akusuzAgirlik: Number(m.akusuzAgirlik) || 0,
                    calismayaHazirAgirlik: Number(m.calismayaHazirAgirlik) || 0,
                    hiz: Number(m.hiz) || 0,
                    sesSeviyesi: Number(m.sesSeviyesi) || 0,
                });
            }
            await batch.commit();
            toast.success(`${brandLabel} makineleri başarıyla içe aktarıldı!`);
            invalidateDbCache();
        } catch (err) {
            console.error(err);
            toast.error('İçe aktarma hatası: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImportTaski = () => {
        confirmDelete('Taski makinelerini içe aktarma işlemi', () => importMachineBatch(taskiMachines, 'Taski'));
    };

    const handleImportKarcher = () => {
        confirmDelete('Karcher makinelerini içe aktarma işlemi', () => importMachineBatch(karcherMachines, 'Karcher'));
    };

    const handleRemoveDuplicates = () => {
        confirmDelete('Eski/kopya makineler', async () => {
            setIsSaving(true);
            try {
                const groups = {};
                mevcutMakineler.forEach(m => {
                    const key = `${m.marka?.toLowerCase()}_${m.model?.toLowerCase()}`.trim();
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(m);
                });

                const batch = writeBatch(db);
                let deletedCount = 0;
                for (const key in groups) {
                    const group = groups[key];
                    if (group.length > 1) {
                        group.sort((a, b) => {
                            const aScore = (a.tekSarjSure ? 1 : 0) + (a.onerilenAlan ? 1 : 0);
                            const bScore = (b.tekSarjSure ? 1 : 0) + (b.onerilenAlan ? 1 : 0);
                            return bScore - aScore;
                        });
                        
                        for (let i = 1; i < group.length; i++) {
                            const idToDelete = group[i].id;
                            batch.delete(doc(db, 'makineler', String(idToDelete)));
                            deletedCount++;
                        }
                    }
                }
                if (deletedCount > 0) {
                    await batch.commit();
                }
                toast.success(`${deletedCount} adet eski/kopya makine silindi.`);
                invalidateDbCache();
            } catch (err) {
                console.error(err);
                toast.error('Kopyaları silme hatası: ' + err.message);
            } finally {
                setIsSaving(false);
            }
        });
    };

    const handleDeleteAll = () => {
        confirmDelete('TÜM MAKİNELER (Kalıcı Silme)', async () => {
            setIsSaving(true);
            try {
                const batch = writeBatch(db);
                mevcutMakineler.forEach(m => {
                    batch.delete(doc(db, 'makineler', String(m.id)));
                });
                await batch.commit();
                toast.success(`${mevcutMakineler.length} adet makine başarıyla silindi.`);
                invalidateDbCache();
            } catch (err) {
                console.error(err);
                toast.error('Tümünü silme hatası: ' + err.message);
            } finally {
                setIsSaving(false);
            }
        });
    };

    const inputCls = 'w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-rose-500 outline-none transition-colors';

    return (
        <div>
            <form onSubmit={handleMakineSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h3 className="col-span-full font-black text-slate-800 text-lg mb-2">
                    {editingId ? 'Makineyi Düzenle' : 'Yeni Makine Detayları'}
                </h3>
                {[
                    { name: 'marka',                 label: 'Marka',                    type: 'text'   },
                    { name: 'model',                 label: 'Model',                    type: 'text'   },
                    { name: 'surus',                 label: 'Sürüş Tipi',               type: 'text',   req: false },
                    { name: 'fircaSayisi',           label: 'Fırça/Ped Sayısı (Adet)',  type: 'number', min: '1' },
                    { name: 'calismaGenisligi',      label: 'Çalışma Genişliği (cm)',   type: 'number' },
                    { name: 'siliciLastikGenisligi', label: 'Silici Lastik Genişliği (cm)', type: 'number', req: false },
                    { name: 'fircaPedEbatlari',      label: 'Fırça / Ped Ebatları',     type: 'text',   req: false },
                    { name: 'fircaBasinci',          label: 'Fırça Basıncı',            type: 'text',   req: false },
                    { name: 'solusyonTuketimi',      label: 'Solüsyon Tüketimi',        type: 'text',   req: false },
                    { name: 'boyutlar',              label: 'Boyutlar (U x G x Y)',     type: 'text',   req: false },
                    { name: 'temizSuTanki',          label: 'Temiz Su Tankı (L)',       type: 'number', req: false },
                    { name: 'kirliSuTanki',          label: 'Kirli Su Tankı (L)',       type: 'number', req: false },
                    { name: 'teorikPerformans',      label: 'Teorik Performans (m²/sa)', type: 'number', req: false },
                    { name: 'pratikPerformans',      label: 'Pratik Performans (m²/sa)', type: 'number', req: false },
                    { name: 'tekSarjSure',           label: 'Ortalama Çalışma Süresi (Saat)', type: 'text', req: false },
                    { name: 'tamSarjSure',           label: 'Ortalama Şarj Süresi',     type: 'text', req: false },
                    { name: 'tekSarjPratikAlan',     label: 'Tek Şarj Pratik Alan (m²)', type: 'number', req: false },
                    { name: 'onerilenAlan',          label: 'Önerilen Alan',            type: 'text', req: false },
                    { name: 'akim',                  label: 'Akü Akımı (V)',            type: 'number', req: false },
                    { name: 'akusuzAgirlik',         label: 'Aküsüz Ağırlık (kg)',      type: 'number', req: false },
                    { name: 'calismayaHazirAgirlik', label: 'Çalışmaya Hazır Ağırlık (kg)', type: 'number', req: false },
                    { name: 'hiz',                   label: 'Hız (km/h)',               type: 'number', req: false },
                    { name: 'sesSeviyesi',           label: 'Ses Seviyesi (dB)',        type: 'number', req: false },
                ].map(({ name, label, type, min, req = true }) => (
                    <div key={name}>
                        <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
                        <input
                            required={req}
                            type={type}
                            name={name}
                            min={min}
                            value={makine[name]}
                            onChange={handleMakineChange}
                            className={inputCls}
                        />
                    </div>
                ))}
                <div className="col-span-full mt-4 flex items-center gap-3">
                    <button type="submit" disabled={isSaving} className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-colors">
                        <Save size={18} /> {isSaving ? 'Kaydediliyor...' : (editingId ? 'Güncelle' : 'Makineyi Kaydet')}
                    </button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors">
                            <X size={18} /> İptal
                        </button>
                    )}
                </div>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <List size={20} className="text-slate-400" />
                        <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                            Mevcut Kayıtlar
                            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{mevcutMakineler.length}</span>
                        </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="border border-gray-200 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none transition-colors mr-2"
                        >
                            <option value="marka-asc">Marka ve Model (A-Z)</option>
                            <option value="marka-desc">Marka ve Model (Z-A)</option>
                            <option value="perf-desc">Teorik Performans (Azalan)</option>
                            <option value="perf-asc">Teorik Performans (Artan)</option>
                        </select>
                        <button 
                            type="button"
                            onClick={handleDeleteAll}
                            disabled={isSaving}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition-colors"
                        >
                            Tümünü Sil
                        </button>
                        <button 
                            type="button"
                            onClick={handleRemoveDuplicates}
                            disabled={isSaving}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition-colors"
                        >
                            Kopyaları Temizle
                        </button>
                        <button 
                            type="button"
                            onClick={handleImportTaski}
                            disabled={isSaving}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition-colors"
                        >
                            İçe Aktar: Taski
                        </button>
                        <button 
                            type="button"
                            onClick={handleImportKarcher}
                            disabled={isSaving}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition-colors"
                        >
                            İçe Aktar: Karcher
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    {mevcutMakineler.length === 0 && <p className="text-sm text-slate-500">Henüz makine bulunmuyor.</p>}
                    {[...mevcutMakineler].sort((a, b) => {
                        const m1 = a.teorikPerformans || a.m2 || 0;
                        const m2 = b.teorikPerformans || b.m2 || 0;
                        const nameA = `${a.marka} ${a.model}`.toLowerCase();
                        const nameB = `${b.marka} ${b.model}`.toLowerCase();

                        if (sortOrder === 'marka-asc') return nameA.localeCompare(nameB);
                        if (sortOrder === 'marka-desc') return nameB.localeCompare(nameA);
                        if (sortOrder === 'perf-desc') return m2 - m1;
                        if (sortOrder === 'perf-asc') return m1 - m2;
                        return 0;
                    }).map(m => (
                        <div key={m.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                            <div>
                                <h4 className="font-bold text-slate-800">{m.marka} {m.model}</h4>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">Kapasite: {m.teorikPerformans || m.m2} m²/sa</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEditMakine(m)} className="p-2 text-indigo-500 hover:bg-indigo-100 rounded-lg transition-colors" title="Düzenle">
                                    <Pencil size={18} />
                                </button>
                                <button onClick={() => handleDeleteMakine(m.id, `${m.marka} ${m.model}`)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors" title="Sil">
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
