import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import toast from 'react-hot-toast';

export default function ChangePassword() {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            toast.error('Password dan konfirmasi password tidak cocok');
            return;
        }

        if (password.length < 6) {
            toast.error('Password minimal 6 karakter');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.put('/profile/update', {
                name: user?.name,
                email: user?.email,
                password,
                password_confirmation: passwordConfirmation,
            });

            // Update user state to remove must_change_password flag
            if (response.data.user) {
                setUser(response.data.user);
            }

            toast.success('Password berhasil diubah!');
            navigate('/dashboard');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Gagal mengubah password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src="/images/logo.webp" alt="MI Al-Ghazali" className="w-24 h-24 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-brand-green-dark">MI AL-GHAZALI</h1>
                    <p className="text-gray-600 text-sm mt-2">Ubah Password Anda</p>
                </div>

                {/* Change Password Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <div>
                                <h3 className="font-medium text-yellow-800">Perhatian</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Ini adalah login pertama Anda. Silakan ubah password untuk keamanan akun.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password Baru
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green-main focus:border-transparent transition"
                                placeholder="Minimal 6 karakter"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                Konfirmasi Password
                            </label>
                            <input
                                id="passwordConfirmation"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green-main focus:border-transparent transition"
                                placeholder="Ulangi password baru"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-green-main text-white font-semibold py-3 px-4 rounded-xl hover:bg-brand-green-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memproses...
                                </span>
                            ) : (
                                'Ubah Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
