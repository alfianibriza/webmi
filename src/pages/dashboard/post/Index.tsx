
import { useEffect, useState, useMemo, useCallback } from 'react';
import { getAdminPosts, deletePost, createPost, updatePost, getEditPost } from '../../../api';
import { Pencil, Trash2, Plus, Newspaper } from 'lucide-react';
import MediaSelectInput from '../../../components/MediaSelectInput';
import Modal from '../../../components/Modal';
import type { Post } from '../../../types/safe_types';

export default function PostIndex() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const initialFormState = {
    title: '',
    content: '',
    status: 'published' as 'published' | 'draft',
    image: '',
    created_at: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await getAdminPosts();
      const data = response.data;
      setPosts(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const lowerQuery = searchQuery.toLowerCase();
    return posts.filter(post =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.slug?.toLowerCase().includes(lowerQuery)
    );
  }, [posts, searchQuery]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus berita ini?')) return;

    try {
      await deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Gagal menghapus berita');
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setSaveError(null);
    setShowModal(true);
  };

  const handleEdit = async (post: Post) => {
    setEditingId(post.id);
    setShowModal(true);
    setIsLoadingDetails(true);
    setSaveError(null);

    try {
      const response = await getEditPost(post.id);
      const fullPost: Post = response.data;

      let formattedDate = '';
      if (fullPost.created_at) {
        const date = new Date(fullPost.created_at);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        formattedDate = `${year} -${month} -${day}T${hours}:${minutes} `;
      }

      setFormData({
        title: fullPost.title,
        content: fullPost.content,
        status: fullPost.status,
        image: fullPost.image || '',
        created_at: formattedDate,
      });
    } catch (error) {
      console.error("Failed to fetch post details", error);
      alert("Gagal memuat detail berita");
      setShowModal(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    try {
      // Build payload with proper typing
      const payload: Record<string, unknown> = {
        title: formData.title,
        content: formData.content,
        status: formData.status,
      };

      // Add image if present
      if (formData.image) {
        payload.image = formData.image;
      }

      // Fix date format for backend (YYYY-MM-DD HH:mm:ss)
      if (formData.created_at && formData.created_at.includes('T')) {
        payload.created_at = formData.created_at.replace('T', ' ') + ':00';
      }

      console.log('Sending payload:', payload);

      if (editingId) {
        await updatePost(editingId, payload);
      } else {
        await createPost(payload);
      }
      setShowModal(false);
      fetchPosts();
    } catch (error: unknown) {
      console.error('Error saving post:', error);

      // Try to get error message from response
      let errorMessage = 'Gagal menyimpan berita.';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.data?.errors) {
          const errors = Object.values(axiosError.response.data.errors).flat();
          errorMessage = errors.join(', ');
        }
      }
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    try {
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch {
      return dateString;
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `/ storage / ${cleanPath} `;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header with single button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Newspaper className="w-8 h-8 text-brand-green-main" />
            Manajemen Berita
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola berita dan pengumuman sekolah</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-brand-green-main text-white p-2 rounded-lg hover:bg-brand-green-dark transition flex items-center justify-center shadow-sm"
          title="Tambah Berita"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-green-main focus:border-brand-green-main sm:text-sm transition duration-150 ease-in-out"
            placeholder="Cari berita berdasarkan judul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Posts Table or Empty State */}
      {filteredPosts.length === 0 && posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Belum ada berita</h3>
          <p className="mt-2 text-sm text-gray-500">Mulai dengan membuat berita pertama Anda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Berita
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-14 w-14 flex-shrink-0">
                            {post.image ? (
                              <img className="h-14 w-14 rounded-lg object-cover border border-gray-200" src={getImageUrl(post.image)} alt={post.title} />
                            ) : (
                              <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4 max-w-xs">
                            <div className="text-sm font-semibold text-gray-900 truncate" title={post.title}>{post.title}</div>
                            <div className="text-xs text-gray-500 truncate" title={post.slug}>/{post.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px - 3 py - 1 inline - flex text - xs leading - 5 font - semibold rounded - full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          } `}>
                          {post.status === 'published' ? 'Dipublikasi' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(post.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="text-brand-green-main hover:text-brand-green-dark transition-colors p-1.5 rounded-md hover:bg-green-50"
                            title="Edit"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-md hover:bg-red-50"
                            title="Hapus"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                      Tidak ada berita yang cocok dengan pencarian "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Menampilkan {filteredPosts.length} dari {posts.length} berita
            </p>
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Berita" : "Tambah Berita Baru"}
        maxWidth="5xl"
      >
        {isLoadingDetails ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-green-main mb-4"></div>
            <p className="text-gray-500">Memuat detail berita...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Error Message */}
            {saveError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <strong>Error:</strong> {saveError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Input Fields */}
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Berita <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent transition text-sm"
                    placeholder="Masukkan judul berita yang menarik"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Konten Berita <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-main focus:border-transparent transition text-sm leading-relaxed"
                      placeholder="Tulis konten berita di sini..."
                      required
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none bg-white px-1">
                      {formData.content.length} karakter
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Settings */}
              <div className="space-y-5">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                  <h4 className="font-medium text-gray-800 text-sm border-b pb-2">Pengaturan</h4>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'published' | 'draft' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green-main focus:border-transparent transition text-sm"
                    >
                      <option value="published">Dipublikasi</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="created_at" className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Publikasi
                    </label>
                    <input
                      id="created_at"
                      type="datetime-local"
                      value={formData.created_at}
                      onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green-main focus:border-transparent transition text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Kosongkan untuk waktu saat ini.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <MediaSelectInput
                    label="Gambar Utama"
                    id="post_image"
                    value={formData.image}
                    onSelect={(path) => setFormData({ ...formData, image: path })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-brand-green-main text-white rounded-lg text-sm font-medium hover:bg-brand-green-dark disabled:opacity-50 transition flex items-center gap-2"
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
                  <>Simpan</>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
