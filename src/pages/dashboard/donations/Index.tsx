import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDonations, updateDonation, deleteDonation } from '../../../api';
import { Trash2, CheckCircle, XCircle, Heart } from 'lucide-react';
import type { Donation } from '../../../types/safe_types';
import { useAuth } from '../../../contexts/AuthContext';
import WaliMuridDonations from './WaliMuridDonations';

export default function DonationsIndex() {
  const { user } = useAuth();

  // Show WaliMuridDonations for siswa and wali_murid roles
  if (user?.role === 'siswa' || user?.role === 'wali_murid') {
    return <WaliMuridDonations />;
  }

  // Admin view below
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalDonations, setTotalDonations] = useState(0);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await getAdminDonations();
      const data = response.data;
      const donationList = Array.isArray(data) ? data : (data?.data || []);
      setDonations(donationList);

      // Calculate total approved donations
      const total = donationList
        .filter((d: Donation) => d.status === 'approved')
        .reduce((sum: number, d: Donation) => sum + (parseInt(d.amount?.toString() || '0')), 0);
      setTotalDonations(total);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setDonations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: 'approved' | 'rejected') => {
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`)) return;

    try {
      await updateDonation(id, { status: newStatus });
      fetchDonations(); // Refresh to update totals
    } catch (error) {
      console.error('Error updating donation status:', error);
      alert('Gagal mengubah status donasi');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data donasi ini?')) return;

    try {
      await deleteDonation(id);
      setDonations(donations.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting donation:', error);
      alert('Gagal menghapus data donasi');
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


      <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div className="p-6 text-gray-900">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Daftar Donasi Masuk</h3>
          </div>

          {/* Stats Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-gray-500 text-sm font-medium uppercase">Total Donasi Terkumpul</div>
              <div className="mt-1 text-2xl font-bold text-green-700">
                Rp {totalDonations.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donatur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Transaksi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.length > 0 ? donations.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(donation.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {donation.donor_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donation.transaction_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      Rp {parseInt(donation.amount?.toString() || '0').toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${donation.status === 'approved' ? 'bg-green-100 text-green-800' :
                          donation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {donation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(donation.id, 'approved')}
                            className="text-green-600 hover:text-green-900 font-semibold"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(donation.id, 'rejected')}
                            className="text-red-600 hover:text-red-900 font-semibold ml-2"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(donation.id)}
                        className="text-gray-600 hover:text-gray-900 font-semibold ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Belum ada data donasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
