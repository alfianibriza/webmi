import { useState } from 'react';
import { UserPlus, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api';

export default function NewStudentActivation() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultMessage, setResultMessage] = useState<string | null>(null);

    const handleActivate = async () => {
        if (!confirm('Proses ini akan mengaktifkan semua calon siswa yang berstatus DITERIMA menjadi siswa KELAS 1 pada Tahun Ajaran Aktif. Lanjutkan?')) return;

        setIsProcessing(true);
        try {
            const response = await api.post('/admin/academic-years/activate-new');
            setResultMessage(response.data.message);
            toast.success('Aktivasi siswa baru berhasil!');
        } catch (error: any) {
            console.error('Activation error:', error);
            toast.error(error.response?.data?.message || 'Gagal aktivasi siswa baru');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-green-light">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-brand-green-light rounded-full">
                        <UserPlus className="w-8 h-8 text-brand-green-main" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Aktivasi Siswa Baru</h2>
                        <p className="text-gray-600">Masuk Kelas 1 Tahun Ajaran Aktif</p>
                    </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-sm text-yellow-800">
                    <h3 className="font-semibold mb-2">Syarat Aktivasi:</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Hanya memproses Pendaftar (PPDB) dengan status <strong>DITERIMA</strong>.</li>
                        <li>Siswa akan otomatis masuk ke <strong>Kelas 1</strong>.</li>
                        <li>Siswa akan mendapatkan <strong>NIS Baru</strong>.</li>
                        <li>Pastikan Tahun Ajaran Baru sudah <strong>AKTIF</strong>.</li>
                    </ul>
                </div>

                {!resultMessage ? (
                    <button
                        onClick={handleActivate}
                        disabled={isProcessing}
                        className="w-full py-3 bg-brand-green-main text-white font-semibold rounded-lg hover:bg-green-800 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isProcessing ? 'Memproses...' : 'Aktivasi Siswa Baru Sekarang'}
                    </button>
                ) : (
                    <div className="bg-green-50 p-6 rounded-lg text-center border border-green-200">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-green-800 mb-2">Berhasil!</h3>
                        <p className="text-gray-700">{resultMessage}</p>
                        <button
                            onClick={() => setResultMessage(null)}
                            className="mt-6 text-brand-green-main hover:underline text-sm"
                        >
                            Kembali
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
