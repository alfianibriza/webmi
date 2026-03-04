import { useEffect, useState } from 'react';
import { getAdminAchievements, deleteAchievement, createAchievement, updateAchievement } from '../../../api';
import { Pencil, Trash2, Trophy } from 'lucide-react';
import MediaSelectInput from '../../../components/MediaSelectInput';
import Modal from '../../../components/Modal';
import type { Achievement } from '../../../types/safe_types';
import { getStorageUrl } from '../../../utils';

export default function AchievementsIndex() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const initialFormState = {
    title: '',
    description: '',
    rank: '',
    level: 'Kabupaten',
    date: '',
    image: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await getAdminAchievements();
      const data = response.data;
      setAchievements(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data prestasi ini?')) return;

    try {
      await deleteAchievement(id);
      setAchievements(achievements.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting achievement:', error);
      alert('Gagal menghapus prestasi');
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingId(achievement.id);
    setFormData({
      title: achievement.title,
      description: achievement.description || '',
      rank: achievement.rank || '',
      level: achievement.level || 'Kabupaten',
      date: achievement.date ? achievement.date.split('T')[0] : '', // Format YYYY-MM-DD
      image: achievement.image || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = { ...formData };
      if (editingId) {
        await updateAchievement(editingId, payload);
      } else {
        await createAchievement(payload);
      }
      setShowModal(false);
      fetchAchievements();
    } catch (error) {
      console.error('Error saving achievement:', error);
      alert('Gagal menyimpan prestasi');
    } finally {
      setIsSaving(false);
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Provinsi':
        return 'bg-purple-100 text-purple-800';
      case 'Kabupaten':
        return 'bg-green-100 text-green-800';
      case 'Nasional':
        return 'bg-amber-100 text-amber-800';
      case 'Kecamatan':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <Trophy className="w-8 h-8 text-brand-green-main" />
            Manajemen Prestasi
          </h2>
          <p className="text-gray-500">Kelola data prestasi siswa dan sekolah</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-brand-green-dark text-white px-4 py-2 rounded-md hover:bg-brand-green-dark/90 transition-colors text-sm font-medium"
        >
          + Tambah Prestasi
        </button>
      </div>

      <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div className="p-6 text-gray-900">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul & Peringkat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tingkat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {achievements.length > 0 ? (
                  achievements.map((achievement) => (
                    <tr key={achievement.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {achievement.image ? (
                          <img
                            src={getStorageUrl(achievement.image)}
                            alt={achievement.title}
                            className="h-16 w-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{achievement.title}</div>
                        <div className="text-sm text-gray-500">{achievement.rank}</div>
                        <div className="text-xs text-gray-400 mt-1 line-clamp-2">{achievement.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelBadge(achievement.level || '')}`}>
                          {achievement.level || 'Kecamatan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {achievement.date ? new Date(achievement.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(achievement)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded hover:bg-indigo-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(achievement.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Belum ada data prestasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Prestasi" : "Tambah Prestasi"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <MediaSelectInput
            label="Foto Dokumentasi (Opsional)"
            id="achievement_image"
            value={formData.image}
            onSelect={(path) => setFormData({ ...formData, image: path })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">Judul Prestasi / Lomba</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Peringkat (Juara)</label>
              <input
                type="text"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
                placeholder="Juara 1, Harapan 2, dll"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tingkat</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
              >
                <option value="Kecamatan">Kecamatan</option>
                <option value="Kabupaten">Kabupaten</option>
                <option value="Provinsi">Provinsi</option>
                <option value="Nasional">Nasional</option>
                <option value="Internasional">Internasional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tanggal</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-brand-green-main focus:ring-brand-green-main"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-brand-green-main text-white rounded-md text-sm font-medium hover:bg-brand-green-dark disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
