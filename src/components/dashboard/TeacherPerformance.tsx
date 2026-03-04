import { useEffect, useState } from 'react';
import { getTeacherPerformance } from '../../api';
import { User, Trophy } from 'lucide-react';
import { getStorageUrl } from '../../utils';

interface TeacherStats {
    id: number;
    name: string;
    photo: string | null;
    subject: string;
    total_tasks: number;
    completed_tasks: number;
    percentage: number;
    status: 'Selesai' | 'Proses' | 'Lambat';
    present_count: number;
    permit_count: number;
    sick_count: number;
    alpha_count: number;
}

interface PerformanceResponse {
    month: number;
    year: number;
    teachers: TeacherStats[];
    top: TeacherStats[];
    bottom: TeacherStats[];
}

export default function TeacherPerformance() {
    const [data, setData] = useState<PerformanceResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchPerformance();
    }, [month, year]);

    const fetchPerformance = async () => {
        setLoading(true);
        try {
            const response = await getTeacherPerformance(month, year);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching teacher performance:', error);
        } finally {
            setLoading(false);
        }
    };

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];





    const getProgressBarColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-brand-green-main';
        if (percentage >= 80) return 'bg-brand-green-main';
        if (percentage >= 50) return 'bg-yellow-400';
        return 'bg-red-500';
    };

    if (loading && !data) {
        return <div className="animate-pulse h-64 bg-gray-100 rounded-2xl"></div>;
    }

    return (
        <div className="space-y-8">
            {/* Header & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-brand-green-main" />
                        Update Perform
                    </h2>
                    <p className="text-sm text-gray-500">Peringkat guru berdasarkan kehadiran dan tugas yang dikerjakan</p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-green-main"
                    >
                        {months.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-green-main"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Leaderboard */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Kehadiran</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-gray-100">
                                {data?.teachers && data.teachers.length > 0 ? (
                                    [...data.teachers]
                                        .sort((a, b) => b.present_count - a.present_count || a.alpha_count - b.alpha_count)
                                        .map((teacher, index, arr) => {
                                            const isLast = index === arr.length - 1;
                                            return (
                                                <tr key={teacher.id} className={`transition-colors ${isLast ? 'bg-red-100 animate-pulse' : 'hover:bg-gray-50'}`}>
                                                    <td className="px-4 sm:px-6 py-4 text-center w-16">
                                                        <div className={`flex justify-center items-center font-bold ${index < 3 ? 'text-brand-green-main text-lg' : 'text-gray-400'}`}>
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 border-2 ${index < 3 ? 'border-yellow-100' : 'border-gray-100'}`}>
                                                                {teacher.photo ? (
                                                                    <img src={getStorageUrl(teacher.photo)} alt={teacher.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`font-medium text-sm sm:text-base ${index < 3 ? 'text-gray-900 font-semibold' : 'text-gray-900'}`}>{teacher.name}</div>
                                                                    {index < 3 && (
                                                                        <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded border border-yellow-200">
                                                                            TOP {index + 1}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                                            <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                                                                {teacher.present_count} <span className="hidden sm:inline">Hadir</span>
                                                            </span>
                                                            {(teacher.permit_count > 0 || teacher.sick_count > 0) && (
                                                                <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                                                    {teacher.permit_count + teacher.sick_count} <span className="hidden sm:inline">Izin</span>
                                                                </span>
                                                            )}
                                                            {teacher.alpha_count > 0 && (
                                                                <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                                                    {teacher.alpha_count} <span className="hidden sm:inline">Alpha</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-10 text-gray-500 text-sm">
                                            Belum ada data absensi untuk periode ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Task Stats List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Penyelesaian Tugas</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-gray-100">
                                {data?.teachers?.length ? (
                                    [...data.teachers]
                                        .sort((a, b) => b.percentage - a.percentage || b.completed_tasks - a.completed_tasks)
                                        .map((teacher, index, arr) => {
                                            const isLast = index === arr.length - 1;
                                            return (
                                                <tr key={teacher.id} className={`transition-colors ${isLast ? 'bg-red-100 animate-pulse' : 'hover:bg-gray-50'}`}>
                                                    <td className="px-4 sm:px-6 py-4 text-center w-16">
                                                        <div className={`flex justify-center items-center font-bold ${index < 3 ? 'text-brand-green-main text-lg' : 'text-gray-400'}`}>
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 border-2 ${index < 3 ? 'border-yellow-100' : 'border-gray-100'}`}>
                                                                {teacher.photo ? (
                                                                    <img src={getStorageUrl(teacher.photo)} alt={teacher.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-brand-green-light text-white font-bold text-sm">
                                                                        {teacher.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="max-w-[100px] sm:max-w-none truncate">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`font-medium text-sm sm:text-base ${index < 3 ? 'text-gray-900 font-semibold' : 'text-gray-900'}`}>{teacher.name}</div>
                                                                    {index < 3 && (
                                                                        <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded border border-yellow-200">
                                                                            TOP {index + 1}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="space-y-2 min-w-[140px]">
                                                            <div className="flex justify-between text-xs font-medium">
                                                                <span className="text-gray-500 hidden sm:inline">Progress</span>
                                                                <span className={teacher.percentage >= 100 ? 'text-green-600' : teacher.percentage < 50 ? 'text-red-500' : 'text-gray-700'}>
                                                                    {teacher.completed_tasks}/{teacher.total_tasks} <span className="hidden sm:inline">Tugas</span> ({teacher.percentage}%)
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full ${getProgressBarColor(teacher.percentage)} rounded-full transition-all duration-500`}
                                                                    style={{ width: `${teacher.percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-10 text-gray-500 text-sm">
                                            Belum ada data guru.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
