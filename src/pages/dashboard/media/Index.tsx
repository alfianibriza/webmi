import MediaLibrary from '../../../components/MediaLibrary';


import { Image } from 'lucide-react';

export default function MediaIndex() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Image className="w-8 h-8 text-brand-green-main" />
            Pustaka Media
          </h1>
          <p className="text-gray-500">Kelola gambar dan file media lainnya</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: '70vh' }}>
        <MediaLibrary className="h-full border-none shadow-none" />
      </div>
    </div>
  );
}
