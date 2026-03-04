import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, HandCoins, CheckSquare } from 'lucide-react';

import type { User } from '../types/safe_types';
import { getMyNotifications } from '../api';

interface MobileDashboardLayoutProps {
    user: User;
}

export default function MobileDashboardLayout({ user }: MobileDashboardLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [unreadCount, setUnreadCount] = useState(0);

    // Update activeTab based on current path
    useEffect(() => {
        if (location.pathname === '/dashboard') setActiveTab('home');
        else if (location.pathname.startsWith('/dashboard/message')) setActiveTab('message');
        else if (location.pathname.startsWith('/dashboard/notifications')) setActiveTab('notification');
        else if (location.pathname.startsWith('/dashboard/schedules') || location.pathname.startsWith('/dashboard/learning-schedule')) setActiveTab('schedule');
        else if (location.pathname.startsWith('/dashboard/donations')) setActiveTab('donation');
        else setActiveTab('back'); // Default to back for other pages
    }, [location.pathname]);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await getMyNotifications();
                setUnreadCount(response.data.unread_count || 0);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    // Page Titles for Mobile Header
    const pageTitles: { [key: string]: string } = {
        // Guru Routes
        '/dashboard/post': 'Berita & Pengumuman',
        '/dashboard/media': 'Pustaka Media',
        '/dashboard/students': 'Data Siswa',
        '/dashboard/attendance/students': 'Input Absensi Siswa',
        '/dashboard/attendance/students/report': 'Laporan Absensi',
        '/dashboard/guru/schedule': 'Jadwal Mengajar',
        '/dashboard/attendance/teachers': 'Laporan Kehadiran',
        '/dashboard/guru/tasks': 'Daftar Tugas',
        '/dashboard/profile-settings': 'Pengaturan Akun',
        // Wali Murid Routes
        '/dashboard/learning-schedule': 'Jadwal Pelajaran',
        '/dashboard/schedules': 'Jadwal Ujian & Lainnya',
        '/dashboard/donations': 'Daftar Tanggungan & Donasi',
        '/dashboard/parent': 'Dashboard Wali Murid',
    };

    const currentPath = location.pathname;
    // Find title that matches the start of the path (longest match first ideally, but simple lookup works for now)
    const pageTitle = Object.keys(pageTitles).find(path => currentPath.startsWith(path))
        ? pageTitles[Object.keys(pageTitles).find(path => currentPath.startsWith(path)) as string]
        : (user.role === 'guru' ? 'Dashboard Guru' : 'Dashboard Wali Murid');

    const isHome = currentPath === '/dashboard';

    return (
        <div className="min-h-screen flex justify-center font-sans items-center py-4 sm:py-0 relative">
            <div className="animated-bg-container"></div>
            {/* Mobile Container Limit */}
            <div className="w-full max-w-md bg-gray-50/50 shadow-2xl h-screen sm:h-[95vh] sm:rounded-[2.5rem] flex flex-col relative overflow-hidden border border-white/50 ring-1 ring-gray-900/5">

                {/* Header for Non-Home Pages */}
                {!isHome && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg relative z-20 flex-shrink-0">
                        <div className="items-center relative z-10">
                            <h1 className="text-xl font-bold leading-tight">{pageTitle}</h1>
                            <p className="text-blue-100 text-xs mt-1 opacity-90">MI Al-Ghazali</p>
                        </div>
                        {/* Abstract Background Shapes for Header */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
                    {/* Content Background Decoration */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl mix-blend-multiply filter opacity-50"></div>
                        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl mix-blend-multiply filter opacity-50"></div>
                    </div>

                    <div className={`${!isHome ? 'px-6 py-6 pb-24' : 'h-full'} `}>
                        <Outlet />
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="absolute bottom-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200/50 px-6 py-3 flex justify-between items-center z-30 pb-5 rounded-t-2xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
                    {/* 1. Beranda */}
                    <Link
                        to="/dashboard"
                        onClick={() => setActiveTab('home')}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'home' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <div className={`p-1 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-blue-50' : 'bg-transparent'}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activeTab === 'home' ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        </div>
                        <span className="text-[10px] font-medium">Beranda</span>
                    </Link>

                    {/* 2. Pesan (Guru) OR Jadwal (Wali Murid) */}
                    {user.role === 'guru' ? (
                        <button
                            onClick={() => setActiveTab('message')}
                            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'message' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <div className={`p-1 rounded-xl transition-colors ${activeTab === 'message' ? 'bg-blue-50' : 'bg-transparent'}`}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activeTab === 'message' ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2-2z" /></svg>
                            </div>
                            <span className="text-[10px] font-medium">Pesan</span>
                        </button>
                    ) : (
                        <Link
                            to="/dashboard/learning-schedule"
                            onClick={() => setActiveTab('schedule')}
                            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'schedule' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <div className={`p-1 rounded-xl transition-colors ${activeTab === 'schedule' ? 'bg-blue-50' : 'bg-transparent'}`}>
                                <Calendar className="w-6 h-6" strokeWidth={activeTab === 'schedule' ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-medium">Jadwal</span>
                        </Link>
                    )}

                    {/* 3. Center Button: Absen (Guru) OR Donasi (Wali Murid) */}
                    <div className="relative -top-8 flex flex-col items-center">
                        {user.role === 'guru' ? (
                            <>
                                <button
                                    onClick={() => navigate('/dashboard/guru/tasks')}
                                    className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-300 flex items-center justify-center text-white hover:shadow-blue-400 transition transform hover:scale-105 active:scale-95 ring-4 ring-white"
                                    aria-label="Tugas"
                                >
                                    <CheckSquare className="w-7 h-7" strokeWidth={2.5} />
                                </button>
                                <span className="absolute -bottom-6 text-[10px] font-bold text-gray-500">Tugas</span>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/dashboard/donations')}
                                    className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-300 flex items-center justify-center text-white hover:shadow-emerald-400 transition transform hover:scale-105 active:scale-95 ring-4 ring-white"
                                    aria-label="Donasi"
                                >
                                    <HandCoins className="w-7 h-7" strokeWidth={2.5} />
                                </button>
                                <span className="absolute -bottom-6 text-[10px] font-bold text-gray-500">Donasi</span>
                            </>
                        )}
                    </div>

                    {/* 4. Notifikasi */}
                    <Link
                        to="/dashboard/notifications"
                        onClick={() => setActiveTab('notification')}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'notification' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <div className={`relative p-1 rounded-xl transition-colors ${activeTab === 'notification' ? 'bg-blue-50' : 'bg-transparent'}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activeTab === 'notification' ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                            {/* Badge Pesan */}
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">Notifikasi</span>
                    </Link>

                    {/* 5. Kembali */}
                    <button
                        onClick={() => activeTab === 'back' ? navigate(-1) : setActiveTab('back')}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'back' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <div className={`p-1 rounded-xl transition-colors ${activeTab === 'back' ? 'bg-blue-50' : 'bg-transparent'}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activeTab === 'back' ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        </div>
                        <span className="text-[10px] font-medium">Kembali</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
