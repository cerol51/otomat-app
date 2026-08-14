import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Settings } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (password !== passwordConfirm) {
            return setError('Şifreler eşleşmiyor.');
        }

        try {
            setError('');
            setLoading(true);
            await register(email, password);
            navigate('/app');
        } catch (err) {
            console.error("Kayıt Hatası:", err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Bu e-posta adresi zaten kullanımda.');
            } else if (err.code === 'auth/weak-password') {
                setError('Şifreniz çok zayıf. En az 6 karakter olmalıdır.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('HATA: Firebase Console üzerinden "Email/Password" girişi aktifleştirilmemiş! Lütfen Firebase Authentication ayarlarından etkinleştirin.');
            } else {
                setError('Hesap oluşturulamadı: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full glass-card p-8 rounded-3xl shadow-xl shadow-purple-100 border-t-4 border-purple-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 mb-4">
                        <Settings size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">Hesap Oluştur</h2>
                    <p className="text-slate-500 mt-2 font-medium">Temizlik senaryoları ve raporlar hazırlamak için ücretsiz katılın.</p>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold mb-6 border border-rose-200 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">E-posta</label>
                        <input 
                            type="email" 
                            required 
                            className="w-full border border-gray-200/80 bg-white rounded-xl p-3 text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Şifre (En az 6 karakter)</label>
                        <input 
                            type="password" 
                            required 
                            minLength="6"
                            className="w-full border border-gray-200/80 bg-white rounded-xl p-3 text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Şifre Tekrar</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full border border-gray-200/80 bg-white rounded-xl p-3 text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        disabled={loading}
                        type="submit" 
                        className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all disabled:opacity-70"
                    >
                        {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-600 font-medium">
                    Zaten bir hesabınız var mı? <Link to="/login" className="text-purple-600 hover:text-purple-700 font-bold">Giriş Yap</Link>
                </div>
            </div>
        </div>
    );
}
