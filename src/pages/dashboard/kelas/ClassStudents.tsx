import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users, Plus, Search, Check, ArrowLeft, UserPlus, UserMinus
} from 'lucide-react';
import {
    getKelasAktif,
    getStudentCandidates,
    enrollStudents,
    removeStudentFromClass
} from '../../../api';
import toast from 'react-hot-toast';

interface Student {
    id: number;
    name: string;
    nis: string;
    image?: string;
}

interface KelasAktif {
    id: number;
    name: string;
    tingkat_id: number;
    rombel_id: number;
    academic_year_id: number;
    students_count?: number;
    students?: Student[];
    tingkat?: {
        id: number;
        level: number;
        name: string;
    };
    rombel?: {
        id: number;
        name: string;
    };
}

export default function ClassStudents() {
    const { kelasId } = useParams<{ kelasId: string }>();
    const navigate = useNavigate();

    const [kelas, setKelas] = useState<KelasAktif | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Unassigned students state
    const [candidates, setCandidates] = useState<Student[]>([]);
    const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
    const [searchCandidate, setSearchCandidate] = useState('');
    const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);

    // Actions state
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'unassigned' | 'enrolled'>('unassigned');

    useEffect(() => {
        if (kelasId) {
            fetchKelasData();
        }
    }, [kelasId]);

    const fetchKelasData = async () => {
        try {
            setIsLoading(true);
            setIsLoadingCandidates(true);

            // Fetch kelas detail
            const kelasRes = await getKelasAktif({});
            const kelasData = kelasRes.data.find((k: KelasAktif) => k.id === Number(kelasId));

            if (!kelasData) {
                toast.error('Kelas tidak ditemukan');
                navigate('/dashboard/enrollment');
                return;
            }

            setKelas(kelasData);

            // Fetch unassigned students for this academic year
            const candidatesRes = await getStudentCandidates(kelasData.academic_year_id);
            setCandidates(candidatesRes.data);
        } catch (e) {
            console.error(e);
            toast.error('Gagal mengambil data kelas');
        } finally {
            setIsLoading(false);
            setIsLoadingCandidates(false);
        }
    };

    const handleToggleCandidate = (id: number) => {
        setSelectedCandidates(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedCandidates.length === filteredCandidates.length) {
            setSelectedCandidates([]);
        } else {
            setSelectedCandidates(filteredCandidates.map(c => c.id));
        }
    };

    const handleEnrollStudents = async () => {
        if (!kelas || selectedCandidates.length === 0) return;

        setIsSaving(true);
        try {
            await enrollStudents({
                kelas_id: kelas.id,
                student_ids: selectedCandidates
            });
            toast.success(`Berhasil menambahkan ${selectedCandidates.length} siswa ke kelas!`);
            setSelectedCandidates([]);
            // Refresh data
            fetchKelasData();
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.message || 'Gagal menyimpan data.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveStudent = async (studentId: number) => {
        if (!kelas || !confirm('Yakin ingin mengeluarkan siswa ini dari kelas?')) return;

        try {
            await removeStudentFromClass(kelas.id, studentId);
            toast.success('Siswa berhasil dikeluarkan dari kelas');
            fetchKelasData();
        } catch (e) {
            console.error(e);
            toast.error('Gagal menghapus siswa.');
        }
    };

    // Filter candidates by search
    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchCandidate.toLowerCase()) ||
        c.nis?.includes(searchCandidate)
    );

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-green-main"></div>
            </div>
        );
    }

    if (!kelas) {
        return null;
    }

    return (
        <div>
            {/* Header with Back Button */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/dashboard/enrollment')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-3 transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Kembali ke Daftar Kelas</span>
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Users className="w-8 h-8 text-brand-green-main" />
                            {kelas.name}
                        </h2>
                        <p className="text-gray-500">
                            {kelas.tingkat?.name && `${kelas.tingkat.name}`}
                            {kelas.rombel?.name && ` • Rombel ${kelas.rombel.name}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                            <span className="text-sm text-green-700 font-medium">
                                {kelas.students?.length || 0} siswa terdaftar
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-t-xl border border-b-0 border-gray-200">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('unassigned')}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2
                            ${activeTab === 'unassigned'
                                ? 'text-brand-green-main border-b-2 border-brand-green-main bg-green-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        <UserPlus className="w-4 h-4" />
                        Siswa Belum Terdaftar
                        <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700">
                            {candidates.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('enrolled')}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2
                            ${activeTab === 'enrolled'
                                ? 'text-brand-green-main border-b-2 border-brand-green-main bg-green-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Users className="w-4 h-4" />
                        Siswa Terdaftar
                        <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                            {kelas.students?.length || 0}
                        </span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-xl shadow-sm border border-gray-200">
                {activeTab === 'unassigned' ? (
                    <>
                        {/* Search & Actions Bar */}
                        <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
                            <div className="relative flex-1 min-w-[250px] max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Cari siswa berdasarkan nama atau NIS..."
                                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-brand-green-main focus:border-brand-green-main"
                                    value={searchCandidate}
                                    onChange={(e) => setSearchCandidate(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                {filteredCandidates.length > 0 && (
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        {selectedCandidates.length === filteredCandidates.length
                                            ? 'Batalkan Semua'
                                            : 'Pilih Semua'}
                                    </button>
                                )}

                                <button
                                    onClick={handleEnrollStudents}
                                    disabled={selectedCandidates.length === 0 || isSaving}
                                    className="bg-brand-green-main hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-4 h-4" />
                                    {isSaving
                                        ? 'Menyimpan...'
                                        : `Tambah ke Kelas (${selectedCandidates.length})`}
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            {isLoadingCandidates ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green-main mx-auto"></div>
                                    <p className="mt-2 text-gray-500">Memuat data siswa...</p>
                                </div>
                            ) : filteredCandidates.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Tidak ada siswa tersedia</h3>
                                    <p className="text-gray-500 mt-1">
                                        Semua siswa sudah terdaftar di kelas atau belum ada data siswa.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredCandidates.map(candidate => (
                                        <div
                                            key={candidate.id}
                                            onClick={() => handleToggleCandidate(candidate.id)}
                                            className={`
                                                cursor-pointer p-4 rounded-xl border-2 flex items-center justify-between transition-all
                                                ${selectedCandidates.includes(candidate.id)
                                                    ? 'border-brand-green-main bg-green-50 ring-1 ring-brand-green-main shadow-sm'
                                                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                                                    {candidate.image ? (
                                                        <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-500 font-medium text-sm">
                                                            {candidate.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{candidate.name}</div>
                                                    <div className="text-xs text-gray-500">NIS: {candidate.nis || '-'}</div>
                                                </div>
                                            </div>
                                            <div className={`
                                                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                                ${selectedCandidates.includes(candidate.id)
                                                    ? 'bg-brand-green-main border-brand-green-main text-white'
                                                    : 'border-gray-300 bg-white'}
                                            `}>
                                                {selectedCandidates.includes(candidate.id) && <Check className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Enrolled Students Tab */
                    <div className="p-0">
                        {kelas.students && kelas.students.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            NIS
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {kelas.students.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                                                        {student.image ? (
                                                            <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-gray-500 font-medium text-xs">
                                                                {student.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {student.nis || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleRemoveStudent(student.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                                                    title="Keluarkan dari kelas"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Belum ada siswa</h3>
                                <p className="text-gray-500 mt-1">
                                    Silakan tambahkan siswa dari tab "Siswa Belum Terdaftar".
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
