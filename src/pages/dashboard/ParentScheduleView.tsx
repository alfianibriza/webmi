import { useEffect, useState, useMemo } from 'react';
import { getParentSlotSchedules, getSlotSchedules, getGuruSlotSchedules } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User, AlertCircle, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SlotSchedule } from '../../types/safe_types';

type Day = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

const DAYS: { key: Day; label: string }[] = [
    { key: 'sabtu', label: 'Sabtu' },
    { key: 'minggu', label: 'Ahad' },
    { key: 'senin', label: 'Senin' },
    { key: 'selasa', label: 'Selasa' },
    { key: 'rabu', label: 'Rabu' },
    { key: 'kamis', label: 'Kamis' },
];

export default function ParentScheduleView() {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<SlotSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDay, setSelectedDay] = useState<Day>('sabtu');

    // Determine current day on initial load
    useEffect(() => {
        const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ... 5 = Friday, 6 = Saturday
        const dayMap: { [key: number]: Day } = {
            0: 'minggu', // Sunday -> Ahad
            1: 'senin',
            2: 'selasa',
            3: 'rabu',
            4: 'kamis',
            6: 'sabtu'
        };

        // If today is Friday (5), it's not in the list, so we default to Saturday or keep default
        // If today is in the map, switch to it
        if (dayMap[today]) {
            setSelectedDay(dayMap[today]);
        }
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [user]);

    const fetchSchedules = async () => {
        setLoading(true);
        setError('');
        try {
            let res;
            // Use different API based on user role
            if (user?.role === 'admin' || user?.role === 'tu') {
                // Admin/TU: fetch all schedules
                res = await getSlotSchedules();
            } else if (user?.role === 'guru') {
                // Teacher: fetch teacher's schedules
                res = await getGuruSlotSchedules();
            } else {
                // Parent/Student: fetch their class schedules
                res = await getParentSlotSchedules();
            }
            setSchedules(Array.isArray(res.data) ? res.data : []);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Gagal memuat jadwal');
        } finally {
            setLoading(false);
        }
    };

    // Filter schedules for the selected day and sort by slot
    const dailySchedules = useMemo(() => {
        return schedules
            .filter(s => s.day === selectedDay)
            .sort((a, b) => a.slot_number - b.slot_number);
    }, [schedules, selectedDay]);

    const getSlotTimeRange = (slot: number) => {
        const times: Record<number, string> = {
            1: '07:00 - 07:35',
            2: '07:35 - 08:10',
            3: '08:10 - 08:45',
            4: '08:45 - 09:20',
            5: '09:50 - 10:25',
            6: '10:25 - 11:00',
            7: '11:00 - 11:35',
            8: '11:35 - 12:10',
        };
        return times[slot] || '';
    };

    const className = useMemo(() => {
        if (schedules.length > 0 && schedules[0].class_room) {
            return `Kelas ${schedules[0].class_room.grade} ${schedules[0].class_room.name}`;
        }
        if (user?.student?.class_room) {
            return `Kelas ${user.student.class_room.grade} ${user.student.class_room.name}`;
        }
        if (user?.student?.grade) {
            return `Kelas ${user.student.grade}`;
        }
        return '';
    }, [schedules, user]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-400 font-medium text-sm animate-pulse">Memuat jadwal...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 flex flex-col items-center justify-center text-center min-h-[40vh]">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Terjadi Kesalahan</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">{error}</p>
                <button
                    onClick={fetchSchedules}
                    className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 pb-24 min-h-screen bg-[#F9FAFB]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Link to="/dashboard" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-emerald-600 transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Jadwal {className}</h1>
                    <p className="text-sm text-gray-500">MI Al-Ghazali</p>
                </div>
            </div>

            {/* Day Tabs */}
            <div className="sticky top-0 z-30 -mx-6 px-6 py-4 bg-[#F9FAFB]/80 backdrop-blur-md flex overflow-x-auto gap-4 no-scrollbar snap-x">
                {DAYS.map((day) => {
                    const isActive = selectedDay === day.key;

                    return (
                        <button
                            key={day.key}
                            onClick={() => setSelectedDay(day.key)}
                            className={`snap-center flex flex-col items-center justify-center min-w-[5.5rem] py-3 rounded-[1.2rem] transition-all duration-300 relative overflow-hidden group ${isActive
                                ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl shadow-emerald-200 scale-105'
                                : 'bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/50 shadow-sm border border-gray-100'
                                }`}
                        >
                            {/* Active Shine Effect */}
                            {isActive && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-[1.2rem]"></div>}

                            <span className={`text-sm font-bold uppercase tracking-wider ${isActive ? 'text-white' : ''}`}>
                                {day.label}
                            </span>

                            {/* Dot Indicator for Active */}
                            {isActive && (
                                <div className="absolute bottom-1.5 w-1 h-1 bg-white rounded-full"></div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-5 mt-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Calendar size={16} />
                        </div>
                        <span className="font-bold text-gray-700 capitalize text-lg">{DAYS.find(d => d.key === selectedDay)?.label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {dailySchedules.length} Mapel
                    </span>
                </div>

                {dailySchedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Calendar className="text-gray-300" size={32} />
                        </div>
                        <p className="text-gray-600 font-bold text-lg">Libur / Kosong</p>
                        <p className="text-sm text-gray-400 mt-1 max-w-[200px]">
                            Tidak ada kegiatan belajar mengajar pada hari ini
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {dailySchedules.map((schedule, idx) => {
                            // Dynamic colors based on index/subject
                            const colors = [
                                'border-l-emerald-500 bg-emerald-50/30',
                                'border-l-blue-500 bg-blue-50/30',
                                'border-l-orange-500 bg-orange-50/30',
                                'border-l-purple-500 bg-purple-50/30',
                                'border-l-rose-500 bg-rose-50/30',
                            ];
                            const colorClass = colors[idx % colors.length];
                            const badgeColor = colorClass.replace('border-l-', 'text-').replace('bg-', 'bg-').replace('/30', '-100');

                            return (
                                <div key={schedule.id} className={`flex flex-col sm:flex-row gap-4 p-5 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 ${colorClass}`}>
                                    <div className="flex items-center gap-4 w-full">
                                        {/* Jam Badge */}
                                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-2xl shrink-0 shadow-sm border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">JAM</span>
                                            <span className="text-2xl font-black text-gray-800 leading-none">{schedule.slot_number}</span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">
                                                {schedule.subject?.name || 'Mata Pelajaran'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3">
                                                {getSlotTimeRange(schedule.slot_number) && (
                                                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                                        <Clock size={12} className="text-emerald-500" />
                                                        {getSlotTimeRange(schedule.slot_number)}
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                                    <User size={12} className="text-blue-500" />
                                                    <span className="truncate max-w-[150px]">{schedule.teacher?.name || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
