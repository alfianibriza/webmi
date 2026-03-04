import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfileSection, updateProfileSection } from '../../../api';
import MediaSelectInput from '../../../components/MediaSelectInput';

const sectionConfig: Record<string, { title: string; description: string }> = {
  sejarah: {
    title: 'Sejarah',
    description: 'Kelola informasi sejarah madrasah yang akan ditampilkan di halaman profil.',
  },
  proker_kepala: {
    title: 'Program Kerja Kepala',
    description: 'Kelola program kerja kepala madrasah.',
  },
  visi: {
    title: 'Visi & Misi',
    description: 'Kelola visi dan misi madrasah secara terpisah.',
  },
};

interface VisiMisiData {
  visi: { title: string; content: string; image: string };
  misi: { title: string; content: string; image: string };
}

export default function ProfileSectionEdit() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
  });

  // Separate state for Visi & Misi
  const [visiMisiData, setVisiMisiData] = useState<VisiMisiData>({
    visi: { title: 'Visi', content: '', image: '' },
    misi: { title: 'Misi', content: '', image: '' },
  });

  const isVisiMisi = key === 'visi';

  useEffect(() => {
    if (key && sectionConfig[key]) {
      if (isVisiMisi) {
        fetchVisiMisi();
      } else {
        fetchSection();
      }
    } else {
      navigate('/dashboard');
    }
  }, [key]);

  const fetchSection = async () => {
    if (!key) return;
    try {
      setLoading(true);
      const response = await getProfileSection(key);
      const data = response.data;
      setFormData({
        title: data.title || '',
        content: data.content || '',
        image: data.image || '',
      });
    } catch (error) {
      console.error('Error fetching section:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisiMisi = async () => {
    try {
      setLoading(true);
      const [visiRes, misiRes] = await Promise.all([
        getProfileSection('visi'),
        getProfileSection('misi'),
      ]);

      setVisiMisiData({
        visi: {
          title: visiRes.data?.title || 'Visi',
          content: visiRes.data?.content || '',
          image: visiRes.data?.image || '',
        },
        misi: {
          title: misiRes.data?.title || 'Misi',
          content: misiRes.data?.content || '',
          image: misiRes.data?.image || '',
        },
      });
    } catch (error) {
      console.error('Error fetching visi misi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;

    try {
      setSaving(true);
      await updateProfileSection(key, formData);
      alert('Data berhasil disimpan!');
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const handleVisiMisiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await Promise.all([
        updateProfileSection('visi', visiMisiData.visi),
        updateProfileSection('misi', visiMisiData.misi),
      ]);
      alert('Visi & Misi berhasil disimpan!');
    } catch (error) {
      console.error('Error saving visi misi:', error);
      alert('Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const config = key ? sectionConfig[key] : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
      </div>
    );
  }

  // Special Form for Visi & Misi
  if (isVisiMisi) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{config?.title || 'Visi & Misi'}</h1>
            <p className="mt-1 text-sm text-gray-500">{config?.description}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleVisiMisiSubmit} className="space-y-6">
          {/* Visi Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-brand-green-dark mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              VISI
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="visi-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Visi
                </label>
                <input
                  type="text"
                  id="visi-title"
                  value={visiMisiData.visi.title}
                  onChange={(e) => setVisiMisiData({
                    ...visiMisiData,
                    visi: { ...visiMisiData.visi, title: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent"
                  placeholder="Contoh: VISI"
                />
              </div>

              <div>
                <label htmlFor="visi-content" className="block text-sm font-medium text-gray-700 mb-1">
                  Konten Visi
                </label>
                <textarea
                  id="visi-content"
                  rows={5}
                  value={visiMisiData.visi.content}
                  onChange={(e) => setVisiMisiData({
                    ...visiMisiData,
                    visi: { ...visiMisiData.visi, content: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent resize-y"
                  placeholder="Tuliskan visi madrasah..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Misi Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-brand-orange-main mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              MISI
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="misi-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Misi
                </label>
                <input
                  type="text"
                  id="misi-title"
                  value={visiMisiData.misi.title}
                  onChange={(e) => setVisiMisiData({
                    ...visiMisiData,
                    misi: { ...visiMisiData.misi, title: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent"
                  placeholder="Contoh: MISI"
                />
              </div>

              <div>
                <label htmlFor="misi-content" className="block text-sm font-medium text-gray-700 mb-1">
                  Konten Misi
                </label>
                <textarea
                  id="misi-content"
                  rows={8}
                  value={visiMisiData.misi.content}
                  onChange={(e) => setVisiMisiData({
                    ...visiMisiData,
                    misi: { ...visiMisiData.misi, content: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent resize-y"
                  placeholder="Tuliskan misi madrasah (pisahkan dengan baris baru untuk setiap poin)..."
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Tips: Gunakan baris baru untuk memisahkan setiap poin misi.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-brand-green-main text-white rounded-lg hover:bg-brand-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Menyimpan...' : 'Simpan Visi & Misi'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Regular Form for other sections
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config?.title || 'Profil'}</h1>
          <p className="mt-1 text-sm text-gray-500">{config?.description}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Judul
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Konten
            </label>
            <textarea
              id="content"
              rows={10}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent resize-y"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Anda dapat menggunakan baris baru untuk memisahkan paragraf.
            </p>
          </div>

          {/* Image */}
          <div>
            <MediaSelectInput
              label="Gambar"
              value={formData.image}
              onSelect={(path: string) => setFormData({ ...formData, image: path })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-brand-green-main text-white rounded-lg hover:bg-brand-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
