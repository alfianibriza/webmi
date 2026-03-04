import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFinancialObligation, verifyStudentObligation, getClassRooms } from '../../../api';
import { ArrowLeft, CheckCircle, XCircle, Clock, Calendar, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface StudentObligation {
    id: number;
    student: {
        id: number;
        name: string;
        class_room: { id: number; name: string; grade: number } | null;
    };
    status: string;
    proof_image: string | null;
    paid_at: string | null;
    verified_at: string | null;
}

interface Obligation {
    id: number;
    title: string;
    amount: number;
    due_date: string;
    description: string;
    created_at: string;
}

export default function ShowFinancialObligation() {
    const { id } = useParams();
    const [obligation, setObligation] = useState<Obligation | null>(null);
    const [records, setRecords] = useState<StudentObligation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [selectedClassroom, setSelectedClassroom] = useState('all');

    const [selectedProof, setSelectedProof] = useState<string | null>(null);

    useEffect(() => {
        getClassRooms().then(res => setClassrooms(res.data));
    }, []);

    useEffect(() => {
        if (id) fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            const response = await getFinancialObligation(parseInt(id!));
            setObligation(response.data.obligation);
            setRecords(response.data.records);
        } catch (error) {
            console.error('Error fetching detail:', error);
            toast.error('Gagal memuat detail data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (recordId: number, action: 'approve' | 'reject') => {
        try {
            await verifyStudentObligation(recordId, action);
            toast.success(action === 'approve' ? 'Pembayaran diverifikasi' : 'Pembayaran ditolak/reset');
            // Update local state
            setRecords(prev => prev.map(r => {
                if (r.id === recordId) {
                    return {
                        ...r,
                        status: action === 'approve' ? 'paid' : 'pending',
                        verified_at: action === 'approve' ? new Date().toISOString() : null
                    };
                }
                return r;
            }));
            if (selectedProof) setSelectedProof(null); // Close modal
        } catch (error) {
            console.error('Error verifying:', error);
            toast.error('Gagal memproses');
        }
    };

    const filteredRecords = records.filter(r => {
        const matchesSearch = r.student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesClassroom = selectedClassroom === 'all' ||
            (r.student.class_room?.id.toString() === selectedClassroom);

        return matchesSearch && matchesStatus && matchesClassroom;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Lunas</span>;
            case 'paid_verification':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Perlu Verifikasi</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">Belum Lunas</span>;
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!obligation) return <div className="p-8 text-center">Data tidak ditemukan</div>;

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Link to="/dashboard/donations" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{obligation.title}</h2>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center">Rp {Number(obligation.amount).toLocaleString('id-ID')}</span>
                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {obligation.due_date ? new Date(obligation.due_date).toLocaleDateString('id-ID') : 'Tanpa Tenggat'}</span>
                    </div>
                </div>
            </div>

            {/* Proof Modal */}
            {selectedProof && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setSelectedProof(null)}>
                    <div className="bg-white p-2 rounded-lg max-w-lg max-h-screen overflow-auto" onClick={e => e.stopPropagation()}>
                        <img src={`/storage/${selectedProof}`} alt="Proof" className="max-w-full h-auto rounded" />
                        <div className="mt-2 text-center">
                            <button onClick={() => setSelectedProof(null)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Tutup</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 justify-end items-center">
                    <select
                        value={selectedClassroom}
                        onChange={e => setSelectedClassroom(e.target.value)}
                        className="rounded-lg border-gray-300 text-sm focus:ring-brand-green-main focus:border-brand-green-main"
                    >
                        <option value="all">Semua Kelas</option>
                        {classrooms.map((room: any) => (
                            <option key={room.id} value={room.id}>
                                Kelas {room.grade} {room.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="rounded-lg border-gray-300 text-sm focus:ring-brand-green-main focus:border-brand-green-main"
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Belum Lunas</option>
                        <option value="paid_verification">Menunggu Verifikasi</option>
                        <option value="paid">Lunas</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Siswa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRecords.map(record => (
                                <tr key={record.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {record.student.class_room
                                            ? `Kelas ${record.student.class_room.grade} ${record.student.class_room.name}`
                                            : '-'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {record.status === 'paid_verification' && (
                                            <>
                                                <button
                                                    onClick={() => handleVerify(record.id, 'approve')}
                                                    className="text-green-600 hover:text-green-800"
                                                    title="Terima"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(record.id, 'reject')}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Tolak"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                        {record.status === 'paid' && (
                                            <span className="text-gray-400 text-xs flex items-center">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Terverifikasi
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredRecords.length === 0 && (
                                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Tidak ada data siswa.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
