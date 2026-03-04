import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudent } from '../../../api';
import toast from 'react-hot-toast';
import MediaSelectInput from '../../../components/MediaSelectInput';

export default function CreateStudent() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        nis: '',
        nisn: '',
        gender: 'L',
        birth_place: '',
        birth_date: '',
        address: '',
        father_name: '',
        mother_name: '',
        parent_phone: '',
        admission_year: new Date().getFullYear().toString(),
        status: 'active',
        image: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = (path: string) => {
        setFormData(prev => ({ ...prev, image: path }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await createStudent(formData);
            toast.success('Siswa berhasil ditambahkan!');
            navigate('/dashboard/students');
        } catch (error: any) {
            console.error('Error creating student:', error);
            const errorMessage = error.response?.data?.message || 'Gagal menambahkan siswa';
            const validationErrors = error.response?.data?.errors;

            if (validationErrors) {
                const firstError = Object.values(validationErrors)[0] as string[];
                toast.error(firstError[0] || errorMessage);
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold leading-tight text-gray-800">
                    Tambah Data Siswa
                </h2>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-8">

                    {/* SECTION 1: INFORMASI PRIBADI */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Informasi Pribadi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* NIS */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    NIS <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nis"
                                    value={formData.nis}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                                    placeholder="Masukkan NIS"
                                />
                            </div>

                            {/* NISN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    NISN
                                </label>
                                <input
                                    type="text"
                                    name="nisn"
                                    value={formData.nisn}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                                    placeholder="Masukkan NISN"
                                />
                            </div>

                            {/* Nama Lengkap */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>

                            {/* Tempat Lahir */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tempat Lahir
                                </label>
                                <input
                                    type="text"
                                    name="birth_place"
                                    value={formData.birth_place}
                                    onChange={handleChange}
                                    placeholder="Masukkan tempat lahir"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                                />
                            </div>

                            {/* Tanggal Lahir */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Lahir
                                </label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                                />
                            </div>

                            {/* Jenis Kelamin */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Jenis Kelamin <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                                >
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>

                            {/* Foto Siswa */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Foto Siswa
                                </label>
                                <MediaSelectInput
                                    label="Pilih Foto"
                                    value={formData.image}
                                    onSelect={handleImageSelect}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: DATA WALI */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Data Wali</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Ayah */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Ayah
                                </label>
                                <input
                                    type="text"
                                    name="father_name"
                                    value={formData.father_name}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                                    placeholder="Masukkan nama ayah"
                                />
                            </div>

                            {/* Nama Ibu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Ibu
                                </label>
                                <input
                                    type="text"
                                    name="mother_name"
                                    value={formData.mother_name}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                                    placeholder="Masukkan nama ibu"
                                />
                            </div>

                            {/* Alamat Domisili */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alamat Domisili
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                                    placeholder="Masukkan alamat lengkap"
                                />
                            </div>

                            {/* No. WA */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    No. WA (WhatsApp)
                                </label>
                                <input
                                    type="text"
                                    name="parent_phone"
                                    value={formData.parent_phone}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                                    placeholder="Contoh: 08123456789"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/students')}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-brand-green-main text-white rounded-lg hover:bg-brand-green-dark transition disabled:opacity-50"
                        >
                            {isLoading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
