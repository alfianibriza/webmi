import { useState, useEffect } from "react";
import { getAlumni, deleteAlumni, createAlumni, updateAlumni } from "../../../api";
import { GraduationCap, Search, Trash2, Plus, Edit2, X, Save } from "lucide-react";
import Swal from "sweetalert2";
import { getStorageUrl } from "../../../utils";
import MediaSelectInput from "../../../components/MediaSelectInput";

export default function AlumniIndex() {
    const [alumni, setAlumni] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        nisn: "",
        graduation_year: "",
        gender: "L",
        status: "alumni",
        image: ""
    });

    useEffect(() => {
        fetchAlumni();
    }, [selectedYear]);

    const fetchAlumni = async () => {
        setLoading(true);
        try {
            const response = await getAlumni(selectedYear);
            setAlumni(response.data);
        } catch (error) {
            console.error("Error fetching alumni:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({
            name: "",
            nisn: "",
            graduation_year: "",
            gender: "L",
            status: "alumni",
            image: ""
        });
        setIsEditing(false);
        setCurrentId(null);
    };

    const openModal = (alumniData?: any) => {
        if (alumniData) {
            setIsEditing(true);
            setCurrentId(alumniData.id);
            setFormData({
                name: alumniData.name,
                nisn: alumniData.nisn || "",
                graduation_year: alumniData.graduation_year,
                gender: alumniData.gender,
                status: "alumni",
                image: alumniData.image || ""
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditing && currentId) {
                await updateAlumni(currentId, formData);
                Swal.fire('Berhasil!', 'Data alumni berhasil diperbarui.', 'success');
            } else {
                await createAlumni(formData);
                Swal.fire('Berhasil!', 'Data alumni berhasil ditambahkan.', 'success');
            }
            setShowModal(false);
            resetForm();
            fetchAlumni();
        } catch (error) {
            console.error("Error saving alumni:", error);
            Swal.fire('Gagal!', 'Terjadi kesalahan saat menyimpan data.', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Apakah anda yakin?',
            text: "Data alumni akan dihapus permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                await deleteAlumni(id);
                setAlumni(alumni.filter(a => a.id !== id));
                Swal.fire('Terhapus!', 'Data alumni berhasil dihapus.', 'success');
            } catch (error) {
                console.error("Error deleting alumni:", error);
                Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error');
            }
        }
    };

    const filteredAlumni = alumni.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.nisn && item.nisn.includes(search))
    );

    // Generate years for filter (current year down to 2000)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <GraduationCap className="w-8 h-8 text-brand-green-main" />
                        Data Alumni
                    </h1>
                    <p className="text-gray-500">Daftar siswa yang telah lulus.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-brand-green-main hover:bg-brand-green-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Alumni
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50">
                    <div className="flex gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari nama atau NISN..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green-main focus:border-transparent outline-none"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="">Semua Tahun</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Nama Alumni</th>
                                <th className="px-6 py-4">NISN</th>
                                <th className="px-6 py-4">Tahun Lulus</th>
                                <th className="px-6 py-4">Jenis Kelamin</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : filteredAlumni.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada data alumni yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredAlumni.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {item.image ? (
                                                        <img
                                                            src={getStorageUrl(item.image)}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-brand-green-light text-white font-bold text-sm">
                                                            {item.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-medium text-gray-900">{item.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-mono text-sm">{item.nisn || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                                {item.graduation_year || 'Belum diisi'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {item.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(item)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditing ? 'Edit Alumni' : 'Tambah Alumni Manual'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    NISN (Opsional)
                                </label>
                                <input
                                    type="text"
                                    name="nisn"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent"
                                    value={formData.nisn}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <MediaSelectInput
                                    label="Foto (Opsional)"
                                    value={formData.image}
                                    onSelect={(path) => setFormData({ ...formData, image: path })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tahun Lulus <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="graduation_year"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent"
                                        value={formData.graduation_year}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Jenis Kelamin <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="gender"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                    >
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-brand-green-main hover:bg-brand-green-dark text-white rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
