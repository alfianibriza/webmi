import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminPmb, deletePmb } from '../../../api';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import type { PmbRegistrant } from '../../../types/safe_types';

export default function PmbIndex() {
  const [registrants, setRegistrants] = useState<PmbRegistrant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRegistrants();
  }, []);

  const fetchRegistrants = async () => {
    try {
      const response = await getAdminPmb();
      const data = response.data;
      setRegistrants(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Error fetching registrants:', error);
      setRegistrants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data pendaftar ini?')) return;

    try {
      await deletePmb(id);
      setRegistrants(registrants.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting registrant:', error);
      alert('Gagal menghapus data pendaftar');
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold leading-tight text-gray-800 flex items-center gap-2">
            <UserPlus className="w-8 h-8 text-brand-green-main" />
            Manajemen PMB
          </h2>
          <p className="text-gray-500 mt-1">Kelola data Pendaftaran Peserta Didik Baru</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/dashboard/pmb/info"
            className="bg-brand-green-main hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm text-sm flex items-center gap-1"
          >
            <span>⚙️</span> Atur Halaman Info
          </Link>
          <Link
            to="/dashboard/pmb/create"
            className="bg-brand-orange-main hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm text-sm flex items-center gap-1"
          >
            <span>+</span> Tambah Pendaftar
          </Link>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div className="p-6 text-gray-900">
          {registrants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Lahir</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelamin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Ortu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. HP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrants.map((registrant) => (
                    <tr key={registrant.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {registrant.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registrant.birth_date ? new Date(registrant.birth_date).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registrant.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registrant.parent_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registrant.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${registrant.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            registrant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                          {registrant.status?.charAt(0).toUpperCase() + registrant.status?.slice(1) || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/dashboard/pmb/${registrant.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(registrant.id)}
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
              <div className="text-gray-400 mb-2">Belum ada pendaftar PMB.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
