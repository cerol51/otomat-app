import { useState, useEffect, useMemo, useCallback } from 'react';
import { Settings } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { generateScenario, getAkilliPedOnerisi } from '../utils/calculations';
import toast from 'react-hot-toast';

import { useDbData } from '../hooks/useDbData';
import { useCalculations } from '../hooks/useCalculations';
import { InputPanel } from '../components/dashboard/InputPanel';
import { ResultPanel } from '../components/dashboard/ResultPanel';
import { ScenarioModal } from '../components/dashboard/ScenarioModal';

export default function Dashboard() {
    const { dbData, isLoading, error } = useDbData();
    const { currentUser } = useAuth();

    // ── Form State ──
    const [alanInput, setAlanInput]         = useState('');
    const [sektor, setSektor]               = useState('');
    const [zemin, setZemin]                 = useState('');
    const [kirTuru, setKirTuru]             = useState('');
    const [kirYogunlugu, setKirYogunlugu]   = useState('');
    const [seciliMarka, setSeciliMarka]     = useState('');
    const [seciliSurus, setSeciliSurus]     = useState('');
    const [seciliKategori, setSeciliKategori] = useState('');
    const [seciliAparatId, setSeciliAparatId] = useState(null);
    const [seciliMakineId, setSeciliMakineId] = useState(null);
    const [makineYasi, setMakineYasi]       = useState('');

    // ── UI State ──
    const [showScenario, setShowScenario]   = useState(false);
    const [isExporting, setIsExporting]     = useState(false);
    const [isSaving, setIsSaving]           = useState(false);
    const [saveSuccess, setSaveSuccess]     = useState(false);

    // ── Hata bildirimi ──
    useEffect(() => {
        if (error) toast.error('Veritabanına bağlanılamadı: ' + error.message);
    }, [error]);

    // ── Varsayılan değerleri atama iptal edildi, kutular boş başlar ──
    useEffect(() => {
        if (!dbData) return;
        // dbData sadece yüklendiğinde başka işlemler yapılması gerekirse buraya eklenebilir.
    }, [dbData]);

    const {
        zeminTipleri = [], sektorelVeriler = {}, kirYogunluklari = [],
        yasSecenekleri = [], makineVeritabani = [], aparatVeritabani = [],
        kategoriler = [],
    } = dbData || {};

    // ── Dinamik Marka ve Sürüş Tipi Üretimi ──
    const dinamikMarkalar = useMemo(() => {
        return [...new Set(makineVeritabani.map(m => m.marka).filter(Boolean))];
    }, [makineVeritabani]);

    const dinamikSurusTipleri = useMemo(() => {
        return [...new Set(makineVeritabani
            .filter(m => !seciliMarka || m.marka === seciliMarka)
            .map(m => m.surus)
            .filter(Boolean))];
    }, [makineVeritabani, seciliMarka]);

    // ── Manuel Seçimlerde Alt Alanları Sıfırlama ──
    const handleMarkaChange = useCallback((marka) => {
        setSeciliMarka(marka);
        setSeciliSurus('');
        setSeciliMakineId('');
    }, []);

    const handleSurusChange = useCallback((surus) => {
        setSeciliSurus(surus);
        setSeciliMakineId('');
    }, []);

    // ── Sektör değişince kir türünü sıfırla ──
    const handleSektorChange = useCallback((newSektor) => {
        setSektor(newSektor);
        const yeniKirler = sektorelVeriler[newSektor]?.kirler || [];
        if (!yeniKirler.includes(kirTuru)) setKirTuru(yeniKirler[0] || '');
    }, [kirTuru, sektorelVeriler]);

    const handleAlanChange = useCallback((e) => {
        const value = e.target.value;
        if (value === '') {
            setAlanInput('');
        } else {
            const val = Number(value);
            setAlanInput(val >= 0 ? Math.min(val, 1_000_000) : '');
        }
    }, []);

    const handleSelectRecommendedMachine = useCallback((machine) => {
        setSeciliMarka(machine.marka);
        setSeciliSurus(machine.surus);
        setSeciliMakineId(machine.id);
        toast.success(`${machine.marka} ${machine.model} seçildi.`);
    }, []);

    // ── Filtrelenmiş makine listesi ──
    const filtrelenmisMakineler = useMemo(
        () => makineVeritabani.filter(m => m.marka === seciliMarka && m.surus === seciliSurus),
        [seciliMarka, seciliSurus, makineVeritabani]
    );

    useEffect(() => {
        setSeciliAparatId('');
    }, [seciliKategori, aparatVeritabani]);

    const aktifMakine  = makineVeritabani.find(m => m.id === seciliMakineId) || null;
    const aktifAparat  = aparatVeritabani.find(a => a.id === seciliAparatId) || aparatVeritabani[0] || { ad: '', aciklama: '' };

    // Ped önerisi zemin/kir yoğunluğuna bağlı — makine seçiminden bağımsız hesaplanır
    const onerilenPedler = useMemo(() => getAkilliPedOnerisi(zemin, kirYogunlugu), [zemin, kirYogunlugu]);

    const hesaplamalar = useCalculations({ aktifMakine, aktifAparat, alanInput, sektor, zemin, kirYogunlugu, makineYasi });

    // ── Rapor Kaydet ──
    const saveReport = async () => {
        if (isSaving || !hesaplamalar || !aktifMakine || !currentUser) return;
        try {
            setIsSaving(true);
            setSaveSuccess(false);
            await addDoc(collection(db, 'reports'), {
                userId: currentUser.uid,
                createdAt: serverTimestamp(),
                alan: alanInput, sektor, zemin, kirTuru, kirYogunlugu,
                makine: { id: aktifMakine.id, marka: aktifMakine.marka, model: aktifMakine.model },
                aparat: { id: aktifAparat.id, ad: aktifAparat.ad },
                sonuclar: {
                    pratikM2:          hesaplamalar.pratikM2,
                    kaynakSuTuketimi:  hesaplamalar.kaynakSuTuketimi,
                    netYikamaDk:       hesaplamalar.netYikamaDk,
                    toplamOperasyonDk: hesaplamalar.toplamOperasyonDk,
                    gerekliAdet:       hesaplamalar.gerekliAdet,
                },
            });
            sessionStorage.removeItem('otomatReportsCache');
            setSaveSuccess(true);
            toast.success('Rapor başarıyla kaydedildi!');
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Rapor kaydedilemedi:', err);
            toast.error('Rapor kaydedilirken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    // ── PDF Export ──
    const exportPDF = async () => {
        if (isExporting) return;
        try {
            setIsExporting(true);
            await new Promise(resolve => setTimeout(resolve, 100));
            // Dinamik Import (Kütüphaneler sadece tıklandığında indirilir)
            const { jsPDF } = await import('jspdf');
            const htmlToImage = await import('html-to-image');
            
            const element = document.getElementById('report-content');
            
            const dataUrl = await htmlToImage.toJpeg(element, {
                quality: 0.98, backgroundColor: '#ffffff', pixelRatio: 2,
            });
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const imgProps  = pdf.getImageProperties(dataUrl);
            const pdfWidth  = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('otomat_raporu.pdf');
        } catch (err) {
            console.error('PDF Export Error:', err);
            toast.error('PDF dışa aktarılırken bir hata oluştu: ' + err.message);
        } finally {
            setIsExporting(false);
        }
    };

    const handleOpenScenario = useCallback(() => {
        if (aktifMakine && hesaplamalar) setShowScenario(true);
    }, [aktifMakine, hesaplamalar]);

    // ── Yükleniyor ──
    if (isLoading || !dbData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Settings className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="text-slate-600 font-medium text-lg">Veritabanından veriler alınıyor...</p>
                </div>
            </div>
        );
    }

    const scenarioText = (aktifMakine && hesaplamalar) ? generateScenario(
        sektor, zemin, kirTuru, kirYogunlugu,
        aktifMakine.model, aktifMakine.marka, aktifMakine.surus,
        aktifAparat.ad, aktifAparat.aciklama,
        hesaplamalar.kimyasal.aciklama, hesaplamalar.kimyasal.dozajYuzdesi, hesaplamalar.isTwister,
        hesaplamalar.netYikamaDk, hesaplamalar.doldurBosaltDk, hesaplamalar.toplamOperasyonDk,
        hesaplamalar.kaynakSuTuketimi, hesaplamalar.gerekliAdet, hesaplamalar.teorikOmur,
    ) : '';

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                <InputPanel
                    zeminTipleri={zeminTipleri}
                    sektorelVeriler={sektorelVeriler}
                    kirYogunluklari={kirYogunluklari}
                    yasSecenekleri={yasSecenekleri}
                    markalar={dinamikMarkalar}
                    surusTipleri={dinamikSurusTipleri}
                    seciliMarka={seciliMarka} setSeciliMarka={handleMarkaChange}
                    seciliSurus={seciliSurus} setSeciliSurus={handleSurusChange}
                    kategoriler={kategoriler}
                    aparatVeritabani={aparatVeritabani}
                    makineVeritabani={makineVeritabani}
                    filtrelenmisMakineler={filtrelenmisMakineler}
                    onerilenPedler={onerilenPedler}
                    alanInput={alanInput}
                    sektor={sektor}
                    zemin={zemin}
                    kirTuru={kirTuru}
                    kirYogunlugu={kirYogunlugu}
                    seciliMakineId={seciliMakineId}
                    makineYasi={makineYasi}
                    seciliKategori={seciliKategori}
                    seciliAparatId={seciliAparatId}
                    handleAlanChange={handleAlanChange}
                    handleSektorChange={handleSektorChange}
                    setZemin={setZemin}
                    setKirTuru={setKirTuru}
                    setKirYogunlugu={setKirYogunlugu}
                    setSeciliMakineId={setSeciliMakineId}
                    setMakineYasi={setMakineYasi}
                    setSeciliKategori={setSeciliKategori}
                    setSeciliAparatId={setSeciliAparatId}
                    onSelectRecommendedMachine={handleSelectRecommendedMachine}
                />

                {(!aktifMakine || !hesaplamalar) ? (
                    <div className="lg:col-span-8 xl:col-span-9 glass-card rounded-3xl h-full flex flex-col items-center justify-center p-12 text-slate-400 min-h-[400px]">
                        <Settings className="w-16 h-16 mb-4 opacity-30 animate-spin-slow" />
                        <p className="font-medium text-lg text-center">Sistem analizi için sol menüden geçerli bir makine modeli seçin.</p>
                    </div>
                ) : (
                    <ResultPanel
                        aktifMakine={aktifMakine}
                        aktifAparat={aktifAparat}
                        hesaplamalar={hesaplamalar}
                        isSaving={isSaving}
                        saveSuccess={saveSuccess}
                        onSaveReport={saveReport}
                        isExporting={isExporting}
                        onExportPDF={exportPDF}
                        onOpenScenario={handleOpenScenario}
                    />
                )}
            </div>

            <ScenarioModal
                show={showScenario}
                onClose={() => setShowScenario(false)}
                aktifMakine={aktifMakine}
                alanInput={alanInput}
                zemin={zemin}
                kirTuru={kirTuru}
                kirYogunlugu={kirYogunlugu}
                scenarioText={scenarioText}
            />
        </div>
    );
}
