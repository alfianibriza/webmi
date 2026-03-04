import { useEffect, useState } from 'react';
import { getGuruSlotSchedules, requestSwap, getMySwapRequests, cancelSwapRequest, getGuruGlobalSlotSchedules } from '../../../api';
import { Calendar, ArrowRightLeft, Clock, X, CheckCircle, XCircle, User } from 'lucide-react';
import type { SlotSchedule, SwapRequest } from '../../../types/safe_types';
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

export default function GuruSchedule() {
    const [schedules, setSchedules] = useState<SlotSchedule[]>([]);
    const [allSchedules, setAllSchedules] = useState<SlotSchedule[]>([]);
    const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'schedule' | 'swap'>('schedule');
    const [activeDay, setActiveDay] = useState<Day>('senin');
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<SlotSchedule | null>(null);
    const [swapNotes, setSwapNotes] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [swapMode, setSwapMode] = useState<'internal' | 'external'>('internal');
    const [filterDay, setFilterDay] = useState<Day>('senin');
    const [filterSlot, setFilterSlot] = useState<number>(1);

    useEffect(() => {
        fetchData();

        // Set active day based on current day
        const today = new Date().getDay();
        const dayMap: Record<number, Day> = {
            0: 'minggu',
            1: 'senin',
            2: 'selasa',
            3: 'rabu',
            4: 'kamis',
            6: 'sabtu'
        };
        if (today in dayMap) {
            setActiveDay(dayMap[today]);
        }
    }, []);

    const fetchData = async () => {
        try {
            const [scheduleRes, swapRes, globalRes] = await Promise.all([
                getGuruSlotSchedules(),
                getMySwapRequests(),
                getGuruGlobalSlotSchedules()
            ]);
            setSchedules(scheduleRes.data);
            setSwapRequests(swapRes.data);
            setAllSchedules(globalRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const groupByDay = () => {
        const grouped: Record<Day, SlotSchedule[]> = {
            senin: [], selasa: [], rabu: [], kamis: [], sabtu: [], minggu: []
        };
        schedules.forEach(s => {
            grouped[s.day as Day].push(s);
        });
        // Sort each day by slot number
        Object.keys(grouped).forEach(day => {
            grouped[day as Day].sort((a, b) => a.slot_number - b.slot_number);
        });
        return grouped;
    };

    const getAvailableTargets = () => {
        if (swapMode === 'internal') {
            return schedules.filter(s => s.id !== selectedSchedule?.id && s.status !== 'pending_swap');
        } else {
            return allSchedules.filter(s =>
                s.day === filterDay &&
                s.slot_number === filterSlot &&
                s.teacher_id !== selectedSchedule?.teacher_id
            );
        }
    };

    const openSwapModal = (schedule: SlotSchedule) => {
        setSelectedSchedule(schedule);
        setSwapNotes('');
        setError('');
        setShowSwapModal(true);
    };

    const handleSwapRequest = async (targetScheduleId: number) => {
        if (!selectedSchedule) return;

        try {
            await requestSwap(selectedSchedule.id, targetScheduleId, swapNotes);
            setSuccess('Permintaan swap berhasil diajukan!');
            setShowSwapModal(false);
            fetchData();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Gagal mengajukan swap');
        }
    };

    const handleCancelSwap = async (id: number) => {
        if (!confirm('Yakin ingin membatalkan permintaan swap ini?')) return;
        try {
            await cancelSwapRequest(id);
            fetchData();
        } catch (err) {
            console.error('Error canceling swap:', err);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs flex items-center gap-1"><Clock size={12} /> Pending</span>;
            case 'approved':
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1"><CheckCircle size={12} /> Disetujui</span>;
            case 'rejected':
                return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1"><XCircle size={12} /> Ditolak</span>;
            default:
                return null;
        }
    };

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

    const groupedSchedules = groupByDay();

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
                    <Calendar className="text-emerald-600" />
                    Jadwal Mengajar Saya
                </h1>
            </div>

            {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                    {success}
                    <button onClick={() => setSuccess('')} className="float-right"><X size={16} /></button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'schedule'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Jadwal Saya
                </button>
                <button
                    onClick={() => setActiveTab('swap')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'swap'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <ArrowRightLeft size={18} />
                    Swap Requests
                    {swapRequests.filter(r => r.status === 'pending').length > 0 && (
                        <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">
                            {swapRequests.filter(r => r.status === 'pending').length}
                        </span>
                    )}
                </button>
            </div>

            {activeTab === 'schedule' ? (
                <div>
                    {/* Day Tabs - Sticky & Glassmorphism */}
                    <div className="sticky top-0 z-30 -mx-6 px-6 py-4 bg-[#F9FAFB]/80 backdrop-blur-md flex overflow-x-auto gap-4 no-scrollbar snap-x transition-all duration-300">
                        {DAYS.map((day) => {
                            const isActive = activeDay === day.key;
                            return (
                                <button
                                    key={day.key}
                                    onClick={() => setActiveDay(day.key)}
                                    className={`snap-center flex flex-col items-center justify-center min-w-[5.5rem] py-3 rounded-[1.2rem] transition-all duration-300 relative overflow-hidden group ${isActive
                                        ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl shadow-emerald-200 scale-105'
                                        : 'bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/50 shadow-sm border border-gray-100'
                                        }`}
                                >
                                    {isActive && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-[1.2rem]"></div>}
                                    <span className={`text-sm font-bold uppercase tracking-wider ${isActive ? 'text-white' : ''}`}>
                                        {day.label}
                                    </span>
                                    {isActive && <div className="absolute bottom-1.5 w-1 h-1 bg-white rounded-full"></div>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Schedule Content */}
                    <div className="mt-2 space-y-4">
                        <div className="flex items-center justify-between px-1 mb-2">
                            <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
                                <Calendar size={20} className="text-emerald-600" />
                                {DAYS.find(d => d.key === activeDay)?.label}
                            </h3>
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                {groupedSchedules[activeDay].length} Slot
                            </span>
                        </div>

                        {groupedSchedules[activeDay].length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                    <Calendar className="text-gray-300" size={32} />
                                </div>
                                <p className="text-gray-600 font-bold text-lg">Tidak ada jadwal</p>
                                <p className="text-sm text-gray-400 mt-1 max-w-[200px]">
                                    Anda bebas tugas mengajar pada hari ini
                                </p>
                            </div>
                        ) : (
                            groupedSchedules[activeDay].map((schedule, idx) => {
                                // Dynamic colors
                                const colors = [
                                    'border-l-emerald-500 bg-emerald-50/30',
                                    'border-l-blue-500 bg-blue-50/30',
                                    'border-l-orange-500 bg-orange-50/30',
                                    'border-l-purple-500 bg-purple-50/30',
                                    'border-l-rose-500 bg-rose-50/30',
                                ];
                                const colorClass = colors[idx % colors.length];

                                return (
                                    <div
                                        key={schedule.id}
                                        className={`flex flex-col sm:flex-row gap-4 p-5 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 ${colorClass} ${schedule.status === 'pending_swap' ? 'opacity-75' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 w-full">
                                            {/* Jam Badge */}
                                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-2xl shrink-0 shadow-sm border border-gray-100 relative overflow-hidden">
                                                {schedule.status === 'pending_swap' && (
                                                    <div className="absolute inset-0 bg-yellow-50/80 flex items-center justify-center z-10">
                                                        <Clock size={20} className="text-yellow-600" />
                                                    </div>
                                                )}
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">JAM</span>
                                                <span className="text-2xl font-black text-gray-800 leading-none">{schedule.slot_number}</span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">
                                                        {schedule.subject?.name}
                                                    </h3>
                                                    {/* Swap Button */}
                                                    {schedule.status !== 'pending_swap' && (
                                                        <button
                                                            onClick={() => openSwapModal(schedule)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                            title="Request Swap"
                                                        >
                                                            <ArrowRightLeft size={18} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                                        <User size={12} className="text-blue-500" />
                                                        Kelas {schedule.class_room?.grade} {schedule.class_room?.name}
                                                    </span>
                                                    {getSlotTimeRange(schedule.slot_number) && (
                                                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                                            <Clock size={12} className="text-emerald-500" />
                                                            {getSlotTimeRange(schedule.slot_number)}
                                                        </span>
                                                    )}
                                                    {schedule.status === 'pending_swap' && (
                                                        <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                                                            Menunggu Swap
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {swapRequests.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <ArrowRightLeft size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>Belum ada riwayat permintaan swap.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {swapRequests.map(request => (
                                <div key={request.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getStatusBadge(request.status)}
                                                <span className="text-sm text-gray-400">
                                                    #{request.id}
                                                </span>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                                    <div className="text-xs text-blue-600 mb-1">Jadwal Saya</div>
                                                    <div className="font-medium">{request.schedule_one?.subject?.name}</div>
                                                    <div className="text-sm text-gray-600">
                                                        {request.schedule_one?.day} Jam {request.schedule_one?.slot_number}
                                                    </div>
                                                </div>
                                                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                                    <div className="text-xs text-purple-600 mb-1">Ditukar dengan</div>
                                                    <div className="font-medium">{request.schedule_two?.subject?.name}</div>
                                                    <div className="text-sm text-gray-600">
                                                        {request.target_teacher?.name} - {request.schedule_two?.day} Jam {request.schedule_two?.slot_number}
                                                    </div>
                                                </div>
                                            </div>
                                            {request.notes && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <strong>Catatan:</strong> {request.notes}
                                                </div>
                                            )}
                                        </div>
                                        {request.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelSwap(request.id)}
                                                className="ml-4 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                Batalkan
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Swap Request Modal */}
            <Modal show={showSwapModal} onClose={() => setShowSwapModal(false)}>
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Request Swap Jadwal</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {selectedSchedule && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm text-blue-600 mb-1">Jadwal yang akan ditukar:</div>
                            <div className="font-semibold">{selectedSchedule.subject?.name}</div>
                            <div className="text-sm text-gray-600">
                                {selectedSchedule.day} Jam {selectedSchedule.slot_number} - Kelas {selectedSchedule.class_room?.grade} {selectedSchedule.class_room?.name}
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Catatan (opsional):
                        </label>
                        <textarea
                            value={swapNotes}
                            onChange={(e) => setSwapNotes(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            rows={3}
                            placeholder="Alasan swap jadwal..."
                        />
                    </div>

                    <div className="mb-4">
                        <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                            <button
                                onClick={() => setSwapMode('internal')}
                                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${swapMode === 'internal' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Tukar Jadwal Sendiri
                            </button>
                            <button
                                onClick={() => setSwapMode('external')}
                                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${swapMode === 'external' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Tukar dengan Guru Lain
                            </button>
                        </div>

                        {swapMode === 'external' && (
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Hari Target</label>
                                    <select
                                        value={filterDay}
                                        onChange={(e) => setFilterDay(e.target.value as Day)}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                    >
                                        {DAYS.map(day => (
                                            <option key={day.key} value={day.key}>{day.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Jam Target</label>
                                    <select
                                        value={filterSlot}
                                        onChange={(e) => setFilterSlot(Number(e.target.value))}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(slot => (
                                            <option key={slot} value={slot}>Jam ke-{slot}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {swapMode === 'internal' ? 'Pilih jadwal Anda untuk ditukar:' : 'Pilih jadwal target:'}
                        </label>

                        <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3 scrollbar-thin">
                            {getAvailableTargets().length === 0 ? (
                                <div className="text-center text-gray-400 text-sm py-4">
                                    {swapMode === 'internal'
                                        ? 'Tidak ada jadwal lain yang tersedia.'
                                        : 'Tidak ada jadwal ditemukan pada waktu ini.'}
                                </div>
                            ) : (
                                getAvailableTargets().map(schedule => (
                                    <button
                                        key={schedule.id}
                                        onClick={() => handleSwapRequest(schedule.id)}
                                        className="w-full text-left p-3 hover:bg-emerald-50 rounded-lg transition-colors border border-gray-200 group relative"
                                    >
                                        <div className="font-medium flex items-center justify-between">
                                            <span>{schedule.subject?.name}</span>
                                            {swapMode === 'external' && (
                                                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <User size={10} /> {schedule.teacher?.name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {schedule.day} Jam {schedule.slot_number} - Kelas {schedule.class_room?.grade} {schedule.class_room?.name}
                                        </div>
                                        {swapMode === 'external' && (
                                            <div className="mt-1 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Klik untuk request swap
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowSwapModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
