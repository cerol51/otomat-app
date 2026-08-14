import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAZ4mSB04jAWhhdekomaJNCruP6vd73MdE",
  projectId: "otomat-app-d0338",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    const snap = await getDocs(collection(db, 'makineler'));
    const machines = snap.docs.map(d => ({id: d.id, ...d.data()}));
    console.log(JSON.stringify(machines.map(m => m.marka + " " + m.model + " (" + m.id + ")"), null, 2));
    process.exit(0);
}
check();
