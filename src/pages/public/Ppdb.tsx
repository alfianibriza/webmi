import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { getPpdbInfo } from '../../api';
import { getStorageUrl } from '../../utils';
import type { PpdbInfo } from '../../types/safe_types';
import Footer from '../../components/Footer';

export default function Ppdb() {
  const [info, setInfo] = useState<PpdbInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPpdbInfo();
        setInfo(response.data);
      } catch (error) {
        console.error('Error fetching PPDB info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
      </div>
    );
  }

  // Check if PMB is inactive
  const isActive = info?.is_active !== false;

  return (
    <>
      <div className="min-h-screen pb-10">
        <Header />

        <div className="w-full max-w-md mx-auto mt-6 px-4">
          {/* Section Title */}
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-brand-orange-main">
              <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
            </svg>
            <h2 className="text-3xl font-bold italic text-brand-orange-main">PMB</h2>
          </div>

          <p className="text-gray-600 mb-6">Penerimaan Murid Baru MI Al-Ghazali</p>

          {/* Status Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {isActive ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'}
            </span>
          </div>

          {/* Banner Image */}
          {info?.image && (
            <div className="w-full rounded-2xl overflow-hidden mb-6 shadow-lg">
              <img
                src={getStorageUrl(info.image)}
                alt={info.title || 'PMB Banner'}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Info Card */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-brand-green-dark mb-4">
              {info?.title || 'Informasi Pendaftaran'}
            </h3>

            {info?.description ? (
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                {info.description}
              </div>
            ) : (
              <p className="text-gray-500">Informasi pendaftaran belum tersedia.</p>
            )}

            {/* Brochure Link */}
            {info?.brochure_link && (
              <div className="mt-6">
                <a
                  href={info.brochure_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-orange-main text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 transition font-medium text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zm6.905 9.97a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72V18a.75.75 0 001.5 0v-4.19l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
                    <path d="M14.25 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0016.5 7.5h-1.875a.375.375 0 01-.375-.375V5.25z" />
                  </svg>
                  Download Brosur PMB
                </a>
              </div>
            )}
          </div>

          {/* Contact Card */}
          <div className="bg-gradient-card rounded-3xl p-6 text-white">
            <h3 className="text-lg font-bold mb-3">Hubungi Kami</h3>
            <p className="text-sm opacity-90">
              Untuk informasi lebih lanjut silahkan hubungi kami atau kunjungi langsung MI Al-Ghazali Rombasan Pragaan Sumenep.
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
