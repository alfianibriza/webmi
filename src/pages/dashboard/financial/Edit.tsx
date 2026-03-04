import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getFinancialObligation, updateFinancialObligation } from '../../../api';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EditFinancialObligation() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        due_date: '',
        description: '',
    });

    useEffect(() => {
        fetchObligation();
    }, [id]);

    const fetchObligation = async () => {
        try {
            const response = await getFinancialObligation(Number(id));
            const data = response.data.obligation;
            setFormData({
                title: data.title,
                amount: data.amount,
                due_date: data.due_date ? data.due_date.split('T')[0] : '', // Format YYYY-MM-DD
                description: data.description || '',
            });
        } catch (error) {
            console.error('Error fetching obligation:', error);
            toast.error('Gagal memuat data tanggungan');
            navigate('/dashboard/donations');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await updateFinancialObligation(Number(id), formData);
            toast.success('Tanggungan berhasil diperbarui');
            navigate('/dashboard/donations');
        } catch (error) {
            console.error('Error updating obligation:', error);
            toast.error('Gagal memperbarui tanggungan');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
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
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Tanggungan Keuangan</h2>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg max-w-3xl">
                <div className="p-6 text-gray-900">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Tanggungan
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-green-main focus:border-brand-green-main"
                                placeholder="Contoh: SPP Januari 2026"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nominal (Rp)
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-green-main focus:border-brand-green-main"
                                placeholder="Contoh: 50000"
                                required
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Jatuh Tempo
                            </label>
                            <input
                                type="date"
                                name="due_date"
                                value={formData.due_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-green-main focus:border-brand-green-main"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Keterangan (Opsional)
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-green-main focus:border-brand-green-main"
                                placeholder="Tambahkan keterangan tambahan jika perlu..."
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`flex items-center px-6 py-2 bg-brand-green-main text-white rounded-lg hover:bg-brand-green-dark font-medium transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
