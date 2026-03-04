import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, MapPin, Clock, Check, X, AlertCircle, History } from 'lucide-react';
import { getTeacherAttendance, teacherCheckIn, teacherCheckOut } from '../../../api';

interface AttendanceRecord {
    id: number;
    date: string;
    type: 'masuk' | 'keluar';
    status: 'pending' | 'approved' | 'rejected';
    photo: string | null;
    latitude: number | null;
    longitude: number | null;
    location_status: 'valid' | 'invalid';
    admin_note: string | null;
    created_at: string;
}

export default function GuruAbsensi() {
    const [mode, setMode] = useState<'idle' | 'camera'>('idle');
    const [attendanceType, setAttendanceType] = useState<'masuk' | 'keluar'>('masuk');
    const [photo, setPhoto] = useState<string | null>(null);
    const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [todayStatus, setTodayStatus] = useState<{ masuk: boolean; keluar: boolean }>({ masuk: false, keluar: false });

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Time validation (server time should be used, but for UI we show local as hint)
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const canCheckIn = currentHour >= 7 && currentHour < 8;
    const canCheckOut = currentHour >= 10 && currentHour < 13;

    // Fetch history on mount
    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const response = await getTeacherAttendance({ month: now.getMonth() + 1, year: now.getFullYear() });
            const data = response.data?.data || [];
            setHistory(data);

            // Check today's status
            const today = now.toISOString().split('T')[0];
            const todayRecords = data.filter((r: AttendanceRecord) => r.date === today);
            setTodayStatus({
                masuk: todayRecords.some((r: AttendanceRecord) => r.type === 'masuk'),
                keluar: todayRecords.some((r: AttendanceRecord) => r.type === 'keluar'),
            });
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Get current location
    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolokasi tidak didukung browser Anda.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                setLocationError(null);
            },
            (error) => {
                setLocationError(`Gagal mendapatkan lokasi: ${error.message}`);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    // Start camera
    const startCamera = async (type: 'masuk' | 'keluar') => {
        setAttendanceType(type);
        setMode('camera');
        setPhoto(null);
        setPhotoBlob(null);
        setMessage(null);
        getLocation();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.' });
            setMode('idle');
        }
    };

    // Stop camera
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setMode('idle');
        setPhoto(null);
        setPhotoBlob(null);
    }, []);

    // Capture photo
    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(dataUrl);

        // Convert to Blob
        canvas.toBlob((blob) => {
            if (blob) setPhotoBlob(blob);
        }, 'image/jpeg', 0.8);

        // Stop video stream after capture
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
    };

    // Submit attendance
    const handleSubmit = async () => {
        if (!photoBlob || !location) {
            setMessage({ type: 'error', text: 'Foto dan lokasi wajib diisi.' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('photo', photoBlob, 'selfie.jpg');
        formData.append('latitude', location.lat.toString());
        formData.append('longitude', location.lng.toString());

        try {
            const submitFn = attendanceType === 'masuk' ? teacherCheckIn : teacherCheckOut;
            await submitFn(formData);

            setMessage({ type: 'success', text: `Absen ${attendanceType === 'masuk' ? 'Masuk' : 'Keluar'} berhasil dikirim!` });
            stopCamera();
            fetchHistory(); // Refresh history
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengirim absensi.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string, locStatus: string) => {
        if (status === 'approved') return 'bg-green-100 text-green-800';
        if (status === 'rejected') return 'bg-red-100 text-red-800';
        if (locStatus === 'invalid') return 'bg-orange-100 text-orange-800';
        return 'bg-yellow-100 text-yellow-800'; // pending
    };

    const getStatusText = (status: string, locStatus: string) => {
        if (status === 'approved') return 'Disetujui';
        if (status === 'rejected') return 'Ditolak';
        if (locStatus === 'invalid') return 'Pending (Lokasi Invalid)';
        return 'Pending';
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Absensi Guru</h1>

            {/* Message */}
            {message && (
                <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            {mode === 'idle' && (
                <>
                    {/* Current Time & Status */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="text-blue-600" size={24} />
                            <div>
                                <p className="text-sm text-gray-500">Waktu Saat Ini</p>
                                <p className="text-2xl font-bold text-gray-800">{currentTimeStr}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Check In Button */}
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Absen Masuk (07:00 - 08:00)</p>
                                <button
                                    onClick={() => startCamera('masuk')}
                                    disabled={!canCheckIn || todayStatus.masuk}
                                    className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition
                    ${canCheckIn && !todayStatus.masuk
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <Camera size={20} />
                                    {todayStatus.masuk ? 'Sudah Absen' : 'Absen Masuk'}
                                </button>
                            </div>

                            {/* Check Out Button */}
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Absen Keluar (10:00 - 13:00)</p>
                                <button
                                    onClick={() => startCamera('keluar')}
                                    disabled={!canCheckOut || todayStatus.keluar}
                                    className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition
                    ${canCheckOut && !todayStatus.keluar
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <Camera size={20} />
                                    {todayStatus.keluar ? 'Sudah Absen' : 'Absen Keluar'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <History size={20} className="text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Riwayat Absensi Bulan Ini</h2>
                        </div>

                        {isLoadingHistory ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : history.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Belum ada data absensi.</p>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {history.map((record) => (
                                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className="text-sm text-gray-500 capitalize">{record.type}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(record.status, record.location_status)}`}>
                                            {getStatusText(record.status, record.location_status)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {mode === 'camera' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Absen {attendanceType === 'masuk' ? 'Masuk' : 'Keluar'}
                    </h2>

                    {/* Camera Preview / Captured Photo */}
                    <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden mb-4">
                        {!photo ? (
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        ) : (
                            <img src={photo} alt="Captured" className="w-full h-full object-cover" />
                        )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Location Status */}
                    <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                        <MapPin size={20} className={location ? 'text-green-600' : 'text-gray-400'} />
                        {location ? (
                            <span className="text-sm text-green-700">
                                Lokasi: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </span>
                        ) : locationError ? (
                            <span className="text-sm text-red-600">{locationError}</span>
                        ) : (
                            <span className="text-sm text-gray-500">Mendapatkan lokasi...</span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {!photo ? (
                            <>
                                <button
                                    onClick={stopCamera}
                                    className="flex-1 py-3 px-4 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center gap-2"
                                >
                                    <X size={20} /> Batal
                                </button>
                                <button
                                    onClick={capturePhoto}
                                    className="flex-1 py-3 px-4 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <Camera size={20} /> Ambil Foto
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => { setPhoto(null); setPhotoBlob(null); startCamera(attendanceType); }}
                                    className="flex-1 py-3 px-4 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center gap-2"
                                >
                                    <Camera size={20} /> Ulangi
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !location}
                                    className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition
                    ${isSubmitting || !location
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <Check size={20} />
                                    )}
                                    Kirim
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
