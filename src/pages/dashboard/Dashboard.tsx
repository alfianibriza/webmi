import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TeacherDashboard from './TeacherDashboard';
import ParentDashboard from './ParentDashboard';
import BendaharaDashboard from './BendaharaDashboard'; // Import BendaharaDashboard
import TUDashboard from './TUDashboard';
import { useAuth } from '../../contexts/AuthContext';
import type { DashboardStats } from '../../types/safe_types';
import { FileText, Users, Image as ImageIcon, Award } from 'lucide-react';
import { getStorageUrl } from '../../utils';
import { getDashboardStats } from '../../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-green-main"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="h-8 w-8 bg-brand-green-light rounded-full opacity-20 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect or show alternative for other roles if they somehow login
  if (user?.role === 'siswa' || user?.role === 'wali_murid') {
    return <ParentDashboard />;
  }
  if (user?.role === 'guru') {
    return <TeacherDashboard />;
  }
  if (user?.role === 'bendahara') {
    return <BendaharaDashboard />;
  }
  if (user?.role === 'tu') {
    return <TUDashboard />;
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Dashboard Informasi
          </h1>
          <p className="text-gray-500 mt-1">Selamat datang, <span className="font-semibold text-brand-green-main">{user?.name}</span>!</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-gray-600">Sistem Informasi Aktif</span>
        </div>
      </div>

      {/* Stats Cards - Simplified for Info Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/dashboard/post">
          <StatCard
            title="Total Berita"
            value={stats?.posts_count || 0}
            icon={<FileText className="w-6 h-6" />}
            gradient="from-blue-500 to-blue-600"
            delay={0}
          />
        </Link>
        <Link to="/dashboard/media">
          <StatCard
            title="Total Media"
            value={(stats as any)?.media_count || 0}
            icon={<ImageIcon className="w-6 h-6" />}
            gradient="from-purple-500 to-fuchsia-600"
            delay={100}
          />
        </Link>
        <Link to="/dashboard/achievements">
          <StatCard
            title="Total Prestasi"
            value={(stats as any)?.achievements_count || 0}
            icon={<Award className="w-6 h-6" />}
            gradient="from-orange-400 to-amber-500"
            delay={200}
          />
        </Link>
        {user?.role === 'admin' && (
          <Link to="/dashboard/users">
            <StatCard
              title="Staff & User"
              value={(stats as any)?.users_count || 0}
              icon={<Users className="w-6 h-6" />}
              gradient="from-emerald-500 to-teal-600"
              delay={300}
            />
          </Link>
        )}
      </div>

      {/* Recent Posts Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">Berita Terbaru</h2>
          <Link to="/dashboard/post" className="text-sm font-medium text-brand-green-main hover:text-brand-green-dark transition-colors">
            Lihat Semua
          </Link>
        </div>

        {stats?.recent_posts && stats.recent_posts.length > 0 ? (
          <div className="space-y-4">
            {stats.recent_posts.map((post) => (
              <div key={post.id} className="group flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0 shadow-sm">
                  {post.image ? (
                    <img
                      src={getStorageUrl(post.image)}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate group-hover:text-brand-green-main transition-colors">{post.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    {formatDate(post.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada berita yang dipublish.</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}

function StatCard({ title, value, icon, gradient, delay = 0 }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800 tracking-tight">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shadow-gray-200`}>
        {icon}
      </div>
    </div>
  );
}
