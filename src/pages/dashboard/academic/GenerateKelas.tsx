import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus } from 'lucide-react';
import api from '../../../api';

const GenerateKelas: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!confirm('Apakah Anda yakin ingin generate kelas untuk tahun ajaran aktif?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/admin/kelas/generate');
            toast.success(response.data.message || 'Kelas berhasil di-generate!');
            navigate('/dashboard/academic');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal generate kelas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/dashboard/academic')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Generate Kelas</h1>
                <p className="text-gray-600 mt-2">
                    Generate semua kombinasi Tingkat × Rombel untuk tahun ajaran aktif
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-4">Informasi</h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800">
                            <strong>Proses ini akan:</strong>
                        </p>
                        <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                            <li>Membuat semua kombinasi Tingkat (1-6) × Rombel (A, B, C)</li>
                            <li>Total: 18 kelas akan dibuat (6 tingkat × 3 rombel)</li>
                            <li>Kelas hanya dibuat untuk tahun ajaran yang aktif</li>
                        </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            <strong>⚠️ Perhatian:</strong>
                        </p>
                        <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                            <li>Pastikan tahun ajaran baru sudah aktif</li>
                            <li>Proses ini hanya bisa dilakukan 1× per tahun ajaran</li>
                            <li>Jalankan ini SEBELUM proses kenaikan kelas</li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {loading ? 'Memproses...' : 'Generate Kelas'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GenerateKelas;
