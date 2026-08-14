import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Settings } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/app');
        } catch (err) {
            console.error("Giriş Hatası:", err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('E-posta veya şifre hatalı.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('HATA: Firebase Console üzerinden "Email/Password" girişi aktifleştirilmemiş!');
            } else {
                setError('Giriş başarısız: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full glass-card p-8 rounded-3xl shadow-xl shadow-indigo-100 border-t-4 border-indigo-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-4">
                        <Settings size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">Otomat'a Giriş Yap</h2>
                    <p className="text-slate-500 mt-2 font-medium">Temizlik analizlerinizi oluşturmak için giriş yapın.</p>
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
                            className="w-full border border-gray-200/80 bg-white rounded-xl p-3 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Şifre</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full border border-gray-200/80 bg-white rounded-xl p-3 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        disabled={loading}
                        type="submit" 
                        className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all disabled:opacity-70"
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-600 font-medium">
                    Hesabınız yok mu? <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold">Kayıt Ol</Link>
                </div>
            </div>
        </div>
    );
}
