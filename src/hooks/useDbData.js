import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const CACHE_KEY = 'otomatDbCacheV6';

/** sessionStorage cache'ini dışarıdan temizlemek için yardımcı fonksiyon */
export function invalidateDbCache() {
    sessionStorage.removeItem(CACHE_KEY);
}

/**
 * Firestore'dan uygulama verilerini yükler.
 * Firestore döküman ID'sini her zaman birincil ID olarak kullanır —
 * böylece Admin ve Dashboard arasındaki ID uyumsuzluğu ortadan kalkar.
 */
export function useDbData() {
    const [dbData, setDbData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                const cached = sessionStorage.getItem(CACHE_KEY);
                if (cached) {
                    setDbData(JSON.parse(cached));
                    setIsLoading(false);
                    return;
                }

                const sabitDoc = await getDoc(doc(db, 'sabitVeriler', 'uygulamaAyarlari'));
                const sabitVeriler = sabitDoc.exists() ? sabitDoc.data() : {};

                const makinelerSnap = await getDocs(collection(db, 'makineler'));
                // id olarak daima Firestore döküman ID'sini kullan (tutarlılık)
                const makineler = makinelerSnap.docs.map(d => ({ ...d.data(), id: d.id }));

                const aparatlarSnap = await getDocs(collection(db, 'aparatlar'));
                const aparatlar = aparatlarSnap.docs.map(d => ({ ...d.data(), id: d.id }));

                // Endüstriyel Yıkama Fırçası ve Tynex Fırça veritabanında yoksa varsayılan olarak ekle
                const varsayilanFircalar = [
                    {
                        id: 'std-yikama-fircasi',
                        ad: 'Yıkama Fırçası (Polipropilen)',
                        kategori: 'Özel Pedler ve Fırçalar',
                        aciklama: 'Derzli seramik, kaymaz (safety) zeminler, pürüzlü beton ve silindirik/disk makineler için uzun ömürlü standart polipropilen kıl fırça (Ömür: ~250.000 m²).',
                    },
                    {
                        id: 'std-tynex-firca',
                        ad: 'Tynex Fırça',
                        kategori: 'Özel Pedler ve Fırçalar',
                        aciklama: 'Silisyum karbür emdirilmiş ağır hizmet tipi aşındırıcı fırça. Endüstriyel beton, ağır yağ/kir ve kaymaz zeminlerde maksimum kazıma gücü sağlar (Ömür: ~350.000 m²).',
                    }
                ];
                varsayilanFircalar.forEach(vf => {
                    const varMi = aparatlar.some(a => (a.ad || '').toLowerCase().includes(vf.ad.split(' ')[0].toLowerCase()));
                    if (!varMi) aparatlar.push(vf);
                });
                
                // Ped kategorisini veritabanındaki aparatlardan dinamik olarak çıkartıyoruz
                const dinamikKategoriler = [...new Set(aparatlar.map(a => a.kategori).filter(Boolean))];

                const data = {
                    zeminTipleri: sabitVeriler.zeminTipleri || [],
                    sektorelVeriler: sabitVeriler.sektorelVeriler || {},
                    kirYogunluklari: sabitVeriler.kirYogunluklari || [],
                    yasSecenekleri: ['0-1 Yaş', '1-3 Yaş', '3-5+ Yaş'],
                    kategoriler: dinamikKategoriler.length > 0 ? dinamikKategoriler : (sabitVeriler.kategoriler || []),
                    markalar: sabitVeriler.markalar || [],
                    surusTipleri: sabitVeriler.surusTipleri || [],
                    makineVeritabani: makineler,
                    aparatVeritabani: aparatlar,
                };

                sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
                setDbData(data);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    return { dbData, isLoading, error };
}
