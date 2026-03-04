import { useState } from 'react';
import { Layers, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api';

export default function GenerateRombel() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<{ created: number } | null>(null);

    const handleGenerate = async () => {
        if (!confirm('PERHATIAN: Proses ini akan membuat rombel baru untuk tahun ajaran aktif dan menonaktifkan rombel lama. Pastikan Tahun Ajaran Baru sudah AKTIF. Lanjutkan?')) return;

        setIsProcessing(true);
        try {
            const response = await api.post('/admin/academic-years/generate-rombel');
            setResult(response.data);
            toast.success('Rombel berhasil di-generate!');
        } catch (error: any) {
            console.error('Generate rombel error:', error);
            toast.error(error.response?.data?.message || 'Gagal generate rombel');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-green-light">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-brand-green-light rounded-full">
                        <Layers className="w-8 h-8 text-brand-green-main" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Generate Rombel Baru</h2>
                        <p className="text-gray-600">Buat rombel untuk tahun ajaran aktif</p>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-800">
                    <h3 className="font-semibold mb-2">Proses Generate:</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Rombel lama akan di-<strong>nonaktifkan</strong>.</li>
                        <li>Rombel baru dibuat dengan <strong>Grade + 1</strong> (contoh: 1A → 2A).</li>
                        <li>Rombel Kelas 6 tidak dilanjutkan (siswa lulus).</li>
                        <li>Rombel Kelas 1 baru dibuat untuk siswa baru.</li>
                        <li>Proses ini hanya bisa dijalankan <strong>1x per tahun ajaran</strong>.</li>
                    </ul>
                </div>

                {!result ? (
                    <button
                        onClick={handleGenerate}
                        disabled={isProcessing}
                        className="w-full py-3 bg-brand-green-main text-white font-semibold rounded-lg hover:bg-green-800 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isProcessing ? 'Memproses...' : 'Generate Rombel Sekarang'}
                    </button>
                ) : (
                    <div className="bg-green-50 p-6 rounded-lg text-center border border-green-200">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-green-800 mb-2">Berhasil!</h3>
                        <div className="mt-4">
                            <span className="block text-3xl font-bold text-gray-800">{result.created}</span>
                            <span className="text-sm text-gray-600">Rombel Baru Dibuat</span>
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
