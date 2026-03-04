import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminTasks, deleteTask } from '../../../api';
import type { Task } from '../../../types';
import { Plus, Eye, Trash2, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper to calculate status summary
const getStatusSummary = (task: Task) => {
    if (!task.assignees || task.assignees.length === 0) return 'No Assignees';
    const pending = task.assignees.filter(a => a.status === 'pending').length;
    const submitted = task.assignees.filter(a => a.status === 'submitted').length;
    const approved = task.assignees.filter(a => a.status === 'approved').length;
    const rejected = task.assignees.filter(a => a.status === 'rejected').length;

    return (
        <div className="flex gap-2 text-xs">
            {pending > 0 && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">{pending} Pending</span>}
            {submitted > 0 && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{submitted} Submitted</span>}
            {approved > 0 && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{approved} Approved</span>}
            {rejected > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full">{rejected} Rejected</span>}
        </div>
    );
};

export default function AdminTaskList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await getAdminTasks();
            setTasks(response.data.data); // Assuming response format { data: Task[] } or wrapped
        } catch (error) {
            console.error('Failed to fetch tasks', error);
            toast.error('Gagal memuat tugas');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;
        try {
            await deleteTask(id);
            toast.success('Tugas berhasil dihapus');
            fetchTasks();
        } catch (error) {
            toast.error('Gagal menghapus tugas');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <ClipboardList className="w-8 h-8 text-brand-green-main" />
                        Daftar Tugas Guru
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola tugas yang diberikan guru</p>
                </div>
                <Link
                    to="/dashboard/tasks/create"
                    className="bg-brand-green-main hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Buat Tugas</span>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green-main"></div>
                </div>
            ) : tasks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                    Belum ada tugas yang dibuat.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-1">
                    {tasks.map((task) => (
                        <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-md border
                        ${task.type === 'simple' ? 'bg-gray-50 border-gray-200 text-gray-600' :
                                                    task.type === 'upload' ? 'bg-purple-50 border-purple-200 text-purple-600' :
                                                        'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
                                                {task.type === 'simple' ? 'Simple' : task.type === 'upload' ? 'Upload File' : 'Isian Teks'}
                                            </span>
                                            {task.deadline && (
                                                <span className="text-xs text-gray-500">
                                                    Due: {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-2 md:line-clamp-none mb-3">
                                            {task.description || 'Tidak ada deskripsi'}
                                        </p>

                                        {getStatusSummary(task)}
                                    </div>

                                    <div className="flex items-center gap-2 self-start sm:self-center">
                                        <Link
                                            to={`/dashboard/tasks/${task.id}`}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Lihat Detail"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(task.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
