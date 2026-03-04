import { Link } from 'react-router-dom';

export default function SectionNavigation() {
  return (
    <div className="w-full max-w-md mx-auto mt-6 flex items-center gap-2 px-4 text-brand-orange-main font-bold text-sm">
      <div className="flex-none flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-brand-orange-main">
          <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
        </svg>
        <span className="text-3xl italic font-bold whitespace-nowrap">Beranda</span>
      </div>

      <div className="flex-1"></div>

      <Link to="/pmb" className="w-[60%] gradient-yellow text-brand-green-dark font-semibold py-2 px-4 rounded-xl shadow-sm text-sm text-center block">
        Informasi PMB
      </Link>
    </div>
  );
}

export function SectionScrollNav() {
  return (
    <div className="w-full max-w-md mx-auto mt-4 flex items-center gap-2 px-4 overflow-hidden">
      <span className="text-brand-orange-main font-bold">&lt;</span>
      <div className="flex-1 flex gap-4 overflow-x-auto no-scrollbar whitespace-nowrap text-brand-orange-main font-semibold text-sm">
        <Link to="/profil-madrasah?tab=sejarah" className="hover:underline">Sejarah</Link>
        <Link to="/profil-madrasah?tab=proker-kepala" className="hover:underline">Proker Kepala</Link>
        <Link to="/profil-madrasah?tab=visi-misi" className="hover:underline">Visi Misi</Link>
        <Link to="/profil-madrasah?tab=ptk" className="hover:underline">PTK</Link>
        <Link to="/profil-madrasah?tab=filosofi-logo" className="hover:underline">Filosofi Logo</Link>
      </div>
      <span className="text-brand-orange-main font-bold">&gt;</span>
    </div>
  );
}
