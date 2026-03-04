import { useEffect, useState } from 'react';
import { getAdminPhilosophy, createPhilosophy, updatePhilosophy, deletePhilosophy } from '../../../api';
import { Pencil, Trash2, Lightbulb } from 'lucide-react';
import MediaSelectInput from '../../../components/MediaSelectInput';
import { getStorageUrl } from '../../../utils';

interface Philosophy {
  id: number;
  title: string;
  description: string;
  image: string;
  order?: number;
}

export default function PhilosophyIndex() {
  const [items, setItems] = useState<Philosophy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Philosophy | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    order: 1,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await getAdminPhilosophy();
      const data = response.data;
      setItems(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Error fetching philosophy items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingItem) {
        await updatePhilosophy(editingItem.id, formData);
      } else {
        await createPhilosophy(formData);
      }
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error saving philosophy:', error);
      alert('Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Philosophy) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      image: item.image || '',
      order: item.order || 1,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      order: items.length + 1,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;
    try {
      await deletePhilosophy(id);
      fetchItems();
    } catch (error) {
      console.error('Error deleting philosophy:', error);
      alert('Gagal menghapus data');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
      </div>
    );
  }



  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold leading-tight text-gray-800 flex items-center gap-2">
            <Lightbulb className="w-8 h-8 text-brand-green-main" />
            Manajemen Filosofi Logo
          </h2>
          <p className="text-gray-500">Kelola makna dan filosofi logo sekolah</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Form Input */}
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">
            {editingItem ? 'Edit Filosofi Logo' : 'Tambah Filosofi Logo'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Judul (Contoh: Kubah Masjid)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700">Deskripsi / Makna</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-brand-green-main focus:ring-brand-green-main"
                required
              ></textarea>
            </div>
            <MediaSelectInput
              label={editingItem ? 'Ganti Gambar (Opsional)' : 'Gambar Icon'}
              id="philosophy_image"
              value={formData.image}
              onSelect={(path) => setFormData({ ...formData, image: path })}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
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
          <h3 className="text-lg font-bold mb-4">Daftar Filosofi</h3>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 border rounded-lg ${editingItem?.id === item.id ? 'bg-brand-green-light/20 border-brand-green-dark' : 'bg-gray-50'}`}
              >
                {item.image ? (
                  <img src={getStorageUrl(item.image)} alt={item.title} className="w-16 h-16 object-contain bg-white rounded-lg p-1 border" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">
                    {item.title}
                    <span className="text-xs text-gray-500 font-normal ml-2">(Order: {item.order || 1})</span>
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
              <p className="text-gray-500 text-sm italic">Belum ada data filosofi logo.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
