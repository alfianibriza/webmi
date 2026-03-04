import { useEffect, useState } from 'react';
import { getAdminPtkAttendanceInput, storeAdminPtkAttendance } from '../../../api';
import type { Teacher } from '../../../types/safe_types';

export default function AdminTeacherAttendance() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [attendanceInput, setAttendanceInput] = useState<Record<number, string>>({});

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await getAdminPtkAttendanceInput(date);
            const { teachers: fetchedTeachers, attendances } = response.data;

            setTeachers(fetchedTeachers);

            // Map existing attendances to state
            const initialInput: Record<number, string> = {};
            fetchedTeachers.forEach((t: Teacher) => {
                if (t.user_id) {
                    // attendances is keyed by user_id from backend
                    const att = attendances[t.user_id];
                    initialInput[t.user_id] = att ? att.status : 'hadir';
                }
            });
            setAttendanceInput(initialInput);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const attendances = Object.entries(attendanceInput).map(([user_id, status]) => ({
                user_id: Number(user_id),
                status,
            }));

            await storeAdminPtkAttendance(attendances, date);
            alert('Absensi guru berhasil disimpan!');
            fetchData(); // Refresh to ensure data is in sync
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Gagal menyimpan absensi.');
        } finally {
            setIsSaving(false);
        }
    };

    const statusOptions = [
        { value: 'hadir', label: 'Hadir', color: 'bg-green-100 text-green-800' },
        { value: 'izin', label: 'Izin', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'sakit', label: 'Sakit', color: 'bg-blue-100 text-blue-800' },
        { value: 'alpha', label: 'Alpha', color: 'bg-red-100 text-red-800' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Absensi Guru (PTK)</h1>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Guru</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIP</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {teachers.map((teacher, index) => {
                                        if (!teacher.user_id) return null; // Skip if no user_id (cannot assign attendance)
                                        return (
                                            <tr key={teacher.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                                <td className="px-6 py-4 font-medium text-gray-800">{teacher.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{teacher.nip || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-1">
                                                        {statusOptions.map((option) => (
                                                            <button
                                                                key={option.value}
                                                                onClick={() => setAttendanceInput(prev => ({ ...prev, [teacher.user_id!]: option.value }))}
                                                                className={`px-2 py-1 text-xs rounded-full transition ${attendanceInput[teacher.user_id!] === option.value
                                                                    ? option.color
                                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                {option.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-brand-green-main text-white px-6 py-2 rounded-lg hover:bg-brand-green-dark transition disabled:opacity-50"
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan Absensi'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
