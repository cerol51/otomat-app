import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const CACHE_KEY = 'otomatDbCacheV5';

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
