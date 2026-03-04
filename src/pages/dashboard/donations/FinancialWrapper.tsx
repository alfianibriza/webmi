import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom'; // Assuming routing might be used or just local state
import { Heart, Wallet, Plus, Settings } from 'lucide-react';
import DonationsIndex from './Index';
import ObligationsIndex from './ObligationsIndex';
import { useAuth } from '../../../contexts/AuthContext';

// We rename the import of the original DonationsIndex to avoid conflict if we were lazy loading,
// but since we are importing it directly, we can use an alias in import if needed.
// Actually, I can just use the component.

export default function FinancialWrapper() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'donations' | 'obligations'>('obligations');

    // If user is not admin, logic might differ, 
    // currently DonationsIndex handles logic for students.
    // ObligationsIndex handles logic for Admin.

    // Wait, if student, what do they see? 
    // Student sees "Tagihan Saya" (StudentFinancial/Index) and "Donasi" (Voluntary).
    // The user request was "di menu Approval Donasi tambah navbar". Approval Donasi is Admin specific.

    // So this Wrapper is primarily for Admin View.

    if (user?.role !== 'admin' && user?.role !== 'guru' && user?.role !== 'bendahara') {
        // For student/parent, we might rely on the sidebars or a different view.
        // But if they access /dashboard/donations, they get DonationsIndex which handles student logic.
        // This wrapper might be needed if student also needs tabs?
        // "Laporan Keuangan" implies Admin Reports.
        // For now, let's keep it simple for Admin.
        return <DonationsIndex />;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold leading-tight text-gray-800 flex items-center gap-2">
                        <Wallet className="w-8 h-8 text-brand-green-main" />
                        Keuangan & Donasi
                    </h2>
                    <p className="text-gray-500 mt-1">Kelola laporan keuangan dan donasi masuk</p>
                </div>
                <div>
                    {activeTab === 'obligations' && (
                        <Link
                            to="/dashboard/financial/create"
                            className="flex items-center px-4 py-2 bg-brand-green-main text-white rounded-md hover:bg-brand-green-dark text-sm font-medium"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Tanggungan
                        </Link>
                    )}
                    {activeTab === 'donations' && (
                        <Link
                            to="/dashboard/donations/settings"
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Pengaturan Donasi
                        </Link>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('obligations')}
                        className={`
              whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === 'obligations'
                                ? 'border-brand-green-main text-brand-green-main'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
            `}
                    >
                        <Wallet className="w-4 h-4 mr-2" />
                        Laporan Keuangan (Tanggungan)
                    </button>

                    <button
                        onClick={() => setActiveTab('donations')}
                        className={`
              whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === 'donations'
                                ? 'border-brand-green-main text-brand-green-main'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
            `}
                    >
                        <Heart className="w-4 h-4 mr-2" />
                        Donasi Sukarela
                    </button>
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'obligations' ? <ObligationsIndex /> : <DonationsIndex />}
            </div>
        </div>
    );
}
