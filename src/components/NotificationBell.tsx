import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../api";
import { useNavigate } from "react-router-dom";

interface Notification {
    id: string;
    data: {
        title: string;
        content: string;
        target_type: string;
        created_by: string;
        created_at: string;
    };
    read_at: string | null;
    created_at: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const response = await getMyNotifications();
            // Inspect the response structure to correctly map data
            // Based on controller: { notifications: [], unread_count: 0 }
            const data = response.data;
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll every 60s
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    // Function to determine if notification is unread
    const isUnread = (n: Notification) => !n.read_at;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green-main"
                title="Notifikasi"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 py-0 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-800">Notifikasi</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                Belum ada notifikasi.
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <li
                                        key={notification.id}
                                        className={`relative p-4 hover:bg-gray-50 transition-colors ${!notification.read_at ? 'bg-indigo-50/50' : ''}`}
                                        onClick={() => isUnread(notification) && handleMarkAsRead(notification.id)}
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <p className={`text-sm ${!notification.read_at ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.data.title}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                                    {notification.data.content}
                                                </p>
                                                <p className="mt-2 text-[10px] text-gray-400">
                                                    {new Date(notification.created_at).toLocaleString('id-ID')} • Oleh {notification.data.created_by}
                                                </p>
                                            </div>
                                            {!notification.read_at && (
                                                <span className="flex-shrink-0 h-2 w-2 rounded-full bg-indigo-600 mt-1.5"></span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
