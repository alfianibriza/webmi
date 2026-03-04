import { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Pencil,
    Trash2,
    Search,
    UserCircle,
    Briefcase
} from 'lucide-react';
import {
    getAdminPtk,
    createPtk,
    updatePtk,
    deletePtk,
    updateProfileSection,
    getClassRooms,
    getSubjects,
    getAdminExtracurriculars
} from '../../../api';
import Modal from '../../../components/Modal';
import MediaSelectInput from '../../../components/MediaSelectInput';
import { getStorageUrl } from '../../../utils';
import { toast } from 'react-hot-toast';

interface Teacher {
    id: number;
    name: string;
    nip: string | null;
    gender: 'L' | 'P';
    birth_place: string;
    birth_date: string;
    address: string;
    position: string;
    status: 'active' | 'inactive';
    image: string | null;
}

export default function PtkIndex() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Additional Data for Dropdowns
    const [classrooms, setClassRooms] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [extracurriculars, setExtracurriculars] = useState<any[]>([]);

    // Dropdown States
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedDetail, setSelectedDetail] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State for Teacher
    const [formData, setFormData] = useState({
        name: '',
        nip: '',
        gender: 'L',
        birth_place: '',
        birth_date: '',
        address: '',
        position: 'Guru',
        status: 'active',
        image: '',
    });

    useEffect(() => {
        fetchTeachers();
        fetchDropdownData();
    }, []);

    // Sync dropdown changes to formData
    useEffect(() => {
        if (!isModalOpen) return; // Don't run if modal is closed

        if (!selectedRole) {
            setFormData(prev => ({ ...prev, position: '' }));
            return;
        }

        // Prevent infinite loop by checking if value actually changed
        const newPosition = selectedRole + (selectedDetail ? ` ${selectedDetail}` : '');
        if (formData.position !== newPosition) {
            setFormData(prev => ({ ...prev, position: newPosition }));
        }
    }, [selectedRole, selectedDetail]);

    const fetchDropdownData = async () => {
        try {
            const [classRes, subjectRes, extraRes] = await Promise.all([
                getClassRooms(),
                getSubjects(),
                getAdminExtracurriculars()
            ]);
            setClassRooms(classRes.data.class_rooms || classRes.data || []);
            setSubjects(subjectRes.data.subjects || subjectRes.data || []);
            setExtracurriculars(extraRes.data.extracurriculars || extraRes.data || []);
        } catch (error) {
            console.error("Error fetching dropdown data:", error);
        }
    };

    const fetchTeachers = async () => {
        setIsLoading(true);
        try {
            const response = await getAdminPtk();
            setTeachers(response.data.teachers || []);
            // Check if groupPhoto exists in response
            if (response.data.groupPhoto) {
                setGroupPhoto(response.data.groupPhoto.image);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            toast.error('Gagal memuat data PTK');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateGroupPhoto = async (path: string) => {
        try {
            await updateProfileSection('ptk_group_photo', { image: path });
            setGroupPhoto(path);
            toast.success('Foto bersama berhasil diperbarui');
        } catch (error) {
            console.error('Error updating group photo:', error);
            toast.error('Gagal memperbarui foto bersama');
        }
    };

    const handleOpenModal = (teacher?: Teacher) => {
        if (teacher) {
            setCurrentTeacher(teacher);
            setFormData({
                name: teacher.name,
                nip: teacher.nip || '',
                gender: teacher.gender,
                birth_place: teacher.birth_place || '',
                birth_date: teacher.birth_date || '',
                address: teacher.address || '',
                position: teacher.position || 'Guru',
                status: teacher.status,
                image: teacher.image || '',
            });

            // Parse Position
            const pos = teacher.position || '';
            const rolesWithDetails = ['Guru Kelas', 'Guru Mapel', 'Pembina'];
            let foundRole = '';

            for (const r of rolesWithDetails) {
                if (pos.startsWith(r)) {
                    foundRole = r;
                    break;
                }
            }

            if (foundRole) {
                setSelectedRole(foundRole);
                setSelectedDetail(pos.replace(foundRole, '').trim());
            } else {
                setSelectedRole(pos);
                setSelectedDetail('');
            }
        } else {
            setCurrentTeacher(null);
            setFormData({
                name: '',
                nip: '',
                gender: 'L',
                birth_place: '',
                birth_date: '',
                address: '',
                position: 'Guru',
                status: 'active',
                image: '',
            });
            setSelectedRole('');
            setSelectedDetail('');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (currentTeacher) {
                await updatePtk(currentTeacher.id, formData);
                toast.success('Data PTK berhasil diperbarui');
            } else {
                await createPtk(formData);
                toast.success('Data PTK berhasil ditambahkan');
            }
            setIsModalOpen(false);
            fetchTeachers();
        } catch (error) {
            console.error('Error saving teacher:', error);
            toast.error('Gagal menyimpan data PTK');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus data "${name}"?`)) return;

        try {
            await deletePtk(id);
            toast.success('Data PTK berhasil dihapus');
            setTeachers(teachers.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting teacher:', error);
            toast.error('Gagal menghapus data PTK');
        }
    };

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (teacher.nip && teacher.nip.includes(searchQuery))
    );

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            {/* Header Standard */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Briefcase className="w-8 h-8 text-brand-green-main" />
                        Manajemen PTK
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola data Pendidik dan Tenaga Kependidikan</p>
                </div>
            </div>

            {/* Group Photo Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-full md:w-1/3">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Foto Bersama</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Foto ini akan ditampilkan di halaman publik pada bagian profil guru/staff.
                        </p>
                        <MediaSelectInput
                            value={groupPhoto || ''}
                            onSelect={handleUpdateGroupPhoto}
                            label="Pilih Foto dari Galeri"
                        />
                    </div>
                    <div className="w-full md:w-2/3">
                        <div className="aspect-video bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center relative group">
                            {groupPhoto ? (
                                <img
                                    src={getStorageUrl(groupPhoto)}
                                    alt="Foto Bersama Guru"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center text-gray-400 p-8">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada foto bersama yang dipilih</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari guru atau NIP..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-brand-orange-main hover:bg-orange-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>Tambah Data</span>
                </button>
            </div>

            {/* Content Table */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-green-main"></div>
                </div>
            ) : filteredTeachers.length > 0 ? (
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info PTK</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIP / NUPTK</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L/P</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempat, Tgl Lahir</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTeachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full border border-gray-200 overflow-hidden bg-gray-50">
                                                        {teacher.image ? (
                                                            <img
                                                                className="h-full w-full object-cover"
                                                                src={getStorageUrl(teacher.image)}
                                                                alt={teacher.name}
                                                            />
                                                        ) : (
                                                            <UserCircle className="h-full w-full text-gray-400 p-1" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{teacher.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {teacher.nip || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-brand-green-main/10 text-brand-green-main">
                                                {teacher.position}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {teacher.gender}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{teacher.birth_place}</span>
                                                <span className="text-xs text-gray-400">{teacher.birth_date}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${teacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {teacher.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={teacher.address}>
                                            {teacher.address}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(teacher)}
                                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(teacher.id, teacher.name)}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Belum ada data</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        Silakan tambahkan data PTK (Guru/Staff) baru untuk memulai pengelolaan.
                    </p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-brand-green-main text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah PTK Baru
                    </button>
                </div>
            )}


            {/* Modal Form */}
            <Modal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentTeacher ? "Edit Data PTK" : "Tambah PTK Baru"}
                maxWidth="3xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-6">
                        {/* Form Fields - Moved to Top */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Ahmad Fauzi, S.Pd"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-green-main focus:ring focus:ring-brand-green-main focus:ring-opacity-50 transition-colors"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NIP / NUPTK</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-green-main focus:ring focus:ring-brand-green-main focus:ring-opacity-50 transition-colors"
                                    value={formData.nip}
                                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                                <div className="flex gap-2">
                                    <div className="relative w-full">
                                        <select
                                            className="w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-brand-green-main focus:ring focus:ring-brand-green-main focus:ring-opacity-50 transition-colors appearance-none"
                                            value={selectedRole}
                                            onChange={(e) => {
                                                setSelectedRole(e.target.value);
                                                setSelectedDetail(''); // Reset detail
                                            }}
                                            required
                                        >
                                            <option value="">-- Pilih Jabatan --</option>
                                            {[
                                                "Kepala Madrasah",
                                                "Guru Kelas",
                                                "Guru Mapel",
                                                "Kepala TU",
                                                "Staf TU",
                                                "Kepala Operator",
                                                "Staf Operator",
                                                "Bendahara",
                                                "Pustakawan",
                                                "Pembina"
                                            ].map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    </div>

                                    {/* Conditional Inputs */}
                                    {selectedRole === 'Guru Kelas' && (
                                        <select
                                            value={selectedDetail}
                                            onChange={(e) => setSelectedDetail(e.target.value)}
                                            className="w-1/2 rounded-lg border-gray-300 shadow-sm focus:border-brand-green-main focus:ring focus:ring-brand-green-main focus:ring-opacity-50 transition-colors"
                                            required
                                        >
                                            <option value="">-- Pilih Rombel --</option>
                                            {classrooms.map((c: any) => (
                                                <option key={c.id} value={`${c.grade} ${c.name}`}>Kelas {c.grade} {c.name}</option>
                                            ))}
                                        </select>
                                    )}

                                    {selectedRole === 'Guru Mapel' && (
                                        <select
                                            value={selectedDetail}
                                            onChange={(e) => setSelectedDetail(e.target.value)}
                                            className="w-1/2 rounded-lg border-gray-300 shadow-sm focus:border-brand-green-main focus:ring focus:ring-brand-green-main focus:ring-opacity-50 transition-colors"
                                            required
                                        >
                                            <option value="">-- Pilih Mapel --</option>
                                            {subjects.map((s: any) => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    )}

                                    {selectedRole === 'Pembina' && (
                                        <select
                                            value={selectedDetail}
                                            onChange={(e) => setSelectedDetail(e.target.value)}
                                            className="w-1/2 rounded-lg border-gray-300 shadow-sm focus:border-brand-green-main focus:ring focus:ring-brand-green-main focus:ring-opacity-50 transition-colors"
                                            required
                                        >
                                            <option value="">-- Pilih Ekstra --</option>
                                            {extracurriculars.map((ex: any) => (
                                                <option key={ex.id} value={ex.name}>{ex.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-green-main focus:ring focus:ring-brand-green-main focus:ring-opacity-50 transition-colors"
                                    value={formData.birth_place}
                                    onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-green-main focus:ring focus:ring-brand-green-main focus:ring-opacity-50 transition-colors"
                                    value={formData.birth_date}
                                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                                <select
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-green-main focus:ring focus:ring-brand-green-main focus:ring-opacity-50 transition-colors"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                                >
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Keaktifan</label>
                                <select
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-green-main focus:ring focus:ring-brand-green-main focus:ring-opacity-50 transition-colors"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Tidak Aktif</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-green-main focus:ring focus:ring-brand-green-main focus:ring-opacity-50 transition-colors"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Image Upload - Moved to Bottom */}
                        <div className="w-full md:w-1/2 mx-auto space-y-2 border-t pt-4 border-gray-100">
                            <div className="p-4">
                                <MediaSelectInput
                                    label="Foto Profil"
                                    value={formData.image}
                                    onSelect={(path) => setFormData({ ...formData, image: path })}
                                />
                                <p className="text-xs text-gray-400 mt-2 ml-1">
                                    Format: JPG, PNG, WEBP. Maks 2MB
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-brand-green-main rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
