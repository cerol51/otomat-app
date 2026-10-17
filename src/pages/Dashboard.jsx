import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { generateScenario, getAkilliPedOnerisi } from '../utils/calculations';
import toast from 'react-hot-toast';

import { useDbData } from '../hooks/useDbData';
import { useCalculations } from '../hooks/useCalculations';
import { useDashboardForm } from '../hooks/useDashboardForm';
import { InputPanel } from '../components/dashboard/InputPanel';
import { ResultPanel } from '../components/dashboard/ResultPanel';
import { ScenarioModal } from '../components/dashboard/ScenarioModal';

export default function Dashboard() {
    const { dbData, isLoading, error } = useDbData();
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // ── Form State (Hook ile yönetiliyor) ──
    const {
        musteriAdi, setMusteriAdi,
        alanInput, handleAlanChange,
        sektor, handleSektorChange,
        zemin, setZemin,
        kirTuru, setKirTuru,
        kirYogunlugu, setKirYogunlugu,
        isCilaliZemin, setIsCilaliZemin,
        seciliMarka, handleMarkaChange,
        seciliSurus, handleSurusChange,
        seciliKategori, handleKategoriChange,
        seciliAparatId, setSeciliAparatId,
        seciliMakineId, setSeciliMakineId, handleSelectRecommendedMachine,
        makineYasi, setMakineYasi,
        birimMaliyetler, handleMaliyetChange,
        loadFromReport,
    } = useDashboardForm(dbData?.sektorelVeriler || {});

    // ── UI State ──
    const [showScenario, setShowScenario]   = useState(false);
    const [isExporting, setIsExporting]     = useState(false);
    const [isSaving, setIsSaving]           = useState(false);
    const [saveSuccess, setSaveSuccess]     = useState(false);

    // ── Referanslar ──
    const resultsRef = useRef(null);

    const scrollToResults = useCallback(() => {
        if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    // ── Hata bildirimi ──
    useEffect(() => {
        if (error) toast.error('Veritabanına bağlanılamadı: ' + error.message);
    }, [error]);

    const {
        zeminTipleri = [], sektorelVeriler = {}, kirYogunluklari = [],
        yasSecenekleri = [], makineVeritabani = [], aparatVeritabani = [],
        kategoriler = [],
    } = dbData || {};

    // ── Geçmiş Rapordan Geri Yükleme Desteği ──
    useEffect(() => {
        if (!dbData || !location.state?.loadReport) return;
        loadFromReport(location.state.loadReport, makineVeritabani, aparatVeritabani);
        toast.success('Rapor verileri hesaplayıcıya yüklendi!');
        navigate(location.pathname, { replace: true, state: {} });
    }, [dbData, location.state, location.pathname, loadFromReport, makineVeritabani, aparatVeritabani, navigate]);

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

    // ── Filtrelenmiş makine listesi ──
    const filtrelenmisMakineler = useMemo(
        () => makineVeritabani.filter(m => m.marka === seciliMarka && m.surus === seciliSurus),
        [seciliMarka, seciliSurus, makineVeritabani]
    );

    const aktifMakine  = makineVeritabani.find(m => m.id === seciliMakineId) || null;
    const aktifAparat  = seciliAparatId 
        ? (aparatVeritabani.find(a => a.id === seciliAparatId) || { ad: '', aciklama: '' }) 
        : { ad: '', aciklama: 'Uyarı: Herhangi bir ped veya fırça seçmediniz. Lütfen operasyon türünüze uygun bir aparat seçin.' };

    // Ped önerisi zemin/kir yoğunluğuna bağlı — makine seçiminden bağımsız hesaplanır
    const onerilenPedler = useMemo(() => getAkilliPedOnerisi(zemin, kirYogunlugu), [zemin, kirYogunlugu]);

    const hesaplamalar = useCalculations({ aktifMakine, aktifAparat, alanInput, sektor, zemin, kirYogunlugu, makineYasi, isCilaliZemin });

    // ── Rapor Kaydet ──
    const saveReport = async () => {
        if (isSaving || !hesaplamalar || !aktifMakine || !currentUser) return;
        try {
            setIsSaving(true);
            setSaveSuccess(false);
            await addDoc(collection(db, 'reports'), {
                userId: currentUser.uid,
                createdAt: serverTimestamp(),
                musteriAdi: musteriAdi ? musteriAdi.trim() : '',
                alan: alanInput, sektor, zemin, kirTuru, kirYogunlugu,
                isCilaliZemin: Boolean(isCilaliZemin),
                makineYasi: makineYasi || '0-1 Yaş',
                makine: { id: aktifMakine.id, marka: aktifMakine.marka, model: aktifMakine.model },
                aparat: { id: aktifAparat.id || '', ad: aktifAparat.ad || '' },
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
            
            // PDF fix - mobilde de düzgün çıkması için sabit genişlik
            const originalWidth = element.style.width;
            const originalMaxWidth = element.style.maxWidth;
            element.style.width = '800px';
            element.style.maxWidth = 'none';
            
            const dataUrl = await htmlToImage.toJpeg(element, {
                quality: 0.98, backgroundColor: '#ffffff', pixelRatio: 2,
            });

            // Eski haline geri çevir
            element.style.width = originalWidth;
            element.style.maxWidth = originalMaxWidth;

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const imgProps  = pdf.getImageProperties(dataUrl);
            const pdfWidth  = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            const safeFileName = musteriAdi ? `${musteriAdi.trim().replace(/\s+/g, '_')}_rapor.pdf` : 'otomat_raporu.pdf';
            pdf.save(safeFileName);
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
        hesaplamalar.kaynakSuTuketimi, hesaplamalar.gerekliAdet, hesaplamalar.teorikOmur, isCilaliZemin
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
                    musteriAdi={musteriAdi}
                    alanInput={alanInput}
                    sektor={sektor}
                    zemin={zemin}
                    kirTuru={kirTuru}
                    kirYogunlugu={kirYogunlugu}
                    isCilaliZemin={isCilaliZemin}
                    seciliMakineId={seciliMakineId}
                    makineYasi={makineYasi}
                    seciliKategori={seciliKategori}
                    seciliAparatId={seciliAparatId}
                    setMusteriAdi={setMusteriAdi}
                    handleAlanChange={handleAlanChange}
                    handleSektorChange={handleSektorChange}
                    setZemin={setZemin}
                    setKirTuru={setKirTuru}
                    setKirYogunlugu={setKirYogunlugu}
                    setIsCilaliZemin={setIsCilaliZemin}
                    setSeciliMakineId={setSeciliMakineId}
                    setMakineYasi={setMakineYasi}
                    setSeciliKategori={handleKategoriChange}
                    setSeciliAparatId={setSeciliAparatId}
                    onSelectRecommendedMachine={handleSelectRecommendedMachine}
                    onScrollToResults={scrollToResults}
                />

                {(!aktifMakine || !hesaplamalar) ? (
                    <div className="lg:col-span-8 xl:col-span-9 glass-card rounded-3xl h-full flex flex-col items-center justify-center p-8 md:p-12 text-slate-500 min-h-[400px] shadow-lg shadow-slate-200/50">
                        <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full mb-6 shadow-inner">
                            <Settings className="w-12 h-12 animate-spin-slow" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Sistem Analizi Bekleniyor</h2>
                        <p className="text-center font-medium max-w-md mb-10">
                            Operasyonel maliyet, zaman ve kaynak tüketimi sonuçlarını görmek için sol taraftaki formu doldurun.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                            <div className="bg-white/60 p-5 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
                                <span className="text-3xl mb-3">🏢</span>
                                <h3 className="font-bold text-slate-700 text-sm">1. Alan ve Zemin</h3>
                                <p className="text-xs text-slate-500 mt-1">Tesis ve kirlilik bilgilerini girin.</p>
                            </div>
                            <div className="bg-white/60 p-5 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
                                <span className="text-3xl mb-3">⚙️</span>
                                <h3 className="font-bold text-slate-700 text-sm">2. Makine ve Ped</h3>
                                <p className="text-xs text-slate-500 mt-1">Akıllı önerileri kullanın.</p>
                            </div>
                            <div className="bg-white/60 p-5 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
                                <span className="text-3xl mb-3">📊</span>
                                <h3 className="font-bold text-slate-700 text-sm">3. Rapor İnceleme</h3>
                                <p className="text-xs text-slate-500 mt-1">Maliyetleri PDF'e aktarın.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div ref={resultsRef} className="lg:col-span-8 xl:col-span-9">
                        <ResultPanel
                            musteriAdi={musteriAdi}
                            alanInput={alanInput}
                            aktifMakine={aktifMakine}
                            aktifAparat={aktifAparat}
                            hesaplamalar={hesaplamalar}
                            birimMaliyetler={birimMaliyetler}
                            onMaliyetChange={handleMaliyetChange}
                            isSaving={isSaving}
                            saveSuccess={saveSuccess}
                            onSaveReport={saveReport}
                            isExporting={isExporting}
                            onExportPDF={exportPDF}
                            onOpenScenario={handleOpenScenario}
                        />
                    </div>
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
                musteriAdi={musteriAdi}
            />
        </div>
    );
}
