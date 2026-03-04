import { useState } from 'react';
import ContentCard from '../../components/ContentCard';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Save, Info, Settings } from 'lucide-react';

export default function Profile() {
    const { user, setUser } = useAuth();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev: any) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await api.put('/profile/update', formData);
            toast.success(response.data.message);
            if (response.data.user) {
                setUser(response.data.user);
            }
            setFormData(prev => ({
                ...prev,
                password: '',
                password_confirmation: '',
            }));
        } catch (error: any) {
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('Gagal memperbarui profil. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ContentCard title="Pengaturan Profil">
            <div className="max-w-2xl mx-auto">
                {/* Header Decoration */}
                <div className="mb-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100 relative">
                        <User size={32} className="text-emerald-600" />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                            <Settings size={14} className="text-emerald-500" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Edit Informasi Akun</h2>
                    <p className="text-sm text-gray-500">Perbarui detail profil dan keamanan akun Anda</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-orange-50/80 rounded-xl p-4 flex gap-3 border border-orange-100">
                        <Info className="flex-shrink-0 text-orange-500 mt-0.5" size={18} />
                        <p className="text-sm text-orange-800 leading-relaxed font-medium">
                            Kosongkan kolom password jika Anda tidak ingin mengubah password saat ini.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                            {errors.name && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">{errors.name[0]}</p>}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                                    placeholder="alamat@email.com"
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">{errors.email[0]}</p>}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
                            <Lock size={16} className="text-emerald-500" />
                            Ganti Password
                        </h3>

                        {/* Password Field */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password Baru</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                                    placeholder="Minimal 6 karakter"
                                />
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">{errors.password[0]}</p>}
                        </div>

                        {/* Password Confirmation */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Konfirmasi Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 sm:text-sm"
                                    placeholder="Ulangi password baru"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-200 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:translate-y-[-2px]
              ${loading ? 'opacity-70 cursor-not-allowed scale-100' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </ContentCard>
    );
}
