import { useEffect, useState } from 'react';
import { getPendingSwapRequests, approveSwapRequest, rejectSwapRequest } from '../../../api';
import { Check, X, Clock, ArrowRightLeft } from 'lucide-react';
import type { SwapRequest } from '../../../types/safe_types';

export default function SwapRequestsIndex() {
    const [requests, setRequests] = useState<SwapRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<number | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await getPendingSwapRequests();
            setRequests(res.data);
        } catch (err) {
            console.error('Error fetching swap requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm('Yakin ingin menyetujui swap ini?')) return;
        setProcessing(id);
        try {
            await approveSwapRequest(id);
            fetchRequests();
        } catch (err) {
            console.error('Error approving swap:', err);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id: number) => {
        const notes = prompt('Alasan penolakan (opsional):');
        setProcessing(id);
        try {
            await rejectSwapRequest(id, notes || undefined);
            fetchRequests();
        } catch (err) {
            console.error('Error rejecting swap:', err);
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ArrowRightLeft className="w-8 h-8 text-brand-green-main" />
                    Permintaan Swap Jadwal
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    {requests.length} permintaan pending
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
                    <ArrowRightLeft size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Tidak ada permintaan swap yang pending saat ini.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div key={request.id} className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                            Pending
                                        </span>
                                        <span className="text-gray-400 text-sm">
                                            #{request.id}
                                        </span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Schedule 1 */}
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                            <div className="text-sm text-blue-600 font-medium mb-2">
                                                {request.requester_teacher?.name}
                                            </div>
                                            <div className="font-semibold text-gray-800">
                                                {request.schedule_one?.subject?.name}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {request.schedule_one?.class_room?.name} •
                                                {request.schedule_one?.day} Jam {request.schedule_one?.slot_number}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center">
                                            <ArrowRightLeft size={24} className="text-gray-400" />
                                        </div>

                                        {/* Schedule 2 */}
                                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 md:col-start-2">
                                            <div className="text-sm text-purple-600 font-medium mb-2">
                                                {request.target_teacher?.name}
                                            </div>
                                            <div className="font-semibold text-gray-800">
                                                {request.schedule_two?.subject?.name}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {request.schedule_two?.class_room?.name} •
                                                {request.schedule_two?.day} Jam {request.schedule_two?.slot_number}
                                            </div>
                                        </div>
                                    </div>

                                    {request.notes && (
                                        <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                            <strong>Catatan:</strong> {request.notes}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleApprove(request.id)}
                                        disabled={processing === request.id}
                                        className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                    >
                                        <Check size={18} />
                                        Setujui
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.id)}
                                        disabled={processing === request.id}
                                        className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        <X size={18} />
                                        Tolak
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
