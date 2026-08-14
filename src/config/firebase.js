import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZ4mSB04jAWhhdekomaJNCruP6vd73MdE",
  authDomain: "otomat-app-d0338.firebaseapp.com",
  projectId: "otomat-app-d0338",
  storageBucket: "otomat-app-d0338.firebasestorage.app",
  messagingSenderId: "1091641931731",
  appId: "1:1091641931731:web:271c62058a16b88bbb2126",
  measurementId: "G-L5M7VXMTL8"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
