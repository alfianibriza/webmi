import { useEffect, useState } from 'react';
import { getClassRooms, getAdminPtk, getTeacherConstraints, createTeacherConstraint, deleteTeacherConstraint } from '../../../api';
import { UserCheck, Plus, Trash2, AlertCircle } from 'lucide-react';
import type { ClassRoom, Teacher, TeacherClassConstraint } from '../../../types/safe_types';
import Modal from '../../../components/Modal';

type Day = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'minggu' | 'sabtu';

const DAYS: { key: Day; label: string }[] = [
    { key: 'sabtu', label: 'Sabtu' },
    { key: 'minggu', label: 'Ahad' },
    { key: 'senin', label: 'Senin' },
    { key: 'selasa', label: 'Selasa' },
    { key: 'rabu', label: 'Rabu' },
    { key: 'kamis', label: 'Kamis' },
];

export default function TeacherConstraintsIndex() {
    const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [constraints, setConstraints] = useState<TeacherClassConstraint[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        teacher_id: '',
        class_room_id: '',
        day: 'senin' as Day,
        slot_numbers: [] as number[],
        is_available: true,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [classRes, teacherRes, constraintRes] = await Promise.all([
                getClassRooms(),
                getAdminPtk(),
                getTeacherConstraints()
            ]);
            setClassRooms(classRes.data);
            setTeachers(teacherRes.data.teachers || []);
            setConstraints(constraintRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSlotToggle = (slot: number) => {
        setFormData(prev => ({
            ...prev,
            slot_numbers: prev.slot_numbers.includes(slot)
                ? prev.slot_numbers.filter(s => s !== slot)
                : [...prev.slot_numbers, slot].sort((a, b) => a - b)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.teacher_id || !formData.class_room_id) {
            setError('Pilih guru dan kelas');
            return;
        }

        if (formData.slot_numbers.length === 0) {
            setError('Pilih minimal satu jam pelajaran');
            return;
        }

        try {
            await createTeacherConstraint({
                teacher_id: Number(formData.teacher_id),
                class_room_id: Number(formData.class_room_id),
                day: formData.day,
                slot_numbers: formData.slot_numbers,
                is_available: formData.is_available,
            });
            setSuccess('Constraint berhasil ditambahkan!');
            setShowModal(false);
            setFormData({
                teacher_id: '',
                class_room_id: '',
                day: 'senin',
                slot_numbers: [],
                is_available: true,
            });
            fetchData();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Gagal menambahkan constraint');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus constraint ini?')) return;
        try {
            await deleteTeacherConstraint(id);
            fetchData();
        } catch (err) {
            console.error('Error deleting constraint:', err);
        }
    };

    const getTeacherName = (id: number) => teachers.find(t => t.id === id)?.name || '-';
    const getClassName = (id: number) => {
        const c = classRooms.find(c => c.id === id);
        return c ? `Kelas ${c.grade} ${c.name}` : '-';
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
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <UserCheck className="w-8 h-8 text-brand-green-main" />
                    Constraint Jam Mengajar Guru
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <Plus size={18} />
                    Tambah Constraint
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                    {success}
                </div>
            )}

            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Constraint Jam Mengajar</strong> digunakan untuk menentukan kapan seorang guru
                <strong> HARUS mengajar</strong> atau <strong>TIDAK BISA mengajar</strong> pada kelas dan jam tertentu.
                Ini akan dipertimbangkan saat generate jadwal otomatis.
            </div>

            {/* Constraints Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {constraints.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <UserCheck size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>Belum ada constraint yang dikonfigurasi.</p>
                        <p className="text-sm mt-2">Klik "Tambah Constraint" untuk menambahkan.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guru</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hari</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {constraints.map(constraint => (
                                <tr key={constraint.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                        {getTeacherName(constraint.teacher_id)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-600">
                                        {getClassName(constraint.class_room_id)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-600 capitalize">
                                        {constraint.day}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-600">
                                        <div className="flex flex-wrap gap-1">
                                            {constraint.slot_numbers.map(slot => (
                                                <span key={slot} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                                    Jam {slot}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        {constraint.is_available ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                Wajib Mengajar
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                                Tidak Tersedia
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(constraint.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Constraint Modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-xl font-bold mb-4">Tambah Constraint Jam Mengajar</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Guru</label>
                            <select
                                value={formData.teacher_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, teacher_id: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                required
                            >
                                <option value="">Pilih Guru</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                            <select
                                value={formData.class_room_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, class_room_id: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                required
                            >
                                <option value="">Pilih Kelas</option>
                                {classRooms.map(c => (
                                    <option key={c.id} value={c.id}>Kelas {c.grade} {c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hari</label>
                            <select
                                value={formData.day}
                                onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value as Day }))}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            >
                                {DAYS.map(day => (
                                    <option key={day.key} value={day.key}>{day.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pilih Jam Pelajaran
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(slot => (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => handleSlotToggle(slot)}
                                        className={`w-12 h-12 rounded-lg border-2 font-medium transition-colors ${formData.slot_numbers.includes(slot)
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Constraint</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={formData.is_available}
                                        onChange={() => setFormData(prev => ({ ...prev, is_available: true }))}
                                        className="text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-gray-700">Wajib Mengajar (di jam ini)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={!formData.is_available}
                                        onChange={() => setFormData(prev => ({ ...prev, is_available: false }))}
                                        className="text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-gray-700">Tidak Tersedia (di jam ini)</span>
                                </label>
                            </div>
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
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
