import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTask, verifyTaskSubmission } from '../../../api';
import type { Task, TaskAssignee } from '../../../types';
import { ArrowLeft, CheckCircle, XCircle, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminTaskDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null); // assignee id being processed
    const [rejectModal, setRejectModal] = useState<{ isOpen: boolean, assigneeId: number | null }>({ isOpen: false, assigneeId: null });
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        if (id) fetchTask(parseInt(id));
    }, [id]);

    const fetchTask = async (taskId: number) => {
        try {
            const response = await getTask(taskId);
            setTask(response.data.data);
        } catch (error) {
            toast.error('Gagal memuat detail tugas');
            navigate('/dashboard/tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (assigneeId: number, status: 'approved' | 'rejected', feedback?: string) => {
        setActionLoading(assigneeId);
        try {
            await verifyTaskSubmission(assigneeId, { status, admin_feedback: feedback });
            toast.success(status === 'approved' ? 'Tugas disetujui' : 'Tugas ditolak');
            if (task) fetchTask(task.id); // Refresh data
            setRejectModal({ isOpen: false, assigneeId: null });
            setRejectReason('');
        } catch (error) {
            toast.error('Gagal memverifikasi tugas');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!task) return <div className="p-10 text-center">Task not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5 mr-1" /> Kembali
            </button>

            {/* Header Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
                        <p className="text-gray-600 mb-4">{task.description || 'Tidak ada deskripsi'}</p>
                        <div className="flex flex-wrap gap-2 text-sm">
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                Tipe: {task.type.toUpperCase()}
                            </span>
                            {task.deadline && (
                                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full">
                                    Due: {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-gray-50 p-4 rounded-lg self-start">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{task.assignees?.length || 0}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600">
                                {task.assignees?.filter(a => a.status === 'submitted').length || 0}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Submitted</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">
                                {task.assignees?.filter(a => a.status === 'approved').length || 0}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Approved</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-red-600">
                                {task.assignees?.filter(a => a.status === 'rejected').length || 0}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Rejected</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignee List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Daftar Pengumpulan</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Nama Guru</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Waktu Submit</th>
                                <th className="px-6 py-3 font-medium">Bukti / Jawaban</th>
                                <th className="px-6 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {task.assignees?.map((assignee) => (
                                <tr key={assignee.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {assignee.user?.name || 'Unknown User'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={assignee.status} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {assignee.submitted_at
                                            ? new Date(assignee.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {renderSubmissionContent(task.type, assignee)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {assignee.status === 'submitted' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleVerify(assignee.id, 'approved')}
                                                    disabled={actionLoading === assignee.id}
                                                    className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-colors"
                                                    title="Setujui"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setRejectModal({ isOpen: true, assigneeId: assignee.id })}
                                                    disabled={actionLoading === assignee.id}
                                                    className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors"
                                                    title="Tolak"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                        {assignee.status === 'rejected' && (
                                            <span className="text-xs text-red-500 italic">Menunggu perbaikan</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reject Modal */}
            {rejectModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Tolak Tugas</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Berikan alasan penolakan..."
                            className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 mb-4"
                            rows={4}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setRejectModal({ isOpen: false, assigneeId: null })}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => rejectModal.assigneeId && handleVerify(rejectModal.assigneeId, 'rejected', rejectReason)}
                                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
                            >
                                Tolak Tugas
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: 'bg-gray-100 text-gray-700',
        submitted: 'bg-blue-100 text-blue-700',
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status as keyof typeof styles]}`}>
            {status}
        </span>
    );
}

function renderSubmissionContent(type: string, assignee: TaskAssignee) {
    if (assignee.status === 'pending') return <span className="text-gray-400 italic">Belum dikirim</span>;

    if (type === 'simple') return <span className="text-gray-900">Selesai (Klik)</span>;

    if (type === 'text') {
        return (
            <div className="text-gray-900 whitespace-pre-wrap max-w-xs">
                {assignee.submission_content}
            </div>
        );
    }

    if (type === 'upload' && assignee.submission_file_url) {
        return (
            <a
                href={assignee.submission_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
            >
                <ImageIcon className="w-4 h-4" />
                Lihat File
            </a>
        );
    }

    return '-';
}
