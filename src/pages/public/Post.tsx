import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import HeroCarousel from '../../components/HeroCarousel';
import { getPosts, getAchievements } from '../../api';
import { getStorageUrl } from '../../utils';
import type { Post as PostType, Achievement } from '../../types/safe_types';
import Footer from '../../components/Footer';

interface CombinedItem {
  id: number;
  type: 'post' | 'achievement';
  title: string;
  content?: string;
  description?: string;
  image?: string;
  slug?: string;
  rank?: string;
  created_at?: string;
  date?: string;
  sortDate: Date;
}

export default function Post() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, achievementsRes] = await Promise.all([
          getPosts(),
          getAchievements()
        ]);
        setPosts(postsRes.data);
        setAchievements(achievementsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date helper
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const handleImageError = (e: SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    const nextElement = target.nextElementSibling as HTMLElement;
    if (nextElement) {
      nextElement.style.display = 'flex';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
      </div>
    );
  }

  // Merge and sort posts and achievements
  const allItems: CombinedItem[] = [
    ...posts.map(p => ({ ...p, type: 'post' as const, sortDate: new Date(p.created_at) })),
    ...achievements.map(a => ({ ...a, type: 'achievement' as const, sortDate: new Date(a.date) }))
  ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  return (
    <>
      <div className="min-h-screen pb-10">
        <Header />

        <HeroCarousel />

        {/* Content Area */}
        <div className="w-full max-w-md mx-auto mt-6 px-4">

          {/* Section Title */}
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-brand-orange-main">
              <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
            </svg>
            <h2 className="text-3xl font-bold italic text-brand-orange-main">Berita</h2>
          </div>

          {/* News Feed List */}
          <div className="flex flex-col gap-4">
            {allItems.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-medium">
                Belum ada berita atau prestasi.
              </div>
            ) : (
              allItems.map((item) => {
                const isPost = item.type === 'post';
                const href = isPost ? `/post/${item.slug}` : `/prestasi/${item.id}`;
                const title = isPost ? item.title : (item.rank ? `${item.rank} - ${item.title}` : item.title);
                const content = isPost ? item.content : item.description;
                const date = isPost ? item.created_at : item.date;
                const image = item.image;
                const badgeText = isPost ? 'Berita' : 'Prestasi';

                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    to={href}
                    className="bg-white rounded-3xl p-3 shadow-md border border-gray-100 flex gap-4 items-start hover:shadow-lg transition-shadow duration-300 block relative overflow-hidden"
                  >
                    {/* Type Badge */}
                    <div className={`absolute top-0 right-0 px-2 py-0.5 rounded-bl-xl text-[10px] font-bold text-white ${isPost ? 'bg-brand-orange-main' : 'bg-brand-green-dark'}`}>
                      {badgeText}
                    </div>

                    {/* Left Image */}
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-200 rounded-2xl shrink-0 flex items-center justify-center relative overflow-hidden group self-center">
                      {image ? (
                        <img
                          src={getStorageUrl(image)}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={handleImageError}
                        />
                      ) : null}

                      <div className={`absolute inset-0 flex items-center justify-center bg-gray-300 ${image ? 'hidden' : 'flex'}`}>
                        <span className="text-xs font-semibold text-white/50 z-10">Foto</span>
                        <div className="absolute inset-0 bg-gray-500 opacity-20"></div>
                      </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 flex flex-col min-h-[7rem] justify-between">
                      <div className="mt-2">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-snug mb-2 line-clamp-2 hover:text-brand-orange-main transition-colors">
                          {title}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                          {content}
                        </p>
                      </div>

                      <div className="border-t border-gray-100 pt-2 w-full mt-auto">
                        <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 italic">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                          </svg>
                          {date && formatDate(date)}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

        </div>

        <Footer />
      </div>
    </>
  );
}
