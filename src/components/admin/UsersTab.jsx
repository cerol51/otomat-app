import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

export function UsersTab() {
    const [kullanicilar, setKullanicilar] = useState([]);

    useEffect(() => {
        const unSub = onSnapshot(collection(db, 'users'), snapshot => {
            setKullanicilar(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
        });
        return () => unSub();
    }, []);

    return (
        <div>
            <div className="mb-4">
                <h3 className="font-black text-slate-800 text-lg mb-2">Sisteme Kayıtlı Kullanıcılar</h3>
                <p className="text-sm text-slate-500">Bu listede uygulamaya giriş yapmış olan kullanıcıların e-posta adresleri yer alır.</p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex flex-col gap-3">
                    {kullanicilar.length === 0 && <p className="text-sm text-slate-500">Henüz kullanıcı bulunmuyor.</p>}
                    {kullanicilar.map(k => (
                        <div key={k.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                    {k.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{k.email}</h4>
                                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                                        Son Giriş: {k.lastLogin ? new Date(k.lastLogin).toLocaleString('tr-TR') : 'Bilinmiyor'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
