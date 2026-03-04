import type { ReactNode, SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';

interface ContentCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

export default function ContentCard({ title, children, className = "", innerClassName = "" }: ContentCardProps) {
  return (
    <div className={`w-full max-w-md mx-auto mt-4 px-4 ${className}`}>
      <div className={`gradient-card rounded-3xl p-6 text-white shadow-lg relative ${innerClassName.includes('overflow') ? innerClassName : 'overflow-hidden ' + innerClassName}`}>
        {/* Decorative Pattern or Gradient overlay could go here */}

        {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}

        {children}
      </div>
    </div>
  );
}

interface ProfileCardProps {
  image?: string | null;
}

export function ProfileCard({ image }: ProfileCardProps) {
  const handleImageError = (e: SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    const nextElement = target.nextElementSibling as HTMLElement;
    if (nextElement) {
      nextElement.style.display = 'flex';
    }
  };

  return (
    <ContentCard className="mt-8 mb-8" innerClassName="overflow-hidden">
      <div className="flex flex-col items-center text-center relative z-10">

        {/* Image Container - Inside the card */}
        <div className="relative w-40 h-48 mb-6 group mt-4">
          {/* Decorative background glow */}
          <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl transform translate-y-2"></div>

          {/* Main Image Frame */}
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden border-[6px] border-white shadow-2xl bg-gray-200 transform transition-transform duration-500 hover:scale-105">
            <img
              src={image || "/images/kepala_madrasah_placeholder.png"}
              alt="Kepala Madrasah"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            <div className="hidden w-full h-full items-center justify-center text-gray-400 text-xs font-medium">Foto Belum Ada</div>
          </div>

          {/* Badge Icon */}
          <div className="absolute -bottom-3 -right-3 bg-yellow-400 text-brand-green-dark p-2 rounded-full shadow-lg border-4 border-brand-green-main transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>

        {/* Content */}
        <div className="px-2 w-full">
          {/* Quote */}
          <div className="relative mb-6">
            <svg className="w-6 h-6 text-yellow-300/80 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.896 14.325 10.272 17.748 10.272L18.253 10.272L18.253 19L14.017 19L14.017 21ZM6.017 21L6.017 18C6.017 16.896 6.325 10.272 9.748 10.272L10.253 10.272L10.253 19L6.017 19L6.017 21ZM0 21L0 8L7.672 8C10.648 8 13.017 10.369 13.017 13.345L13.017 21L0 21ZM22 21L14.017 21L14.017 13.345C14.017 10.369 16.386 8 19.362 8L22 8L22 21Z" /></svg>
            <p className="text-sm italic font-medium leading-relaxed font-serif text-white/95 max-w-xs mx-auto">
              "Besar cinta seorang guru pada murid-muridnya tiada padanan yang mampu menakarnya, sebab melebihi cinta ia pada dirinya."
            </p>
          </div>

          {/* Divider */}
          <div className="w-12 h-1 bg-yellow-400/50 rounded-full mx-auto mb-4"></div>

          {/* Identity */}
          <div className="space-y-1 mb-6">
            <h3 className="text-lg font-bold text-white tracking-wide drop-shadow-sm">
              Moh. Bakri. S.Ag.
            </h3>
            <p className="text-[10px] font-bold text-yellow-300 uppercase tracking-[0.2em] bg-white/10 py-1 px-3 rounded-full inline-block">
              Kepala MI Al-Ghazali
            </p>
          </div>

          <Link
            to="/profil-madrasah?tab=proker-kepala"
            className="bg-white text-brand-green-dark font-black text-xs py-2.5 px-6 rounded-full shadow-lg hover:shadow-xl hover:bg-yellow-50 hover:-translate-y-0.5 transition-all duration-300 group w-full max-w-[200px] block text-center mx-auto"
          >
            <span className="group-hover:text-brand-orange-main transition-colors">PROGRAM KEPALA</span>
          </Link>
        </div>
      </div>

      {/* Decorative Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
      </div>
    </ContentCard>
  );
}

export function NewsCard() {
  return (
    <ContentCard className="mb-8" innerClassName="overflow-visible">
      {/* CSS Animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-5deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(250, 204, 21, 0.4), 0 0 40px rgba(250, 204, 21, 0.2); }
          50% { box-shadow: 0 0 30px rgba(250, 204, 21, 0.6), 0 0 60px rgba(250, 204, 21, 0.3); }
        }
        @keyframes trophy-bounce {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-5px) rotate(3deg); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #fef08a 25%, #fff 50%, #fef08a 75%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        {/* Main gradient orbs */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-yellow-400/30 to-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-emerald-400/25 to-teal-300/20 rounded-full blur-3xl" style={{ animation: 'pulse 3s ease-in-out infinite 0.5s' }}></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>

        {/* Floating confetti particles */}
        <div className="absolute top-4 left-8 w-2 h-2 bg-yellow-400 rounded-full" style={{ animation: 'float 4s ease-in-out infinite' }}></div>
        <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-amber-300 rounded-full" style={{ animation: 'float-reverse 3.5s ease-in-out infinite 0.3s' }}></div>
        <div className="absolute bottom-16 left-16 w-1 h-1 bg-white rounded-full" style={{ animation: 'sparkle 2s ease-in-out infinite' }}></div>
        <div className="absolute top-20 left-1/3 w-1.5 h-1.5 bg-emerald-300 rounded-full" style={{ animation: 'float 5s ease-in-out infinite 0.7s' }}></div>
        <div className="absolute bottom-8 right-8 w-2 h-2 bg-yellow-200 rounded-full" style={{ animation: 'sparkle 2.5s ease-in-out infinite 0.5s' }}></div>

        {/* Decorative stars */}
        <svg className="absolute top-6 right-20 w-4 h-4 text-yellow-400/60" style={{ animation: 'sparkle 2s ease-in-out infinite 0.2s' }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <svg className="absolute bottom-12 left-6 w-3 h-3 text-amber-300/50" style={{ animation: 'sparkle 2.5s ease-in-out infinite 0.8s' }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>

      <div className="relative z-10">

        {/* Header with spectacular typography */}
        <div className="text-center mb-6 pt-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 mb-3">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
            <span className="text-yellow-200 text-[10px] font-bold tracking-[0.3em] uppercase">Prestasi Membanggakan</span>
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
          </div>

          <h3 className="text-xl font-light italic text-white/80 mb-1 tracking-wide">Back to Back</h3>
          <h2 className="shimmer-text text-4xl font-black uppercase tracking-wider drop-shadow-2xl mb-2">
            CHAMPIONS!
          </h2>

          {/* Animated underline */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-yellow-400 rounded-full"></div>
            <svg className="w-5 h-5 text-yellow-400" style={{ animation: 'float 2s ease-in-out infinite' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
            </svg>
            <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-yellow-400 rounded-full"></div>
          </div>
        </div>

        {/* Content Area with spectacular layout */}
        <div className="flex gap-5 items-start">
          {/* Image with premium animated frame */}
          <div className="relative group shrink-0">
            {/* Multi-layer glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-yellow-400/50 via-amber-300/30 to-emerald-400/40 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" style={{ animation: 'glow-pulse 3s ease-in-out infinite' }}></div>
            <div className="absolute -inset-1 bg-gradient-to-bl from-white/20 to-transparent rounded-2xl blur-md"></div>

            {/* Image Container with animated border */}
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-500" style={{ animation: 'glow-pulse 3s ease-in-out infinite' }}>
              <img
                src="/images/champions.webp"
                alt="Champions"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />

              {/* Premium overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10"></div>

              {/* Corner shine effect */}
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-white/30 rotate-45 transform group-hover:translate-x-20 group-hover:translate-y-20 transition-transform duration-700"></div>
            </div>

            {/* Floating Trophy icon */}
            <div
              className="absolute -bottom-3 -right-3 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 p-2.5 rounded-xl shadow-xl border-2 border-white/60"
              style={{ animation: 'float 3s ease-in-out infinite' }}
            >
              <svg className="w-5 h-5 text-brand-green-dark drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
              </svg>
            </div>

            {/* Corner star */}
            <div
              className="absolute -top-2 -left-2 bg-gradient-to-br from-emerald-400 to-teal-500 p-1.5 rounded-full shadow-lg border border-white/50"
              style={{ animation: 'float-reverse 2.5s ease-in-out infinite' }}
            >
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
          </div>

          {/* Text Content with enhanced styling */}
          <div className="flex-1 min-w-0">
            <p className="text-xs leading-relaxed text-white/95 mb-3">
              Tim futsal kebanggaan ini sukses mengamankan gelar <span className="font-black text-yellow-300 drop-shadow-sm">juara futsal se-Kecamatan Pragaan</span> dua kali berturut-turut pada tahun <span className="font-bold">2023</span> dan <span className="font-bold">2024</span>.
            </p>
            <p className="text-[11px] leading-relaxed text-white/70 italic border-l-2 border-yellow-400/50 pl-3">
              Prestasi ini menjadi bukti nyata kualitas pembinaan dan talenta di MI Al-Ghazali.
            </p>

            {/* Enhanced Stats badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-sm text-[10px] font-black text-white py-1.5 px-3 rounded-full border border-yellow-400/30 shadow-lg hover:scale-105 transition-transform cursor-default">
                <svg className="w-3 h-3 text-yellow-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                2x Juara Berturut
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm text-[10px] font-black text-white py-1.5 px-3 rounded-full border border-emerald-400/30 shadow-lg hover:scale-105 transition-transform cursor-default">
                <span className="text-sm">⚽</span>
                Futsal
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm text-[10px] font-black text-white py-1.5 px-3 rounded-full border border-blue-400/30 shadow-lg hover:scale-105 transition-transform cursor-default">
                <span className="text-sm">🏆</span>
                Kec. Pragaan
              </span>
            </div>
          </div>
        </div>
      </div>
    </ContentCard>
  );
}
