import { useState, useEffect } from 'react';
import { getMedia, uploadMedia, deleteMedia } from '../api';
import type { Media } from '../types/safe_types';

interface MediaLibraryProps {
  onSelect?: (media: Media) => void;
  className?: string;
}

export default function MediaLibrary({ onSelect, className = "" }: MediaLibraryProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('library');
  const [images, setImages] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Media | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (activeTab === 'library') {
      fetchImages();
    }
  }, [activeTab]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await getMedia();
      console.log('MediaLibrary fetch response:', response);
      const data = response.data;
      const imagesList = Array.isArray(data) ? data : (data?.data || []);
      console.log('MediaLibrary images list:', imagesList);
      setImages(imagesList);
    } catch (error) {
      console.error("Failed to load images", error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadMedia(file);
      setActiveTab('library');
      await fetchImages();
      // Safe check for response structure
      const uploadedFile = response.data?.file || response.data;
      if (uploadedFile) setSelectedImage(uploadedFile);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Gagal mengupload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedImage) return;
    if (!window.confirm('Apakah anda yakin ingin menghapus file ini?')) return;

    setLoading(true);
    try {
      await deleteMedia(selectedImage.path);
      await fetchImages();
      setSelectedImage(null);
    } catch (error) {
      console.error("Delete failed", error);
      alert("Gagal menghapus file.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedImage && onSelect) {
      onSelect(selectedImage);
    }
  };

  const isImage = (name: string) => {
    if (!name) return false;
    const ext = name.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow h-full flex flex-col ${className}`}>
      {/* Tabs */}
      <div className="bg-gray-50 px-4 py-2 border-b flex gap-4 shrink-0">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'upload'
            ? 'bg-white text-blue-600 border-t border-l border-r border-gray-200'
            : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('upload')}
        >
          Upload File
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'library'
            ? 'bg-white text-blue-600 border-t border-l border-r border-gray-200'
            : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('library')}
        >
          Pustaka Media
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {activeTab === 'upload' && (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <label htmlFor="file-upload-input" className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Pilih File untuk Upload
                <input
                  id="file-upload-input"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleUpload}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                />
              </label>
            </div>
            <p className="mt-3 text-xs text-gray-500">JPG, PNG, WebP, PDF, DOC, XLS, PPT, ZIP (max 10MB)</p>
            {uploading && (
              <div className="mt-4 flex items-center text-blue-600">
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-semibold">Mengupload...</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'library' && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.isArray(images) && images.length > 0 ? images.map((img) => (
                  <div
                    key={img.path}
                    className={`relative group cursor-pointer border rounded-lg overflow-hidden ${selectedImage?.path === img.path ? 'ring-4 ring-blue-500' : ''
                      }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    {isImage(img.name) ? (
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        <span className="text-xs uppercase font-bold text-center px-1 truncate w-full">{img.name.split('.').pop()}</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                      {img.name}
                    </div>
                  </div>
                )) : (
                  <p className="col-span-full text-center text-gray-500">Belum ada media.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with Select or Delete Button */}
      <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center border-t shrink-0">
        <div className="flex items-center gap-4">
          {/* File Info */}
          {selectedImage && (
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900 block truncate max-w-[200px]">{selectedImage.name}</span>
              <span className="text-xs text-gray-500">{formatBytes(selectedImage.size)}</span>
            </div>
          )}

          {/* Delete Button */}
          {selectedImage && activeTab === 'library' && (
            <button
              onClick={handleDelete}
              className="inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
              title="Hapus File"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Select Button (Right side) - Only if onSelect is present */}
        {onSelect && (
          <button
            onClick={handleConfirmSelect}
            disabled={!selectedImage || activeTab !== 'library'}
            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pilih File
          </button>
        )}
      </div>
    </div>
  );
}
