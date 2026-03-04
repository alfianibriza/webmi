import { useEffect, useState, useMemo } from 'react';
import { getSlotSchedules, getTingkat, getKelasAktif, generateSlotSchedules, clearSlotSchedules, getSlotScheduleExportUrl, moveSlotSchedule } from '../../../api';
import { Calendar, Download, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import type { SlotSchedule, Tingkat, KelasAktif } from '../../../types/safe_types';
import Modal from '../../../components/Modal';

type Day = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

const DAYS: { key: Day; label: string }[] = [
    { key: 'sabtu', label: 'Sabtu' },
    { key: 'minggu', label: 'Ahad' },
    { key: 'senin', label: 'Senin' },
    { key: 'selasa', label: 'Selasa' },
    { key: 'rabu', label: 'Rabu' },
    { key: 'kamis', label: 'Kamis' },
];

const MAX_SLOTS = 7;

const SLOT_TIMES = [
    "07.15 - 07.50", // Jam 1
    "07.50 - 08.25", // Jam 2
    "08.25 - 09.00", // Jam 3
    "09.30 - 10.05", // Jam 4
    "10.05 - 10.40", // Jam 5
    "10.50 - 11.25", // Jam 6
    "11.25 - 12.00", // Jam 7
];

export default function SlotScheduleIndex() {
    const [schedules, setSchedules] = useState<SlotSchedule[]>([]);
    const [tingkatList, setTingkatList] = useState<Tingkat[]>([]);
    const [allClasses, setAllClasses] = useState<KelasAktif[]>([]); // For modal and local filtering
    const [availableKelas, setAvailableKelas] = useState<KelasAktif[]>([]); // For dropdown
    const [selectedTingkat, setSelectedTingkat] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedClassRoom, setSelectedClassRoom] = useState<number | null>(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [overwrite, setOverwrite] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Move/Swap State
    const [selectedSlot, setSelectedSlot] = useState<{ day: Day; slot: number; scheduleId: number } | null>(null);
    const [moving, setMoving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    // Filter available classes when Tingkat changes
    useEffect(() => {
        if (selectedTingkat) {
            const classes = allClasses.filter(c => c.tingkat_id === Number(selectedTingkat));
            setAvailableKelas(classes);

            // Auto-select if only 1 class
            if (classes.length === 1) {
                setSelectedClassRoom(classes[0].id);
            } else {
                setSelectedClassRoom(null); // Reset selection to force explicit choice
            }
        } else {
            setAvailableKelas([]);
            setSelectedClassRoom(null);
        }
    }, [selectedTingkat, allClasses]);

    useEffect(() => {
        if (selectedClassRoom) {
            fetchSchedules();
        } else {
            setSchedules([]); // Clear schedules if no class selected
        }
    }, [selectedClassRoom]);

    const fetchData = async () => {
        try {
            const [tingkatRes, classesRes] = await Promise.all([
                getTingkat(),
                getKelasAktif({}) // Fetch all active classes
            ]);

            setTingkatList(Array.isArray(tingkatRes.data) ? tingkatRes.data : []);

            const classes = Array.isArray(classesRes.data) ? classesRes.data : [];
            setAllClasses(classes);

            // No auto-select first class anymore - force hierarchy selection
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedules = async () => {
        if (!selectedClassRoom) return;
        try {
            const res = await getSlotSchedules({ class_room_id: selectedClassRoom });
            setSchedules(res.data);
        } catch (err) {
            console.error('Error fetching schedules:', err);
        }
    };

    const scheduleGrid = useMemo(() => {
        const grid: Record<Day, Record<number, SlotSchedule | null>> = {
            senin: {}, selasa: {}, rabu: {}, kamis: {}, jumat: {}, sabtu: {}, minggu: {}
        };
        schedules.forEach(s => {
            if (grid[s.day as Day]) {
                grid[s.day as Day][s.slot_number] = s;
            }
        });
        return grid;
    }, [schedules]);

    const handleGenerate = async () => {
        if (selectedClasses.length === 0) {
            setError('Pilih minimal satu kelas');
            return;
        }

        setGenerating(true);
        setError('');
        setSuccess('');

        try {
            const res = await generateSlotSchedules(selectedClasses, overwrite);
            setSuccess(`Berhasil generate ${res.data.created} jadwal!`);
            setShowGenerateModal(false);
            fetchSchedules();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string; errors?: string[] } } };
            if (error.response?.data?.errors) {
                setError(error.response.data.errors.join(', '));
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Gagal generate jadwal');
            }
        } finally {
            setGenerating(false);
        }
    };

    const handleClear = async () => {
        if (!confirm('Yakin ingin menghapus semua jadwal untuk kelas ini?')) return;
        try {
            await clearSlotSchedules(selectedClassRoom || undefined);
            setSchedules([]);
            setSuccess('Jadwal berhasil dihapus');
        } catch (err) {
            console.error('Error clearing schedules:', err);
        }
    };

    const handleSlotClick = async (day: Day, slot: number, scheduleId?: number) => {
        setError('');
        setSuccess('');

        if (selectedSlot) {
            // If clicking the same slot, deselect
            if (selectedSlot.day === day && selectedSlot.slot === slot) {
                setSelectedSlot(null);
                return;
            }

            // Perform Move/Swap
            if (!selectedClassRoom) return;

            setMoving(true);
            try {
                await moveSlotSchedule({
                    source_id: selectedSlot.scheduleId,
                    target_day: day,
                    target_slot: slot,
                    class_room_id: selectedClassRoom
                });

                setSuccess('Jadwal berhasil dipindahkan/ditukar');
                fetchSchedules();
                setSelectedSlot(null);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Gagal memindahkan jadwal');
            } finally {
                setMoving(false);
            }

        } else {
            // Select Source (only if occupied)
            if (scheduleId) {
                setSelectedSlot({ day, slot, scheduleId });
            }
        }
    };

    const handleExport = (type: 'class' | 'all') => {
        const url = getSlotScheduleExportUrl(type, selectedClassRoom || undefined);
        window.open(url, '_blank');
    };

    const selectedClass = allClasses.find(c => c.id === selectedClassRoom);

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
                    <Calendar className="w-8 h-8 text-brand-green-main" />
                    Jadwal Pelajaran (Slot)
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        <RefreshCw size={18} />
                        Generate Jadwal
                    </button>
                    <button
                        onClick={() => handleExport('class')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download size={18} />
                        Export Kelas
                    </button>
                    <button
                        onClick={() => handleExport('all')}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Download size={18} />
                        Export Semua
                    </button>
                </div>
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

            {/* Class Selector */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex w-full gap-2 md:w-auto">

                        {/* Tingkat Filter */}
                        <select
                            className="rounded-lg border-gray-300 shadow-sm text-sm focus:border-emerald-500 focus:ring-emerald-500 flex-1 md:flex-none md:w-40"
                            value={selectedTingkat}
                            onChange={(e) => setSelectedTingkat(e.target.value ? Number(e.target.value) : '')}
                        >
                            <option value="">Pilih Tingkat</option>
                            {tingkatList.map(t => (
                                <option key={t.id} value={t.id}>
                                    Kelas {t.level}
                                </option>
                            ))}
                        </select>

                        {/* Detail Kelas Filter (Conditional) */}
                        {availableKelas.length > 1 && (
                            <select
                                className="rounded-lg border-gray-300 shadow-sm text-sm focus:border-emerald-500 focus:ring-emerald-500 flex-1 md:flex-none md:w-48"
                                value={selectedClassRoom || ''}
                                onChange={(e) => setSelectedClassRoom(Number(e.target.value))}
                            >
                                <option value="" disabled>Pilih Detail Kelas</option>
                                {availableKelas.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <button
                        onClick={handleClear}
                        className="ml-auto flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        disabled={!selectedClassRoom}
                    >
                        <Trash2 size={16} />
                        <span className="hidden md:inline">Hapus Jadwal</span>
                    </button>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className={`bg-white rounded-xl shadow-sm overflow-hidden transition-opacity ${moving ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Jam</th>
                                {DAYS.map(day => (
                                    <th key={day.key} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        {day.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {Array.from({ length: MAX_SLOTS }, (_, i) => i + 1).map(slot => (
                                <tr key={slot} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span>Jam {slot}</span>
                                            <span className="text-xs text-gray-400 font-normal">{SLOT_TIMES[slot - 1]}</span>
                                        </div>
                                    </td>
                                    {DAYS.map(day => {
                                        const schedule = scheduleGrid[day.key][slot];
                                        return (
                                            <td
                                                key={day.key}
                                                className={`px-2 py-2 text-center cursor-pointer transition-colors ${selectedSlot?.day === day.key && selectedSlot?.slot === slot
                                                    ? 'bg-blue-100 ring-2 ring-blue-500'
                                                    : selectedSlot
                                                        ? 'hover:bg-blue-50 ring-2 ring-transparent hover:ring-blue-200'
                                                        : ''
                                                    }`}
                                                onClick={() => handleSlotClick(day.key, slot, schedule?.id)}
                                            >
                                                {schedule ? (
                                                    <div className={`rounded-lg p-2 text-xs ${schedule.status === 'pending_swap'
                                                        ? 'bg-yellow-100 border-2 border-yellow-400'
                                                        : 'bg-emerald-50 border border-emerald-200'
                                                        }`}>
                                                        <div className="font-semibold text-gray-800" title={schedule.subject?.name}>
                                                            {schedule.subject?.code}
                                                        </div>
                                                        <div className="text-gray-500 mt-1">
                                                            {schedule.teacher?.name}
                                                        </div>
                                                        {schedule.status === 'pending_swap' && (
                                                            <div className="mt-1 text-yellow-600 text-[10px] font-medium">
                                                                Pending Swap
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center min-h-[60px] rounded-lg border-2 border-dashed border-gray-100 text-gray-300 text-xs">
                                                        {selectedSlot ? 'Pindah Sini' : '-'}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {schedules.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Belum ada jadwal untuk kelas {(selectedClass as any)?.grade} {selectedClass?.name}.
                        <br />
                        Klik "Generate Jadwal" untuk membuat jadwal otomatis.
                    </div>
                )}
            </div>

            {/* Generate Modal */}
            <Modal show={showGenerateModal} onClose={() => setShowGenerateModal(false)}>
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Generate Jadwal Otomatis</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pilih Kelas untuk Generate:
                        </label>
                        <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
                            {allClasses.map(c => (
                                <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={selectedClasses.includes(c.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedClasses([...selectedClasses, c.id]);
                                            } else {
                                                setSelectedClasses(selectedClasses.filter(id => id !== c.id));
                                            }
                                        }}
                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span>{c.name}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={() => setSelectedClasses(allClasses.map(c => c.id))}
                            className="mt-2 text-sm text-emerald-600 hover:underline"
                        >
                            Pilih Semua
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={overwrite}
                                onChange={(e) => setOverwrite(e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-700">
                                Timpa jadwal yang sudah ada
                            </span>
                        </label>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 mb-4">
                        <strong>Catatan:</strong> Pastikan mata pelajaran sudah dikonfigurasi dengan guru pengampu dan jam mingguan per kelas sebelum melakukan generate.
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setShowGenerateModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {generating && <RefreshCw size={16} className="animate-spin" />}
                            {generating ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
