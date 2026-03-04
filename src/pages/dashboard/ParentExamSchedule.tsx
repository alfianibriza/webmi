import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User, ChevronLeft, School, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { getMySchedules } from '../../api';

export default function ParentExamSchedule() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') === 'PAS' ? 'PAS' : 'PTS'; // Default to PTS

    const [loading, setLoading] = useState(true);
    const [rawExams, setRawExams] = useState<any[]>([]);

    useEffect(() => {
        const fetchExams = async () => {
            setLoading(true);
            try {
                // Use getMySchedules (Public/Student endpoint) instead of Admin endpoints
                const res = await getMySchedules();
                const allSchedules = res.data?.schedules || [];

                // Parse description JSON
                const parsedExams = allSchedules.map((s: any) => {
                    let details: any = {};
                    try {
                        if (s.description && s.description.startsWith('{')) {
                            details = JSON.parse(s.description);
                        }
                    } catch (e) {
                        // ignore
                    }
                    return {
                        ...s,
                        ...details,
                        // Ensure date object is valid for sorting
                        date: details.date || s.created_at
                    };
                }).filter((s: any) =>
                    // Filter valid exams AND match the requested Type (PTS/PAS)
                    s.subject &&
                    (s.type.toLowerCase() === type.toLowerCase() || (s.type === type))
                );

                setRawExams(parsedExams);
            } catch (error) {
                console.error("Failed to load exams", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, [type]);

    const studentClass = useMemo(() => {
        // Normalize to string just number e.g. "1" or "6"
        const grade = user?.student?.classRoom?.grade || user?.student?.class_room?.grade || (user?.student?.grade ? user?.student?.grade : '6');
        return String(grade).replace('Kelas ', '');
    }, [user]);

    // Filter logic
    const filteredExams = useMemo(() => {
        return rawExams.filter(exam =>
            // Loose comparison for class "1" == "1"
            // And match type (though API fetch already filtered by type roughly, this double checks)
            (exam.class == studentClass)
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [rawExams, studentClass]);

    return (
        <div className="p-6 pb-24 min-h-screen bg-[#F9FAFB]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link to="/dashboard" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-emerald-600 transition-colors border border-gray-100">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        Jadwal {type}
                        <span className={`text-xs px-2 py-1 rounded-md ${type === 'PTS' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                            {type === 'PTS' ? 'Ganjil' : 'Genap'}
                        </span>
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">Tahun Ajaran 2024/2025</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto">
                {filteredExams.length > 0 ? (
                    <div className="space-y-4">
                        {filteredExams.map((exam) => (
                            <div key={exam.id} className="bg-white border border-gray-100 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col sm:flex-row gap-5 group">
                                <div className={`w-1.5 absolute top-0 bottom-0 left-0 ${type === 'PTS' ? 'bg-blue-500' : 'bg-rose-500'}`} />

                                {/* Date Box */}
                                <div className="flex sm:flex-col items-center justify-center sm:w-20 sm:h-20 bg-gray-50 rounded-2xl shrink-0 border border-gray-100 gap-2 sm:gap-0 p-3 sm:p-0">
                                    <span className="text-xs text-gray-400 font-bold uppercase">{new Date(exam.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                    <span className="text-2xl font-black text-gray-800 leading-none">{new Date(exam.date).getDate()}</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase sm:hidden">{new Date(exam.date).toLocaleDateString('id-ID', { year: 'numeric' })}</span>
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-emerald-700 transition-colors">{exam.subject}</h3>

                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                            <Clock size={14} className="text-emerald-500" />
                                            <span className="font-semibold">{exam.timeStart} - {exam.timeEnd}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                            <School size={14} className="text-orange-500" />
                                            <span className="font-semibold">{exam.room}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                                            <User size={14} className="text-blue-500" />
                                            <span className="font-semibold">{exam.supervisor}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-600">Belum ada jadwal</h3>
                        <p className="text-sm text-gray-400 mt-1 max-w-xs">
                            Jadwal ujian {type} belum tersedia untuk kelas Anda saat ini.
                        </p>
                    </div>
                )}
            </div>


        </div>
    );
}
