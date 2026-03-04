import { useEffect, useState } from 'react';
import { getAdminPtkAttendanceReport } from '../../../api';
import { FileText, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface ReportFilters {
  start_date: string;
  end_date: string;
}

interface TeacherReportItem {
  id: number;
  name: string;
  nip: string;
  hadir_count: number;
  izin_count: number;
  sakit_count: number;
  alpha_count: number;
}

export default function TeacherAttendanceReport() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<TeacherReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<ReportFilters>({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminPtkAttendanceReport({
        start_date: filters.start_date,
        end_date: filters.end_date,
      });
      // The backend returns { teachers: [...] }
      setTeachers(response.data.teachers);
    } catch (error) {
      console.error('Error fetching report:', error);
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const isGuru = user?.role === 'guru';
  const myStats = isGuru && teachers.length > 0 ? teachers[0] : null;

  return (
    <div className="space-y-6">
      {!isGuru && (
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-8 h-8 text-brand-green-main" />
              Laporan Kehadiran PTK
            </h1>
            <p className="text-gray-500">Fitur ini digunakan untuk melihat laporan kehadiran guru/PTK.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
        </div>
      ) : isGuru && myStats ? (
        // GRID VIEW FOR TEACHER
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold text-green-700 mb-1">{myStats.hadir_count}</h3>
            <p className="text-sm font-medium text-green-600 uppercase tracking-wide">Hadir</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold text-blue-700 mb-1">{myStats.izin_count}</h3>
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Izin</p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3 text-yellow-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold text-yellow-700 mb-1">{myStats.sakit_count}</h3>
            <p className="text-sm font-medium text-yellow-600 uppercase tracking-wide">Sakit</p>
          </div>

          <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 text-red-600">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold text-red-700 mb-1">{myStats.alpha_count}</h3>
            <p className="text-sm font-medium text-red-600 uppercase tracking-wide">Alpha</p>
          </div>
        </div>
      ) : (
        // TABLE VIEW FOR ADMIN (OR NO DATA)
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Guru</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hadir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Izin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sakit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alpha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teachers.length > 0 ? (
                  teachers.map((teacher, index) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{teacher.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.nip || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {teacher.hadir_count}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {teacher.izin_count}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {teacher.sakit_count}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {teacher.alpha_count}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Belum ada data guru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

