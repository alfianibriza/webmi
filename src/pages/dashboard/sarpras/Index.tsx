import { useEffect, useState } from 'react';
import { getAdminSarpras, deleteSarpras, createSarpras, updateSarpras } from '../../../api';
import { Pencil, Trash2, Box } from 'lucide-react';
import MediaSelectInput from '../../../components/MediaSelectInput';
import type { Sarpras } from '../../../types/safe_types';
import { getStorageUrl } from '../../../utils';

export default function SarprasIndex() {
  const [sarpras, setSarpras] = useState<Sarpras[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Sarpras | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    order: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSarpras();
  }, []);

  const fetchSarpras = async () => {
    try {
      const response = await getAdminSarpras();
      const data = response.data;
      setSarpras(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Error fetching sarpras:', error);
      setSarpras([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateSarpras(editingItem.id, formData);
      } else {
        await createSarpras(formData);
      }
      fetchSarpras();
      resetForm();
    } catch (error) {
      console.error('Error saving sarpras:', error);
      alert('Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: Sarpras) => {
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
      order: sarpras.length + 1,
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus item ini?')) return;

    try {
      await deleteSarpras(id);
      setSarpras(sarpras.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting sarpras:', error);
      alert('Gagal menghapus sarana prasarana');
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
            <Box className="w-8 h-8 text-brand-green-main" />
            Manajemen Sarpras
          </h2>
          <p className="text-gray-500 mt-1">Kelola data sarana dan prasarana sekolah</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Form Input */}
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">
            {editingItem ? 'Edit Sarpras' : 'Tambah Sarpras'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Sarpras (Contoh: Lab Komputer)</label>
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
              label={editingItem ? 'Ganti Gambar (Opsional)' : 'Gambar / Foto'}
              id="sarpras_image"
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
          <h3 className="text-lg font-bold mb-4">Daftar Sarpras</h3>
          <div className="space-y-4">
            {sarpras.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 border rounded-lg ${editingItem?.id === item.id ? 'bg-brand-green-light/20 border-brand-green-dark' : 'bg-gray-50'}`}
              >
                {item.image ? (
                  <img src={getStorageUrl(item.image)} alt={item.name} className="w-16 h-16 object-contain bg-white rounded-lg p-1 border" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
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
            {sarpras.length === 0 && (
              <p className="text-gray-500 text-sm italic">Belum ada data sarpras.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
