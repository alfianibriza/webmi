import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Edit3,
    Image,
    Settings,
    FileText,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function TeacherDashboard() {
    const { user, logout } = useAuth();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Data Guru (Fallback to user data)
    const teacherProfile = {
        name: user?.name || "Bpk. Guru",
        role: "Guru Pengajar",
        nip: user?.nip || "-",
        photoUrl: user?.profile_photo_url || `https://ui-avatars.com/api/?name=${user?.name}&background=random`
    };

    // Menu Utama (Only Information related)
    const menuItems = [
        { id: 1, title: "Post Berita", icon: <Edit3 size={24} />, gradient: "from-blue-400 to-cyan-400", shadow: "shadow-blue-200", path: "/dashboard/post" },
        { id: 2, title: "Pustaka Media", icon: <Image size={24} />, gradient: "from-purple-500 to-fuchsia-400", shadow: "shadow-purple-200", path: "/dashboard/media" },
        {
            id: 8,
            title: "Web Madrasah",
            icon: <img src="/images/logo.webp" alt="Logo" className="w-6 h-6 object-contain" />,
            gradient: "from-lime-400 to-green-500",
            shadow: "shadow-lime-300",
            path: "/"
        },
    ];

    const handleLogout = () => {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            logout();
        }
    };

    return (
        <div className="pb-20 bg-[#F8F9FE] min-h-screen">
            {/* Clean Header Section */}
            <div className="pt-12 px-6 pb-6 flex items-center justify-between relative z-50">
                <div className="flex items-center gap-4">
                    {/* Profile Image */}
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl p-0.5 bg-blue-100 border border-blue-200">
                            <img src={teacherProfile.photoUrl} alt="Profile" className="w-full h-full object-cover rounded-[14px]" />
                        </div>
                    </div>

                    {/* Text Info */}
                    <div className="flex-1">
                        <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-0.5">
                            Selamat Datang
                        </p>
                        <h1 className="text-lg font-bold text-gray-800 leading-tight mb-1">
                            {teacherProfile.name}
                        </h1>
                        <span className="inline-block bg-white border border-gray-200 text-gray-400 text-[10px] px-2 py-0.5 rounded-md font-medium">
                            {teacherProfile.nip}
                        </span>
                    </div>
                </div>

                {/* Right Action Button */}
                <div className="relative">
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="w-10 h-10 rounded-full bg-white text-yellow-500 border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all relative z-10"
                    >
                        <Settings size={20} className={`transition-transform duration-300 ${isSettingsOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isSettingsOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-0"
                                onClick={() => setIsSettingsOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-1">
                                    <Link
                                        to="/dashboard/profile-settings"
                                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                        onClick={() => setIsSettingsOpen(false)}
                                    >
                                        <Settings size={16} />
                                        Pengaturan Akun
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsSettingsOpen(false);
                                            handleLogout();
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                                    >
                                        <LogOut size={16} />
                                        Keluar
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="px-6">
                {/* Information Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Mode Informasi</h2>
                            <p className="text-sm text-gray-500">Menu manajemen akademik & kesiswaan dinonaktifkan.</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Anda dapat mengakses fitur berita dan media melalui menu di bawah ini.
                    </p>
                </div>

                {/* Menu Grid */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                        Menu Utama
                    </h2>
                </div>

                <div className="grid grid-cols-4 gap-x-4 gap-y-6 mb-8">
                    {menuItems.map((item) => (
                        <Link to={item.path} key={item.id} className="flex flex-col items-center gap-2 group">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${item.gradient} text-white group-active:scale-95 transition-transform duration-200 ${item.shadow} ring-2 ring-white`}>
                                {item.icon}
                            </div>
                            <span className="text-[11px] text-gray-600 text-center font-medium leading-tight px-1 group-hover:text-blue-600 transition-colors">{item.title}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

