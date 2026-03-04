import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEditStudent, updateStudent } from '../../../api';
import type { Student } from '../../../types';
import toast from 'react-hot-toast';
import MediaSelectInput from '../../../components/MediaSelectInput';

export default function EditStudent() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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
        admission_year: '',
        graduation_year: '',
        status: 'active',
        image: '',
    });

    useEffect(() => {
        if (id) {
            fetchInitialData();
        }
    }, [id]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const response = await getEditStudent(Number(id));
            const student: Student = response.data.student || response.data;

            setFormData({
                name: student.name || '',
                nis: student.nis || '',
                nisn: student.nisn || '',
                gender: student.gender || 'L',
                birth_place: student.birth_place || '',
                birth_date: student.birth_date || '',
                address: student.address || '',
                father_name: student.father_name || '',
                mother_name: student.mother_name || '',
                parent_phone: student.parent_phone || '',
                admission_year: student.admission_year || '',
                graduation_year: student.graduation_year || '',
                status: student.status || 'active',
                image: student.image || '',
            });

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Gagal memuat data siswa');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = (path: string) => {
        setFormData(prev => ({ ...prev, image: path }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsSaving(true);

        try {
            // Prepare payload
            const payload = {
                ...formData,
                graduation_year: formData.graduation_year ? Number(formData.graduation_year) : null,
                admission_year: formData.admission_year ? Number(formData.admission_year) : null,
                // Ensure nulls for optional fields
                nisn: formData.nisn || null,
                father_name: formData.father_name || null,
                mother_name: formData.mother_name || null,
                address: formData.address || null,
                birth_place: formData.birth_place || null,
                birth_date: formData.birth_date || null,
                parent_phone: formData.parent_phone || null,
                image: formData.image || null,
            };

            await updateStudent(Number(id), payload);
            toast.success('Siswa berhasil diperbarui!');
            navigate('/dashboard/students');
        } catch (error: any) {
            console.error('Error updating student:', error);
            const errorMessage = error.response?.data?.message || 'Gagal memperbarui siswa';

            if (error.response?.data?.errors) {
                const validationErrors = error.response?.data?.errors;
                const firstError = Object.values(validationErrors)[0] as string[];
                toast.error(firstError[0] || errorMessage);
            } else {
                toast.error(errorMessage);
            }
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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold leading-tight text-gray-800">
                    Edit Data Siswa
                </h2>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-8">

                    {/* SECTION 1: INFORMASI PRIBADI */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Informasi Pribadi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                />
                            </div>

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

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                                >
                                    <option value="active">Aktif</option>
                                    <option value="alumni">Alumni</option>
                                </select>
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

                            {/* Foto Siswa */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Foto Siswa
                                </label>
                                <MediaSelectInput
                                    label="Foto Siswa"
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
                            disabled={isSaving}
                            className="px-4 py-2 bg-brand-green-main text-white rounded-lg hover:bg-brand-green-dark transition disabled:opacity-50"
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
