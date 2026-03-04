import { useState, useEffect } from 'react';
import MediaLibrary from './MediaLibrary';
import Modal from './Modal';
import type { Media } from '../types';

interface MediaSelectInputProps {
  label?: string;
  value?: string;
  onSelect: (path: string) => void;
  error?: string;
  id?: string;
}

export default function MediaSelectInput({
  label = "Foto / Gambar",
  onSelect,
  value,
  error,
  id = "media_input"
}: MediaSelectInputProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  // Helper to check if file is image
  const isImage = (url: string) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  // Initial value handling
  useEffect(() => {
    if (value) {
      if (value.startsWith('http')) {
        setSelectedUrl(value);
      } else {
        const displayPath = value.startsWith('/') ? value : `/storage/${value}`;
        setSelectedUrl(displayPath);
      }
    } else {
      setSelectedUrl(null);
    }
  }, [value]);

  const handleSelect = (file: Media) => {
    onSelect(file.path);
    setSelectedUrl(file.url);
    setShowModal(false);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="flex items-center space-x-4">
        {/* Preview Area */}
        <div className="shrink-0 relative group">
          {selectedUrl ? (
            <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-300 bg-gray-50 flex items-center justify-center">
              {isImage(selectedUrl) ? (
                <img
                  src={selectedUrl}
                  alt="Selected"
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="text-center p-2">
                  <svg className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-500 break-all mt-1 block">
                    {selectedUrl.split('/').pop()?.substring(0, 10)}...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Button Area */}
        <div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
          >
            {selectedUrl ? 'Ganti File' : 'Pilih File'}
          </button>
          {selectedUrl && (
            <button
              type="button"
              onClick={() => {
                onSelect('');
                setSelectedUrl(null);
              }}
              className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition ease-in-out duration-150"
            >
              Hapus
            </button>
          )}

        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {/* Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Pilih Media"
        maxWidth="5xl"
        zIndex={60}
      >
        <div className="h-[70vh] flex flex-col">
          <div className="flex-1 overflow-hidden">
            <MediaLibrary
              onSelect={handleSelect}
              className="h-full border-none shadow-none rounded-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
