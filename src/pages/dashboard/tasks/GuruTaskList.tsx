import React, { useEffect, useState } from 'react';
import { getGuruTasks, submitTask } from '../../../api';
import type { TaskAssignee } from '../../../types';
import { ClipboardCheck, Upload, FileText, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuruTaskList() {
    const [tasks, setTasks] = useState<TaskAssignee[]>([]);
    const [loading, setLoading] = useState(true);

    // Submit Modal State
    const [selectedTask, setSelectedTask] = useState<TaskAssignee | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [textContent, setTextContent] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await getGuruTasks();
            setTasks(response.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Gagal memuat tugas');
        } finally {
            setLoading(false);
        }
    };

    const openSubmitModal = (assignee: TaskAssignee) => {
        setSelectedTask(assignee);
        setTextContent(assignee.submission_content || '');
        setFile(null);
    };

    const handleSimpleSubmit = async (assigneeId: number) => {
        if (!window.confirm('Tandai tugas ini sebagai selesai?')) return;
        try {
            await submitTask(assigneeId, { submission_content: 'done' });
            toast.success('Tugas selesai');
            fetchTasks();
        } catch (error) {
            toast.error('Gagal mengirim tugas');
        }
    };

    const handleDetailedSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask) return;

        setSubmitLoading(true);
        try {
            let data: any;
            if (selectedTask.task?.type === 'text') {
                data = { submission_content: textContent };
            } else if (selectedTask.task?.type === 'upload') {
                const formData = new FormData();
                if (file) formData.append('file', file);
                data = formData;
            }

            await submitTask(selectedTask.id, data);
            toast.success('Tugas berhasil dikirim');
            setSelectedTask(null);
            fetchTasks();
        } catch (error) {
            toast.error('Gagal mengirim tugas');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Tugas Saya</h1>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : tasks.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-500">Anda tidak memiliki tugas aktif.</div>
            ) : (
                <div className="flex flex-col gap-4">
                    {tasks.map((assignee) => {
                        const task = assignee.task;
                        if (!task) return null;
                        const isLate = task.deadline && new Date(task.deadline) < new Date() && assignee.status === 'pending';

                        return (
                            <div key={assignee.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden">
                                {isLate && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl">Terlambat</div>
                                )}

                                <div className="mb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${assignee.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            assignee.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                assignee.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {assignee.status}
                                        </span>
                                        <span className="text-xs text-gray-400 capitalize">{task.type}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 line-clamp-2">{task.title}</h3>
                                    {task.deadline && (
                                        <p className="text-xs text-gray-500 mt-1">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
                                    {task.description}
                                </p>

                                {assignee.admin_feedback && (
                                    <div className="mb-4 bg-red-50 p-3 rounded text-xs text-red-800 border border-red-100">
                                        <strong>Catatan Admin:</strong> {assignee.admin_feedback}
                                    </div>
                                )}

                                <div className="mt-auto">
                                    {assignee.status === 'approved' ? (
                                        <div className="w-full py-2 bg-green-50 text-green-700 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2">
                                            <Check className="w-5 h-5" /> Selesai
                                        </div>
                                    ) : assignee.status === 'submitted' ? (
                                        <div className="w-full py-2 bg-blue-50 text-blue-700 rounded-lg text-center text-sm font-medium">
                                            Menunggu Verifikasi
                                        </div>
                                    ) : (
                                        task.type === 'simple' ? (
                                            <button
                                                onClick={() => handleSimpleSubmit(assignee.id)}
                                                className="w-full py-2 bg-brand-green-main text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <ClipboardCheck className="w-5 h-5" />
                                                Tandai Selesai
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => openSubmitModal(assignee)}
                                                className="w-full py-2 bg-brand-green-main text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {task.type === 'upload' ? <Upload className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                                {assignee.status === 'rejected' ? 'Perbaiki Tugas' : 'Kerjakan Tugas'}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Submission Modal */}
            {selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Kirim Tugas: {selectedTask.task?.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{selectedTask.task?.description}</p>

                        <form onSubmit={handleDetailedSubmit}>
                            {selectedTask.task?.type === 'text' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Laporan / Jawaban</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={textContent}
                                        onChange={(e) => setTextContent(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Tulis laporan anda disini..."
                                    />
                                </div>
                            )}

                            {selectedTask.task?.type === 'upload' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                        <input
                                            type="file"
                                            required={!selectedTask.submission_file} // Required if no previous file
                                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Max user 10MB</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTask(null)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="px-4 py-2 bg-brand-green-main text-white rounded-lg hover:bg-emerald-600 font-medium disabled:opacity-50"
                                >
                                    {submitLoading ? 'Mengirim...' : 'Kirim Tugas'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
