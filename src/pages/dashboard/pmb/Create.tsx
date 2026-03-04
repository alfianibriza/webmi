import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPmb } from '../../../api';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Create() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        birth_place: '',
        birth_date: '',
        gender: 'L',
        parent_name: '',
        phone: '',
        address: '',
        status: 'pending'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await createPmb(formData);
            toast.success('Data pendaftar berhasil ditambahkan');
            navigate('/dashboard/pmb');
        } catch (error) {
            console.error('Error creating registrant:', error);
            toast.error('Gagal menambahkan data pendaftar');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/dashboard/pmb')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold leading-tight text-gray-800">
                        Tambah Pendaftar
                    </h2>
                    <p className="text-gray-500 mt-1">Isi formulir pendaftaran peserta didik baru pendaftar</p>
                </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green-main focus:ring-brand-green-main sm:text-sm"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tempat Lahir
                                </label>
                                <input
                                    type="text"
                                    name="birth_place"
                                    value={formData.birth_place}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green-main focus:ring-brand-green-main sm:text-sm"
                                    placeholder="Kota kelahiran"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Lahir
                                </label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green-main focus:ring-brand-green-main sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Jenis Kelamin
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green-main focus:ring-brand-green-main sm:text-sm"
                                >
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Orang Tua
                                </label>
                                <input
                                    type="text"
                                    name="parent_name"
                                    value={formData.parent_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green-main focus:ring-brand-green-main sm:text-sm"
                                    placeholder="Nama ayah/ibu"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nomor HP (WhatsApp)
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green-main focus:ring-brand-green-main sm:text-sm"
                                    placeholder="08..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green-main focus:ring-brand-green-main sm:text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Diterima</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Alamat Lengkap
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green-main focus:ring-brand-green-main sm:text-sm"
                                placeholder="Alamat domisili saat ini"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/pmb')}
                                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-main"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex justify-center items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-green-main hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-main disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
