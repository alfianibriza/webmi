import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { getKesiswaan } from '../../api';
import { getStorageUrl } from '../../utils';
import type { Achievement } from '../../types/safe_types';
import { Link } from 'react-router-dom';
import StudentSection from './StudentList';
import Footer from '../../components/Footer';

export default function Kesiswaan() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Daftar Murid' | 'Prestasi'>('Daftar Murid');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getKesiswaan();
        setAchievements(response.data.achievements || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <>
      <div className="min-h-screen pb-10">
        <Header />

        {/* Navigation Tabs (Profile Style) */}
        {/* Navigation Floating Pills */}
        <div className="w-full max-w-md mx-auto sticky top-2 z-40 px-4 mt-4">
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-full p-1.5 shadow-lg flex items-center justify-between gap-1 ring-1 ring-black/5">
            {['Daftar Murid', 'Prestasi'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all duration-300 relative overflow-hidden ${activeTab === tab
                  ? 'bg-gradient-to-r from-brand-orange-main to-orange-500 text-white shadow-md transform scale-[1.02]'
                  : 'text-gray-500 hover:text-brand-orange-main hover:bg-white/50'
                  }`}
              >
                {/* Subtle shine effect for active tab */}
                {activeTab === tab && (
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></span>
                )}
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md mx-auto mt-6 px-4">
          {/* Section Title */}
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-brand-orange-main">
              <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
            </svg>
            <h2 className="text-3xl font-bold italic text-brand-orange-main">Kesiswaan</h2>
          </div>

          {/* DAFTAR MURID TAB */}
          {activeTab === 'Daftar Murid' && (
            <StudentSection />
          )}

          {/* PRESTASI TAB */}
          {activeTab === 'Prestasi' && (
            <div className="mb-8 animate-fade-in">
              <h3 className="text-xl font-bold text-brand-green-dark mb-4">Prestasi Siswa</h3>

              {achievements.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Belum ada data prestasi.</p>
              ) : (
                <div className="grid gap-4">
                  {achievements.map((achievement) => (
                    <Link
                      key={achievement.id}
                      to={`/prestasi/${achievement.id}`}
                      className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow flex gap-4"
                    >
                      <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                        {achievement.image ? (
                          <img
                            src={getStorageUrl(achievement.image)}
                            alt={achievement.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-1 line-clamp-2">{achievement.title}</h4>
                        {achievement.level && (
                          <span className="text-xs bg-brand-green-main text-white px-2 py-0.5 rounded-full">
                            {achievement.level}
                          </span>
                        )}
                        <p className="text-xs text-gray-400 mt-2">{formatDate(achievement.date)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
