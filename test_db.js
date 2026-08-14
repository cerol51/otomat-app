import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc, getDocs, collection, updateDoc, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const aparatlarSnap = await getDocs(collection(db, 'aparatlar'));
    const aparatlar = aparatlarSnap.docs.map(d => ({id: d.id, ...d.data()}));
    console.log(JSON.stringify(aparatlar, null, 2));
}

run();
