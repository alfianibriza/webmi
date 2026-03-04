import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { getSarpras } from '../../api';
import { getStorageUrl } from '../../utils';
import type { Sarpras as SarprasType } from '../../types/safe_types';
import Footer from '../../components/Footer';

export default function Sarpras() {
  const [sarpras, setSarpras] = useState<SarprasType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSarpras();
        setSarpras(response.data);
      } catch (error) {
        console.error('Error fetching sarpras:', error);
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
            <h2 className="text-3xl font-bold italic text-brand-orange-main">Sarpras</h2>
          </div>

          <p className="text-gray-600 mb-6">Sarana dan Prasarana MI Al-Ghazali</p>

          {/* Sarpras Grid */}
          {sarpras.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada data sarana prasarana.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {sarpras.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-200">
                    {item.image ? (
                      <img
                        src={getStorageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
