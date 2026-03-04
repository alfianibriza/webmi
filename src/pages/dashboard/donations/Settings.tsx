import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDonationSettings, updateDonationSettings } from '../../../api';
import { toast } from 'react-hot-toast';

interface DonationSettings {
    bank_name: string;
    account_number: string;
    account_holder: string;
    wa_number: string;
}

export default function DonationSettings() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<DonationSettings>({
        bank_name: '',
        account_number: '',
        account_holder: '',
        wa_number: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await getDonationSettings();
            if (response.data) {
                setFormData(response.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Gagal memuat pengaturan donasi');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateDonationSettings(formData);
            toast.success('Pengaturan donasi berhasil disimpan');
            // Optional: navigate back or stay
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Gagal menyimpan pengaturan');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Link
                    to="/dashboard/donations"
                    className="p-2 text-gray-500 hover:text-gray-900 bg-white rounded-lg shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">Pengaturan Donasi</h2>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg max-w-2xl">
                <div className="p-6 text-gray-900">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Bank
                            </label>
                            <input
                                type="text"
                                name="bank_name"
                                value={formData.bank_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-green-main focus:border-brand-green-main"
                                placeholder="Contoh: Bank BRI"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nomor Rekening
                            </label>
                            <input
                                type="text"
                                name="account_number"
                                value={formData.account_number}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-green-main focus:border-brand-green-main"
                                placeholder="Contoh: 1234567890"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Atas Nama
                            </label>
                            <input
                                type="text"
                                name="account_holder"
                                value={formData.account_holder}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-green-main focus:border-brand-green-main"
                                placeholder="Contoh: Panitia Pembangunan"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nomor WhatsApp Konfirmasi (Opsional)
                            </label>
                            <input
                                type="text"
                                name="wa_number"
                                value={formData.wa_number}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-green-main focus:border-brand-green-main"
                                placeholder="Contoh: 628123456789"
                            />
                            <p className="mt-1 text-xs text-gray-500">Format: 628xxx (tanpa 0 atau +)</p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`px-6 py-2 bg-brand-green-main text-white rounded-lg hover:bg-brand-green-dark font-medium transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
