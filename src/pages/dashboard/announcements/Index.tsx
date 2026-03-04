import React, { useEffect, useState } from "react";
import {
    getAdminAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
} from "../../../api";
import { Plus, Trash2, Megaphone } from "lucide-react";
import Modal from "../../../components/Modal";
import Swal from "sweetalert2";

interface Announcement {
    id: number;
    title: string;
    content: string;
    target_type: "all" | "guru" | "wali_murid";
    created_at: string;
    creator: {
        name: string;
    };
}

export default function AnnouncementIndex() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        target_type: "all",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            const response = await getAdminAnnouncements();
            setAnnouncements(response.data);
        } catch (error) {
            console.error("Failed to fetch announcements", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createAnnouncement(formData);
            Swal.fire("Berhasil", "Pengumuman berhasil dibuat", "success");
            setIsModalOpen(false);
            setFormData({ title: "", content: "", target_type: "all" });
            fetchAnnouncements();
        } catch (error) {
            Swal.fire("Error", "Gagal membuat pengumuman", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Apakah anda yakin?",
            text: "Pengumuman akan dihapus permanen",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            try {
                await deleteAnnouncement(id);
                Swal.fire("Deleted!", "Pengumuman berhasil dihapus.", "success");
                fetchAnnouncements();
            } catch (error) {
                Swal.fire("Error", "Gagal menghapus pengumuman", "error");
            }
        }
    };

    const getTargetLabel = (type: string) => {
        switch (type) {
            case "all":
                return "Semua";
            case "guru":
                return "Guru & PTK";
            case "wali_murid":
                return "Wali Murid";
            default:
                return type;
        }
    };

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Megaphone className="w-8 h-8 text-brand-green-main" />
                        Manajemen Pengumuman
                    </h1>
                    <p className="text-gray-600">Buat dan kelola pengumuman untuk sekolah</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                    <Plus size={20} />
                    Buat Pengumuman
                </button>
            </div>

            <div className="grid gap-6">
                {announcements.map((announcement) => (
                    <div
                        key={announcement.id}
                        className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-indigo-100 p-3 text-indigo-600">
                                    <Megaphone size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {announcement.title}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                            Ke: {getTargetLabel(announcement.target_type)}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(announcement.created_at).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        <span>•</span>
                                        <span>Oleh: {announcement.creator?.name}</span>
                                    </div>
                                    <p className="mt-3 text-gray-600 whitespace-pre-wrap">{announcement.content}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(announcement.id)}
                                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                title="Hapus"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}

                {announcements.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-gray-500">
                        Belum ada pengumuman yang dibuat.
                    </div>
                )}
            </div>

            <Modal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Buat Pengumuman Baru"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Judul Pengumuman
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="Contoh: Libur Hari Raya"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Target Penerima
                        </label>
                        <select
                            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                            value={formData.target_type}
                            onChange={(e) =>
                                setFormData({ ...formData, target_type: e.target.value })
                            }
                        >
                            <option value="all">Semua (Guru, Staff & Wali Murid)</option>
                            <option value="guru">Hanya Guru & PTK</option>
                            <option value="wali_murid">Hanya Wali Murid</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Isi Pengumuman
                        </label>
                        <textarea
                            required
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                            value={formData.content}
                            onChange={(e) =>
                                setFormData({ ...formData, content: e.target.value })
                            }
                            placeholder="Tulis detail pengumuman disini..."
                        />
                    </div>

                    <div className="mt-6 flex justifying-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Mengirim..." : "Kirim Pengumuman"}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
