import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import { taskiMachines } from "./src/components/admin/taskiData.js";
import { karcherMachines } from "./src/components/admin/karcherData.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZ4mSB04jAWhhdekomaJNCruP6vd73MdE",
  authDomain: "otomat-app-d0338.firebaseapp.com",
  projectId: "otomat-app-d0338",
  storageBucket: "otomat-app-d0338.firebasestorage.app",
  messagingSenderId: "1091641931731",
  appId: "1:1091641931731:web:271c62058a16b88bbb2126"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncMachines() {
  const colRef = collection(db, 'makineler');
  const allMachines = [...taskiMachines, ...karcherMachines];
  let updated = 0;
  let added = 0;

  console.log(`Veritabanındaki makine kayıtları güncelleniyor. Toplam ${allMachines.length} makine işlenecek...`);

  for (const m of allMachines) {
      const dataToSave = {
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
      };

      const q = query(colRef, where("marka", "==", m.marka), where("model", "==", m.model));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
          console.log(`+ EKLENDİ: ${m.marka} ${m.model}`);
          await addDoc(colRef, dataToSave);
          added++;
      } else {
          console.log(`* GÜNCELLENDİ: ${m.marka} ${m.model}`);
          // Update the first matching document
          const docId = querySnapshot.docs[0].id;
          await setDoc(doc(db, 'makineler', docId), dataToSave, { merge: true });
          updated++;
      }
  }
  console.log(`\nİşlem tamamlandı! Toplam Eklendi: ${added}, Toplam Güncellendi: ${updated}`);
  process.exit(0);
}

syncMachines();
