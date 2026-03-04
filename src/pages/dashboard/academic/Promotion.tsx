import { useState } from 'react';
import { ArrowUpCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api';

export default function Promotion() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<{ promoted: number; graduated: number } | null>(null);

    const handlePromote = async () => {
        if (!confirm('PERHATIAN: Proses ini akan menaikkan kelas semua siswa aktif ke tingkat selanjutnya. Siswa Kelas 6 akan diluluskan. Pastikan sudah menjalankan "Generate Kelas" terlebih dahulu. Lanjutkan?')) return;

        setIsProcessing(true);
        try {
            const response = await api.post('/admin/kelas/promote');
            setResult(response.data);
            toast.success('Proses kenaikan kelas berhasil!');
        } catch (error: any) {
            console.error('Promotion error:', error);
            toast.error(error.response?.data?.message || 'Gagal memproses kenaikan kelas');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-green-light">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-brand-green-light rounded-full">
                        <ArrowUpCircle className="w-8 h-8 text-brand-green-main" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Kenaikan Kelas Masal</h2>
                        <p className="text-gray-600">Proses otomatis kenaikan tingkat siswa aktif</p>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-800">
                    <h3 className="font-semibold mb-2">Aturan Proses:</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Pastikan sudah menjalankan <strong>Generate Kelas</strong> terlebih dahulu.</li>
                        <li>Siswa akan naik tingkat, <strong>rombel tetap sama</strong> (1A → 2A).</li>
                        <li>Siswa Kelas 6 akan diubah statusnya menjadi <strong>Lulus (Alumni)</strong>.</li>
                        <li>Proses ini hanya berlaku untuk siswa dengan status <strong>Aktif</strong>.</li>
                    </ul>
                </div>

                {!result ? (
                    <button
                        onClick={handlePromote}
                        disabled={isProcessing}
                        className="w-full py-3 bg-brand-green-main text-white font-semibold rounded-lg hover:bg-green-800 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isProcessing ? 'Memproses...' : 'Jalankan Proses Kenaikan Kelas'}
                    </button>
                ) : (
                    <div className="bg-green-50 p-6 rounded-lg text-center border border-green-200">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-green-800 mb-2">Proses Selesai!</h3>
                        <div className="flex justify-center gap-8 mt-4">
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-gray-800">{result.promoted}</span>
                                <span className="text-sm text-gray-600">Siswa Naik Kelas</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-gray-800">{result.graduated}</span>
                                <span className="text-sm text-gray-600">Siswa Lulus</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setResult(null)}
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
