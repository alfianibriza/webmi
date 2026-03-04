import { useEffect, useState } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import api from '../../../api'; // Adjust path if necessary
import toast from 'react-hot-toast';

interface NotificationData {
    id: string;
    data: {
        title: string;
        content: string;
        target_type: string;
        created_by: number;
        announcement_id: number;
    };
    read_at: string | null;
    created_at: string;
}

export default function NotificationsIndex() {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Gagal memuat notifikasi');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            toast.success('Ditandai sudah dibaca');
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            toast.success('Semua notifikasi ditandai sudah dibaca');
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="pb-20">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Bell className="w-8 h-8 text-brand-green-main" />
                        Notifikasi
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Pemberitahuan terbaru sistem</p>
                </div>
                {notifications.some(n => !n.read_at) && (
                    <button onClick={handleMarkAllRead} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Tandai semua dibaca
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read_at ? 'bg-blue-50/50' : ''}`}>
                                <div className="flex gap-4">
                                    <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${!notification.read_at ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                                    <div className="flex-1">
                                        <h4 className={`text-sm font-semibold text-gray-900 ${!notification.read_at ? 'font-bold' : ''}`}>
                                            {notification.data.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">{notification.data.content}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(notification.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {!notification.read_at && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                                >
                                                    <Check size={12} /> Tandai dibaca
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <Bell size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-gray-800 font-bold mb-1">Belum ada notifikasi</h3>
                        <p className="text-gray-500 text-sm max-w-xs">Kami akan memberi tahu Anda jika ada pembaruan penting atau informasi terbaru.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
