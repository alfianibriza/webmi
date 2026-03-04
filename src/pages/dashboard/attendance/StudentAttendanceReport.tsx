import { useEffect, useState } from 'react';
import { getStudentAttendanceReport, downloadStudentAttendanceReport, getTingkat, getKelasAktif, getAcademicYears } from '../../../api';
import type { StudentAttendanceReportItem } from '../../../types';
import { FileText } from 'lucide-react';

interface ReportFilters {
    start_date: string;
    end_date: string;
    // class_room_id: string; // Removed legacy rombel filter
}

interface Tingkat {
    id: number;
    level: number;
    name: string;
}

interface KelasAktif {
    id: number;
    name: string;
    rombel: {
        name: string;
    };
}

interface AcademicYear {
    id: number;
    status: string;
}

export default function StudentAttendanceReport() {
    const [students, setStudents] = useState<StudentAttendanceReportItem[]>([]);

    // Filter States
    const [tingkatList, setTingkatList] = useState<Tingkat[]>([]);
    const [selectedTingkat, setSelectedTingkat] = useState<number | null>(null);

    const [kelasList, setKelasList] = useState<KelasAktif[]>([]);
    const [selectedKelas, setSelectedKelas] = useState<number | null>(null);

    const [activeYearId, setActiveYearId] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false); // Changed default to false, wait for user action or initial load
    const [isExporting, setIsExporting] = useState(false);

    const [filters, setFilters] = useState<ReportFilters>({
        start_date: (() => {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const year = firstDay.getFullYear();
            const month = String(firstDay.getMonth() + 1).padStart(2, '0');
            const day = String(firstDay.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })(),
        end_date: (() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })(),
    });

    // 1. Fetch Initial Data
    useEffect(() => {
        const init = async () => {
            try {
                const [tingkatRes, yearRes] = await Promise.all([
                    getTingkat(),
                    getAcademicYears()
                ]);
                setTingkatList(tingkatRes.data);
                const active = yearRes.data.find((y: AcademicYear) => y.status === 'active');
                if (active) setActiveYearId(active.id);
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };
        init();
        fetchReport(); // Initial load
    }, []);

    // 2. Fetch Kelas when Tingkat or Year changes
    useEffect(() => {
        if (selectedTingkat && activeYearId) {
            const fetchKelas = async () => {
                try {
                    const response = await getKelasAktif({
                        academic_year_id: activeYearId,
                        tingkat_id: selectedTingkat
                    });
                    setKelasList(response.data);
                    setSelectedKelas(null);
                } catch (error) {
                    console.error('Error fetching kelas:', error);
                }
            };
            fetchKelas();
        } else {
            setKelasList([]);
            setSelectedKelas(null);
        }
    }, [selectedTingkat, activeYearId]);

    // 3. Fetch Report when filters change
    useEffect(() => {
        fetchReport();
    }, [filters, selectedTingkat, selectedKelas]);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            // Determine filter params
            const distinctTingkat = tingkatList.find(t => t.id === selectedTingkat);
            const grade = distinctTingkat ? String(distinctTingkat.level) : undefined;

            const response = await getStudentAttendanceReport({
                start_date: filters.start_date,
                end_date: filters.end_date,
                grade: !selectedKelas ? grade : undefined,
                class_room_id: selectedKelas || undefined,
            });
            setStudents(response.data.students);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const distinctTingkat = tingkatList.find(t => t.id === selectedTingkat);
            const grade = distinctTingkat ? String(distinctTingkat.level) : undefined;

            await downloadStudentAttendanceReport({
                start_date: filters.start_date,
                end_date: filters.end_date,
                grade: !selectedKelas ? grade : undefined,
                class_room_id: selectedKelas || undefined,
            });
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('Gagal mencetak laporan');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="w-8 h-8 text-brand-green-main" />
                        Laporan Kehadiran Murid
                    </h1>
                    <p className="text-gray-500">Fitur ini digunakan untuk melihat dan mencetak laporan kehadiran murid.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    {/* Tingkat Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat</label>
                        <select
                            value={selectedTingkat || ''}
                            onChange={(e) => setSelectedTingkat(e.target.value ? Number(e.target.value) : null)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[120px]"
                        >
                            <option value="">Semua Tingkat</option>
                            {tingkatList.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Detail Kelas Filter - Only show if more than 1 option */}
                    {kelasList.length > 1 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Detail Kelas</label>
                            <select
                                value={selectedKelas || ''}
                                onChange={(e) => setSelectedKelas(e.target.value ? Number(e.target.value) : null)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[120px]"
                                disabled={!selectedTingkat}
                            >
                                <option value="">Semua Detail</option>
                                {kelasList.map((k) => (
                                    <option key={k.id} value={k.id}>{k.rombel?.name || k.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <FileText className="w-4 h-4" />
                        )}
                        {isExporting ? 'Mencetak...' : 'Cetak Laporan'}
                    </button>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama Siswa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NIS
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kelas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hadir
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Izin
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sakit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Alpha
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.length > 0 ? (
                                    students.map((student, index) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800">{student.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{student.nis || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {student.classrooms?.[0]?.name || student.kelas?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {student.hadir_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {student.izin_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    {student.sakit_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    {student.alpha_count}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            Belum ada data siswa.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
