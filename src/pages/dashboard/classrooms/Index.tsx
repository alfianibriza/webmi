import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClassRooms, createClassRoom, updateClassRoom, deleteClassRoom } from '../../../api';
import { Pencil, Trash2, School } from 'lucide-react';
import type { ClassRoom } from '../../../types/safe_types';
import toast from 'react-hot-toast';

export default function ClassRoomsIndex() {
    const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClassRoom, setEditingClassRoom] = useState<ClassRoom | null>(null);
    const [formData, setFormData] = useState({ grade: '', name: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchClassRooms();
    }, []);

    const fetchClassRooms = async () => {
        setIsLoading(true);
        try {
            const response = await getClassRooms();
            const data = response.data;
            setClassRooms(Array.isArray(data) ? data : (data?.data || []));
        } catch (error) {
            console.error('Error fetching class rooms:', error);
            toast.error('Gagal memuat data rombel');
            setClassRooms([]);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingClassRoom(null);
        setFormData({ grade: '', name: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (classRoom: ClassRoom) => {
        setEditingClassRoom(classRoom);
        setFormData({
            grade: classRoom.grade?.toString() || '',
            name: classRoom.name
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClassRoom(null);
        setFormData({ grade: '', name: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.grade || !formData.name.trim()) {
            toast.error('Kelas dan nama rombel harus diisi');
            return;
        }

        setIsSubmitting(true);
        try {
            const data = {
                grade: parseInt(formData.grade),
                name: formData.name.trim()
            };

            if (editingClassRoom) {
                await updateClassRoom(editingClassRoom.id, data);
                toast.success('Rombel berhasil diperbarui!');
            } else {
                await createClassRoom(data);
                toast.success('Rombel berhasil ditambahkan!');
            }
            closeModal();
            fetchClassRooms();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Gagal menyimpan rombel';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (classRoom: ClassRoom) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus rombel "${classRoom.name}"?`)) return;

        try {
            await deleteClassRoom(classRoom.id);
            toast.success('Rombel berhasil dihapus!');
            fetchClassRooms();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Gagal menghapus rombel';
            toast.error(message);
        }
    };

    // Group classrooms by grade
    const groupedClassRooms = classRooms.reduce((acc, cr) => {
        const grade = cr.grade || 'Lainnya';
        if (!acc[grade]) acc[grade] = [];
        acc[grade].push(cr);
        return acc;
    }, {} as Record<string, ClassRoom[]>);

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
                <div>
                    <h2 className="text-2xl font-bold leading-tight text-gray-800 flex items-center gap-2">
                        <School className="w-8 h-8 text-brand-green-main" />
                        Manajemen Rombel
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Kelola rombongan belajar untuk setiap kelas</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        to="/dashboard/students"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg shadow-sm text-sm flex items-center gap-2"
                    >
                        <span>←</span> Kembali ke Kesiswaan
                    </Link>
                    <button
                        onClick={openCreateModal}
                        className="bg-brand-orange-main hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm text-sm flex items-center gap-2"
                    >
                        <span>+</span> Tambah Rombel
                    </button>
                </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    {classRooms.length > 0 ? (
                        <div className="space-y-6">
                            {Object.entries(groupedClassRooms).sort(([a], [b]) => Number(a) - Number(b)).map(([grade, rooms]) => (
                                <div key={grade} className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-3">
                                        <h3 className="font-semibold text-gray-700">Kelas {grade}</h3>
                                    </div>
                                    <div className="divide-y">
                                        {rooms.map((classRoom) => (
                                            <div
                                                key={classRoom.id}
                                                className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">🏫</span>
                                                    <div>
                                                        <span className="font-medium text-gray-800">{classRoom.name}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(classRoom)}
                                                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded transition-colors text-sm"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(classRoom)}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors text-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="text-6xl mb-4">🏫</div>
                            <div className="text-gray-400 mb-2">Belum ada data rombel.</div>
                            <p className="text-sm text-gray-500 mb-4">Tambahkan rombel baru untuk memulai.</p>
                            <button
                                onClick={openCreateModal}
                                className="bg-brand-orange-main hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg"
                            >
                                + Tambah Rombel Pertama
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">
                            {editingClassRoom ? 'Edit Rombel' : 'Tambah Rombel Baru'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kelas <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-orange-main focus:ring-brand-orange-main"
                                        value={formData.grade}
                                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                        required
                                    >
                                        <option value="">Pilih Kelas</option>
                                        <option value="1">Kelas 1</option>
                                        <option value="2">Kelas 2</option>
                                        <option value="3">Kelas 3</option>
                                        <option value="4">Kelas 4</option>
                                        <option value="5">Kelas 5</option>
                                        <option value="6">Kelas 6</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Rombel <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-orange-main focus:ring-brand-orange-main"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Contoh: A, B, Unggulan, dsb."
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Masukkan nama rombel seperti A, B, C atau Unggulan, Regular, dsb.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-brand-orange-main hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Menyimpan...' : (editingClassRoom ? 'Perbarui' : 'Simpan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
