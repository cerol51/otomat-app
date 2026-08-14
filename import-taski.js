import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

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
const db = getFirestore(app);

const taskiMachines = [
  {
    "marka": "Taski",
    "model": "swingo 250µicro",
    "surus": "İtmeli",
    "calismaGenisligi": 44,
    "fircaSayisi": 2,
    "siliciLastikGenisligi": 52,
    "boyutlar": "45 x 52 x 120",
    "temizSuTanki": 2.2,
    "kirliSuTanki": 3,
    "teorikPerformans": 1320,
    "pratikPerformans": 800,
    "tekSarjSure": 1.33,
    "tamSarjSure": "1,5",
    "tekSarjPratikAlan": 1064,
    "onerilenAlan": "Paspas Yerine Geçen Küçük Alanlar"
  },
  {
    "marka": "Taski",
    "model": "swingo 455 B",
    "surus": "İtmeli",
    "calismaGenisligi": 43,
    "fircaSayisi": 1,
    "siliciLastikGenisligi": 69,
    "boyutlar": "110 x 48 x 92",
    "temizSuTanki": 22,
    "kirliSuTanki": 25,
    "teorikPerformans": 1290,
    "pratikPerformans": 850,
    "tekSarjSure": 1.5,
    "tamSarjSure": "8 - 10",
    "tekSarjPratikAlan": 1275,
    "onerilenAlan": "Sıkışık Alanlar, Marketler"
  },
  {
    "marka": "Taski",
    "model": "swingo 755 B",
    "surus": "İtmeli",
    "calismaGenisligi": 43,
    "fircaSayisi": 1,
    "siliciLastikGenisligi": 69,
    "boyutlar": "116 x 48 x 120",
    "temizSuTanki": 40,
    "kirliSuTanki": 40,
    "teorikPerformans": 1935,
    "pratikPerformans": 1160,
    "tekSarjSure": 2,
    "tamSarjSure": "8 - 10",
    "tekSarjPratikAlan": 2320,
    "onerilenAlan": "Genel Zemin Temizliği"
  },
  {
    "marka": "Taski",
    "model": "swingo 855 B",
    "surus": "İtmeli",
    "calismaGenisligi": 50,
    "fircaSayisi": 1,
    "siliciLastikGenisligi": 69,
    "boyutlar": "122 x 53 x 120",
    "temizSuTanki": 40,
    "kirliSuTanki": 40,
    "teorikPerformans": 2250,
    "pratikPerformans": 1350,
    "tekSarjSure": 2.5,
    "tamSarjSure": "8 - 10",
    "tekSarjPratikAlan": 3375,
    "onerilenAlan": "Orta Ölçekli İşletmeler"
  },
  {
    "marka": "Taski",
    "model": "swingo 1255 B",
    "surus": "İtmeli",
    "calismaGenisligi": 55,
    "fircaSayisi": 2,
    "siliciLastikGenisligi": 80,
    "boyutlar": "142 x 58 x 117",
    "temizSuTanki": 60,
    "kirliSuTanki": 60,
    "teorikPerformans": 2475,
    "pratikPerformans": 1800,
    "tekSarjSure": 3.5,
    "tamSarjSure": "8 - 10",
    "tekSarjPratikAlan": 6300,
    "onerilenAlan": "Orta / Büyük Ölçekli Tesisler"
  },
  {
    "marka": "Taski",
    "model": "swingo 1650",
    "surus": "İtmeli",
    "calismaGenisligi": 65,
    "fircaSayisi": 2,
    "siliciLastikGenisligi": 95,
    "boyutlar": "154 x 69 x 118",
    "temizSuTanki": 85,
    "kirliSuTanki": 85,
    "teorikPerformans": 2925,
    "pratikPerformans": 2200,
    "tekSarjSure": 4,
    "tamSarjSure": "10 - 12",
    "tekSarjPratikAlan": 8800,
    "onerilenAlan": "Geniş Koridorlar, Hastaneler"
  },
  {
    "marka": "Taski",
    "model": "swingo 1850",
    "surus": "İtmeli",
    "calismaGenisligi": 85,
    "fircaSayisi": 2,
    "siliciLastikGenisligi": 110,
    "boyutlar": "164 x 88 x 119",
    "temizSuTanki": 85,
    "kirliSuTanki": 85,
    "teorikPerformans": 3825,
    "pratikPerformans": 2700,
    "tekSarjSure": 4.5,
    "tamSarjSure": "10 - 12",
    "tekSarjPratikAlan": 12150,
    "onerilenAlan": "Geniş Tesisler, Depolar"
  },
  {
    "marka": "Taski",
    "model": "swingo 2100micro",
    "surus": "Binicili",
    "calismaGenisligi": 55,
    "fircaSayisi": 2,
    "siliciLastikGenisligi": 73,
    "boyutlar": "138 x 58 x 128",
    "temizSuTanki": 75,
    "kirliSuTanki": 75,
    "teorikPerformans": 3025,
    "pratikPerformans": 2300,
    "tekSarjSure": 4,
    "tamSarjSure": "10 - 12",
    "tekSarjPratikAlan": 9200,
    "onerilenAlan": "Dinamik, Yoğun Trafikli Alanlar"
  },
  {
    "marka": "Taski",
    "model": "swingo XPM",
    "surus": "Binicili",
    "calismaGenisligi": 65,
    "fircaSayisi": 2,
    "siliciLastikGenisligi": 95,
    "boyutlar": "135 x 65 x 125",
    "temizSuTanki": 75,
    "kirliSuTanki": 75,
    "teorikPerformans": 3575,
    "pratikPerformans": 2700,
    "tekSarjSure": 4.5,
    "tamSarjSure": "10 - 12",
    "tekSarjPratikAlan": 12150,
    "onerilenAlan": "IntelliSweep (2'si 1 arada) Geniş Alan"
  },
  {
    "marka": "Taski",
    "model": "swingo XPR",
    "surus": "Binicili",
    "calismaGenisligi": 65,
    "fircaSayisi": 2,
    "siliciLastikGenisligi": 95,
    "boyutlar": "141 x 69 x 124",
    "temizSuTanki": 75,
    "kirliSuTanki": 75,
    "teorikPerformans": 3575,
    "pratikPerformans": 2700,
    "tekSarjSure": 4.5,
    "tamSarjSure": "10 - 12",
    "tekSarjPratikAlan": 12150,
    "onerilenAlan": "Büyük Süpermarketler, Lobiler"
  },
  {
    "marka": "Taski",
    "model": "swingo 2500",
    "surus": "Binicili",
    "calismaGenisligi": 70,
    "fircaSayisi": 2,
    "siliciLastikGenisligi": 95,
    "boyutlar": "169 x 78 x 137",
    "temizSuTanki": 95,
    "kirliSuTanki": 95,
    "teorikPerformans": 4550,
    "pratikPerformans": 3400,
    "tekSarjSure": 4.5,
    "tamSarjSure": "10 - 12",
    "tekSarjPratikAlan": 15300,
    "onerilenAlan": "Geniş Kapalı Alanlar, AVM'ler"
  },
  {
    "marka": "Taski",
    "model": "swingo 4000",
    "surus": "Binicili",
    "calismaGenisligi": 85,
    "fircaSayisi": 2,
    "siliciLastikGenisligi": 110,
    "boyutlar": "178 x 89 x 140",
    "temizSuTanki": 200,
    "kirliSuTanki": 210,
    "teorikPerformans": 6375,
    "pratikPerformans": 4800,
    "tekSarjSure": 6,
    "tamSarjSure": "10 - 12",
    "tekSarjPratikAlan": 28800,
    "onerilenAlan": "Endüstriyel Alanlar, Büyük Depolar"
  },
  {
    "marka": "Taski",
    "model": "swingo 5000",
    "surus": "Binicili",
    "calismaGenisligi": 105,
    "fircaSayisi": 4,
    "siliciLastikGenisligi": 129,
    "boyutlar": "178 x 109 x 140",
    "temizSuTanki": 200,
    "kirliSuTanki": 210,
    "teorikPerformans": 7875,
    "pratikPerformans": 6000,
    "tekSarjSure": 6.5,
    "tamSarjSure": "10 - 12",
    "tekSarjPratikAlan": 39000,
    "onerilenAlan": "Maksimum Verimlilik Gereken Dev Tesisler"
  },
  {
    "marka": "Taski",
    "model": "ULTIMAXX 900 Single Disc",
    "surus": "İtmeli",
    "calismaGenisligi": 43,
    "fircaSayisi": 1,
    "siliciLastikGenisligi": 69,
    "boyutlar": "116 x 48 x 120",
    "temizSuTanki": 20,
    "kirliSuTanki": 22,
    "teorikPerformans": 1935,
    "pratikPerformans": 1160,
    "tekSarjSure": 2.5,
    "tamSarjSure": "2 - 3 (IntelliPower Li Ion)",
    "tekSarjPratikAlan": 2900,
    "onerilenAlan": "Kompakt Modüler Alanlar"
  },
  {
    "marka": "Taski",
    "model": "ULTIMAXX 900 Double Disc",
    "surus": "İtmeli",
    "calismaGenisligi": 55,
    "fircaSayisi": 2,
    "siliciLastikGenisligi": 82,
    "boyutlar": "120 x 60 x 111",
    "temizSuTanki": 20,
    "kirliSuTanki": 22,
    "teorikPerformans": 2475,
    "pratikPerformans": 1485,
    "tekSarjSure": 2.5,
    "tamSarjSure": "2 - 3 (IntelliPower Li Ion)",
    "tekSarjPratikAlan": 3712,
    "onerilenAlan": "Kompakt Modüler Alanlar"
  },
  {
    "marka": "Taski",
    "model": "ULTIMAXX 1900 Single Disc",
    "surus": "İtmeli",
    "calismaGenisligi": 43,
    "fircaSayisi": 1,
    "siliciLastikGenisligi": 72,
    "boyutlar": "125 x 54 x 111",
    "temizSuTanki": 43,
    "kirliSuTanki": 45,
    "teorikPerformans": 1935,
    "pratikPerformans": 1160,
    "tekSarjSure": 4,
    "tamSarjSure": "2 - 3 (IntelliPower Li Ion)",
    "tekSarjPratikAlan": 4640,
    "onerilenAlan": "Modüler / Yüksek Hijyen (HEPA)"
  },
  {
    "marka": "Taski",
    "model": "ULTIMAXX 1900 Double Disc",
    "surus": "İtmeli",
    "calismaGenisligi": 55,
    "fircaSayisi": 2,
    "siliciLastikGenisligi": 82,
    "boyutlar": "120 x 60 x 111",
    "temizSuTanki": 43,
    "kirliSuTanki": 45,
    "teorikPerformans": 2475,
    "pratikPerformans": 1485,
    "tekSarjSure": 4,
    "tamSarjSure": "2 - 3 (IntelliPower Li Ion)",
    "tekSarjPratikAlan": 5940,
    "onerilenAlan": "Modüler / Esnek Alanlar"
  },
  {
    "marka": "Taski",
    "model": "ULTIMAXX 2900 Single Disc",
    "surus": "İtmeli",
    "calismaGenisligi": 50,
    "fircaSayisi": 1,
    "siliciLastikGenisligi": 80,
    "boyutlar": "149 x 70 x 113",
    "temizSuTanki": 60,
    "kirliSuTanki": 63,
    "teorikPerformans": 2250,
    "pratikPerformans": 1500,
    "tekSarjSure": 4.5,
    "tamSarjSure": "2 - 3 (IntelliPower Li Ion)",
    "tekSarjPratikAlan": 6750,
    "onerilenAlan": "Modüler / Yüksek Hijyen (HEPA)"
  },
  {
    "marka": "Taski",
    "model": "ULTIMAXX 2900 Double Disc",
    "surus": "İtmeli",
    "calismaGenisligi": 55,
    "fircaSayisi": 2,
    "siliciLastikGenisligi": 80,
    "boyutlar": "149 x 70 x 113",
    "temizSuTanki": 60,
    "kirliSuTanki": 63,
    "teorikPerformans": 2475,
    "pratikPerformans": 1650,
    "tekSarjSure": 4.5,
    "tamSarjSure": "2 - 3 (IntelliPower Li Ion)",
    "tekSarjPratikAlan": 7425,
    "onerilenAlan": "Modüler / Yüksek Hijyen (HEPA)"
  }
];

async function importData() {
  const colRef = collection(db, 'makineler');
  
  for (const machine of taskiMachines) {
      // Check if machine already exists
      const q = query(colRef, where("marka", "==", machine.marka), where("model", "==", machine.model));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
          console.log(`Adding ${machine.model}...`);
          await addDoc(colRef, machine);
      } else {
          console.log(`${machine.model} already exists, skipping...`);
      }
  }
  console.log('Import completed.');
  process.exit(0);
}

importData();
