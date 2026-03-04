import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminPmbInfo, updatePmbInfo } from '../../../api';
import MediaSelectInput from '../../../components/MediaSelectInput';
import { getStorageUrl } from '../../../utils';

interface PmbInfoData {
  id?: number;
  title: string;
  description: string;
  image: string;
  brochure_link: string;
  is_active: boolean;
}

const initialFormState: PmbInfoData = {
  title: '',
  description: '',
  image: '',
  brochure_link: '',
  is_active: true,
};

export default function PmbInfoSettings() {
  const [formData, setFormData] = useState<PmbInfoData>(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchInfo = useCallback(async () => {
    try {
      const response = await getAdminPmbInfo();
      if (response.data) {
        setFormData({
          id: response.data.id,
          title: response.data.title || '',
          description: response.data.description || '',
          image: response.data.image || '',
          brochure_link: response.data.brochure_link || '',
          is_active: response.data.is_active ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching PMB info:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const payload: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        brochure_link: formData.brochure_link,
        is_active: formData.is_active,
      };

      if (formData.image) {
        payload.image = formData.image;
      }

      await updatePmbInfo(payload);
      setMessage({ type: 'success', text: 'Info PMB berhasil disimpan!' });
    } catch (error) {
      console.error('Error saving PMB info:', error);
      setMessage({ type: 'error', text: 'Gagal menyimpan info PMB.' });
    } finally {
      setIsSaving(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengaturan Info PMB</h1>
          <p className="text-gray-500 text-sm mt-1">Atur informasi yang akan ditampilkan di halaman PMB publik</p>
        </div>
        <Link
          to="/dashboard/pmb"
          className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Fields */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Judul PMB
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent transition text-sm"
                placeholder="Contoh: Penerimaan Murid Baru 2024/2025"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi / Informasi
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent transition text-sm leading-relaxed"
                placeholder="Tulis informasi lengkap tentang PMB, persyaratan, jadwal, dll..."
              />
            </div>

            <div>
              <label htmlFor="brochure_link" className="block text-sm font-medium text-gray-700 mb-1">
                Link Brosur (Opsional)
              </label>
              <input
                id="brochure_link"
                type="url"
                value={formData.brochure_link}
                onChange={(e) => setFormData({ ...formData, brochure_link: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent transition text-sm"
                placeholder="https://drive.google.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">Link ke file brosur (Google Drive, dsb)</p>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-5">
            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 text-sm mb-3">Status PMB</h4>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-brand-green-main focus:ring-brand-green-main"
                />
                <span className="text-sm text-gray-700">
                  PMB Aktif / Dibuka
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Jika dinonaktifkan, halaman PMB akan menampilkan pesan bahwa pendaftaran ditutup.
              </p>
            </div>

            {/* Image */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <MediaSelectInput
                label="Gambar / Banner PMB"
                id="pmb_image"
                value={formData.image}
                onSelect={(path) => setFormData({ ...formData, image: path })}
              />
            </div>

            {/* Preview */}
            {formData.image && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 text-sm mb-2">Preview Gambar</h4>
                <img
                  src={getStorageUrl(formData.image)}
                  alt="Preview"
                  className="w-full rounded-lg object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-brand-green-main text-white rounded-lg text-sm font-medium hover:bg-brand-green-dark disabled:opacity-50 transition flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
