import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    BookOpen,
    Users,
    Plus,
    Search,
    Filter,
    Trash2,
    Edit,
    MoreHorizontal,
    CheckCircle2,
    School,
    LogOut,
    CalendarClock
} from 'lucide-react';

import { getSubjects, getClassRooms, getPtsSchedules, getPasSchedules, createSchedule, updateSchedule, deleteSchedule, getMedia } from '../../../api';
import type { Subject, ClassRoom } from '../../../types';

const PtsPasIndex = () => {
    // --- State Management ---
    const [activeTab, setActiveTab] = useState('PTS');
    const [selectedClass, setSelectedClass] = useState('Semua');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsRes, classRoomsRes] = await Promise.all([
                    getSubjects(),
                    getClassRooms()
                ]);
                setSubjects(subjectsRes.data);
                setClassRooms(classRoomsRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, []);

    // Data State
    const [schedules, setSchedules] = useState<any[]>([]);

    const fetchSchedules = async () => {
        try {
            const [ptsRes, pasRes] = await Promise.all([
                getPtsSchedules(),
                getPasSchedules()
            ]);

            const processData = (data: any[], type: string) => {
                return data.map((s: any) => {
                    let details: any = {};
                    try {
                        if (s.description && s.description.startsWith('{')) {
                            details = JSON.parse(s.description);
                        }
                    } catch (e) {
                        // Not JSON, ignore
                    }
                    return {
                        ...s,
                        type,
                        // Defaults to prevent crash
                        subject: details.subject || s.title || 'Tanpa Mapel',
                        class: details.class || '?',
                        rombel: details.rombel || '',
                        date: details.date || new Date().toISOString(),
                        timeStart: details.timeStart || '--:--',
                        timeEnd: details.timeEnd || '--:--',
                        supervisor: details.supervisor || '-',
                        room: details.room || '-'
                    };
                });
            };

            const ptsData = processData(ptsRes.data?.schedules || [], 'PTS');
            // Assuming API returns object with schedules array based on Index.tsx
            // If it returns array directly, handle that too. Index.tsx uses res.data.schedules
            const pasData = processData(pasRes.data?.schedules || [], 'PAS');

            setSchedules([...ptsData, ...pasData]);
        } catch (error) {
            console.error("Failed to fetch schedules", error);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const [newSchedule, setNewSchedule] = useState({
        type: 'PTS', subject: '', class: '1', rombel: '', date: '', timeStart: '', timeEnd: '', supervisor: '', room: 'R. 01'
    });

    // --- Handlers ---
    const handleAddSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Fetch media to get a valid file path for backend validation
            let validFilePath = 'manual_entry.pdf'; // Fallback
            try {
                const mediaRes = await getMedia();
                if (mediaRes.data && mediaRes.data.length > 0) {
                    // Use the first available file path
                    validFilePath = mediaRes.data[0].path;
                }
            } catch (err) {
                console.warn("Could not fetch media for dummy file path", err);
            }

            // Serialize granular details into description
            const payload = {
                title: `${newSchedule.subject} - Kelas ${newSchedule.class}${newSchedule.rombel ? ` ${newSchedule.rombel}` : ''}`,
                type: newSchedule.type === 'PTS' ? 'pts' : 'pas',
                file_path: validFilePath,
                description: JSON.stringify(newSchedule),
            };

            if (isEditing && editId !== null) {
                await updateSchedule(editId, payload);
                fetchSchedules();
            } else {
                await createSchedule(payload);
                fetchSchedules();
            }

            setIsModalOpen(false);
            setNewSchedule({ type: 'PTS', subject: '', class: '1', rombel: '', date: '', timeStart: '', timeEnd: '', supervisor: '', room: 'R. 01' });
            setIsEditing(false);
            setEditId(null);
        } catch (error: any) {
            console.error("Failed to save schedule", error);
            const errorMsg = error.response?.data?.message || error.message || "Gagal menyimpan jadwal.";
            alert(`Gagal menyimpan jadwal: ${errorMsg}\n\nPastikan Anda telah mengunggah minimal satu file di Pustaka Media sebagai syarat sistem.`);
        }
    };

    const handleEdit = (item: any) => {
        setNewSchedule({
            type: item.type,
            subject: item.subject,
            class: item.class,
            rombel: item.rombel || '',
            date: item.date,
            timeStart: item.timeStart,
            timeEnd: item.timeEnd,
            supervisor: item.supervisor,
            room: item.room
        });
        setEditId(item.id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Hapus jadwal ini?')) {
            try {
                await deleteSchedule(id);
                fetchSchedules();
            } catch (error) {
                console.error("Failed to delete schedule", error);
                alert("Gagal menghapus jadwal");
            }
        }
    };

    const filteredSchedules = schedules.filter(item => {
        const matchTab = item.type === activeTab;
        const matchClass = selectedClass === 'Semua' || item.class === selectedClass.replace('Kelas ', '');
        const matchSearch = item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supervisor.toLowerCase().includes(searchTerm.toLowerCase());
        return matchTab && matchClass && matchSearch;
    });

    // --- Components ---
    const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass }: any) => (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${colorClass} group-hover:scale-150 transition-transform duration-500 ease-out`} />
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-gray-800 tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${gradientClass} text-white shadow-lg shadow-emerald-900/10`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col relative overflow-hidden min-h-screen">

            {/* Search Header - Adapted for Dashboard Layout */}
            <header className="flex items-center justify-between mb-8 z-30 pt-4 pb-2 bg-transparent">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        <CalendarClock className="w-8 h-8 text-brand-green-main" />
                        Manajemen Jadwal
                    </h2>
                    <span className="text-sm text-gray-500 font-medium">Tahun Ajaran 2024/2025 • Semester Genap</span>
                </div>

                {/* User profile elements are handled by the main layout header, so we can remove or simplify them here if redundant */}
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-visible pb-8 pt-4">

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Jadwal PTS Aktif"
                        value={schedules.filter(s => s.type === 'PTS').length}
                        icon={Calendar}
                        colorClass="bg-blue-500"
                        gradientClass="bg-gradient-to-br from-blue-500 to-blue-600"
                    />
                    <StatCard
                        title="Jadwal PAS Aktif"
                        value={schedules.filter(s => s.type === 'PAS').length}
                        icon={BookOpen}
                        colorClass="bg-emerald-500"
                        gradientClass="bg-gradient-to-br from-emerald-500 to-teal-500"
                    />
                    <StatCard
                        title="Total Pengawas"
                        value={new Set(schedules.map(s => s.supervisor)).size}
                        icon={Users}
                        colorClass="bg-orange-500"
                        gradientClass="bg-gradient-to-br from-orange-400 to-red-400"
                    />
                </div>

                {/* Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 bg-white/60 backdrop-blur-sm p-4 rounded-3xl border border-white/50 shadow-sm">

                    {/* Custom Tab Switcher */}
                    <div className="bg-gray-100 p-1.5 rounded-2xl flex relative">
                        <div
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-md transition-all duration-300 ease-out ${activeTab === 'PTS' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}
                        />
                        <button
                            onClick={() => setActiveTab('PTS')}
                            className={`relative z-10 w-32 py-2.5 text-sm font-bold rounded-xl transition-colors duration-300 ${activeTab === 'PTS' ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Jadwal PTS
                        </button>
                        <button
                            onClick={() => setActiveTab('PAS')}
                            className={`relative z-10 w-32 py-2.5 text-sm font-bold rounded-xl transition-colors duration-300 ${activeTab === 'PAS' ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Jadwal PAS
                        </button>
                    </div>

                    <div className="flex gap-3 flex-1 justify-end">
                        <div className="relative group flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Cari Mata Pelajaran, Guru, atau Ruangan..."
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200/80 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm transition-all shadow-sm group-hover:shadow-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditId(null);
                                setNewSchedule({ type: 'PTS', subject: '', class: '1', rombel: '', date: '', timeStart: '', timeEnd: '', supervisor: '', room: 'R. 01' });
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
                        >
                            <Plus size={20} strokeWidth={2.5} />
                            <span className="hidden sm:inline">Buat Jadwal</span>
                        </button>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-4 custom-scrollbar">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-500 font-medium text-xs uppercase tracking-wider mr-2">
                        <Filter size={14} /> Filter
                    </div>
                    {['Semua', 'Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'].map((cls) => (
                        <button
                            key={cls}
                            onClick={() => setSelectedClass(cls)}
                            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${selectedClass === cls
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                                : 'bg-white border-transparent text-gray-500 hover:bg-white hover:text-emerald-600 hover:border-emerald-100 shadow-sm'
                                }`}
                        >
                            {cls}
                        </button>
                    ))}
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredSchedules.map((item) => (
                        <div key={item.id} className="group bg-white rounded-[2rem] p-6 border border-gray-100/80 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            {/* Decorative Top Line */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.type === 'PTS' ? 'from-blue-400 to-blue-600' : 'from-purple-400 to-purple-600'}`} />

                            <div className="flex justify-between items-start mb-5">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${item.type === 'PTS' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                    }`}>
                                    {item.type}
                                </span>
                                <div className="flex gap-2 transition-all duration-300">
                                    <button onClick={() => handleEdit(item)} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-emerald-50 flex items-center justify-center text-gray-400 hover:text-emerald-600 transition-colors">
                                        <Edit size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors">{item.subject}</h3>
                                <div className="flex items-center gap-2">
                                    <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                                        <Users size={12} />
                                        {item.class} - {item.rombel || 'A'}
                                    </div>
                                    <div className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-bold flex items-center gap-1.5">
                                        <School size={12} />
                                        {item.room || 'R. 01'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-5 border-t border-gray-50">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Tanggal</p>
                                        <p className="text-sm font-bold text-gray-700">
                                            {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Waktu</p>
                                        <p className="text-sm font-bold text-gray-700">{item.timeStart} - {item.timeEnd} WIB</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-4 pt-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-emerald-700">
                                        {item.supervisor.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Pengawas</p>
                                        <p className="text-xs font-bold text-gray-700 truncate">{item.supervisor}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredSchedules.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center opacity-60">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-600">Jadwal tidak ditemukan</h3>
                        <p className="text-gray-400 text-sm mt-1">Coba ubah filter atau kata kunci pencarian Anda.</p>
                    </div>
                )}
            </div>

            {/* Modern Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md transition-opacity" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 relative z-10 border border-white/20">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-xl text-gray-800 tracking-tight">{isEditing ? 'Edit Jadwal' : 'Buat Jadwal Baru'}</h3>
                                <p className="text-xs text-gray-500 mt-1">Silakan lengkapi detail ujian di bawah ini.</p>
                            </div>
                            <button onClick={() => {
                                setIsModalOpen(false);
                                setIsEditing(false);
                                setEditId(null);
                            }} className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
                                <LogOut size={20} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSchedule} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Jenis Ujian</label>
                                    <div className="relative">
                                        <select
                                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-semibold appearance-none transition-all cursor-pointer"
                                            value={newSchedule.type}
                                            onChange={(e) => setNewSchedule({ ...newSchedule, type: e.target.value })}
                                        >
                                            <option value="PTS">PTS (Tengah)</option>
                                            <option value="PAS">PAS (Akhir)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <MoreHorizontal size={16} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Tingkat</label>
                                    <div className="relative">
                                        <select
                                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-semibold appearance-none transition-all cursor-pointer"
                                            value={newSchedule.class}
                                            onChange={(e) => {
                                                const newClass = e.target.value;
                                                setNewSchedule({
                                                    ...newSchedule,
                                                    class: newClass,
                                                    rombel: '' // Reset rombel when class changes
                                                });
                                            }}
                                        >
                                            <option value="">Pilih Tingkat</option>
                                            {[1, 2, 3, 4, 5, 6].map(grade => (
                                                <option key={grade} value={grade.toString()}>
                                                    Kelas {grade}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <MoreHorizontal size={16} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                {/* Detail Kelas - Only show if more than 1 option for selected tingkat */}
                                {classRooms.filter(cr => cr.grade == newSchedule.class).length > 1 && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Detail Kelas</label>
                                        <div className="relative">
                                            <select
                                                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-semibold appearance-none transition-all cursor-pointer"
                                                value={classRooms.find(cr => cr.name === newSchedule.rombel && cr.grade == newSchedule.class)?.id || ''}
                                                onChange={(e) => {
                                                    const selectedId = Number(e.target.value);
                                                    const selectedClassRoom = classRooms.find(cr => cr.id === selectedId);
                                                    if (selectedClassRoom) {
                                                        setNewSchedule({
                                                            ...newSchedule,
                                                            rombel: selectedClassRoom.name
                                                        });
                                                    } else {
                                                        setNewSchedule({
                                                            ...newSchedule,
                                                            rombel: ''
                                                        });
                                                    }
                                                }}
                                            >
                                                <option value="">Pilih Detail Kelas</option>
                                                {classRooms
                                                    .filter(cr => cr.grade == newSchedule.class)
                                                    .sort((a, b) => a.name.localeCompare(b.name))
                                                    .map(cr => (
                                                        <option key={cr.id} value={cr.id}>
                                                            {cr.name}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <MoreHorizontal size={16} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>


                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mata Pelajaran</label>
                                <div className="relative">
                                    <select
                                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-semibold appearance-none transition-all cursor-pointer"
                                        value={newSchedule.subject}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, subject: e.target.value })}
                                    >
                                        <option value="">Pilih Mata Pelajaran</option>
                                        {subjects.map(subj => (
                                            <option key={subj.id} value={subj.name}>{subj.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <MoreHorizontal size={16} className="rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Tanggal</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-semibold text-gray-600 transition-all"
                                        value={newSchedule.date}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Pengawas</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Nama Guru"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-semibold transition-all placeholder:font-normal"
                                        value={newSchedule.supervisor}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, supervisor: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Jam Mulai</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-semibold text-gray-600 transition-all"
                                        value={newSchedule.timeStart}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, timeStart: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Jam Selesai</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-semibold text-gray-600 transition-all"
                                        value={newSchedule.timeEnd}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, timeEnd: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setIsEditing(false);
                                        setEditId(null);
                                    }}
                                    className="flex-1 px-6 py-3.5 rounded-xl border-2 border-gray-100 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={18} />
                                    {isEditing ? 'Simpan Perubahan' : 'Simpan Jadwal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}

        </div >
    );
};

export default PtsPasIndex;
