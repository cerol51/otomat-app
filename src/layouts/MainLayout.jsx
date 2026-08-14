import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Settings, LogOut, FileText, LayoutDashboard, ShieldAlert, BookOpen, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function MainLayout() {
    const { currentUser, logout, isAdmin } = useAuth();
    const navigate  = useNavigate();
    const location  = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Sayfa değişince mobil menüyü kapat
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Çıkış yapılamadı:', error);
        }
    }

    const isActive = path => location.pathname === path;

    // Nav link tanımları
    const navLinks = [
        { to: '/app',          label: 'Hesaplayıcı',      Icon: LayoutDashboard, admin: false },
        { to: '/app/reports',  label: 'Geçmiş Raporlarım', Icon: FileText,         admin: false },
        { to: '/app/guide',    label: 'Nasıl Kullanılır?', Icon: BookOpen,         admin: false },
        ...(isAdmin ? [{ to: '/app/admin', label: 'Admin Paneli', Icon: ShieldAlert, admin: true }] : []),
    ];

    const linkCls = (path, adminLink) => {
        const active = isActive(path);
        if (adminLink) {
            return `px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
                active ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'
            }`;
        }
        return `px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
            active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`;
    };

    const mobileLinkCls = (path, adminLink) => {
        const active = isActive(path);
        if (adminLink) {
            return `px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors w-full ${
                active ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50'
            }`;
        }
        return `px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors w-full ${
            active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
        }`;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

            {/* ── Navbar ── */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm no-print">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
                    <div className="flex justify-between h-16">

                        {/* Sol: Logo + Masaüstü Linkler */}
                        <div className="flex items-center gap-8">
                            <Link to="/app" className="flex items-center gap-2">
                                <Settings className="w-8 h-8 text-indigo-600" />
                                <span className="font-black text-xl tracking-tight text-slate-800">
                                    Otomat<span className="text-indigo-600">Pro</span>
                                </span>
                            </Link>

                            {/* Masaüstü Nav Linkleri */}
                            <div className="hidden md:flex items-center gap-1">
                                {navLinks.map(({ to, label, Icon, admin }) => (
                                    <Link key={to} to={to} className={linkCls(to, admin)}>
                                        <Icon size={18} /> {label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Sağ: Kullanıcı + Çıkış + Hamburger */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hoş Geldiniz</p>
                                <p className="text-sm font-bold text-slate-800 max-w-[180px] truncate">{currentUser?.email}</p>
                            </div>

                            {/* Masaüstü Çıkış Butonu */}
                            <button
                                onClick={handleLogout}
                                className="hidden md:flex p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                title="Çıkış Yap"
                            >
                                <LogOut size={20} />
                            </button>

                            {/* Mobil Hamburger */}
                            <button
                                onClick={() => setMobileOpen(prev => !prev)}
                                className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                                aria-label={mobileOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
                                aria-expanded={mobileOpen}
                            >
                                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Mobil Açılır Menü ── */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            key="mobile-menu"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
                        >
                            <div className="px-4 py-3 flex flex-col gap-1">
                                {navLinks.map(({ to, label, Icon, admin }) => (
                                    <Link key={to} to={to} className={mobileLinkCls(to, admin)}>
                                        <Icon size={18} /> {label}
                                    </Link>
                                ))}

                                {/* Kullanıcı ve Çıkış */}
                                <div className="border-t border-gray-100 mt-2 pt-3">
                                    <p className="px-4 text-xs text-slate-400 font-medium mb-2 truncate">
                                        {currentUser?.email}
                                    </p>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <LogOut size={18} /> Çıkış Yap
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ── İçerik Alanı ── */}
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}
