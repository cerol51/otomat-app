import React, { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));
const Admin = lazy(() => import('./pages/Admin'));
const Guide = lazy(() => import('./pages/Guide'));

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import MainLayout from './layouts/MainLayout';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            borderRadius: '12px',
                            background: '#1e293b',
                            color: '#f8fafc',
                            fontSize: '14px',
                            fontWeight: '500',
                        },
                        success: { iconTheme: { primary: '#10b981', secondary: '#f8fafc' } },
                        error:   { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
                    }}
                />
                <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center bg-slate-50">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                            <p className="text-slate-600 font-medium text-lg">Yükleniyor...</p>
                        </div>
                    </div>
                }>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Routes (Requires Login) */}
                        <Route path="/app" element={<ProtectedRoute />}>
                            <Route element={<MainLayout />}>
                                {/* /app -> Dashboard */}
                                <Route index element={<Dashboard />} />
                                {/* /app/reports -> Geçmiş Raporlar */}
                                <Route path="reports" element={<Reports />} />
                                {/* /app/guide -> Kullanım Kılavuzu */}
                                <Route path="guide" element={<Guide />} />
                                
                                {/* /app/admin -> Admin Paneli (Sadece Adminler) */}
                                <Route element={<AdminRoute />}>
                                    <Route path="admin" element={<Admin />} />
                                </Route>
                            </Route>
                        </Route>
                    </Routes>
                </Suspense>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
