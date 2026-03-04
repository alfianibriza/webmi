import { useEffect, useState } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../../../api';
import { Plus, Pencil, Trash2, Book } from 'lucide-react';
import type { Subject } from '../../../types/safe_types';
import Modal from '../../../components/Modal';

export default function SubjectsIndex() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [form, setForm] = useState({ name: '', code: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const res = await getSubjects();
            const data = Array.isArray(res.data) ? res.data : [];
            setSubjects(data);
            return data;
        } catch (err) {
            console.error('Error fetching subjects:', err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingSubject(null);
        setForm({ name: '', code: '' });
        setError('');
        setShowModal(true);
    };

    const openEditModal = (subject: Subject) => {
        console.log("Edit subject:", subject);
        setEditingSubject(subject);
        setForm({ name: subject.name, code: subject.code });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (editingSubject) {
                await updateSubject(editingSubject.id, form);
            } else {
                await createSubject(form);
            }
            setShowModal(false);
            fetchSubjects();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus mata pelajaran ini?')) return;
        try {
            await deleteSubject(id);
            fetchSubjects();
        } catch (err) {
            console.error('Error deleting subject:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Book className="w-8 h-8 text-brand-green-main" />
                        Mata Pelajaran
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola daftar mata pelajaran sekolah</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <Plus size={18} />
                    Tambah Mata Pelajaran
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {subjects.map((subject) => (
                            <tr key={subject.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-sm font-mono">
                                        {subject.code}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                    {subject.name}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openEditModal(subject)}
                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subject.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {subjects.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Belum ada mata pelajaran. Klik tombol "Tambah Mata Pelajaran" untuk menambahkan.
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-xl font-bold mb-4">
                        {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kode Mapel
                            </label>
                            <input
                                type="text"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="MTK"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Mata Pelajaran
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Matematika"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            {editingSubject ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
