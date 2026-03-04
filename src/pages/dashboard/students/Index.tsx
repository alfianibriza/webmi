import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Users, Plus } from 'lucide-react';
import { getAdminStudents, deleteStudent, getTingkat, getRombel } from '../../../api';
import type { Student } from '../../../types/safe_types';
import { getStorageUrl } from '../../../utils';

export default function StudentsIndex() {
  const [students, setStudents] = useState<Student[]>([]);
  // Filters
  const [tingkatList, setTingkatList] = useState<any[]>([]);
  const [rombelList, setRombelList] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    tingkat_id: '',
    rombel_id: '',
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTingkat();
  }, []);

  useEffect(() => {
    if (filters.tingkat_id) {
      fetchRombel(filters.tingkat_id);
    } else {
      setRombelList([]);
      setFilters(prev => ({ ...prev, rombel_id: '' }));
    }
  }, [filters.tingkat_id]);

  useEffect(() => {
    fetchStudents();
  }, [filters.tingkat_id, filters.rombel_id]);

  const fetchTingkat = async () => {
    try {
      const res = await getTingkat();
      setTingkatList(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchRombel = async (tingkatId: string) => {
    try {
      const res = await getRombel(Number(tingkatId));
      setRombelList(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminStudents({
        tingkat_id: filters.tingkat_id ? Number(filters.tingkat_id) : undefined,
        rombel_id: filters.rombel_id ? Number(filters.rombel_id) : undefined,
      });

      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data siswa "${name}"?`)) return;

    try {
      await deleteStudent(id);
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Gagal menghapus siswa');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold leading-tight text-gray-800 flex items-center gap-2">
            <Users className="w-8 h-8 text-brand-green-main" />
            Manajemen Kesiswaan
          </h2>
          <p className="text-gray-500 mt-1">Kelola data siswa dan informasi akademik</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 w-full mb-4 items-end sm:items-center">
        {/* Helper Link/Button */}
        <Link
          to="/dashboard/students/create"
          className="bg-brand-orange-main hover:bg-orange-600 text-white p-2 rounded-lg shadow-sm flex items-center justify-center transition w-10 h-10 flex-shrink-0"
          title="Tambah Data"
        >
          <Plus className="w-5 h-5" />
        </Link>

        {/* Filters */}
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          <select
            className="rounded-lg border-gray-300 shadow-sm text-sm focus:border-brand-green-main focus:ring-brand-green-main min-w-[120px]"
            value={filters.tingkat_id}
            onChange={(e) => setFilters(prev => ({ ...prev, tingkat_id: e.target.value }))}
          >
            <option value="">Semua Tingkat</option>
            {tingkatList.map((t: any) => (
              <option key={t.id} value={t.id}>Kelas {t.level} ({t.name})</option>
            ))}
          </select>

          <select
            className="rounded-lg border-gray-300 shadow-sm text-sm focus:border-brand-green-main focus:ring-brand-green-main min-w-[150px]"
            value={filters.rombel_id}
            onChange={(e) => setFilters(prev => ({ ...prev, rombel_id: e.target.value }))}
            disabled={!filters.tingkat_id}
          >
            <option value="">Semua Detail Kelas</option>
            {rombelList.map((r: any) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div className="p-6 text-gray-900">
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS/NISN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelamin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orang Tua / Wali</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-3">
                        {student.image ? (
                          <img src={getStorageUrl(student.image)} alt={student.name} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                            {student.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div>{student.name}</div>
                          <div className="text-[10px] text-gray-400 md:hidden">
                            {student.status?.toUpperCase()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.nis || student.nisn || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.kelas ? (
                          <span className="font-medium">
                            {student.kelas.tingkat ? `Kelas ${student.kelas.tingkat.level}` : '-'}
                            {student.kelas.rombel ? ` - ${student.kelas.rombel.name}` : ''}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Belum masuk kelas</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.father_name || student.mother_name ? (
                          <div className="flex flex-col">
                            {student.father_name && <span className="text-gray-900">{student.father_name} (Ayah)</span>}
                            {student.mother_name && <span className="text-gray-500 text-xs">{student.mother_name} (Ibu)</span>}
                          </div>
                        ) : (
                          <span>{student.parent_name || '-'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/dashboard/students/${student.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(student.id, student.name)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-gray-400 mb-2">Belum ada data kesiswaan dengan filter ini.</div>
              <p className="text-sm text-gray-500">Coba ubah filter atau tambahkan data baru.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
