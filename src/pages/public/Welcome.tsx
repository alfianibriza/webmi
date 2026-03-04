import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import HeroCarousel from '../../components/HeroCarousel';
import SectionNavigation from '../../components/SectionNavigation';
import { ProfileCard, NewsCard } from '../../components/ContentCard';
import Footer from '../../components/Footer';
import { getHome } from '../../api';
import type { HomeData } from '../../types/safe_types';
import { Users, Briefcase } from 'lucide-react';

export default function Welcome() {
  const [data, setData] = useState<HomeData>({ sliderImages: [], kepalaImage: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getHome();
        setData(response.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
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
      {/* Main Background with Pattern (handled in index.css body) */}
      <div className="min-h-screen pb-10">

        <Header />

        <HeroCarousel images={data.sliderImages} />

        {/* Stats Section */}
        <div className="w-full max-w-lg mx-auto px-4 mt-8">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-stretch justify-between relative overflow-hidden ring-1 ring-gray-100">
            {/* PTK Section - Left */}
            <div className="flex-1 flex flex-row items-center justify-center p-6 border-r border-gray-100 bg-gradient-to-br from-orange-50/80 via-white to-white gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center transition-transform hover:scale-110 duration-300 shadow-sm shrink-0">
                <Briefcase className="w-6 h-6 text-brand-orange-main" />
              </div>
              <div className="flex flex-col items-start">
                <p className="text-3xl font-bold text-slate-800 tracking-tight leading-none">{data.teachers_count || 0}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">PTK</p>
              </div>
            </div>

            {/* Students Section - Right */}
            <div className="flex-1 flex flex-row items-center justify-center p-6 bg-gradient-to-bl from-emerald-50/80 via-white to-white gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center transition-transform hover:scale-110 duration-300 shadow-sm shrink-0">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex flex-col items-start">
                <p className="text-3xl font-bold text-slate-800 tracking-tight leading-none">{data.students_count || 0}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Murid</p>
              </div>
            </div>
          </div>
        </div>

        <SectionNavigation />

        <div className="flex flex-col gap-2">
          <ProfileCard image={data.kepalaImage} />
          <NewsCard />
        </div>

        <Footer />
      </div>
    </>
  );
}
