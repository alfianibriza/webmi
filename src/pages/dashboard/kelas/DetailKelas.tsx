import { useState, useEffect } from 'react';
import { getTingkat, getKelasAktif, createKelasDetail, deleteKelasDetail, updateKelasDetail, getAcademicYears } from '../../../api';
import toast from 'react-hot-toast';

interface Tingkat {
    id: number;
    level: number;
    name: string;
}

interface KelasAktif {
    id: number;
    name: string;
    tingkat_id: number;
    rombel: {
        id: number;
        name: string;
    };
    status: string;
}

interface AcademicYear {
    id: number;
    name: string;
    semester: string;
    status: string;
}

export default function DetailKelas() {
    const [tingkatList, setTingkatList] = useState<Tingkat[]>([]);
    const [selectedTingkat, setSelectedTingkat] = useState<number | null>(null);
    const [kelasList, setKelasList] = useState<KelasAktif[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Academic Year State
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newKelasName, setNewKelasName] = useState(''); // e.g. "A"

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingKelas, setEditingKelas] = useState<KelasAktif | null>(null);
    const [editKelasName, setEditKelasName] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [tingkatRes, yearsRes] = await Promise.all([
                getTingkat(),
                getAcademicYears()
            ]);
            setTingkatList(tingkatRes.data);
            setAcademicYears(yearsRes.data);

            // Auto select active year
            const active = yearsRes.data.find((y: AcademicYear) => y.status === 'active');
            if (active) setSelectedYear(active.id);
        } catch (error) {
            console.error(error);
            toast.error('Gagal memuat data awal');
        }
    };

    useEffect(() => {
        if (selectedTingkat && selectedYear) {
            fetchKelas(selectedYear, selectedTingkat);
        } else {
            setKelasList([]);
        }
    }, [selectedTingkat, selectedYear]);

    const fetchKelas = async (yearId: number, tingkatId: number) => {
        setIsLoading(true);
        try {
            const response = await getKelasAktif({
                academic_year_id: yearId,
                tingkat_id: tingkatId
            });
            setKelasList(response.data);
        } catch (error) {
            console.error('Error fetching kelas:', error);
            toast.error('Gagal memuat data kelas aktif');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddKelas = async () => {
        if (!newKelasName.trim()) {
            toast.error('Nama detail kelas tidak boleh kosong');
            return;
        }

        if (!selectedTingkat || !selectedYear) {
            toast.error('Pilih tahun ajaran dan tingkat terlebih dahulu');
            return;
        }

        try {
            await createKelasDetail({
                academic_year_id: selectedYear,
                tingkat_id: selectedTingkat,
                name: newKelasName.trim()
            });
            toast.success('Detail kelas berhasil ditambahkan');
            setShowAddModal(false);
            setNewKelasName('');
            fetchKelas(selectedYear, selectedTingkat);
        } catch (error: any) {
            console.error('Error adding kelas:', error);
            const message = error.response?.data?.message || 'Gagal menambahkan detail kelas';
            toast.error(message);
        }
    };

    const handleDeleteKelas = async (id: number) => {
        if (!confirm('Yakin ingin menghapus detail kelas ini dari tahun ajaran terpilih? Siswa yang ada di dalamnya harus dikeluarkan terlebih dahulu.')) return;

        try {
            await deleteKelasDetail(id);
            toast.success('Detail kelas berhasil dihapus');
            if (selectedYear && selectedTingkat) fetchKelas(selectedYear, selectedTingkat);
        } catch (error: any) {
            console.error('Error deleting kelas:', error);
            const message = error.response?.data?.message || 'Gagal menghapus detail kelas';
            toast.error(message);
        }
    };

    const handleEditClick = (kelas: KelasAktif) => {
        setEditingKelas(kelas);
        setEditKelasName(kelas.rombel?.name || '');
        setShowEditModal(true);
    };

    const handleUpdateKelas = async () => {
        if (!editKelasName.trim()) {
            toast.error('Nama detail kelas tidak boleh kosong');
            return;
        }

        if (!editingKelas) return;

        try {
            await updateKelasDetail(editingKelas.id, { name: editKelasName.trim() });
            toast.success('Detail kelas berhasil diperbarui');
            setShowEditModal(false);
            setEditingKelas(null);
            setEditKelasName('');
            if (selectedYear && selectedTingkat) fetchKelas(selectedYear, selectedTingkat);
        } catch (error: any) {
            console.error('Error updating kelas:', error);
            const message = error.response?.data?.message || 'Gagal memperbarui detail kelas';
            toast.error(message);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold leading-tight text-gray-800">
                    Manajemen Detail Kelas
                </h2>
            </div>

            {/* Filters */}
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6 flex flex-col md:flex-row gap-4">
                {/* Academic Year Selection */}
                <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Tahun Ajaran
                    </label>
                    <select
                        value={selectedYear || ''}
                        onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                    >
                        <option value="">-- Pilih Tahun Ajaran --</option>
                        {academicYears.map(y => (
                            <option key={y.id} value={y.id}>
                                {y.name} ({y.status === 'active' ? 'Aktif' : 'Tidak Aktif'})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Kelas Selection */}
                <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Tingkat Kelas
                    </label>
                    <select
                        value={selectedTingkat || ''}
                        onChange={(e) => setSelectedTingkat(e.target.value ? Number(e.target.value) : null)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                    >
                        <option value="">-- Pilih Tingkat --</option>
                        {tingkatList.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Kelas List */}
            {selectedTingkat && selectedYear && (
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Daftar Kelas Aktif: {tingkatList.find(t => t.id === selectedTingkat)?.name} ({academicYears.find(y => y.id === selectedYear)?.name})
                            </h3>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-brand-green-main text-white rounded-lg hover:bg-brand-green-dark transition"
                            >
                                + Tambah Detail Kelas
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500">Memuat data...</div>
                        ) : kelasList.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Belum ada detail kelas untuk tahun ajaran ini. Klik "+ Tambah Detail Kelas" untuk menambahkan (misal: A, B, C).
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Nama Lengkap
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Detail (Label)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {kelasList.map(kelas => (
                                            <tr key={kelas.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {kelas.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {kelas.rombel?.name || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${kelas.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {kelas.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(kelas)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteKelas(kelas.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Tambah Detail Kelas</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Masukkan Label Kelas (contoh: A, B, C)
                            </label>
                            <input
                                type="text"
                                value={newKelasName}
                                onChange={(e) => setNewKelasName(e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                                placeholder="A"
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Akan membuat kelas <strong>{tingkatList.find(t => t.id === selectedTingkat)?.level}{newKelasName}</strong> untuk tahun ajaran terpilih.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewKelasName('');
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAddKelas}
                                className="px-4 py-2 bg-brand-green-main text-white rounded-lg hover:bg-brand-green-dark transition"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingKelas && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Edit Detail Kelas</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Label Kelas (contoh: A, B, C)
                            </label>
                            <input
                                type="text"
                                value={editKelasName}
                                onChange={(e) => setEditKelasName(e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                                placeholder="A"
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Akan mengubah kelas menjadi <strong>{tingkatList.find(t => t.id === editingKelas.tingkat_id)?.level}{editKelasName}</strong>
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingKelas(null);
                                    setEditKelasName('');
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpdateKelas}
                                className="px-4 py-2 bg-brand-green-main text-white rounded-lg hover:bg-brand-green-dark transition"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
