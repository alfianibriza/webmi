import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import { getProfile } from '../../api';
import type { ProfileData } from '../../types/safe_types';
import { getStorageUrl } from '../../utils';
import Footer from '../../components/Footer';

type TabType = 'Sejarah' | 'Proker Kepala' | 'Visi Misi' | 'PTK' | 'Filosofi Logo' | 'Prestasi' | 'Ekstrakurikuler' | 'Sarpras';

const tabMapping: Record<string, TabType> = {
  'sejarah': 'Sejarah',
  'proker-kepala': 'Proker Kepala',
  'visi-misi': 'Visi Misi',
  'ptk': 'PTK',
  'filosofi-logo': 'Filosofi Logo',
  'prestasi': 'Prestasi',
  'ekstrakurikuler': 'Ekstrakurikuler',
  'sarpras': 'Sarpras',
};

export default function ProfileSchool() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam && tabMapping[tabParam] ? tabMapping[tabParam] : 'Sejarah';

  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [prestasiFilter, setPrestasiFilter] = useState('Kecamatan');

  const tabs: TabType[] = ['Sejarah', 'Proker Kepala', 'Visi Misi', 'PTK', 'Filosofi Logo', 'Prestasi', 'Ekstrakurikuler', 'Sarpras'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProfile();
        setData(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSection = (key: string): { image?: string; content?: string; title?: string } =>
    data?.sections?.[key] || { image: undefined, content: undefined, title: undefined };

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

        {/* Custom SectionScrollNav with State */}
        {/* Custom SectionScrollNav with State (Glassmorphism Pill Design) */}
        <div className="w-full max-w-md mx-auto sticky top-2 z-40 px-4 mt-4">
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-full p-1.5 shadow-lg flex items-center gap-1 ring-1 ring-black/5 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 rounded-full text-xs font-bold transition-all duration-300 relative whitespace-nowrap shrink-0 ${activeTab === tab
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

        {/* Content Area */}
        <div className="w-full max-w-md mx-auto mt-6 px-4">

          {/* SEJARAH VIEW */}
          {activeTab === 'Sejarah' && (
            <div className="gradient-card rounded-t-3xl p-6 pb-20 text-white shadow-lg relative overflow-hidden min-h-[600px] animate-fade-in">
              {/* CSS Animations */}
              <style>{`
                @keyframes float-gentle {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
                @keyframes glow {
                  0%, 100% { opacity: 0.5; }
                  50% { opacity: 0.8; }
                }
                @keyframes shine {
                  0% { left: -100%; }
                  100% { left: 200%; }
                }
                @keyframes slide-left-right {
                  0%, 100% { transform: translateX(0px); }
                  50% { transform: translateX(8px); }
                }
              `}</style>

              {/* Decorative Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-yellow-400/20 to-amber-500/10 rounded-full blur-3xl" style={{ animation: 'glow 4s ease-in-out infinite' }}></div>
                <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-gradient-to-tr from-emerald-400/15 to-teal-300/10 rounded-full blur-3xl" style={{ animation: 'glow 4s ease-in-out infinite 1s' }}></div>
                <div className="absolute top-1/3 right-0 w-2 h-2 bg-yellow-400/60 rounded-full" style={{ animation: 'float-gentle 3s ease-in-out infinite' }}></div>
                <div className="absolute top-2/3 left-4 w-1.5 h-1.5 bg-white/40 rounded-full" style={{ animation: 'float-gentle 4s ease-in-out infinite 0.5s' }}></div>
              </div>

              {/* Header with elegant styling */}
              <div className="relative z-10 text-center mb-8">
                <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                  {getSection('sejarah').title || 'Sejarah'}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-yellow-400/60 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-yellow-400/60 rounded-full"></div>
                </div>
              </div>

              {/* Image with premium frame */}
              <div className="relative z-10 mb-8 group">
                {/* Glow effect behind image */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-yellow-400/30 via-amber-300/20 to-emerald-400/25 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>

                <div className="relative w-full aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                  {getSection('sejarah').image ? (
                    <>
                      <img
                        src={getStorageUrl(getSection('sejarah').image)}
                        alt="Sejarah"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animation: 'shine 1.5s ease-in-out' }}></div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-500 font-medium text-sm">Foto Sejarah</span>
                      </div>
                    </div>
                  )}

                  {/* Premium overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 pointer-events-none"></div>
                </div>
              </div>

              {/* Content with styled typography */}
              <div className="relative z-10">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-1 h-full min-h-[60px] bg-gradient-to-b from-yellow-400 via-amber-400 to-transparent rounded-full"></div>
                    <div
                      className="text-sm text-justify leading-relaxed opacity-95 space-y-3 font-medium prose prose-invert prose-p:my-2"
                      dangerouslySetInnerHTML={{ __html: getSection('sejarah').content || 'Belum ada konten sejarah.' }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom decorative line */}
              <div className="relative z-10 mt-6 flex items-center gap-3">
                <div className="flex-1 h-0.5 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                <svg className="w-5 h-5 text-yellow-400/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <div className="flex-1 h-0.5 bg-gradient-to-l from-white/30 to-transparent rounded-full"></div>
              </div>
            </div>
          )}

          {/* PROKER KEPALA VIEW */}
          {activeTab === 'Proker Kepala' && (
            <div className="gradient-card rounded-t-3xl p-6 pb-20 text-white shadow-lg relative overflow-hidden min-h-[600px] animate-fade-in">
              {/* Reuse CSS Animations */}
              <style>{`
                @keyframes float-gentle {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
                @keyframes glow {
                  0%, 100% { opacity: 0.5; }
                  50% { opacity: 0.8; }
                }
              `}</style>

              {/* Decorative Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-yellow-500/10 rounded-full blur-3xl" style={{ animation: 'glow 4s ease-in-out infinite' }}></div>
                <div className="absolute top-1/2 -right-20 w-56 h-56 bg-gradient-to-tr from-brand-orange-main/15 to-amber-300/10 rounded-full blur-3xl" style={{ animation: 'glow 4s ease-in-out infinite 1s' }}></div>
                <div className="absolute top-1/4 left-10 w-2 h-2 bg-white/40 rounded-full" style={{ animation: 'float-gentle 3s ease-in-out infinite' }}></div>
                <div className="absolute bottom-1/3 right-10 w-3 h-3 bg-yellow-400/40 rounded-full" style={{ animation: 'float-gentle 5s ease-in-out infinite 0.5s' }}></div>
              </div>

              {/* Header */}
              <div className="relative z-10 text-center mb-8">
                <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent drop-shadow-lg uppercase tracking-wide">
                  {getSection('proker_kepala').title || 'Proker Kepala'}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-white/60 rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-white/60 rounded-full"></div>
                </div>
              </div>

              {/* Main Content Card */}
              <div className="relative z-10 flex flex-col gap-6">
                {/* Image Section */}
                <div className="group relative w-full aspect-video md:aspect-[21/9] bg-gradient-to-br from-brand-green-dark/20 to-black/10 rounded-2xl overflow-hidden shadow-2xl border border-white/20 mx-auto max-w-4xl">
                  {getSection('proker_kepala').image ? (
                    <>
                      <img src={getStorageUrl(getSection('proker_kepala').image)} alt="Proker" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
                      <div className="absolute bottom-0 left-0 p-6">

                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-black/10">
                      <svg className="w-16 h-16 opacity-50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-sm font-medium">Ilustrasi Proker</span>
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                  </div>

                  <div
                    className="relative z-10 text-sm md:text-base text-justify leading-loose text-white/95 font-medium space-y-4"
                    dangerouslySetInnerHTML={{ __html: getSection('proker_kepala').content || 'Belum ada konten program kerja yang ditambahkan.' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* VISI MISI VIEW */}
          {activeTab === 'Visi Misi' && (
            <div className="gradient-card rounded-t-3xl p-6 pb-20 text-white shadow-lg relative overflow-hidden min-h-[600px] animate-fade-in">
              {/* Reuse CSS Animations */}
              <style>{`
                @keyframes float-gentle {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
                @keyframes glow {
                  0%, 100% { opacity: 0.5; }
                  50% { opacity: 0.8; }
                }
              `}</style>

              {/* Decorative Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-full blur-3xl opacity-60" style={{ animation: 'glow 5s ease-in-out infinite' }}></div>
                <div className="absolute bottom-0 -left-10 w-64 h-64 bg-gradient-to-tr from-brand-teal/20 to-blue-400/10 rounded-full blur-3xl opacity-60" style={{ animation: 'glow 5s ease-in-out infinite 2s' }}></div>
                <div className="absolute top-1/4 left-10 w-2 h-2 bg-white/40 rounded-full" style={{ animation: 'float-gentle 3s ease-in-out infinite' }}></div>
                <div className="absolute bottom-1/3 right-10 w-3 h-3 bg-yellow-400/40 rounded-full" style={{ animation: 'float-gentle 5s ease-in-out infinite 0.5s' }}></div>
              </div>

              {/* Header */}
              <div className="relative z-10 text-center mb-10">
                <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-lg tracking-wide">
                  VISI & MISI
                </h2>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="w-10 h-0.5 bg-gradient-to-r from-transparent to-white/60 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <div className="w-10 h-0.5 bg-gradient-to-l from-transparent to-white/60 rounded-full"></div>
                </div>
              </div>

              {/* VISI Section - Premium Card */}
              <div className="relative z-10 mb-8 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 relative overflow-hidden">
                  {/* Icon Background */}
                  <div className="absolute top-0 right-0 p-6 opacity-[0.07]">
                    <svg className="w-32 h-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-2 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">VISI</h3>
                    </div>

                    <div className="bg-black/20 rounded-xl p-4 md:p-6 border border-white/5 shadow-inner">
                      <div
                        className="text-center text-lg md:text-xl font-medium italic text-white/95 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: getSection('visi').content || 'Belum ada visi yang ditetapkan.' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow Connector */}
              <div className="flex justify-center -my-4 relative z-20">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2 shadow-lg animate-bounce">
                  <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              {/* MISI Section - Premium Card */}
              <div className="relative z-10 mt-8 group">
                <div className="absolute -inset-1 bg-gradient-to-br from-pink-400/30 to-orange-400/30 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 relative overflow-hidden">
                  {/* Icon Background */}
                  <div className="absolute bottom-0 left-0 p-6 opacity-[0.07]">
                    <svg className="w-32 h-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg p-2 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-100 to-white">MISI</h3>
                    </div>

                    <div className="prose prose-invert prose-p:my-1 prose-strong:text-brand-orange-light prose-li:marker:text-brand-yellow-main max-w-none">
                      <div
                        className="text-sm md:text-base leading-loose font-medium text-white/90 text-justify"
                        dangerouslySetInnerHTML={{ __html: getSection('misi').content || 'Belum ada misi yang ditetapkan.' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PTK VIEW */}
          {activeTab === 'PTK' && (
            <div className="gradient-card rounded-t-3xl p-6 pb-20 text-white shadow-lg relative overflow-hidden min-h-[800px] animate-fade-in">
              {/* CSS Animations for PTK */}
              <style>{`
                @keyframes float-gentle {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
                @keyframes glow {
                  0%, 100% { opacity: 0.5; }
                  50% { opacity: 0.8; }
                }
                @keyframes shimmer {
                  0% { background-position: -200% 0; }
                  100% { background-position: 200% 0; }
                }
                @keyframes fade-in-up {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>

              {/* Decorative Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl" style={{ animation: 'glow 4s ease-in-out infinite' }}></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-brand-orange-main/15 to-yellow-400/10 rounded-full blur-3xl" style={{ animation: 'glow 4s ease-in-out infinite 1.5s' }}></div>
                <div className="absolute top-1/3 right-10 w-2 h-2 bg-yellow-400/60 rounded-full" style={{ animation: 'float-gentle 3s ease-in-out infinite' }}></div>
                <div className="absolute top-2/3 left-10 w-1.5 h-1.5 bg-white/40 rounded-full" style={{ animation: 'float-gentle 4s ease-in-out infinite 0.5s' }}></div>
              </div>

              {/* Header with elegant styling */}
              <div className="relative z-10 text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-lg tracking-wide">
                  PTK 2026
                </h2>
                <p className="text-sm text-white/80 font-medium tracking-wider uppercase">Pendidik dan Tenaga Kependidikan</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-emerald-400/60 rounded-full"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-emerald-400/60 rounded-full"></div>
                </div>
              </div>

              {/* Foto Bersama with Premium Frame */}
              <div className="relative z-10 mb-10 group" style={{ animation: 'fade-in-up 0.6s ease-out' }}>
                {/* Glow effect behind image */}
                <div className="absolute -inset-3 bg-gradient-to-tr from-emerald-400/30 via-teal-300/20 to-brand-orange-main/25 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>

                <div className="relative w-full aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30">
                  {data?.groupPhoto?.image ? (
                    <>
                      <img
                        src={getStorageUrl(data.groupPhoto.image)}
                        alt="Foto Bersama PTK"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                      {/* Overlay with shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none"></div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-white/50 to-gray-100/50 backdrop-blur-sm">
                      <svg className="w-16 h-16 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-gray-600 font-medium text-sm">Foto Bersama (Belum diupload)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Divider */}
              <div className="relative z-10 flex items-center justify-center gap-3 mb-8">
                <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"></div>
                <svg className="w-6 h-6 text-emerald-400/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-white/30 to-transparent rounded-full"></div>
              </div>

              {/* Grid Personnel with Premium Cards */}
              <div className="relative z-10 grid grid-cols-2 gap-4 md:gap-5">
                {data?.teachers && data.teachers.map((teacher, index) => (
                  <div
                    key={teacher.id}
                    className="group relative"
                    style={{
                      animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    {/* Card Glow Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-400/30 to-brand-orange-main/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Main Card */}
                    <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-3 pb-4 shadow-xl border border-white/50 flex flex-col items-center text-center transform group-hover:scale-[1.02] transition-all duration-500">
                      {/* Photo Container */}
                      <div className="w-full aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mb-3 relative overflow-hidden shadow-lg">
                        {teacher.image ? (
                          <>
                            <img
                              src={getStorageUrl(teacher.image)}
                              alt={teacher.name}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 pointer-events-none"></div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs font-medium">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Name with gradient */}
                      <h3 className="text-brand-orange-main font-black text-sm leading-tight line-clamp-2 mb-1 px-1">
                        {teacher.name}
                      </h3>

                      {/* Position badge */}
                      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand-orange-main/10 to-brand-green-dark/10 px-3 py-1 rounded-full border border-brand-orange-main/20">
                        <div className="w-1 h-1 bg-brand-orange-main rounded-full"></div>
                        <p className="text-[10px] text-brand-orange-main font-bold italic">{teacher.position}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom decorative element */}
              <div className="relative z-10 mt-10 flex items-center justify-center gap-3">
                <div className="flex-1 h-0.5 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-l from-white/30 to-transparent rounded-full"></div>
              </div>
            </div>
          )}

          {/* FILOSOFI LOGO VIEW (Slider - Premium UI) */}
          {activeTab === 'Filosofi Logo' && (
            <div className="gradient-card rounded-t-3xl p-6 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative overflow-hidden min-h-[650px] animate-fade-in flex flex-col border-t border-white/20">

              {/* Decorative Background Elements */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-brand-yellow-main blur-[100px] rounded-full mix-blend-overlay"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-brand-teal blur-[100px] rounded-full mix-blend-overlay"></div>
              </div>

              {/* Slider Container */}
              <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-6 pb-8 z-10 px-2">

                {/* SLIDE 1 (Cover - Match Design Enhanced) */}
                <div className="min-w-full snap-center flex flex-col relative py-8 px-2">
                  <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] w-full aspect-square flex items-center justify-center p-10 shadow-2xl mb-4 mx-auto max-w-[90%] relative border border-white/50 group">
                    <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/80 to-transparent opacity-50"></div>
                    <img src="/images/logo.webp" alt="Logo MI Al-Ghazali" className="w-full h-full object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500" />
                  </div>

                  <div className="flex-1 flex flex-col justify-center mb-12">
                    <div className="grid grid-cols-2 gap-3 w-[70%] mx-auto">
                      {data?.philosophies && data.philosophies.map((item) => (
                        <div key={item.id} className="aspect-square bg-white rounded-xl flex items-center justify-center shadow-lg p-2">
                          <img src={getStorageUrl(item.image)} alt={item.title} className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="absolute bottom-4 w-full flex justify-center">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 shadow-lg" style={{ animation: 'slide-left-right 2s ease-in-out infinite' }}>
                      <span className="text-white font-bold text-[10px] tracking-widest uppercase">Geser Ke Kanan</span>
                      <div className="bg-white rounded-full p-1 text-brand-green-dark">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Philosophy Slides */}
                {data?.philosophies && data.philosophies.map((item) => (
                  <div key={item.id} className="min-w-full snap-center bg-white/10 backdrop-blur-md rounded-[2rem] p-8 border border-white/20 flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>
                    <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-lg mb-8 shrink-0 p-6 relative z-10">
                      <img src={getStorageUrl(item.image)} alt={item.title} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-yellow-light to-white drop-shadow-sm">{item.title}</h3>
                    <p className="text-base text-center leading-relaxed text-white/90 px-2 font-medium">
                      {item.description}
                    </p>
                  </div>
                ))}

              </div>

            </div>
          )}

          {/* PRESTASI VIEW */}
          {activeTab === 'Prestasi' && (
            <>
              {/* Filter Bar */}
              <div className="bg-brand-teal-light rounded-xl p-1 flex items-center gap-1 mb-6 text-xs md:text-sm shadow-md animate-fade-in text-white/90">
                <span className="font-bold italic px-3 text-white text-base">Tingkat</span>
                {["Kecamatan", "Kabupaten", "Provinsi"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setPrestasiFilter(item)}
                    className={`flex-1 font-medium py-2 px-2 rounded-lg transition text-center ${prestasiFilter === item ? 'gradient-yellow text-white shadow-sm font-bold scale-105' : 'hover:bg-white/10'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Achievement List */}
              <div className="flex flex-col gap-4 animate-fade-in">
                {data?.achievements && data.achievements.length > 0 ? (
                  data.achievements
                    .filter(item => item.level === prestasiFilter)
                    .map((item) => (
                      <a
                        href={`/achievement/${item.id}`}
                        key={item.id}
                        className="gradient-card rounded-3xl p-4 flex items-start gap-4 shadow-lg text-white relative hover:scale-[1.02] transition-transform duration-300 block"
                      >
                        {/* Photo Box */}
                        <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                          {item.image ? (
                            <img src={getStorageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-500 text-xs font-medium">Foto</span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 py-1">
                          <h3 className="text-xl md:text-2xl font-bold mb-1 leading-tight">{item.rank}</h3>
                          <p className="text-xs md:text-sm text-white/90 leading-snug mb-8 font-semibold">
                            {item.title}
                          </p>

                          {/* Date Badge */}
                          <div className="absolute bottom-4 right-4 bg-white text-brand-green-dark text-[10px] font-bold px-3 py-1 rounded-full shadow-sm italic">
                            {new Date(item.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </a>
                    ))
                ) : (
                  <div className="text-center py-10 text-gray-500 bg-white/50 rounded-xl backdrop-blur-sm">
                    <p>Belum ada data prestasi.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* EKSTRAKURIKULER VIEW (Slider - Premium UI) */}
          {activeTab === 'Ekstrakurikuler' && (
            <div className="gradient-card rounded-t-3xl p-6 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative overflow-hidden min-h-[650px] animate-fade-in flex flex-col border-t border-white/20">

              {/* Decorative Background Elements */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-brand-yellow-main blur-[100px] rounded-full mix-blend-overlay"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-brand-teal blur-[100px] rounded-full mix-blend-overlay"></div>
              </div>

              {/* Slider Container */}
              <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-6 pb-8 z-10 px-2">

                {/* Dynamic Extracurricular Slides */}
                {data?.extracurriculars && data.extracurriculars.length > 0 ? (
                  data.extracurriculars.map((item) => (
                    <div key={item.id} className="min-w-full snap-center bg-white/10 backdrop-blur-md rounded-[2rem] p-6 md:p-10 border border-white/20 flex flex-col items-center relative overflow-hidden shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none"></div>

                      {/* Image Landscape */}
                      <div className="w-full max-w-3xl aspect-video bg-white rounded-3xl flex items-center justify-center shadow-lg mb-6 shrink-0 relative z-10 overflow-hidden group border-4 border-white/20">
                        {item.image ? (
                          <img src={getStorageUrl(item.image)} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="text-gray-300 font-bold text-xl">No Image</div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col items-center w-full max-w-4xl">
                        <h3 className="text-3xl md:text-5xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-yellow-light to-white drop-shadow-sm">{item.name}</h3>
                        <p className="text-base md:text-lg text-center leading-relaxed text-white/90 px-2 font-medium">
                          {item.description}
                        </p>
                      </div>

                      {/* Geser Kanan Indicator */}
                      <div className="mt-8 flex items-center gap-2 bg-black/20 backdrop-blur-sm px-5 py-2 rounded-full border border-white/10 shadow-lg" style={{ animation: 'slide-left-right 2s ease-in-out infinite' }}>
                        <span className="text-white font-bold text-[10px] md:text-xs tracking-widest uppercase">Geser Ke Kanan</span>
                        <div className="bg-white rounded-full p-1 text-brand-green-dark">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="min-w-full snap-center flex flex-col items-center justify-center text-white/80 h-full">
                    <div className="bg-white/10 rounded-2xl p-8 backdrop-blur text-center max-w-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-lg font-medium italic">Belum ada data ekstrakurikuler yang ditambahkan.</p>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* SARPRAS VIEW (Slider - Premium UI) */}
          {activeTab === 'Sarpras' && (
            <div className="gradient-card rounded-t-3xl p-6 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative overflow-hidden min-h-[650px] animate-fade-in flex flex-col border-t border-white/20">

              {/* Decorative Background Elements */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-brand-yellow-main blur-[100px] rounded-full mix-blend-overlay"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-brand-teal blur-[100px] rounded-full mix-blend-overlay"></div>
              </div>

              {/* Slider Container */}
              <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-6 pb-8 z-10 px-2">

                {/* Dynamic Sarpras Slides */}
                {data?.sarpras && data.sarpras.length > 0 ? (
                  data.sarpras.map((item) => (
                    <div key={item.id} className="min-w-full snap-center bg-white/10 backdrop-blur-md rounded-[2rem] p-6 md:p-10 border border-white/20 flex flex-col items-center relative overflow-hidden shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none"></div>

                      {/* Image Landscape */}
                      <div className="w-full max-w-3xl aspect-video bg-white rounded-3xl flex items-center justify-center shadow-lg mb-6 shrink-0 relative z-10 overflow-hidden group border-4 border-white/20">
                        {item.image ? (
                          <img src={getStorageUrl(item.image)} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="text-gray-300 font-bold text-xl">No Image</div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col items-center w-full max-w-4xl">
                        <h3 className="text-3xl md:text-5xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-yellow-light to-white drop-shadow-sm">{item.name}</h3>
                        <p className="text-base md:text-lg text-center leading-relaxed text-white/90 px-2 font-medium">
                          {item.description}
                        </p>
                      </div>

                      {/* Geser Kanan Indicator */}
                      <div className="mt-8 flex items-center gap-2 bg-black/20 backdrop-blur-sm px-5 py-2 rounded-full border border-white/10 shadow-lg" style={{ animation: 'slide-left-right 2s ease-in-out infinite' }}>
                        <span className="text-white font-bold text-[10px] md:text-xs tracking-widest uppercase">Geser Ke Kanan</span>
                        <div className="bg-white rounded-full p-1 text-brand-green-dark">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="min-w-full snap-center flex flex-col items-center justify-center text-white/80 h-full">
                    <div className="bg-white/10 rounded-2xl p-8 backdrop-blur text-center max-w-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-lg font-medium italic">Belum ada data sarpras yang ditambahkan.</p>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
