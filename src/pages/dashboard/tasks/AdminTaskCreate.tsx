import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask, getAdminUsers } from '../../../api';
import type { User } from '../../../types';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminTaskCreate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'simple',
        deadline: '',
        target_type: 'all',
        selected_teachers: [] as number[],
    });

    useEffect(() => {
        // Fetch teachers (users with role guru)
        getAdminUsers({ role: 'guru' })
            .then(res => {
                const data = res.data;
                setTeachers(Array.isArray(data) ? data : (data?.data || []));
            })
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Map selected_teachers from teacher IDs to USER IDs if necessary.
            // The backend expects user_ids in `selected_teachers`.
            // The `teachers` endpoint likely returns Teacher models which have `user_id`.
            // Ensure we send User IDs.
            // If the `teachers` list is from `getTeachers` (public endpoint) it might not have user_id exposed?
            // Check `getTeachers` in api/index.ts. It calls `/teachers` (public).
            // Public teacher list might not have user_id.
            // We should use `getAdminUsers({ role: 'guru' })` or `getAdminPtk`?
            // `getAdminPtk` returns admin ptk list which definitely has relation to user.
            // Let's assume for now we use `teachers` and map `user_id` if present, or better, fetch `getAdminUsers({ role: 'guru' })`.
            // I'll stick to `getAdminUsers` to be safe about User IDs.

            await createTask({
                ...formData,
                type: formData.type as 'simple' | 'upload' | 'text',
                target_type: formData.target_type as 'all' | 'selected',
                selected_teachers: formData.selected_teachers,
            });

            toast.success('Tugas berhasil dibuat');
            navigate('/dashboard/tasks');
        } catch (error) {
            console.error(error);
            toast.error('Gagal membuat tugas');
        } finally {
            setLoading(false);
        }
    };



    const toggleTeacher = (userId: number) => {
        setFormData(prev => {
            const selected = prev.selected_teachers.includes(userId)
                ? prev.selected_teachers.filter(id => id !== userId)
                : [...prev.selected_teachers, userId];
            return { ...prev, selected_teachers: selected };
        });
    };

    return (
        <div className="max-w-3xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-gray-700 mb-6"
            >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Kembali
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Tugas Baru</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Judul Tugas <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-lg border-gray-300 focus:border-brand-green-main focus:ring-brand-green-main"
                            placeholder="Contoh: Laporan Wali Kelas Bulan Januari"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipe Tugas <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'simple', label: 'Simple', desc: 'Cukup klik selesai' },
                                { id: 'upload', label: 'Upload File', desc: 'Unggah bukti foto/dokumen' },
                                { id: 'text', label: 'Isian Teks', desc: 'Laporan singkat teks' },
                            ].map((type) => (
                                <div
                                    key={type.id}
                                    onClick={() => setFormData({ ...formData, type: type.id })}
                                    className={`cursor-pointer rounded-lg border p-4 transition-all ${formData.type === type.id
                                        ? 'border-brand-green-main bg-emerald-50 ring-1 ring-brand-green-main'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <p className="font-medium text-gray-900">{type.label}</p>
                                    <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deskripsi (Opsional)
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-lg border-gray-300 focus:border-brand-green-main focus:ring-brand-green-main"
                            placeholder="Jelaskan detail tugas..."
                        />
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deadline (Opsional)
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.deadline}
                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                            className="w-full rounded-lg border-gray-300 focus:border-brand-green-main focus:ring-brand-green-main"
                        />
                    </div>

                    {/* Target */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target Guru <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="target_type"
                                    value="all"
                                    checked={formData.target_type === 'all'}
                                    onChange={() => setFormData({ ...formData, target_type: 'all' })}
                                    className="text-brand-green-main focus:ring-brand-green-main"
                                />
                                <span className="ml-2 text-gray-700">Semua Guru</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="target_type"
                                    value="selected"
                                    checked={formData.target_type === 'selected'}
                                    onChange={() => setFormData({ ...formData, target_type: 'selected' })}
                                    className="text-brand-green-main focus:ring-brand-green-main"
                                />
                                <span className="ml-2 text-gray-700">Guru Tertentu</span>
                            </label>
                        </div>

                        {formData.target_type === 'selected' && (
                            <div className="mt-4 border rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {teachers.map((teacher: any) => (
                                        <label key={teacher.id} className="flex items-center p-2 hover:bg-white rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.selected_teachers.includes(teacher.id)} // Here teacher.id is user id because of mapping above
                                                onChange={() => toggleTeacher(teacher.id)}
                                                className="rounded text-brand-green-main focus:ring-brand-green-main"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{teacher.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-brand-green-main text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-main disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Tugas'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
