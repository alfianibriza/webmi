import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ==========================================
// PUBLIC API FUNCTIONS
// ==========================================

export const getHome = () => api.get("/home");
export const getSliderImages = () => api.get("/slider-images");
export const getProfile = () => api.get("/profile");
export const getTeachers = () => api.get("/teachers");
export const getExtracurriculars = () => api.get("/extracurriculars");
export const getSarpras = () => api.get("/sarpras");
export const getAchievements = () => api.get("/achievements");
export const getAchievement = (id: number) => api.get(`/achievements/${id}`);
export const getPosts = () => api.get("/posts");
export const getPost = (slug: string) => api.get(`/posts/${slug}`);
export const getPpdbInfo = () => api.get("/ppdb-info");
export const getKesiswaan = () => api.get("/kesiswaan");
export const getPublicStudents = (filters?: {
  grade?: string;
  class_room_id?: number;
}) => api.get("/students-public", { params: filters });

// ==========================================
// AUTH API FUNCTIONS
// ==========================================

export const login = (email: string, password: string) =>
  api.post("/login", { email, password });

export const logout = () => api.post("/logout");

export const getUser = () => api.get("/user");

// ==========================================
// DASHBOARD API FUNCTIONS
// ==========================================

export const getDashboardStats = () => api.get("/dashboard/stats");
export const getBendaharaDashboardStats = () => api.get("/dashboard/bendahara-stats"); // Added for Bendahara
export const getParentDashboard = (month?: number, year?: number) =>
  api.get("/parent/dashboard", { params: { month, year } });

// ==========================================
// ADMIN POSTS API
// ==========================================

export const getAdminPosts = () => api.get("/admin/posts");
export const createPost = (data: Record<string, unknown>) =>
  api.post("/admin/posts", data);
export const getEditPost = (id: number) => api.get(`/admin/posts/${id}`);
export const updatePost = (id: number, data: Record<string, unknown>) =>
  api.put(`/admin/posts/${id}`, data);
export const deletePost = (id: number) => api.delete(`/admin/posts/${id}`);

// ==========================================
// ADMIN STUDENTS API
// ==========================================

export const getAdminStudents = (filters?: {
  class_room_id?: number;
  status?: string;
  grade?: string;
  tingkat_id?: number;
  rombel_id?: number;
}) => api.get("/admin/students", { params: filters });
export const createStudent = (data: Record<string, unknown> | FormData) =>
  api.post("/admin/students", data);
export const getEditStudent = (id: number) => api.get(`/admin/students/${id}`);
export const updateStudent = (id: number, data: Record<string, unknown> | FormData) =>
  api.put(`/admin/students/${id}`, data);
export const deleteStudent = (id: number) =>
  api.delete(`/admin/students/${id}`);
export const promoteStudents = () => api.post("/admin/students/promote");
export const demoteStudents = () => api.post("/admin/students/demote");

// ==========================================
// ADMIN CLASS ROOMS API
// ==========================================

// Class Rooms (Legacy)
export const getClassRooms = () => api.get("/admin/class-rooms");

// Kelas System (New Architecture)
export const getTingkat = () => api.get("/tingkat");
export const getRombel = (kelasId?: number) =>
  api.get("/rombel", { params: kelasId ? { kelas_id: kelasId } : {} });
export const createRombel = (data: { kelas_id: number; name: string; status: string }) =>
  api.post("/rombel", data);
export const updateRombel = (id: number, data: { name: string; status: string }) =>
  api.put(`/rombel/${id}`, data);
export const deleteRombel = (id: number) =>
  api.delete(`/rombel/${id}`);
export const getKelasAktif = (params?: { tingkat_id?: number; rombel_id?: number; academic_year_id?: number }) =>
  api.get("/kelas-aktif", { params });
export const createClassRoom = (data: { grade: number; name: string }) =>
  api.post("/admin/class-rooms", data);
export const updateClassRoom = (id: number, data: { grade: number; name: string }) =>
  api.put(`/admin/class-rooms/${id}`, data);
export const deleteClassRoom = (id: number) =>
  api.delete(`/admin/class-rooms/${id}`);
export const createKelasDetail = (data: { academic_year_id: number; tingkat_id: number; name: string }) =>
  api.post("/admin/kelas/detail", data);
export const deleteKelasDetail = (id: number) =>
  api.delete(`/admin/kelas/detail/${id}`);
export const updateKelasDetail = (id: number, data: { name: string }) =>
  api.put(`/admin/kelas/detail/${id}`, data);

// Academic Year & Promotion
export const getAcademicYears = () => api.get("/admin/academic-years");
export const createAcademicYear = (data: any) => api.post("/admin/academic-years", data);
export const updateAcademicYear = (id: number, data: any) => api.put(`/admin/academic-years/${id}`, data);
export const deleteAcademicYear = (id: number) => api.delete(`/admin/academic-years/${id}`);
export const setActiveAcademicYear = (id: number) => api.post(`/admin/academic-years/${id}/active`);
export const closeAcademicYear = (id: number) => api.post(`/admin/academic-years/${id}/close`);
export const getActiveAcademicYear = () => api.get("/active-academic-year");

// Enrollment API
export const getStudentCandidates = (academicYearId: number, grade?: string) =>
  api.get("/kelas/candidates", { params: { academic_year_id: academicYearId, grade } });
export const enrollStudents = (data: { kelas_id: number; student_ids: number[] }) =>
  api.post("/kelas/enroll", data);
export const removeStudentFromClass = (kelasId: number, studentId: number) =>
  api.delete(`/kelas/${kelasId}/students/${studentId}`);

// ==========================================
// ADMIN ATTENDANCE API
// ==========================================

export const getStudentAttendance = (filters?: {
  date?: string;
  class_room_id?: number;
  grade?: string;
}) => api.get("/admin/student-attendance", { params: filters });
export const storeStudentAttendance = (
  attendances: Array<{
    student_id: number;
    date: string;
    status: string;
  }>
) => api.post("/admin/student-attendance", { attendances });

export const getStudentAttendanceReport = (filters?: {
  start_date?: string;
  end_date?: string;
  grade?: string;
  class_room_id?: number;
}) => api.get("/admin/student-attendance/report", { params: filters });

export const getStudentAttendanceExportUrl = (filters?: {
  start_date?: string;
  end_date?: string;
  grade?: string;
  class_room_id?: number;
}) => {
  const params = new URLSearchParams();
  if (filters?.start_date) params.append("start_date", filters.start_date);
  if (filters?.end_date) params.append("end_date", filters.end_date);
  if (filters?.grade) params.append("grade", filters.grade);
  if (filters?.class_room_id) params.append("class_room_id", filters.class_room_id.toString());
  const token = localStorage.getItem("auth_token");
  return `/api/admin/student-attendance/export?${params.toString()}&token=${token}`;
};

export const downloadStudentAttendanceReport = async (filters?: {
  start_date?: string;
  end_date?: string;
  grade?: string;
  class_room_id?: number;
}) => {
  const response = await api.get("/admin/student-attendance/export", {
    params: filters,
    responseType: "blob",
  });

  // Create a blob link to download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `laporan_kehadiran_${new Date().toISOString().slice(0, 10)}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const getAttendance = (date?: string) =>
  api.get("/admin/attendance", { params: { date } });

// ==========================================
// ADMIN PTK (TEACHERS) API
// ==========================================

export const getAdminPtk = () => api.get("/admin/ptk");
export const createPtk = (data: Record<string, unknown>) =>
  api.post("/admin/ptk", data);
export const updatePtk = (id: number, data: Record<string, unknown>) =>
  api.put(`/admin/ptk/${id}`, data);
export const deletePtk = (id: number) => api.delete(`/admin/ptk/${id}`);

// ==========================================
// ADMIN SARPRAS API
// ==========================================

export const getAdminSarpras = () => api.get("/admin/sarpras");
export const createSarpras = (data: Record<string, unknown>) =>
  api.post("/admin/sarpras", data);
export const updateSarpras = (id: number, data: Record<string, unknown>) =>
  api.put(`/admin/sarpras/${id}`, data);
export const deleteSarpras = (id: number) => api.delete(`/admin/sarpras/${id}`);

// ==========================================
// ADMIN PMB API
// ==========================================

export const getAdminPmb = () => api.get("/admin/pmb");
export const createPmb = (data: Record<string, unknown>) =>
  api.post("/admin/pmb", data);
export const deletePmb = (id: number) => api.delete(`/admin/pmb/${id}`);
export const getAdminPmbInfo = () => api.get("/admin/pmb/info");
export const updatePmbInfo = (data: Record<string, unknown>) =>
  api.post("/admin/pmb/info", data);
export const getPmbDetail = (id: number) => api.get(`/admin/pmb/${id}`);
export const updatePmb = (id: number, data: Record<string, unknown>) =>
  api.put(`/admin/pmb/${id}`, data);

// ==========================================
// ADMIN PHILOSOPHY API
// ==========================================

export const getAdminPhilosophy = () => api.get("/admin/philosophy");
export const createPhilosophy = (data: Record<string, unknown>) =>
  api.post("/admin/philosophy", data);
export const updatePhilosophy = (id: number, data: Record<string, unknown>) =>
  api.put(`/admin/philosophy/${id}`, data);
export const deletePhilosophy = (id: number) =>
  api.delete(`/admin/philosophy/${id}`);

// ==========================================
// ADMIN ACHIEVEMENTS API
// ==========================================

export const getAdminAchievements = () => api.get("/admin/achievements");
export const createAchievement = (data: Record<string, unknown>) =>
  api.post("/admin/achievements", data);
export const updateAchievement = (id: number, data: Record<string, unknown>) =>
  api.put(`/admin/achievements/${id}`, data);
export const deleteAchievement = (id: number) =>
  api.delete(`/admin/achievements/${id}`);

// ==========================================
// ADMIN EXTRACURRICULARS API
// ==========================================

export const getAdminExtracurriculars = () =>
  api.get("/admin/extracurriculars");
export const createExtracurricular = (data: Record<string, unknown>) =>
  api.post("/admin/extracurriculars", data);
export const updateExtracurricular = (
  id: number,
  data: Record<string, unknown>
) => api.put(`/admin/extracurriculars/${id}`, data);
export const deleteExtracurricular = (id: number) =>
  api.delete(`/admin/extracurriculars/${id}`);

// ==========================================
// ADMIN SCHEDULES API
// ==========================================

export const getClassSchedules = () => api.get("/admin/schedules/class");
export const getPtsSchedules = () => api.get("/admin/schedules/pts");
export const getPasSchedules = () => api.get("/admin/schedules/pas");
export const createSchedule = (data: Record<string, unknown>) =>
  api.post("/admin/schedules", data);
export const updateSchedule = (id: number, data: Record<string, unknown>) =>
  api.put(`/admin/schedules/${id}`, data);
export const deleteSchedule = (id: number) =>
  api.delete(`/admin/schedules/${id}`);

// ==========================================
// ADMIN DONATIONS API
// ==========================================

// ==========================================
// ADMIN DONATIONS API
// ==========================================

export const getAdminDonations = () => api.get("/admin/donations");
export const getDonationSettings = () => api.get("/admin/donations/settings");
export const updateDonationSettings = (data: Record<string, unknown>) =>
  api.post("/admin/donations/settings", data);
export const updateDonation = (id: number, data: { status: 'approved' | 'rejected' }) =>
  api.patch(`/admin/donations/${id}`, data);
export const deleteDonation = (id: number) =>
  api.delete(`/admin/donations/${id}`);

// ==========================================
// FINANCIAL OBLIGATIONS (TANGGUNGAN) API
// ==========================================

export const getFinancialObligations = () => api.get("/admin/financial-obligations");
export const getFinancialObligationCreateData = () => api.get("/admin/financial-obligations/create");
export const createFinancialObligation = (data: any) => api.post("/admin/financial-obligations", data);
export const getFinancialObligation = (id: number) => api.get(`/admin/financial-obligations/${id}`);
export const updateFinancialObligation = (id: number, data: any) => api.put(`/admin/financial-obligations/${id}`, data);
export const deleteFinancialObligation = (id: number) => api.delete(`/admin/financial-obligations/${id}`);
export const verifyStudentObligation = (id: number, action: 'approve' | 'reject') =>
  api.post(`/admin/student-obligations/${id}/verify`, { action });

// Student Side
export const getStudentFinancialObligations = () => api.get("/siswa/financial-obligations");
export const payStudentObligation = (id: number, data: FormData) =>
  api.post(`/siswa/financial-obligations/${id}/pay`, data, {
    headers: { "Content-Type": "multipart/form-data" }
  });

// ==========================================
// ADMIN USERS API
// ==========================================

export const getRoles = () => api.get("/admin/roles");
export const getAdminUsers = (filters?: { search?: string; role?: string }) =>
  api.get("/admin/users", { params: filters });
export const downloadUsersExport = async (filters?: { search?: string; role?: string }) => {
  const response = await api.get("/admin/users/export", {
    params: filters,
    responseType: "blob",
  });

  // Create a blob link to download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
export const createUser = (data: Record<string, unknown>) =>
  api.post("/admin/users", data);
export const updateUser = (id: number, data: Record<string, unknown>) =>
  api.put(`/admin/users/${id}`, data);
export const deleteUser = (id: number) => api.delete(`/admin/users/${id}`);
export const getUnregisteredTeachers = () =>
  api.get("/admin/users/unregistered-teachers");
export const getUnregisteredStudents = () =>
  api.get("/admin/users/unregistered-students");

// ==========================================
// ADMIN PROFILE SCHOOL API
// ==========================================

export const getProfileSection = (key: string) =>
  api.get(`/admin/profile-school/${key}`);
export const updateProfileSection = (
  key: string,
  data: Record<string, unknown>
) => api.patch(`/admin/profile-school/${key}`, data);

// ==========================================
// GURU API
// ==========================================

export const getGuruAttendanceCreate = () => api.get("/guru/attendance/submit");
export const storeGuruAttendance = (date: string, status: string) =>
  api.post("/guru/attendance/submit", { date, status });
export const getGuruMyQr = () => api.get("/guru/my-qr");

// ==========================================
// TEACHER ATTENDANCE (NEW SYSTEM)
// ==========================================

export const getTeacherAttendance = (filters?: {
  date?: string;
  month?: number;
  year?: number;
  status?: string;
  type?: string;
}) => api.get("/guru/attendance", { params: filters });

export const teacherCheckIn = (data: FormData) =>
  api.post("/guru/attendance/check-in", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const teacherCheckOut = (data: FormData) =>
  api.post("/guru/attendance/check-out", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Admin Teacher Attendance Management
export const getAdminTeacherAttendance = (filters?: {
  date?: string;
  month?: number;
  year?: number;
  status?: string;
  type?: string;
  search?: string;
}) => api.get("/admin/teacher-attendance", { params: filters });

export const approveTeacherAttendance = (id: number) =>
  api.post(`/admin/teacher-attendance/${id}/approve`);

export const rejectTeacherAttendance = (id: number, admin_note: string) =>
  api.post(`/admin/teacher-attendance/${id}/reject`, { admin_note });

export const getTeacherAttendanceSettings = () =>
  api.get("/admin/teacher-attendance/settings");

export const updateTeacherAttendanceSettings = (data: {
  latitude: number;
  longitude: number;
  radius: number;
}) => api.post("/admin/teacher-attendance/settings", data);

export const getAdminPtkAttendanceInput = (date?: string) =>
  api.get("/admin/ptk-attendance", { params: { date } });

export const storeAdminPtkAttendance = (
  attendances: Array<{
    user_id: number;
    status: string;
  }>,
  date: string
) => api.post("/admin/ptk-attendance", { attendances, date });

export const getAdminPtkAttendanceReport = (filters?: {
  start_date?: string;
  end_date?: string;
}) => api.get("/admin/ptk-attendance/report", { params: filters });

export const getTeacherPerformance = (month?: number, year?: number) =>
  api.get("/admin/teacher-performance", { params: { month, year } });

// ==========================================
// SISWA API
// ==========================================

export const getMySchedules = () => api.get("/my-schedules");
export const getSiswaSchedule = () => api.get("/my-schedules"); // Alias for backward compatibility if needed
export const getSiswaDonations = () => api.get("/siswa/donations");
export const storeSiswaDonation = (amount: number, message?: string) =>
  api.post("/siswa/donations", { amount, message });

// ==========================================
// DONATIONS (ALL USERS) API
// ==========================================

export const getDonations = () => api.get("/donations");
export const storeDonation = (data: { donor_name: string; transaction_number: string; amount: number }) =>
  api.post("/donations", data);
export const getPublicDonationSettings = () => api.get("/donation-settings");

// ==========================================
// MEDIA LIBRARY API
// ==========================================

export const getMedia = () => api.get("/admin/media");
export const uploadMedia = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/admin/media", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteMedia = (path: string) =>
  api.delete("/admin/media", { data: { path } });

// ==========================================
// ADMIN ALUMNI API
// ==========================================

export const getAlumni = (year?: string) => api.get('/admin/alumni', { params: { year } });
export const createAlumni = (data: any) => {
  const isFormData = data instanceof FormData;
  return api.post('/admin/alumni', data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined
  });
};
export const updateAlumni = (id: number, data: any) => {
  // update uses POST with _method=PUT for FormData in Laravel if needed, 
  // but usually PUT works with JSON. For files with PUT, Laravel often prefers POST with _method=PUT.
  // Let's assume standard PUT for JSON, but if FormData, we use POST with _method field usually handled by caller or here.
  // Actually, Laravel has trouble with PUT and multipart/form-data. 
  // It is safer to use POST and method spoofing for updates with files.
  const isFormData = data instanceof FormData;
  if (isFormData) {
    data.append('_method', 'PUT');
    return api.post(`/admin/alumni/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
  return api.put(`/admin/alumni/${id}`, data);
};
export const deleteAlumni = (id: number) => api.delete(`/admin/alumni/${id}`);

// ==========================================
// SLOT SCHEDULE API (NEW)
// ==========================================

// Subject Management (Admin)
export const getSubjects = () => api.get("/admin/subjects");
export const createSubject = (data: { name: string; code: string }) =>
  api.post("/admin/subjects", data);
export const updateSubject = (id: number, data: { name: string; code: string }) =>
  api.put(`/admin/subjects/${id}`, data);
export const deleteSubject = (id: number) => api.delete(`/admin/subjects/${id}`);
export const assignTeacherToSubject = (subjectId: number, teacherId: number) =>
  api.post("/admin/subjects/assign-teacher", { subject_id: subjectId, teacher_id: teacherId });
export const removeTeacherFromSubject = (subjectId: number, teacherId: number) =>
  api.post("/admin/subjects/remove-teacher", { subject_id: subjectId, teacher_id: teacherId });

// Class Subject Configuration (Admin)
export const getClassSubjects = (classRoomId: number) =>
  api.get(`/admin/class-rooms/${classRoomId}/subjects`);
export const storeClassSubject = (data: { class_room_id: number; subject_id: number; weekly_hours: number; teacher_id?: number }) =>
  api.post("/admin/class-subjects", data);
export const deleteClassSubject = (id: number) =>
  api.delete(`/admin/class-subjects/${id}`);

// Class Day Slots Configuration (Admin)
export const getClassDaySlots = (classRoomId: number) =>
  api.get(`/admin/class-rooms/${classRoomId}/day-slots`);
export const updateClassDaySlots = (classRoomId: number, slots: Array<{ day: string; total_slots: number }>) =>
  api.post("/admin/class-day-slots", { class_room_id: classRoomId, slots });

// Teacher Constraints (Admin)
export const getTeacherConstraints = (teacherId?: number) =>
  api.get("/admin/teacher-constraints", { params: teacherId ? { teacher_id: teacherId } : {} });
export const createTeacherConstraint = (data: {
  teacher_id: number;
  class_room_id: number;
  day: string;
  slot_numbers: number[];
  is_available?: boolean;
}) => api.post("/admin/teacher-constraints", data);
export const deleteTeacherConstraint = (id: number) =>
  api.delete(`/admin/teacher-constraints/${id}`);

// Slot Schedules (Admin)
export const getSlotSchedules = (filters?: { class_room_id?: number; teacher_id?: number; day?: string }) =>
  api.get("/admin/slot-schedules", { params: filters });
export const generateSlotSchedules = (classRoomIds: number[], overwrite?: boolean) =>
  api.post("/admin/slot-schedules/generate", { class_room_ids: classRoomIds, overwrite });
export const moveSlotSchedule = (data: { source_id: number; target_day: string; target_slot: number; class_room_id: number }) =>
  api.post("/admin/slot-schedules/move", data);
export const updateSlotSchedule = (id: number, data: { subject_id: number; teacher_id: number }) =>
  api.put(`/admin/slot-schedules/${id}`, data);
export const deleteSlotSchedule = (id: number) =>
  api.delete(`/admin/slot-schedules/${id}`);
export const clearSlotSchedules = (classRoomId?: number) =>
  api.post("/admin/slot-schedules/clear", { class_room_id: classRoomId, confirm: true });

// Swap Requests (Admin)
export const getPendingSwapRequests = () => api.get("/admin/swap-requests/pending");
export const approveSwapRequest = (id: number) =>
  api.post(`/admin/swap-requests/${id}/approve`);
export const rejectSwapRequest = (id: number, notes?: string) =>
  api.post(`/admin/swap-requests/${id}/reject`, { notes });

// Export Schedules
export const getSlotScheduleExportUrl = (type: 'class' | 'teacher' | 'all', id?: number) => {
  const token = localStorage.getItem("auth_token");
  let url = `/api/admin/slot-schedules/export?type=${type}&token=${token}`;
  if (type === 'class' && id) url += `&class_room_id=${id}`;
  if (type === 'teacher' && id) url += `&teacher_id=${id}`;
  return url;
};

// Activity Logs (Admin)
export const getActivityLogs = () => api.get("/admin/activity-logs");

// Guru Slot Schedules
export const getGuruSlotSchedules = () => api.get("/guru/slot-schedules");
export const getGuruGlobalSlotSchedules = () => api.get("/guru/slot-schedules/global");
export const requestSwap = (scheduleId1: number, scheduleId2: number, notes?: string) =>
  api.post("/guru/swap-requests", { schedule_id_1: scheduleId1, schedule_id_2: scheduleId2, notes });
export const getMySwapRequests = () => api.get("/guru/swap-requests");
export const cancelSwapRequest = (id: number) => api.delete(`/guru/swap-requests/${id}`);

// Parent Slot Schedules (Read-only)
export const getParentSlotSchedules = () => api.get("/parent/slot-schedules");
export const getParentGlobalSchedule = () => api.get("/parent/slot-schedules/global");

// ==========================================
// ANNOUNCEMENTS & NOTIFICATIONS API
// ==========================================

// Admin
export const getAdminAnnouncements = () => api.get("/admin/announcements");
export const createAnnouncement = (data: { title: string; content: string; target_type: string }) =>
  api.post("/admin/announcements", data);
export const deleteAnnouncement = (id: number) =>
  api.delete(`/admin/announcements/${id}`);

// Users
export const getMyNotifications = () => api.get("/notifications");
export const markNotificationAsRead = (id: string) =>
  api.post(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () =>
  api.post("/notifications/read-all");

// ==========================================
// TASK GURU API
// ==========================================

// Admin
export const getAdminTasks = () => api.get("/admin/tasks");
export const createTask = (data: {
  title: string;
  description?: string;
  type: 'simple' | 'upload' | 'text';
  deadline?: string;
  target_type: 'all' | 'selected';
  selected_teachers?: number[];
}) => api.post("/admin/tasks", data);
export const getTask = (id: number) => api.get(`/admin/tasks/${id}`);
export const updateTask = (id: number, data: any) => api.put(`/admin/tasks/${id}`, data);
export const deleteTask = (id: number) => api.delete(`/admin/tasks/${id}`);
export const verifyTaskSubmission = (assigneeId: number, data: { status: 'approved' | 'rejected'; admin_feedback?: string }) =>
  api.post(`/admin/task-assignees/${assigneeId}/verify`, data);

// Guru
export const getGuruTasks = () => api.get("/guru/tasks");
export const submitTask = (assigneeId: number, data: FormData | { submission_content: string }) => {
  // Check if data is FormData (for file upload)
  const isFormData = data instanceof FormData;
  return api.post(`/guru/task-assignees/${assigneeId}/submit`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined
  });
};

export default api;
