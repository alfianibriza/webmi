import { useState, useEffect } from 'react';
import {
    getTingkat,
    getKelasAktif,
    getClassSubjects,
    storeClassSubject,
    deleteClassSubject,
    getSubjects,
    getTeachers
} from '../../../api';
import { Trash2, Plus, Save, Pencil, Layers } from 'lucide-react';
import type { Subject, Teacher, Tingkat, KelasAktif } from '../../../types/safe_types';

interface ClassSubject {
    id: number;
    class_room_id: number;
    subject_id: number;
    weekly_hours: number;
    teacher_id?: number;
    subject: Subject;
    teacher?: Teacher;
}

export default function CurriculumIndex() {
    // State for data
    const [tingkatList, setTingkatList] = useState<Tingkat[]>([]);
    const [availableKelas, setAvailableKelas] = useState<KelasAktif[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    // State for selection
    const [selectedTingkat, setSelectedTingkat] = useState<number | ''>('');
    const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
    const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);

    // State for form
    const [form, setForm] = useState({
        subject_id: '',
        teacher_id: '',
        weekly_hours: 2
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchClassSubjects(Number(selectedClassId));
        } else {
            setClassSubjects([]);
        }
    }, [selectedClassId]);

    // Fetch Kelas when Tingkat changes
    useEffect(() => {
        if (selectedTingkat) {
            fetchKelasAktif(Number(selectedTingkat));
        } else {
            setAvailableKelas([]);
            setSelectedClassId('');
        }
    }, [selectedTingkat]);

    const fetchInitialData = async () => {
        try {
            const [tingkatRes, subjectsRes, teachersRes] = await Promise.all([
                getTingkat(),
                getSubjects(),
                getTeachers()
            ]);
            setTingkatList(Array.isArray(tingkatRes.data) ? tingkatRes.data : []);
            setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
            setTeachers(Array.isArray(teachersRes.data?.teachers) ? teachersRes.data.teachers : (Array.isArray(teachersRes.data) ? teachersRes.data : []));
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Gagal memuat data awal');
        }
    };

    const fetchKelasAktif = async (tingkatId: number) => {
        try {
            const res = await getKelasAktif({ tingkat_id: tingkatId });
            const classes = Array.isArray(res.data) ? res.data : [];
            setAvailableKelas(classes);

            // Auto-select if only 1 class exists in this grade
            if (classes.length === 1) {
                setSelectedClassId(classes[0].id);
            } else {
                setSelectedClassId('');
            }
        } catch (err) {
            console.error('Error fetching kelas aktif:', err);
        }
    };

    const fetchClassSubjects = async (classId: number) => {
        setLoading(true);
        try {
            const res = await getClassSubjects(classId);
            setClassSubjects(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching class subjects:', err);
            setError('Gagal memuat data mapel kelas');
        } finally {
            setLoading(false);
        }
    };

    // State for edit
    const [editingItem, setEditingItem] = useState<ClassSubject | null>(null);

    const handleEdit = (item: ClassSubject) => {
        setEditingItem(item);
        setForm({
            subject_id: String(item.subject_id),
            teacher_id: item.teacher_id ? String(item.teacher_id) : '',
            weekly_hours: item.weekly_hours
        });
        setError('');
        setSuccess('');
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setForm({
            subject_id: '',
            teacher_id: '',
            weekly_hours: 2
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedClassId) {
            setError('Pilih kelas terlebih dahulu');
            return;
        }

        try {
            await storeClassSubject({
                class_room_id: Number(selectedClassId),
                subject_id: Number(form.subject_id),
                teacher_id: form.teacher_id ? Number(form.teacher_id) : undefined,
                weekly_hours: Number(form.weekly_hours)
            });

            setSuccess(editingItem ? 'Alokasi berhasil diperbarui' : 'Mata pelajaran berhasil dialokasikan');
            fetchClassSubjects(Number(selectedClassId));

            // Reset form
            handleCancelEdit();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal menyimpan data');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus mapel ini dari kelas?')) return;

        try {
            await deleteClassSubject(id);
            if (editingItem?.id === id) handleCancelEdit();
            if (selectedClassId) fetchClassSubjects(Number(selectedClassId));
        } catch (err) {
            console.error('Error deleting:', err);
            setError('Gagal menghapus data');
        }
    };

    // Calculate total hours
    const totalHours = classSubjects.reduce((sum, item) => sum + item.weekly_hours, 0);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Layers className="w-8 h-8 text-brand-green-main" />
                        Alokasi Kurikulum
                    </h1>
                    <p className="text-gray-500 mt-1">Atur alokasi mata pelajaran per kelas</p>
                </div>
            </div>

            {/* Class Selector */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex w-full gap-2 md:w-auto">

                        {/* Tingkat Filter */}
                        <select
                            className="rounded-lg border-gray-300 shadow-sm text-sm focus:border-emerald-500 focus:ring-emerald-500 flex-1 md:flex-none md:w-40"
                            value={selectedTingkat}
                            onChange={(e) => {
                                setSelectedTingkat(e.target.value ? Number(e.target.value) : '');
                                handleCancelEdit();
                            }}
                        >
                            <option value="">Pilih Tingkat</option>
                            {tingkatList.map((t) => (
                                <option key={t.id} value={t.id}>
                                    Kelas {t.level}
                                </option>
                            ))}
                        </select>

                        {/* Detail Kelas Filter (Conditional) */}
                        {availableKelas.length > 1 && (
                            <select
                                className="rounded-lg border-gray-300 shadow-sm text-sm focus:border-emerald-500 focus:ring-emerald-500 flex-1 md:flex-none md:w-40"
                                value={selectedClassId}
                                onChange={(e) => {
                                    setSelectedClassId(e.target.value ? Number(e.target.value) : '');
                                    handleCancelEdit();
                                }}
                            >
                                <option value="">Pilih Detail Kelas</option>
                                {availableKelas.map((k) => (
                                    <option key={k.id} value={k.id}>
                                        {k.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {selectedClassId && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <div className={`bg-white p-6 rounded-xl shadow-sm border ${editingItem ? 'border-amber-200 ring-2 ring-amber-100' : 'border-gray-100'} sticky top-6 transition-all`}>
                            <h2 className={`text-lg font-bold ${editingItem ? 'text-amber-700' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
                                {editingItem ? (
                                    <>
                                        <Pencil size={20} /> Edit Alokasi
                                    </>
                                ) : (
                                    <>
                                        <Plus size={20} className="text-emerald-600" /> Tambah Mapel
                                    </>
                                )}
                            </h2>

                            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
                            {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                                    <select
                                        value={form.subject_id}
                                        onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${editingItem ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        required
                                        disabled={!!editingItem}
                                    >
                                        <option value="">-- Pilih Mapel --</option>
                                        {subjects.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                        ))}
                                    </select>
                                    {editingItem && <p className="text-xs text-amber-600 mt-1">Mapel tidak dapat diubah saat edit.</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Per Minggu</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={form.weekly_hours}
                                        onChange={(e) => setForm({ ...form, weekly_hours: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Guru Pengampu <span className="text-gray-400 font-normal">(Opsional)</span>
                                    </label>
                                    <select
                                        value={form.teacher_id}
                                        onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">-- Gunakan Guru Default Mapel --</option>
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Pilih hanya jika guru untuk kelas ini <strong>berbeda</strong> dengan guru default mata pelajaran.
                                    </p>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    {editingItem && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Batal
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${editingItem ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                                    >
                                        <Save size={18} />
                                        {editingItem ? 'Update' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="font-bold text-gray-800">Daftar Mapel Terplot</h2>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    Total: {totalHours} Jam
                                </span>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center text-gray-400">Loading...</div>
                            ) : classSubjects.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">
                                    Belum ada mata pelajaran dialokasikan untuk kelas ini.
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Mata Pelajaran</th>
                                            <th className="px-6 py-3 text-center">Jam</th>
                                            <th className="px-6 py-3 text-left">Guru Pengampu</th>
                                            <th className="px-6 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {classSubjects.map((item) => (
                                            <tr key={item.id} className={`hover:bg-gray-50 ${editingItem?.id === item.id ? 'bg-amber-50' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{item.subject.name}</div>
                                                    <div className="text-gray-400 text-xs">{item.subject.code}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                                                        {item.weekly_hours}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.teacher ? (
                                                        <span className="text-emerald-700 font-medium">{item.teacher.name}</span>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">Default Mapel</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="Edit Alokasi"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus Alokasi"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!selectedClassId && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">Silakan pilih kelas terlebih dahulu untuk melihat dan mengatur kurikulum.</p>
                </div>
            )}
        </div>
    );
}
