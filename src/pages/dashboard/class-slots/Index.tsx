import { useEffect, useState } from 'react';
import { getClassRooms, getClassDaySlots, updateClassDaySlots } from '../../../api';
import { Clock, Save, AlertCircle } from 'lucide-react';
import type { ClassRoom, ClassDaySlot } from '../../../types';

type Day = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'minggu' | 'sabtu';

const DAYS: { key: string; label: string }[] = [
    { key: 'sabtu', label: 'Sabtu' },
    { key: 'minggu', label: 'Ahad' },
    { key: 'senin', label: 'Senin' },
    { key: 'selasa', label: 'Selasa' },
    { key: 'rabu', label: 'Rabu' },
    { key: 'kamis', label: 'Kamis' },
];

const DEFAULT_SLOTS = 8;

export default function ClassDaySlotsIndex() {
    const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [slots, setSlots] = useState<Record<Day, number>>({
        senin: DEFAULT_SLOTS,
        selasa: DEFAULT_SLOTS,
        rabu: DEFAULT_SLOTS,
        kamis: DEFAULT_SLOTS,
        sabtu: DEFAULT_SLOTS,
        minggu: DEFAULT_SLOTS,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchClassRooms();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSlots();
        }
    }, [selectedClass]);

    const fetchClassRooms = async () => {
        try {
            const res = await getClassRooms();
            setClassRooms(res.data);
            if (res.data.length > 0) {
                setSelectedClass(res.data[0].id);
            }
        } catch (err) {
            console.error('Error fetching classrooms:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async () => {
        if (!selectedClass) return;
        try {
            const res = await getClassDaySlots(selectedClass);

            // Initialize local slots from fetched data
            const newSlots: Record<Day, number> = {
                senin: DEFAULT_SLOTS,
                selasa: DEFAULT_SLOTS,
                rabu: DEFAULT_SLOTS,
                kamis: DEFAULT_SLOTS,
                sabtu: DEFAULT_SLOTS,
                minggu: DEFAULT_SLOTS,
            };
            res.data.forEach((slot: ClassDaySlot) => {
                if (newSlots[slot.day as Day] !== undefined) {
                    newSlots[slot.day as Day] = slot.total_slots;
                }
            });
            setSlots(newSlots);
        } catch (err) {
            console.error('Error fetching slots:', err);
        }
    };

    const handleSlotChange = (day: Day, value: number) => {
        setSlots(prev => ({
            ...prev,
            [day]: Math.max(1, Math.min(12, value))
        }));
    };

    const handleSave = async () => {
        if (!selectedClass) return;

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const slotsData = DAYS.map(day => ({
                day: day.key,
                total_slots: slots[day.key as Day]
            }));

            await updateClassDaySlots(selectedClass, slotsData);
            setSuccess('Konfigurasi slot berhasil disimpan!');
            fetchSlots();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Gagal menyimpan konfigurasi');
        } finally {
            setSaving(false);
        }
    };

    const selectedClassData = classRooms.find(c => c.id === selectedClass);

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
                    <Clock className="w-8 h-8 text-brand-green-main" />
                    Konfigurasi Jam Pelajaran
                </h1>
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
                <div className="flex items-center gap-4">
                    <label className="font-medium text-gray-700">Pilih Kelas:</label>
                    <select
                        value={selectedClass || ''}
                        onChange={(e) => setSelectedClass(Number(e.target.value))}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                        {classRooms.map(c => (
                            <option key={c.id} value={c.id}>
                                Kelas {c.grade} {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Slots Configuration */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Jumlah Jam Pelajaran per Hari - Kelas {selectedClassData?.grade} {selectedClassData?.name}
                </h2>

                <p className="text-gray-600 text-sm mb-6">
                    Tentukan berapa jam pelajaran (slot) yang akan diadakan untuk setiap hari dalam seminggu.
                    Nilai minimum 1 jam dan maksimum 12 jam.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {DAYS.map(day => (
                        <div key={day.key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <label className="block font-medium text-gray-700 mb-2">
                                {day.label}
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleSlotChange(day.key as Day, slots[day.key as Day] - 1)}
                                    className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center font-bold text-lg"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={slots[day.key as Day]}
                                    onChange={(e) => handleSlotChange(day.key as Day, parseInt(e.target.value) || 1)}
                                    className="w-20 text-center px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    min={1}
                                    max={12}
                                />
                                <button
                                    onClick={() => handleSlotChange(day.key as Day, slots[day.key as Day] + 1)}
                                    className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center font-bold text-lg"
                                >
                                    +
                                </button>
                                <span className="text-gray-500 text-sm ml-2">jam</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Catatan:</strong> Konfigurasi ini akan digunakan saat generate jadwal otomatis.
                Pastikan jumlah jam sesuai dengan kurikulum dan kapasitas guru yang tersedia.
            </div>
        </div>
    );
}
