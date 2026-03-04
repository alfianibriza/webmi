import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  School,
  Users,
  ChevronDown,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import MobileDashboardLayout from './MobileDashboardLayout';

export default function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Academic Year Logic Removed for Information-Only Mode */
  // const [activeAcademicYear, setActiveAcademicYear] = useState<{ id: number, name: string } | null>(null);
  // const [academicYears, setAcademicYears] = useState<{ id: number; name: string }[]>([]);

  // useEffect(() => {
  //   getActiveAcademicYear()
  //     .then(response => setActiveAcademicYear(response.data))
  //     .catch(err => console.error("Failed to fetch active academic year", err));
  //   if (user?.role === 'admin' || user?.role === 'tu' || user?.role === 'kepala') {
  //     getAcademicYears()
  //       .then(response => setAcademicYears(response.data))
  //       .catch(err => console.error("Failed to fetch academic years", err));
  //   }
  // }, [user]);

  // const handleAcademicYearChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const newYearId = parseInt(e.target.value);
  //   if (!newYearId) return;
  //   try {
  //     await setActiveAcademicYearApi(newYearId);
  //     window.location.reload(); 
  //   } catch (error) {
  //     console.error("Failed to set active academic year", error);
  //     alert("Gagal mengubah tahun ajaran aktif.");
  //   }
  // };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);
  const isExactActive = (path: string) => location.pathname === path;

  const toggleDropdown = (name: string) => {
    setOpenDropdowns(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const isDropdownOpen = (name: string) => openDropdowns.includes(name);

  // Icons
  const Icons = {
    Dashboard: <LayoutDashboard className="w-5 h-5" />,
    Post: <FileText className="w-5 h-5" />,
    Media: <ImageIcon className="w-5 h-5" />,
    School: <School className="w-5 h-5" />,
    Users: <Users className="w-5 h-5" />,
    ChevronDown: <ChevronDown className="w-4 h-4" />,
    Settings: <Settings className="w-5 h-5" />,
    LogOut: <LogOut className="w-5 h-5" />,
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-4">
        <p className="text-gray-600">Terjadi kesalahan memuat data pengguna.</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
        >
          Logout / Login Ulang
        </button>
      </div>
    );
  }

  // SPECIAL CASE: For 'guru', 'wali_murid', or 'siswa' role on any dashboard route, provide the mobile frame layout.
  if ((user.role === 'guru' || user.role === 'wali_murid' || user.role === 'siswa') && location.pathname.startsWith('/dashboard')) {
    return <MobileDashboardLayout user={user} />;
  }

  const renderSidebarContent = () => (
    <>
      {/* Dashboard - All roles */}
      <SidebarLink to="/dashboard" active={isExactActive('/dashboard')} icon={Icons.Dashboard}>
        Dashboard
      </SidebarLink>

      {/* Non-siswa/wali_murid/bendahara menu items */}
      {user?.role !== 'siswa' && user?.role !== 'wali_murid' && user?.role !== 'bendahara' && (
        <>
          <SidebarLink to="/dashboard/post" active={isActive('/dashboard/post')} icon={Icons.Post}>
            Post
          </SidebarLink>

          <SidebarLink to="/dashboard/media" active={isActive('/dashboard/media')} icon={Icons.Media}>
            Pustaka Media
          </SidebarLink>

          {/* Admin and TU only items */}
          {(user?.role === 'admin' || user?.role === 'tu' || user?.role === 'kepala') && (
            <>
              {/* Profil Madrasah Dropdown */}
              <SidebarDropdown
                label="Profil Madrasah"
                icon={Icons.School}
                isOpen={isDropdownOpen('profil')}
                onToggle={() => toggleDropdown('profil')}
                active={isActive('/dashboard/profile') || isActive('/dashboard/achievements') || isActive('/dashboard/philosophy') || isActive('/dashboard/extracurriculars') || isActive('/dashboard/sarpras')}
              >

                <SidebarDropdownLink to="/dashboard/profile/sejarah" active={isActive('/dashboard/profile/sejarah')}>
                  Sejarah
                </SidebarDropdownLink>
                <SidebarDropdownLink to="/dashboard/profile/proker_kepala" active={isActive('/dashboard/profile/proker_kepala')}>
                  Proker Kepala
                </SidebarDropdownLink>
                <SidebarDropdownLink to="/dashboard/profile/visi" active={isActive('/dashboard/profile/visi')}>
                  Visi Misi
                </SidebarDropdownLink>
                <SidebarDropdownLink to="/dashboard/achievements" active={isActive('/dashboard/achievements')}>
                  Prestasi
                </SidebarDropdownLink>
                <SidebarDropdownLink to="/dashboard/philosophy" active={isActive('/dashboard/philosophy')}>
                  Filosofi Logo
                </SidebarDropdownLink>
                <SidebarDropdownLink to="/dashboard/extracurriculars" active={isActive('/dashboard/extracurriculars')}>
                  Ekstrakurikuler
                </SidebarDropdownLink>
                <SidebarDropdownLink to="/dashboard/sarpras" active={isActive('/dashboard/sarpras')}>
                  Sarpras
                </SidebarDropdownLink>
              </SidebarDropdown>
            </>
          )}

          {/* Admin Only - Manajemen Akun */}
          {user?.role === 'admin' && (
            <SidebarLink to="/dashboard/users" active={isActive('/dashboard/users')} icon={Icons.Users}>
              Manajemen Akun
            </SidebarLink>
          )}
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-transparent flex relative">
      {/* Static Background Elements - Clean & Bright */}
      <div className="animated-bg-container"></div>
      <div className="shimmer-overlay"></div>

      {/* Sidebar Desktop */}
      {/* Safety check: Hide sidebar completely for mobile-first roles even on desktop view */}
      {user.role !== 'wali_murid' && user.role !== 'siswa' && user.role !== 'guru' && (
        <aside className="hidden md:flex flex-col w-72 bg-white/80 backdrop-blur-md h-screen sticky top-0 z-20 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)] border-r border-white/50 transform transition-transform duration-300">
          <div className="flex items-center justify-start h-20 px-6">
            <Link to="/" className="flex items-center gap-3 transform group hover:scale-105 transition-transform duration-300">
              <img src="/images/logo.webp" alt="MI Al-Ghazali" className="h-10 w-auto drop-shadow-md" />
              <div className="flex flex-col">
                <span className="text-xl font-black text-brand-green-main tracking-tight leading-none group-hover:text-brand-green-dark transition-colors">MIALOVE</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-widest leading-none">DIGITAL SYSTEM</span>
              </div>
            </Link>
          </div>
          <div className="flex-1 overflow-y-scroll py-4 space-y-2 px-3 no-scrollbar hover:pr-1 hover:custom-scrollbar transition-all">
            {renderSidebarContent()}
          </div>
          {/* User Profile in Sidebar Bottom */}
          <div className="p-4 border-t border-gray-100/50 backdrop-blur-sm bg-white/30">
            <div className="flex items-center gap-3 bg-white/60 p-2.5 rounded-2xl shadow-sm border border-white/50 backdrop-blur-md">
              {/* Profile Photo */}
              <div className="flex-shrink-0 relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-20 animate-pulse"></div>
                {user.profile_photo_url ? (
                  <img
                    src={user.profile_photo_url}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm relative z-10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-green-main to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm relative z-10 border-2 border-white">
                    {user.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-800 truncate leading-tight">{user.name}</p>
                <p className="text-[10px] font-medium text-brand-green-main truncate bg-brand-green-main/10 px-2 py-0.5 rounded-full inline-block mt-1">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Sidebar Overlay */}
      {showingNavigationDropdown && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowingNavigationDropdown(false)}>
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-sm shadow-xl transition-transform duration-300 ease-in-out transform md:hidden ${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/">
            <img src="/images/logo.webp" alt="MI Al-Ghazali" className="h-8 w-auto" />
          </Link>
          <button onClick={() => setShowingNavigationDropdown(false)} className="text-gray-500 focus:outline-none">
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {renderSidebarContent()}
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden z-10">
        {/* Top Header */}
        <header className="flex items-center justify-between py-4 px-6 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
          <button
            className="text-gray-500 focus:outline-none md:hidden"
            onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>



          <div className="flex-1 px-4 flex justify-end gap-3">
            {/* Academic Year Filter / Badge */}
            {/* Academic Year Filter Removed */}
            <NotificationBell />
            <div className="relative" ref={settingsDropdownRef}>
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green-main"
                title="Pengaturan"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>

              {showSettingsDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard/profile-settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowSettingsDropdown(false)}
                  >
                    <User className="w-4 h-4" />
                    Pengaturan Profil
                  </Link>
                  <button
                    onClick={() => {
                      setShowSettingsDropdown(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

// Sidebar Link Component
interface SidebarLinkProps {
  to: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SidebarLink({ to, active, icon, children }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 relative overflow-hidden ${active
        ? 'bg-gradient-to-r from-brand-green-main to-brand-teal text-white shadow-md shadow-brand-green-main/30 translate-x-1'
        // Inactive State
        : 'text-gray-500 hover:bg-white hover:text-brand-green-main hover:shadow-sm hover:translate-x-1'
        }`}
    >
      {/* Active Indicator Glow */}
      {active && (
        <div className="absolute inset-0 bg-white opacity-10 blur-md"></div>
      )}

      <span className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className="relative z-10">{children}</span>

      {/* Hover Accessnt for Inactive */}
      {!active && (
        <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-brand-green-main/30">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </div>
      )}
    </Link>
  );
}

// Sidebar Dropdown Component
interface SidebarDropdownProps {
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  active: boolean;
  children: React.ReactNode;
}

function SidebarDropdown({ label, icon, isOpen, onToggle, active, children }: SidebarDropdownProps) {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 group ${active
          ? 'bg-brand-green-main/5 text-brand-green-main shadow-sm ring-1 ring-brand-green-main/20'
          : 'text-gray-500 hover:bg-white hover:text-gray-800 hover:shadow-sm'
          }`}
      >
        <div className="flex items-center gap-3">
          <span className={`transition-transform duration-300 ${active || isOpen ? 'scale-110 text-brand-green-main' : 'group-hover:scale-110'}`}>
            {icon}
          </span>
          {label}
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-green-main' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50 py-2 ml-4 space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// Sidebar Dropdown Link Component
interface SidebarDropdownLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

function SidebarDropdownLink({ to, active, children }: SidebarDropdownLinkProps) {
  return (
    <Link
      to={to}
      className={`block relative pl-10 pr-4 py-2.5 text-xs font-semibold rounded-r-xl transition-all duration-200 ${active
        ? 'text-brand-green-main bg-brand-green-main/10 border-l-4 border-brand-green-main'
        : 'text-gray-500 hover:text-brand-green-main hover:bg-brand-green-main/5 hover:pl-11'
        }`}
    >
      {children}
    </Link>
  );
}
