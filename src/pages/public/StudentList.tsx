import { useEffect, useState } from 'react';
import { getPublicStudents } from '../../api';
import { getStorageUrl } from '../../utils';
import type { Student, ClassRoom } from '../../types/safe_types';

export default function StudentSection() {
    const [students, setStudents] = useState<Student[]>([]);
    const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
    // Filters
    const [selectedClassRoom, setSelectedClassRoom] = useState<string>('');

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const filters: any = {};
                if (selectedClassRoom) filters.class_room_id = parseInt(selectedClassRoom);

                const response = await getPublicStudents(filters);
                setStudents(response.data.students || []);

                // Only set options once to avoid resetting when filtering
                if (classRooms.length === 0) {
                    const data = response.data.classRooms || [];
                    const sortedData = data.sort((a: ClassRoom, b: ClassRoom) => {
                        const gradeA = parseInt(a.grade || '999');
                        const gradeB = parseInt(b.grade || '999');
                        if (gradeA !== gradeB) return gradeA - gradeB;
                        return (a.name || '').localeCompare(b.name || '');
                    });
                    setClassRooms(sortedData);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedClassRoom]);

    return (
        <div className="animate-fade-in">
            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex gap-2">
                <select
                    value={selectedClassRoom}
                    onChange={(e) => setSelectedClassRoom(e.target.value)}
                    className="flex-1 rounded-xl border-gray-200 text-sm focus:ring-brand-green-main focus:border-brand-green-main"
                >
                    <option value="">Semua Rombel</option>
                    {classRooms.map((c) => (
                        <option key={c.id} value={c.id}>Kelas {c.grade} - {c.name}</option>
                    ))}
                </select>
            </div>

            {/* Student List */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-green-main"></div>
                </div>
            ) : students.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Tidak ada data murid.</p>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {students.map((student) => (
                        <div key={student.id} className="bg-white rounded-2xl p-3 shadow-md hover:shadow-lg transition-all flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 mb-3 border-2 border-brand-green-light">
                                {student.image ? (
                                    <img
                                        src={getStorageUrl(student.image)}
                                        alt={student.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight mb-1">{student.name}</h3>
                            <p className="text-xs text-brand-green-dark bg-brand-green-light/20 px-2 py-0.5 rounded-full">
                                Kelas {student.grade} {student.class_room?.name}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
