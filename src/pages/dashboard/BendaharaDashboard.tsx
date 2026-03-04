import React, { useEffect, useState } from 'react';
import { getBendaharaDashboardStats } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { HandCoins, Receipt, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { Link } from 'react-router-dom';

interface BendaharaStats {

    donations: {
        total_amount: number;
        pending_count: number;
    };
    financial_obligations: {
        total_collected: number;
        pending_count: number;
    };
}

export default function BendaharaDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<BendaharaStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getBendaharaDashboardStats();
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-green-main"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">
                        Dashboard Bendahara
                    </h1>
                    <p className="text-gray-500 mt-1">Selamat datang kembali, <span className="font-semibold text-brand-green-main">{user?.name}</span>!</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-bold text-gray-600">Sistem Keuangan Aktif</span>
                </div>
            </div>

            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">



            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <StatCard
                    title="Keuangan Masuk"
                    value={stats?.financial_obligations.total_collected || 0}
                    subtitle="Pembayaran Tagihan"
                    icon={<Receipt className="w-6 h-6" />}
                    color="blue"
                    url="/dashboard/financial/obligations"
                    delay={300}
                />
                <StatCard
                    title="Total Donasi"
                    value={stats?.donations.total_amount || 0}
                    subtitle="Donasi Terverifikasi"
                    icon={<HandCoins className="w-6 h-6" />}
                    color="emerald"
                    url="/dashboard/donations"
                    delay={400}
                />
            </div>
        </div>
    );
}

// Styled Components
interface StatCardProps {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ReactNode;
    color: 'pink' | 'orange' | 'blue' | 'emerald';
    url: string;
    delay?: number;
}

function StatCard({ title, value, subtitle, icon, color, url, delay = 0 }: StatCardProps) {
    const colors = {
        pink: {
            bg: 'bg-pink-50',
            border: 'border-pink-100',
            text: 'text-pink-900',
            subtext: 'text-pink-600',
            iconBg: 'bg-pink-500',
            iconText: 'text-white'
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            text: 'text-orange-900',
            subtext: 'text-orange-600',
            iconBg: 'bg-orange-500',
            iconText: 'text-white'
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            text: 'text-blue-900',
            subtext: 'text-blue-600',
            iconBg: 'bg-blue-500',
            iconText: 'text-white'
        },
        emerald: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            text: 'text-emerald-900',
            subtext: 'text-emerald-600',
            iconBg: 'bg-emerald-500',
            iconText: 'text-white'
        }
    };

    const theme = colors[color];

    return (
        <Link to={url} className="block group">
            <div
                className={`${theme.bg} rounded-3xl p-6 border ${theme.border} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden`}
                style={{ animationDelay: `${delay}ms` }}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${theme.iconBg} ${theme.iconText} shadow-lg shadow-black/5 group-hover:scale-110 transition-transform`}>
                        {icon}
                    </div>
                    <div className={`p-2 rounded-full bg-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <ChevronRight className={`w-4 h-4 ${theme.subtext}`} />
                    </div>
                </div>
                <div>
                    <h3 className={`font-semibold text-sm ${theme.subtext} mb-1 opacity-80 uppercase tracking-wider`}>{title}</h3>
                    <p className={`text-2xl font-black ${theme.text} tracking-tight`}>
                        {formatCurrency(value)}
                    </p>
                    <p className={`text-xs ${theme.subtext} mt-2 font-medium opacity-70`}>{subtitle}</p>
                </div>
            </div>
        </Link>
    );
}
