import { useEffect, useState } from 'react';
import { getAdminExtracurriculars, deleteExtracurricular, createExtracurricular, updateExtracurricular } from '../../../api';
import { Pencil, Trash2, Activity } from 'lucide-react';
import MediaSelectInput from '../../../components/MediaSelectInput';
import type { Extracurricular } from '../../../types/safe_types';
import { getStorageUrl } from '../../../utils';

export default function ExtracurricularsIndex() {
  const [items, setItems] = useState<Extracurricular[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Extracurricular | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    order: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExtracurriculars();
  }, []);

  const fetchExtracurriculars = async () => {
    try {
      const response = await getAdminExtracurriculars();
      const data = response.data;
      setItems(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Error fetching extracurriculars:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateExtracurricular(editingItem.id, formData);
      } else {
        await createExtracurricular(formData);
      }
      fetchExtracurriculars();
      resetForm();
    } catch (error) {
      console.error('Error saving extracurricular:', error);
      alert('Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: Extracurricular) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      image: item.image || '',
      order: item.order || 1,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      order: items.length + 1,
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus item ini?')) return;

    try {
      await deleteExtracurricular(id);
      setItems(items.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting extracurricular:', error);
      alert('Gagal menghapus ekstrakurikuler');
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold leading-tight text-gray-800 flex items-center gap-2">
            <Activity className="w-8 h-8 text-brand-green-main" />
            Manajemen Ekstrakurikuler
          </h2>
          <p className="text-gray-500">Kelola kegiatan ekstrakurikuler sekolah</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Form Input */}
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">
            {editingItem ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Ekstrakurikuler (Contoh: Pramuka)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-brand-green-main focus:ring-brand-green-main"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Urutan</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-brand-green-main focus:ring-brand-green-main"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Deskripsi / Keterangan</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-brand-green-main focus:ring-brand-green-main"
                required
              ></textarea>
            </div>
            <MediaSelectInput
              label={editingItem ? 'Ganti Gambar (Opsional)' : 'Gambar / Logo'}
              id="extracurricular_image"
              value={formData.image}
              onSelect={(path) => setFormData({ ...formData, image: path })}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-green-dark text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-green-dark/90 disabled:opacity-50"
              >
                {editingItem ? 'Update' : 'Simpan'}
              </button>
              {editingItem && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-600"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Items */}
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Daftar Ekstrakurikuler</h3>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 border rounded-lg ${editingItem?.id === item.id ? 'bg-brand-green-light/20 border-brand-green-dark' : 'bg-gray-50'}`}
              >
                {item.image ? (
                  <img src={getStorageUrl(item.image)} alt={item.name} className="w-16 h-16 object-contain bg-white rounded-lg p-1 border" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">
                    {item.name}
                    <span className="text-xs text-gray-500 font-normal ml-2">(Order: {item.order})</span>
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2 md:line-clamp-none">{item.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-gray-500 text-sm italic">Belum ada data ekstrakurikuler.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
