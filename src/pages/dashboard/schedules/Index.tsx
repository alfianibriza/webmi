import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getClassSchedules, getPtsSchedules, getPasSchedules, deleteSchedule, getClassRooms, createSchedule, getMySchedules } from '../../../api';
import { Trash2, CalendarDays } from 'lucide-react';
import type { Schedule, ClassRoom } from '../../../types/safe_types';
import Modal from '../../../components/Modal';
import MediaSelectInput from '../../../components/MediaSelectInput';

export default function ScheduleIndex() {
  const { user } = useAuth();
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'guru' || user?.role === 'tu';

  const [activeTab, setActiveTab] = useState<'class' | 'pts' | 'pas'>('class');
  const [classSchedules, setClassSchedules] = useState<Schedule[]>([]);
  const [ptsSchedules, setPtsSchedules] = useState<Schedule[]>([]);
  const [pasSchedules, setPasSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'class',
    grade: '',
    class_room_id: '',
    file_path: '',
    description: ''
  });

  // Fetch logic
  const fetchAllSchedules = async () => {
    setIsLoading(true);
    try {
      if (isAdminOrTeacher) {
        // Admin/Teacher: Fetch all schedules
        const [classRes, ptsRes, pasRes] = await Promise.all([
          getClassSchedules(),
          getPtsSchedules(),
          getPasSchedules(),
        ]);
        setClassSchedules(classRes.data?.schedules || []);
        setPtsSchedules(ptsRes.data?.schedules || []);
        setPasSchedules(pasRes.data?.schedules || []);
      } else {
        // Parent/Student: Fetch my specific schedules
        const response = await getMySchedules();
        const allMySchedules = response.data?.schedules || [];

        // Client-side filtering for tabs since endpoint returns all
        setClassSchedules(allMySchedules.filter((s: Schedule) => s.type === 'class'));
        setPtsSchedules(allMySchedules.filter((s: Schedule) => s.type === 'pts'));
        setPasSchedules(allMySchedules.filter((s: Schedule) => s.type === 'pas'));
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSchedules();
    fetchClassRooms();
  }, []);

  const fetchClassRooms = async () => {
    try {
      const response = await getClassRooms();
      setClassRooms(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching class rooms:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      await deleteSchedule(id);
      // Refresh the current tab's data
      if (activeTab === 'class') {
        setClassSchedules(classSchedules.filter(s => s.id !== id));
      } else if (activeTab === 'pts') {
        setPtsSchedules(ptsSchedules.filter(s => s.id !== id));
      } else {
        setPasSchedules(pasSchedules.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Gagal menghapus jadwal');
    }
  };

  // Filter rombel berdasarkan grade yang dipilih
  const filteredRombels = useMemo(() => {
    if (!selectedGrade) return [];
    return classRooms.filter(cr => String(cr.grade) === selectedGrade);
  }, [selectedGrade, classRooms]);

  const handleOpenModal = () => {
    setSelectedGrade('');
    setFormData({
      title: '',
      type: activeTab,
      grade: '',
      class_room_id: '',
      file_path: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGrade = e.target.value;
    setSelectedGrade(newGrade);
    setFormData(prev => ({ ...prev, grade: newGrade, class_room_id: '' }));
  };

  const handleMediaSelect = (path: string) => {
    setFormData(prev => ({ ...prev, file_path: path }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.file_path) {
      alert('Mohon lengkapi judul dan pilih file dari pustaka media');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: Record<string, unknown> = {
        title: formData.title,
        type: formData.type,
        file_path: formData.file_path,
      };

      if (formData.type === 'class') {
        if (formData.grade) data.grade = formData.grade;
        if (formData.class_room_id) data.class_room_id = formData.class_room_id;
      }
      if (formData.description) {
        data.description = formData.description;
      }

      await createSchedule(data);
      alert('Jadwal berhasil ditambahkan');
      setIsModalOpen(false);
      fetchAllSchedules();
    } catch (error) {
      console.error('Error capturing schedule:', error);
      alert('Gagal menambahkan jadwal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getTypeName = () => {
    switch (activeTab) {
      case 'class': return 'Jadwal Kelas';
      case 'pts': return 'Jadwal PTS';
      case 'pas': return 'Jadwal PAS';
    }
  };

  const getSchedules = () => {
    switch (activeTab) {
      case 'class': return classSchedules;
      case 'pts': return ptsSchedules;
      case 'pas': return pasSchedules;
    }
  };

  const renderSchedules = (schedules: Schedule[]) => {
    if (schedules.length === 0) {
      return (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Belum ada {getTypeName()} yang tersedia.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                {schedule.classRoom?.name || (schedule.grade ? `Kelas ${schedule.grade}` : 'Jadwal')}
              </h3>
              <span className="text-xs text-gray-500">{formatDate(schedule.created_at)}</span>
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{schedule.title || 'Tanpa Judul'}</h4>
              {schedule.description && <p className="text-sm text-gray-600 mb-3">{schedule.description}</p>}
              {schedule.file_path && (
                <div className="mb-4">
                  {schedule.file_path.endsWith('.pdf') ? (
                    <a
                      href={schedule.file_path?.startsWith('http') || schedule.file_path?.startsWith('/storage/') ? schedule.file_path : `/storage/${schedule.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center py-3 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition border border-blue-200"
                    >
                      📄 Buka Dokumen PDF
                    </a>
                  ) : (
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={schedule.file_path?.startsWith('http') || schedule.file_path?.startsWith('/storage/') ? schedule.file_path : `/storage/${schedule.file_path}`}
                        alt="Jadwal"
                        className="w-full h-auto object-cover cursor-pointer"
                        onClick={() => window.open(schedule.file_path?.startsWith('http') || schedule.file_path?.startsWith('/storage/') ? schedule.file_path : `/storage/${schedule.file_path}`, '_blank')}
                      />
                      <div className="text-center text-xs text-gray-500 py-1 bg-gray-50">Klik gambar untuk memperbesar</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isAdminOrTeacher && (
              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={() => handleDelete(schedule.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    // ... loading spinner ...
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-main"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarDays className="w-8 h-8 text-brand-green-main" />
            Jadwal Pelajaran & Ujian
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola jadwal pelajaran dan ujian sekolah</p>
        </div>
        {isAdminOrTeacher && (
          <button
            onClick={handleOpenModal}
            className="bg-brand-green-main hover:bg-brand-green-hover text-white px-4 py-2 rounded-lg flex items-center transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Jadwal
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4 flex space-x-4 border-b">
          <button
            className={`py-2 px-4 font-medium transition-colors duration-200 border-b-2 ${activeTab === 'class'
              ? 'border-brand-green-main text-brand-green-main'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('class')}
          >
            Jadwal Kelas ({classSchedules.length})
          </button>
          <button
            className={`py-2 px-4 font-medium transition-colors duration-200 border-b-2 ${activeTab === 'pts'
              ? 'border-brand-green-main text-brand-green-main'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('pts')}
          >
            Jadwal PTS ({ptsSchedules.length})
          </button>
          <button
            className={`py-2 px-4 font-medium transition-colors duration-200 border-b-2 ${activeTab === 'pas'
              ? 'border-brand-green-main text-brand-green-main'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('pas')}
          >
            Jadwal PAS ({pasSchedules.length})
          </button>
        </div>

        <div className="p-6 min-h-[300px]">
          {renderSchedules(getSchedules())}
        </div>
      </div>
      {/* Upload Modal */}
      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Jadwal Baru"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Jadwal</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border-gray-300 focus:border-brand-green-main focus:ring-brand-green-main"
              placeholder="Contoh: Jadwal Kelas 1A Semester Genap"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Jadwal</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-brand-green-main focus:ring-brand-green-main"
              >
                <option value="class">Jadwal Kelas</option>
                <option value="pts">Jadwal PTS</option>
                <option value="pas">Jadwal PAS</option>
              </select>
            </div>

            {formData.type === 'class' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                <select
                  value={selectedGrade}
                  onChange={handleGradeChange}
                  className="w-full rounded-lg border-gray-300 focus:border-brand-green-main focus:ring-brand-green-main"
                  required={formData.type === 'class'}
                >
                  <option value="">Pilih Kelas</option>
                  <option value="1">Kelas 1</option>
                  <option value="2">Kelas 2</option>
                  <option value="3">Kelas 3</option>
                  <option value="4">Kelas 4</option>
                  <option value="5">Kelas 5</option>
                  <option value="6">Kelas 6</option>
                </select>
              </div>
            )}
          </div>

          {/* Rombel dropdown - only show when type is class AND grade is selected */}
          {formData.type === 'class' && selectedGrade && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rombel (Opsional)</label>
              <select
                value={formData.class_room_id}
                onChange={(e) => setFormData({ ...formData, class_room_id: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-brand-green-main focus:ring-brand-green-main"
              >
                <option value="">Semua Rombel (Satu Angkatan)</option>
                {filteredRombels.map((room) => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
              {filteredRombels.length === 0 && (
                <p className="text-xs text-yellow-600 mt-1">Tidak ada rombel untuk kelas ini. Silakan tambahkan rombel terlebih dahulu.</p>
              )}
            </div>
          )}


          <MediaSelectInput
            label="File Jadwal (dari Pustaka Media)"
            value={formData.file_path}
            onSelect={handleMediaSelect}
            id="schedule_file"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (Opsional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border-gray-300 focus:border-brand-green-main focus:ring-brand-green-main"
              rows={3}
            ></textarea>
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-green-main text-white rounded-lg hover:bg-brand-green-hover transition flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                'Simpan Jadwal'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
