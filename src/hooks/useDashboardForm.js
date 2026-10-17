import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useDashboardForm(sektorelVeriler) {
    const [musteriAdi, setMusteriAdi] = useState('');
    const [alanInput, setAlanInput] = useState('');
    const [sektor, setSektor] = useState('');
    const [zemin, setZemin] = useState('');
    const [kirTuru, setKirTuru] = useState('');
    const [kirYogunlugu, setKirYogunlugu] = useState('');
    const [isCilaliZemin, setIsCilaliZemin] = useState(false);
    const [seciliMarka, setSeciliMarka] = useState('');
    const [seciliSurus, setSeciliSurus] = useState('');
    const [seciliKategori, setSeciliKategori] = useState('');
    const [seciliAparatId, setSeciliAparatId] = useState(null);
    const [seciliMakineId, setSeciliMakineId] = useState(null);
    const [makineYasi, setMakineYasi] = useState('');

    // ── Operasyonel Birim Maliyetler (TL) ──
    const [birimMaliyetler, setBirimMaliyetler] = useState({
        suM3Fiyat: 45,          // 1 m³ (1000 L) şebeke suyu fiyatı (₺)
        kimyasalLtFiyat: 120,   // 1 Litre kimyasal fiyatı (₺)
        pedAdetFiyat: 450,      // 1 Adet ped/fırça fiyatı (₺)
        iscilikSaatFiyat: 250,  // 1 Saatlik operatör maliyeti (₺)
    });

    const handleMaliyetChange = useCallback((field, val) => {
        const num = val === '' ? 0 : Math.max(0, Number(val));
        setBirimMaliyetler(prev => ({ ...prev, [field]: num }));
    }, []);

    const handleAlanChange = useCallback((e) => {
        const value = e.target.value;
        if (value === '') {
            setAlanInput('');
        } else {
            const val = Number(value);
            setAlanInput(val >= 0 ? Math.min(val, 1_000_000) : '');
        }
    }, []);

    const handleSektorChange = useCallback((newSektor) => {
        setSektor(newSektor);
        const yeniKirler = sektorelVeriler?.[newSektor]?.kirler || [];
        if (!yeniKirler.includes(kirTuru)) setKirTuru(yeniKirler[0] || '');
    }, [kirTuru, sektorelVeriler]);

    const handleMarkaChange = useCallback((marka) => {
        setSeciliMarka(marka);
        setSeciliSurus('');
        setSeciliMakineId('');
    }, []);

    const handleSurusChange = useCallback((surus) => {
        setSeciliSurus(surus);
        setSeciliMakineId('');
    }, []);

    const handleSelectRecommendedMachine = useCallback((machine) => {
        setSeciliMarka(machine.marka);
        setSeciliSurus(machine.surus);
        setSeciliMakineId(machine.id);
        toast.success(`${machine.marka} ${machine.model} seçildi.`);
    }, []);

    const handleKategoriChange = useCallback((kategori) => {
        setSeciliKategori(kategori);
        setSeciliAparatId('');
    }, []);

    const loadFromReport = useCallback((report, makineVeritabani = [], aparatVeritabani = []) => {
        if (!report) return;
        setMusteriAdi(report.musteriAdi || '');
        setAlanInput(report.alan || '');
        setSektor(report.sektor || '');
        setZemin(report.zemin || '');
        setKirTuru(report.kirTuru || '');
        setKirYogunlugu(report.kirYogunlugu || '');
        setIsCilaliZemin(Boolean(report.isCilaliZemin));
        setMakineYasi(report.makineYasi || '0-1 Yaş');

        const foundMakine = makineVeritabani.find(m => m.id === report.makine?.id) ||
                            makineVeritabani.find(m => m.marka === report.makine?.marka && m.model === report.makine?.model);
        if (foundMakine) {
            setSeciliMarka(foundMakine.marka);
            setSeciliSurus(foundMakine.surus);
            setSeciliMakineId(foundMakine.id);
        }

        const foundAparat = aparatVeritabani.find(a => a.id === report.aparat?.id) ||
                            aparatVeritabani.find(a => a.ad === report.aparat?.ad);
        if (foundAparat) {
            setSeciliKategori(foundAparat.kategori || '');
            setSeciliAparatId(foundAparat.id);
        }
    }, []);

    return {
        musteriAdi, setMusteriAdi,
        alanInput, setAlanInput, handleAlanChange,
        sektor, setSektor, handleSektorChange,
        zemin, setZemin,
        kirTuru, setKirTuru,
        kirYogunlugu, setKirYogunlugu,
        isCilaliZemin, setIsCilaliZemin,
        seciliMarka, setSeciliMarka, handleMarkaChange,
        seciliSurus, setSeciliSurus, handleSurusChange,
        seciliKategori, setSeciliKategori, handleKategoriChange,
        seciliAparatId, setSeciliAparatId,
        seciliMakineId, setSeciliMakineId, handleSelectRecommendedMachine,
        makineYasi, setMakineYasi,
        birimMaliyetler, handleMaliyetChange,
        loadFromReport,
    };
}
