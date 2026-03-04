import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFinancialObligations, deleteFinancialObligation } from '../../../api';
import { Trash2, Eye, Calendar, CheckCircle, XCircle, Pencil } from 'lucide-react';

interface Obligation {
    id: number;
    title: string;
    amount: number;
    due_date: string;
    student_obligations_count: number;
    paid_count: number;
    created_at: string;
}

export default function ObligationsIndex() {
    const [obligations, setObligations] = useState<Obligation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchObligations();
    }, []);

    const fetchObligations = async () => {
        try {
            const response = await getFinancialObligations();
            setObligations(response.data);
        } catch (error) {
            console.error('Error fetching obligations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data tanggungan ini?')) return;

        try {
            await deleteFinancialObligation(id);
            setObligations(obligations.filter(o => o.id !== id));
        } catch (error) {
            console.error('Error deleting obligation:', error);
            alert('Gagal menghapus data tanggungan');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
            </div>
        );
    }

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-gray-500 text-sm font-medium uppercase">Total Dana Terkumpul</div>
                        <div className="mt-1 text-2xl font-bold text-green-700">
                            Rp {obligations.reduce((sum, obs) => sum + (obs.amount * obs.paid_count), 0).toLocaleString('id-ID')}
                        </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="text-gray-500 text-sm font-medium uppercase">Total Dana Belum Terkumpul</div>
                        <div className="mt-1 text-2xl font-bold text-red-700">
                            Rp {obligations.reduce((sum, obs) => sum + (obs.amount * (obs.student_obligations_count - obs.paid_count)), 0).toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Daftar Tanggungan Keuangan</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggungan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sudah Lunas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Belum Lunas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jatuh Tempo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {obligations.length > 0 ? obligations.map((obligation) => (
                                <tr key={obligation.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {obligation.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                        Rp {Number(obligation.amount).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center text-green-600 font-medium">
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            {obligation.paid_count} Siswa
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center text-red-500 font-medium">
                                            <XCircle className="w-4 h-4 mr-1" />
                                            {obligation.student_obligations_count - obligation.paid_count} Siswa
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {obligation.due_date ? new Date(obligation.due_date).toLocaleDateString('id-ID') : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Link
                                            to={`/dashboard/financial/${obligation.id}`}
                                            className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Lihat Detail"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            to={`/dashboard/financial/${obligation.id}/edit`}
                                            className="inline-flex items-center justify-center p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(obligation.id)}
                                            className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        Belum ada data tanggungan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
