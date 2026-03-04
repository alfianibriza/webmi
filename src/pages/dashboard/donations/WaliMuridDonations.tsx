import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getDonations, storeDonation, getPublicDonationSettings, getStudentFinancialObligations, payStudentObligation } from '../../../api';
import type { Donation } from '../../../types';
import Modal from '../../../components/Modal';
import toast from 'react-hot-toast';
import {
    CreditCard,
    Plus,
    History,
    Calendar,
    Copy,
    CheckCircle,
    Clock,
    XCircle,
    Wallet,
    Banknote,
    Receipt,
    AlertCircle,
    Upload,
    FileText
} from 'lucide-react';

interface StudentObligation {
    id: number;
    title: string;
    amount: number;
    description?: string;
    status: 'paid' | 'unpaid' | 'pending' | 'paid_verification';
    due_date?: string;
    paid_at?: string;
}

export default function WaliMuridDonations() {
    const { user } = useAuth();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [settings, setSettings] = useState<{
        bank_name?: string;
        account_number?: string;
        account_holder?: string;
        wa_number?: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedObligation, setSelectedObligation] = useState<StudentObligation | null>(null);
    const [paymentSenderName, setPaymentSenderName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'obligations' | 'donations'>('obligations');
    const [obligations, setObligations] = useState<StudentObligation[]>([]);

    const [formData, setFormData] = useState({
        donor_name: user?.name || '',
        transaction_number: '',
        amount: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (user?.name) {
            setFormData(prev => ({ ...prev, donor_name: user.name }));
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [donationsRes, settingsRes, obligationsRes] = await Promise.all([
                getDonations(),
                getPublicDonationSettings(),
                getStudentFinancialObligations().catch(() => ({ data: [] }))
            ]);
            setDonations(donationsRes.data || []);
            setSettings(settingsRes.data || null);
            setObligations(obligationsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.donor_name || !formData.transaction_number || !formData.amount) {
            toast.error('Semua field harus diisi');
            return;
        }

        setIsSaving(true);
        try {
            await storeDonation({
                donor_name: formData.donor_name,
                transaction_number: formData.transaction_number,
                amount: parseInt(formData.amount),
            });

            // Build WhatsApp message
            const nominal = parseInt(formData.amount).toLocaleString('id-ID');
            const message = `Assalamu'alaikum izin konfirmasi bukti transfer senilai Rp ${nominal} dengan no transaksi ${formData.transaction_number} atas nama ${formData.donor_name}`;

            // Get WhatsApp number from settings
            const waNumber = settings?.wa_number || '';

            if (waNumber) {
                // Open WhatsApp with pre-filled message
                const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
                window.open(waUrl, '_blank');
            }

            toast.success('Konfirmasi donasi berhasil dikirim!');
            setShowModal(false);
            setFormData({ donor_name: user?.name || '', transaction_number: '', amount: '' });
            fetchData();
        } catch (error) {
            console.error('Error submitting donation:', error);
            toast.error('Gagal mengirim konfirmasi donasi');
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Nomor rekening disalin!', {
            icon: '📋',
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-amber-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return 'Berhasil';
            case 'rejected': return 'Ditolak';
            default: return 'Diproses';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    const handlePayClick = (obligation: StudentObligation) => {
        setSelectedObligation(obligation);
        setPaymentSenderName(user?.name || '');
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedObligation) return;

        setIsSaving(true);
        try {
            // 1. Update status in backend (mark as paid_verification)
            const formData = new FormData();
            // No image needed anymore

            await payStudentObligation(selectedObligation.id, formData);

            // 2. Redirect to WhatsApp
            const waNumber = settings?.wa_number || '';
            const nominal = parseInt(selectedObligation.amount.toString()).toLocaleString('id-ID');
            const message = `Assalamu'alaikum, saya ingin konfirmasi pembayaran untuk tagihan *${selectedObligation.title}* atas nama siswa *${user?.name}* sebesar *Rp ${nominal}*.\n\nPengirim: ${paymentSenderName}`;

            if (waNumber) {
                const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
                window.open(waUrl, '_blank');
            } else {
                toast.success('Status diperbarui, namun nomor WhatsApp admin belum diatur.');
            }

            toast.success('Konfirmasi berhasil! Menunggu verifikasi admin.');
            setShowPaymentModal(false);
            fetchData();
        } catch (error) {
            console.error('Error submitting payment:', error);
            toast.error('Gagal memproses konfirmasi');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-400 font-medium text-sm animate-pulse">Memuat data donasi...</p>
            </div>
        );
    }

    return (
        <div className="pb-24 max-w-xl mx-auto">


            {/* Bank Info Card - Modern Glassmorphism Style */}
            {settings && (
                <div className="relative overflow-hidden mb-8 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl shadow-lg transform transition-transform duration-500 group-hover:scale-[1.02]"></div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300 opacity-10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>

                    <div className="relative p-6 text-white rounded-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1">Metode Pembayaran</p>
                                <h3 className="text-2xl font-bold">{settings.bank_name || 'Bank Transfer'}</h3>
                            </div>
                            <CreditCard className="w-8 h-8 text-emerald-200 opacity-80" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-emerald-100 text-xs mb-1 opacity-80">Nomor Rekening</p>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-2xl font-bold tracking-wider text-white drop-shadow-sm">
                                        {settings.account_number || '---- ---- ----'}
                                    </span>
                                    {settings.account_number && (
                                        <button
                                            onClick={() => copyToClipboard(settings.account_number || '')}
                                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                                            title="Salin No. Rekening"
                                        >
                                            <Copy size={14} className="text-white" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-white/10 flex justify-between items-end">
                                <div>
                                    <p className="text-emerald-100 text-xs opacity-80">Atas Nama</p>
                                    <p className="font-medium text-lg tracking-wide">{settings.account_holder || '-'}</p>
                                </div>
                                {/* Add Button inside card for better UX */}
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="bg-white text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-50 hover:shadow-xl transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <Plus size={16} strokeWidth={3} />
                                    Konfirmasi Donasi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('obligations')}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${activeTab === 'obligations'
                        ? 'text-emerald-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Tanggungan
                    {activeTab === 'obligations' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('donations')}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${activeTab === 'donations'
                        ? 'text-emerald-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Riwayat Donasi
                    {activeTab === 'donations' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
                {activeTab === 'obligations' ? (
                    <>
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <AlertCircle size={16} className="text-gray-400" />
                            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Daftar Tanggungan</h3>
                        </div>

                        {obligations.length > 0 ? (
                            <div className="grid gap-3 animate-fadeIn">
                                {obligations.map((obligation) => (
                                    <div
                                        key={obligation.id}
                                        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${obligation.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-amber-100 text-amber-600'
                                                    }`}>
                                                    <Receipt size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{obligation.title}</p>
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5 opacity-80">
                                                        {obligation.description || 'Tagihan Sekolah'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide flex items-center gap-1.5 ${obligation.status === 'paid'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : obligation.status === 'paid_verification'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {obligation.status === 'paid' ? 'Lunas' : obligation.status === 'paid_verification' ? 'Verifikasi' : 'Belum Lunas'}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                                <Calendar size={12} />
                                                Jatuh Tempo: {obligation.due_date ? new Date(obligation.due_date).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }) : '-'}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-bold text-gray-800 tabular-nums">
                                                    Rp {parseInt(obligation.amount?.toString() || '0').toLocaleString('id-ID')}
                                                </p>
                                                {(obligation.status === 'unpaid' || obligation.status === 'pending') && (
                                                    <button
                                                        onClick={() => handlePayClick(obligation)}
                                                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-1.5"
                                                    >
                                                        <Upload size={12} />
                                                        Bayar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-emerald-300" />
                                </div>
                                <p className="font-medium text-gray-600">Tidak ada tanggungan</p>
                                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                                    Anda tidak memiliki tanggungan pembayaran saat ini.
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    // Recent Donations List
                    <>
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <History size={16} className="text-gray-400" />
                            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Riwayat Donasi</h3>
                        </div>

                        {donations.length > 0 ? (
                            <div className="grid gap-3 animate-fadeIn">
                                {donations.map((donation) => (
                                    <div
                                        key={donation.id}
                                        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${donation.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                                                    donation.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                        'bg-amber-100 text-amber-600'
                                                    }`}>
                                                    {donation.status === 'approved' ? <Banknote size={20} /> : <Receipt size={20} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">Donasi / Pembayaran</p>
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5 opacity-80">
                                                        ID: {donation.transaction_number || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide flex items-center gap-1.5 ${getStatusColor(donation.status)}`}>
                                                {getStatusIcon(donation.status)}
                                                {getStatusText(donation.status)}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                                <Calendar size={12} />
                                                {new Date(donation.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <p className="font-bold text-gray-800 tabular-nums">
                                                Rp {parseInt(donation.amount?.toString() || '0').toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                    <Wallet className="w-8 h-8 text-emerald-300" />
                                </div>
                                <p className="font-medium text-gray-600">Belum ada riwayat</p>
                                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                                    Riwayat pembayaran dan donasi Anda akan muncul di sini.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Donation Form Modal - Repurposed as Bottom Sheet style for mobile if possible, but keeping Modal for now */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title="Konfirmasi Pembayaran"
                maxWidth="md"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex gap-3 items-start">
                        <div className="bg-amber-100 p-1.5 rounded-full shrink-0 mt-0.5">
                            <Clock size={16} className="text-amber-600" />
                        </div>
                        <div>
                            <strong className="block mb-1 font-semibold">Penting!</strong>
                            Pastikan Anda telah melakukan transfer ke rekening sekolah sebelum mengisi formulir ini.
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Nama Pengirim</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <CreditCard size={18} />
                                </span>
                                <input
                                    type="text"
                                    value={formData.donor_name}
                                    onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-colors text-sm font-medium text-gray-800 placeholder-gray-400"
                                    placeholder="Nama pemilik rekening"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Nomor Transaksi</label>
                            <input
                                type="text"
                                value={formData.transaction_number}
                                onChange={(e) => setFormData({ ...formData, transaction_number: e.target.value })}
                                className="block w-full px-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-colors text-sm font-medium font-mono text-gray-800 placeholder-gray-400"
                                placeholder="TRX-12345678"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Nominal (Rp)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="block w-full px-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-colors text-lg font-bold text-gray-800 placeholder-gray-400"
                                placeholder="0"
                                min="1000"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-4 py-2.5 border border-gray-200 bg-white text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-70 disabled:shadow-none"
                        >
                            {isSaving ? 'Mengirim...' : 'Kirim Konfirmasi'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Payment Modal */}
            <Modal
                show={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Konfirmasi Pembayaran Tanggungan"
                maxWidth="md"
            >
                <form onSubmit={handlePaymentSubmit} className="space-y-5">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex gap-3 items-start">
                        <div className="bg-blue-100 p-1.5 rounded-full shrink-0 mt-0.5">
                            <FileText size={16} className="text-blue-600" />
                        </div>
                        <div>
                            <strong className="block mb-1 font-semibold">Konfirmasi Pembayaran</strong>
                            Pastikan Anda telah melakukan transfer ke rekening sekolah kemudian konfirmasi bukti bayar.
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Tagihan</label>
                            <div className="bg-gray-100 px-4 py-3 rounded-xl text-gray-700 font-medium text-sm">
                                {selectedObligation?.title}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Nominal</label>
                            <div className="bg-gray-100 px-4 py-3 rounded-xl text-gray-900 font-bold text-lg">
                                Rp {selectedObligation ? parseInt(selectedObligation.amount?.toString()).toLocaleString('id-ID') : '0'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Nama Pengirim (Rekening)</label>
                            <input
                                type="text"
                                value={paymentSenderName}
                                onChange={(e) => setPaymentSenderName(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm font-medium text-gray-800 placeholder-gray-400"
                                placeholder="Nama pemilik rekening pengirim"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setShowPaymentModal(false)}
                            className="flex-1 px-4 py-2.5 border border-gray-200 bg-white text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 shadow-lg shadow-green-200 transition-all disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {isSaving ? 'Memproses...' : (
                                <>
                                    <span className="font-bold">Lanjut Konfirmasi</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

        </div>
    );
}
