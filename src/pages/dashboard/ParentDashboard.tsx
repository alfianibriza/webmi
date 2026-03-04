import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Settings,
    FileText,
    LogOut,
    ExternalLink,
    Image,
    Megaphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getStorageUrl } from '../../utils';

export default function ParentDashboard() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const studentName = user?.name || "Wali Murid";
    // Simplified profile photo logic
    const photoUrl = user?.profile_photo_url || `https://ui-avatars.com/api/?name=${studentName}&background=random`;

    return (
        <div className="bg-[#F9FAFB] min-h-screen font-sans pb-24 text-gray-800">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-blue-100 to-emerald-100 border border-white shadow-sm overflow-hidden">
                            <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 text-center">
                    <div className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase bg-emerald-50 inline-block px-2 py-0.5 rounded-full mb-1">
                        Assalamu'alaikum
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors shadow-sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Settings size={20} />
                    </button>
                    {/* Settings Dropdown */}
                    {isMenuOpen && (
                        <div className="absolute top-20 right-6 bg-white rounded-xl shadow-xl border border-gray-100 w-48 z-50 overflow-hidden py-1">
                            <Link to="/dashboard/profile-settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Settings size={16} /> Profil Saya
                            </Link>
                            <button onClick={() => logout()} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                                <LogOut size={16} /> Keluar
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Greeting Section */}
            <div className="px-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {studentName}
                </h1>
                <p className="text-sm text-gray-500 italic mt-0.5">
                    Wali Murid
                </p>
            </div>

            {/* Information Card */}
            <div className="px-6 mb-6">
                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <Megaphone size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Mode Informasi</h2>
                            <p className="text-sm text-gray-500">Menu akademik & kesiswaan dinonaktifkan.</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Anda tetap dapat memantau informasi terkini MI Al-Ghazali melalui fitur berita di bawah ini.
                    </p>
                </div>
            </div>

            {/* Menu Grid Custom */}
            <div className="px-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    {/* Berita */}
                    <Link to="/dashboard/post" className="bg-white rounded-[1.5rem] p-5 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 group hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm">Berita & Artikel</h3>
                    </Link>

                    {/* Media */}
                    <Link to="/dashboard/media" className="bg-white rounded-[1.5rem] p-5 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 group hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 mb-3 group-hover:scale-110 transition-transform">
                            <Image size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm">Galeri Media</h3>
                    </Link>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 mb-8 space-y-3">
                {/* Situs Madrasah Button */}
                <a href="/" className="block w-full bg-[#F0F9FF] border border-blue-50 rounded-[1.5rem] p-4 flex items-center justify-between group hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500">
                            <ExternalLink size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">Situs Madrasah</h4>
                            <p className="text-[10px] text-gray-400">Informasi Publik MI Al-Ghazali</p>
                        </div>
                    </div>
                    <button className="px-4 py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-full hover:bg-blue-600 transition-colors shadow-blue-200 shadow-lg">
                        VISIT
                    </button>
                </a>
            </div>
        </div>
    );
}
