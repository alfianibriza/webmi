import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createFinancialObligation, getFinancialObligationCreateData } from '../../../api';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface Student {
    id: number;
    name: string;
    class_room_id: ReturnType<typeof Number>;
}

interface ClassRoom {
    id: number;
    name: string;
    grade: number;
}

export default function CreateFinancialObligation() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState<{ classrooms: ClassRoom[], students: Student[] }>({ classrooms: [], students: [] });

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        due_date: '',
        description: '',
        target_type: 'all', // all | selected
        student_ids: [] as number[],
        class_room_id: '', // Filter for 'all' or 'selected' logic
    });

    const [filterClass, setFilterClass] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const response = await getFinancialObligationCreateData();
            setInitialData(response.data);
        } catch (error) {
            console.error('Error fetching create data:', error);
            toast.error('Gagal memuat data siswa');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) {
            toast.error('Mohon lengkapi data wajib');
            return;
        }

        // Validate target
        if (formData.target_type === 'selected' && formData.student_ids.length === 0) {
            toast.error('Pilih minimal satu siswa');
            return;
        }

        setLoading(true);
        try {
            await createFinancialObligation({
                ...formData,
                class_room_id: formData.class_room_id || null // Ensure null if empty string
            });
            toast.success('Tanggungan berhasil dibuat');
            navigate('/dashboard/donations'); // Redirect back to index (FinancialWrapper)
        } catch (error) {
            console.error('Error creating obligation:', error);
            toast.error('Gagal membuat tanggungan');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = filterClass
        ? initialData.students.filter(s => s.class_room_id == parseInt(filterClass))
        : initialData.students;

    const handleStudentToggle = (id: number) => {
        setFormData(prev => {
            const exists = prev.student_ids.includes(id);
            if (exists) {
                return { ...prev, student_ids: prev.student_ids.filter(sid => sid !== id) };
            } else {
                return { ...prev, student_ids: [...prev.student_ids, id] };
            }
        });
    };

    const handleSelectAllFiltered = () => {
        const ids = filteredStudents.map(s => s.id);
        // Add only new ones
        const newIds = [...new Set([...formData.student_ids, ...ids])];
        setFormData(prev => ({ ...prev, student_ids: newIds }));
    };

    const handleDeselectAllFiltered = () => {
        const idsToRemove = filteredStudents.map(s => s.id);
        setFormData(prev => ({
            ...prev,
            student_ids: prev.student_ids.filter(id => !idsToRemove.includes(id))
        }));
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Link to="/dashboard/donations" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Buat Tanggungan Baru</h2>
                    <p className="text-gray-500">Buat tagihan keuangan untuk siswa</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Tanggungan *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full rounded-lg border-gray-300 focus:border-brand-green-main focus:ring-brand-green-main"
                                placeholder="Contoh: Infaq Pembangunan"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp) *</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full rounded-lg border-gray-300 focus:border-brand-green-main focus:ring-brand-green-main"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi / Catatan</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-lg border-gray-300 focus:border-brand-green-main focus:ring-brand-green-main"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jatuh Tempo</label>
                        <input
                            type="date"
                            value={formData.due_date}
                            onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                            className="w-full rounded-lg border-gray-300 focus:border-brand-green-main focus:ring-brand-green-main"
                        />
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Target Siswa</h3>

                        <div className="flex gap-6 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="target_type"
                                    value="all"
                                    checked={formData.target_type === 'all'}
                                    onChange={e => setFormData({ ...formData, target_type: 'all' })}
                                    className="text-brand-green-main focus:ring-brand-green-main"
                                />
                                <span>Semua Siswa</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="target_type"
                                    value="selected"
                                    checked={formData.target_type === 'selected'}
                                    onChange={e => setFormData({ ...formData, target_type: 'selected' })}
                                    className="text-brand-green-main focus:ring-brand-green-main"
                                />
                                <span>Pilih Siswa Tertentu</span>
                            </label>
                        </div>

                        {/* Class Filter - Available for both modes */}
                        <div className="mb-4 max-w-xs">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Filter Kelas (Opsional)</label>
                            <select
                                value={formData.target_type === 'all' ? formData.class_room_id : filterClass}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (formData.target_type === 'all') {
                                        setFormData({ ...formData, class_room_id: val });
                                    } else {
                                        setFilterClass(val);
                                    }
                                }}
                                className="w-full rounded-lg border-gray-300 focus:border-brand-green-main focus:ring-brand-green-main text-sm"
                            >
                                <option value="">Semua Kelas</option>
                                {initialData.classrooms.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} (Kelas {c.grade})</option>
                                ))}
                            </select>
                            {formData.target_type === 'all' && formData.class_room_id && (
                                <p className="text-xs text-blue-600 mt-1">
                                    * Tanggungan hanya akan dibuat untuk siswa di kelas ini.
                                </p>
                            )}
                        </div>

                        {/* Student Selector - Only for 'selected' mode */}
                        {formData.target_type === 'selected' && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        Pilih Siswa ({formData.student_ids.length} dipilih)
                                    </span>
                                    <div className="space-x-2">
                                        <button
                                            type="button"
                                            onClick={handleSelectAllFiltered}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            Pilih Semua (Filter)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDeselectAllFiltered}
                                            className="text-xs text-red-600 hover:text-red-800"
                                        >
                                            Hapus (Filter)
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-60 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {filteredStudents.map(student => (
                                        <label key={student.id} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={formData.student_ids.includes(student.id)}
                                                onChange={() => handleStudentToggle(student.id)}
                                                className="rounded border-gray-300 text-brand-green-main focus:ring-brand-green-main"
                                            />
                                            <span className="text-sm text-gray-700 truncate">{student.name}</span>
                                        </label>
                                    ))}
                                    {filteredStudents.length === 0 && (
                                        <div className="col-span-full text-center text-gray-500 text-sm py-4">
                                            Tidak ada siswa ditemukan di kelas ini.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-6 py-2 bg-brand-green-main text-white rounded-lg hover:bg-brand-green-dark font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Simpan Tanggungan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
