import { useEffect, useState } from 'react';
import { getStudentAttendance, storeStudentAttendance, getTingkat, getKelasAktif, getAcademicYears } from '../../../api';
import type { Student, StudentAttendance as StudentAttendanceType } from '../../../types/safe_types';
import toast from 'react-hot-toast';

interface AttendanceData {
  students: Student[];
  attendances: StudentAttendanceType[];
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

export default function StudentAttendance() {
  // Filter States
  const [tingkatList, setTingkatList] = useState<Tingkat[]>([]);
  const [selectedTingkat, setSelectedTingkat] = useState<number | null>(null);

  const [kelasList, setKelasList] = useState<KelasAktif[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<number | null>(null);

  const [activeYearId, setActiveYearId] = useState<number | null>(null);

  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
  });

  const [data, setData] = useState<AttendanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [attendanceInput, setAttendanceInput] = useState<Record<number, string>>({});

  // 1. Fetch Initial Data (Tingkat & Active Year)
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
        toast.error('Gagal memuat data awal');
      }
    };
    init();
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
          // Reset selection - we use grade filter when only 1 kelas (filter hidden)
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

  // 3. Fetch Attendance when filters change
  useEffect(() => {
    // Only fetch if we have a date and (optionally) filters
    // If user hasn't selected tingkat, maybe don't fetch anything? 
    // Or fetch all? User requested filters.
    if (selectedTingkat) {
      fetchAttendance();
    } else {
      setData(null);
    }
  }, [filters.date, selectedTingkat, selectedKelas]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      // Determine filters
      // If selectedKelas (Detail Kelas) is chosen, use class_room_id
      // If only selectedTingkat is chosen, use grade parameter (we need to map tingkat ID to grade level)

      const distinctTingkat = tingkatList.find(t => t.id === selectedTingkat);
      const grade = distinctTingkat ? String(distinctTingkat.level) : undefined;

      const response = await getStudentAttendance({
        date: filters.date,
        class_room_id: selectedKelas || undefined,
        grade: !selectedKelas ? grade : undefined, // Send grade only if class is undetermined
      });

      setData(response.data);

      // Initialize attendance input from existing data
      const initial: Record<number, string> = {};
      response.data.students?.forEach((student: Student) => {
        const existing = response.data.attendances?.find(
          (a: StudentAttendanceType) => a.student_id === student.id
        );
        initial[student.id] = existing?.status || 'hadir';
      });
      setAttendanceInput(initial);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Gagal memuat data absensi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const attendances = Object.entries(attendanceInput).map(([student_id, status]) => ({
        student_id: Number(student_id),
        date: filters.date,
        status,
      }));
      await storeStudentAttendance(attendances);
      toast.success('Absensi berhasil disimpan!');
      fetchAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Gagal menyimpan absensi');
    } finally {
      setIsSaving(false);
    }
  };

  const statusOptions = [
    { value: 'hadir', label: 'Hadir', color: 'bg-green-100 text-green-800' },
    { value: 'izin', label: 'Izin', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'sakit', label: 'Sakit', color: 'bg-blue-100 text-blue-800' },
    { value: 'alpha', label: 'Alpha', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Absensi Siswa</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
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
              <option value="">Pilih Tingkat</option>
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
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
        </div>
      ) : !data ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Silakan pilih Tingkat untuk menampilkan siswa.</p>
        </div>
      ) : !data.students?.length ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Tidak ada siswa ditemukan.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.students.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{student.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setAttendanceInput(prev => ({ ...prev, [student.id]: option.value }))}
                              className={`px-2 py-1 text-xs rounded-full transition ${attendanceInput[student.id] === option.value
                                ? option.color
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-brand-green-main text-white px-6 py-2 rounded-lg hover:bg-brand-green-dark transition disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Absensi'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

