import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useDashboardForm(sektorelVeriler) {
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

    return {
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
        makineYasi, setMakineYasi
    };
}
