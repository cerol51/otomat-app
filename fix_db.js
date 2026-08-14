import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try {
    const app = initializeApp();
    const db = getFirestore(app);

    async function run() {
        const sabitDoc = await db.collection('sabitVeriler').doc('uygulamaAyarlari').get();
        console.log("kategoriler:", sabitDoc.data().kategoriler);

        const aparatlarSnap = await db.collection('aparatlar').get();
        const aparatlar = aparatlarSnap.docs.map(d => ({id: d.id, ...d.data()}));
        console.log("aparatlar:", JSON.stringify(aparatlar.map(a => [a.id, a.kategori, a.ad])));
    }

    run();
} catch (e) {
    console.error(e);
}
