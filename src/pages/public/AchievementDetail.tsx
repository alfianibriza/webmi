import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/Header';
import { getAchievement } from '../../api';
import { getStorageUrl } from '../../utils';
import type { Achievement } from '../../types/safe_types';
import Footer from '../../components/Footer';

export default function AchievementDetail() {
  const { id } = useParams<{ id: string }>();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const response = await getAchievement(parseInt(id));
        setAchievement(response.data);
      } catch (error) {
        console.error('Error fetching achievement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className="min-h-screen pb-10">
        <Header />
        <div className="w-full max-w-md mx-auto mt-6 px-4 text-center">
          <p className="text-gray-500">Prestasi tidak ditemukan.</p>
          <Link to="/kesiswaan" className="text-brand-green-main hover:underline mt-4 inline-block">
            ← Kembali ke Kesiswaan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pb-10">
        <Header />

        <div className="w-full max-w-md mx-auto mt-6 px-4">
          {/* Back Button */}
          <Link to="/kesiswaan" className="inline-flex items-center gap-2 text-brand-green-main hover:underline mb-4 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
            </svg>
            Kembali
          </Link>

          {/* Achievement Card */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Image */}
            {achievement.image && (
              <div className="w-full aspect-video bg-gray-200">
                <img
                  src={getStorageUrl(achievement.image)}
                  alt={achievement.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {achievement.level && (
                <span className="inline-block bg-brand-green-main text-white text-xs px-3 py-1 rounded-full mb-3">
                  {achievement.level}
                </span>
              )}

              <h1 className="text-2xl font-bold text-brand-green-dark mb-2">{achievement.title}</h1>

              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                </svg>
                {formatDate(achievement.date)}
              </div>

              {achievement.description && (
                <div className="prose prose-sm max-w-none text-gray-700">
                  {achievement.description}
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
