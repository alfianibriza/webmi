import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight, X, GraduationCap } from 'lucide-react';
import { getTingkat, getKelasAktif } from '../../../api';

interface Tingkat {
    id: number;
    level: number;
    name: string;
}

interface KelasAktif {
    id: number;
    name: string;
    tingkat_id: number;
    rombel_id: number;
    rombel?: {
        id: number;
        name: string;
    };
    students_count?: number;
}

export default function Enrollment() {
    const navigate = useNavigate();

    const [tingkatList, setTingkatList] = useState<Tingkat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Popup state for multiple rombel selection
    const [showRombelPopup, setShowRombelPopup] = useState(false);
    const [selectedTingkat, setSelectedTingkat] = useState<Tingkat | null>(null);
    const [kelasAktifList, setKelasAktifList] = useState<KelasAktif[]>([]);
    const [isLoadingRombel, setIsLoadingRombel] = useState(false);

    useEffect(() => {
        fetchTingkat();
    }, []);

    const fetchTingkat = async () => {
        try {
            setIsLoading(true);
            const res = await getTingkat();
            setTingkatList(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardClick = async (tingkat: Tingkat) => {
        try {
            setIsLoadingRombel(true);
            setSelectedTingkat(tingkat);

            // Fetch kelas aktif for this tingkat
            const kelasRes = await getKelasAktif({ tingkat_id: tingkat.id });
            const kelasAktif = kelasRes.data;

            if (kelasAktif.length === 0) {
                alert('Belum ada kelas aktif untuk tingkat ini. Silakan buat kelas terlebih dahulu di menu Detail Kelas.');
                setIsLoadingRombel(false);
                return;
            }

            if (kelasAktif.length === 1) {
                // Only one active class, navigate directly
                navigate(`/dashboard/enrollment/${kelasAktif[0].id}`);
            } else {
                // Multiple active classes, show popup
                setKelasAktifList(kelasAktif);
                setShowRombelPopup(true);
            }
        } catch (e) {
            console.error(e);
            alert('Gagal mengambil data kelas.');
        } finally {
            setIsLoadingRombel(false);
        }
    };

    const handleSelectKelas = (kelas: KelasAktif) => {
        setShowRombelPopup(false);
        navigate(`/dashboard/enrollment/${kelas.id}`);
    };

    // Generate class cards - We show 6 cards for Kelas 1-6
    // If tingkat doesn't exist in data, we still show the card but disabled
    const classCards = [1, 2, 3, 4, 5, 6].map(level => {
        const tingkat = tingkatList.find(t => t.level === level);
        return {
            level,
            tingkat,
            exists: !!tingkat
        };
    });

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="w-8 h-8 text-brand-green-main" />
                    Manajemen Anggota Kelas
                </h2>
                <p className="text-gray-500">Atur siswa yang masuk ke dalam kelas (Enrollment).</p>
            </div>

            {/* Class Cards Grid */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-green-main"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classCards.map(({ level, tingkat, exists }) => (
                            <button
                                key={level}
                                onClick={() => tingkat && handleCardClick(tingkat)}
                                disabled={!exists || isLoadingRombel}
                                className={`
                                    relative group p-6 rounded-2xl border-2 transition-all duration-200
                                    flex flex-col items-center justify-center min-h-[160px]
                                    ${exists
                                        ? 'border-gray-200 hover:border-brand-green-main hover:shadow-lg cursor-pointer bg-white'
                                        : 'border-dashed border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'}
                                `}
                            >
                                <div className={`
                                    w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors
                                    ${exists
                                        ? 'bg-gradient-to-br from-green-50 to-emerald-100 group-hover:from-green-100 group-hover:to-emerald-200'
                                        : 'bg-gray-100'}
                                `}>
                                    <GraduationCap className={`w-8 h-8 ${exists ? 'text-brand-green-main' : 'text-gray-400'}`} />
                                </div>

                                <h3 className={`text-xl font-bold ${exists ? 'text-gray-800' : 'text-gray-400'}`}>
                                    Kelas {level}
                                </h3>

                                {tingkat && (
                                    <p className="text-sm text-gray-500 mt-1">{tingkat.name}</p>
                                )}

                                {exists && (
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="w-5 h-5 text-brand-green-main" />
                                    </div>
                                )}

                                {!exists && (
                                    <p className="text-xs text-gray-400 mt-2">Belum dikonfigurasi</p>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Rombel Selection Popup */}
            {showRombelPopup && selectedTingkat && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="p-5 border-b flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Pilih Detail Kelas
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Kelas {selectedTingkat.level} memiliki beberapa rombel/sesi
                                </p>
                            </div>
                            <button
                                onClick={() => setShowRombelPopup(false)}
                                className="text-gray-400 hover:text-gray-500 p-1"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                            {kelasAktifList.map(kelas => (
                                <button
                                    key={kelas.id}
                                    onClick={() => handleSelectKelas(kelas)}
                                    className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-brand-green-main hover:bg-green-50 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-brand-green-main" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-800">{kelas.name}</p>
                                            {kelas.rombel && (
                                                <p className="text-sm text-gray-500">Rombel: {kelas.rombel.name}</p>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-green-main transition-colors" />
                                </button>
                            ))}
                        </div>

                        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={() => setShowRombelPopup(false)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
