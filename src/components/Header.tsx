import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Menu } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative w-full max-w-md mx-auto bg-white/0 pt-6 px-4 pb-2 z-50">
      {/* Logo Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-600">Situs Resmi,</p>
          <h1 className="text-2xl font-black text-brand-green-dark leading-tight">MI AL-GHAZALI</h1>
          <p className="text-xs font-extrabold text-brand-orange">Rombasan Pragaan Sumenep</p>
        </div>
        <div className="w-12 h-12">
          <img src="/images/logo.webp" alt="Logo MI Al-Ghazali" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Search and Menu Bar */}
      <div className="flex items-center gap-2 relative">
        <Link to="/login" className="w-10 h-10 flex items-center justify-center bg-brand-orange-main rounded-xl shadow-sm text-white shrink-0 hover:bg-orange-600 transition">
          <User className="w-6 h-6" />
        </Link>

        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari ..."
            className="w-full pl-10 pr-12 py-2 rounded-xl border-none ring-0 focus:ring-0 bg-brand-teal-light text-white placeholder-white/80 font-medium shadow-sm"
          />

          {/* Settings/Filter Icon inside Input (Right) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:opacity-80 transition"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl z-30 py-4 px-5 transition-all duration-200 border border-white/50 ring-1 ring-black/5">
              <div className="flex flex-col gap-3 text-brand-green-dark font-bold text-sm">
                <Link to="/" className="hover:text-brand-orange-main transition">Beranda</Link>
                <Link to="/profil-madrasah" className="hover:text-brand-orange-main transition">Profile</Link>
                <Link to="/post" className="hover:text-brand-orange-main transition">Post</Link>


                {/* Kesiswaan Sub-menu */}
                <Link to="/kesiswaan" className="hover:text-brand-orange-main transition">Kesiswaan</Link>

                <Link to="/sarpras" className="hover:text-brand-orange-main transition">Sarpras</Link>
                <Link to="/pmb" className="hover:text-brand-orange-main transition">PMB</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
