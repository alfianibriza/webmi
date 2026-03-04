// ==========================================
// User & Auth Types
// ==========================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "guru" | "siswa" | "wali_murid" | "bendahara" | "tu" | "kepala";
  nip?: string;
  nis?: string;
  student_id?: number;
  plain_password?: string;
  must_change_password?: boolean;
  profile_photo_url?: string;
  teacher?: Teacher;
  student?: Student;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ==========================================
// Teacher Types
// ==========================================

export interface Teacher {
  id: number;
  user_id?: number;
  name: string;
  nip?: string;
  position?: string;
  subject?: string;
  gender?: "L" | "P";
  death_date?: string;
  birth_place?: string;
  birth_date?: string;
  address?: string;
  phone?: string;
  email?: string;
  image?: string;
  plain_password?: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Student Types
// ==========================================

export interface Student {
  id: number;
  user_id?: number;
  name: string;
  nis: string;
  nisn?: string;
  grade?: string;
  kelas_id?: number;
  class_room_id?: number;
  classRoom?: ClassRoom;
  class_room?: ClassRoom;
  kelas?: {
    id: number;
    tingkat_id: number;
    rombel_id: number;
    name: string;
    tingkat?: {
      id: number;
      name: string;
      level: number;
    };
    rombel?: {
      id: number;
      name: string;
      status: string;
    };
  };
  gender: "L" | "P";
  birth_place?: string;
  birth_date?: string;
  address?: string;
  parent_name?: string;
  father_name?: string;
  mother_name?: string;
  parent_phone?: string;
  admission_year?: string;
  graduation_year?: string;
  plain_password?: string;
  image?: string;
  status: "active" | "alumni";
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Class Room Types
// ==========================================

export interface ClassRoom {
  id: number;
  name: string;
  level?: string;
  grade?: string;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Post Types
// ==========================================

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  image?: string;
  status: "draft" | "published";
  user_id: number;
  created_at: string;
  updated_at?: string;
}

// ==========================================
// Achievement Types
// ==========================================

export interface Achievement {
  id: number;
  title: string;
  description?: string;
  rank?: string;
  date: string;
  level?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Sarpras Types
// ==========================================

export interface Sarpras {
  id: number;
  name: string;
  description?: string;
  image?: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Extracurricular Types
// ==========================================

export interface Extracurricular {
  id: number;
  name: string;
  description?: string;
  image?: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Philosophy Item Types
// ==========================================

export interface PhilosophyItem {
  id: number;
  title: string;
  description: string;
  image?: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Profile Section Types
// ==========================================

export interface ProfileSection {
  id: number;
  key: string;
  title?: string;
  content?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// PPDB Types
// ==========================================

export interface Ppdb {
  id: number;
  name: string;
  birth_date: string;
  gender: "L" | "P";
  parent_name: string;
  phone: string;
  address: string;
  status?: "pending" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
}

export interface PmbRegistrant {
  id: number;
  name: string;
  birth_date?: string;
  gender: "L" | "P";
  parent_name?: string;
  phone?: string;
  address?: string;
  status: "pending" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
}

export interface PpdbInfo {
  id: number;
  title?: string;
  description?: string;
  image?: string;
  brochure_link?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Attendance Types
// ==========================================

export interface Attendance {
  id: number;
  teacher_id: number;
  teacher?: Teacher;
  date: string;
  status: "hadir" | "izin" | "sakit" | "alpha";
  time?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentAttendance {
  id: number;
  student_id: number;
  student?: Student;
  date: string;
  status: "hadir" | "izin" | "sakit" | "alpha";
  created_at?: string;
  updated_at?: string;
}

export interface StudentAttendanceReportItem {
  id: number;
  name: string;
  nis: string;
  grade?: string;
  class_room_id?: number;
  classRoom?: ClassRoom;
  kelas?: {
    id: number;
    name: string;
    rombel?: { name: string };
    tingkat?: { level: number; name: string };
  };
  classrooms?: Array<{
    id: number;
    name: string;
    rombel?: { name: string };
    tingkat?: { level: number; name: string };
    pivot?: { status: string };
  }>;
  hadir_count: number;
  izin_count: number;
  sakit_count: number;
  alpha_count: number;
}

export interface AttendanceReportFilters {
  start_date: string;
  end_date: string;
  grade?: string;
  class_room_id?: number;
}

// ==========================================
// Schedule Types
// ==========================================

export interface Schedule {
  id: number;
  title: string;
  type: "class" | "pts" | "pas";
  grade?: string;
  class_room_id?: number;
  classRoom?: ClassRoom;
  file_path: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Slot Schedule Types (NEW)
// ==========================================

export interface Subject {
  id: number;
  name: string;
  code: string;
  teachers?: Teacher[];
  created_at?: string;
  updated_at?: string;
}

export interface ClassSubject {
  id: number;
  class_room_id: number;
  subject_id: number;
  weekly_hours: number;
  subject?: Subject;
  class_room?: ClassRoom;
  created_at?: string;
  updated_at?: string;
}

export interface ClassDaySlot {
  id: number;
  class_room_id: number;
  day: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
  total_slots: number;
  class_room?: ClassRoom;
  created_at?: string;
  updated_at?: string;
}

export interface TeacherClassConstraint {
  id: number;
  teacher_id: number;
  class_room_id: number;
  day: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
  slot_numbers: number[];
  is_available: boolean;
  teacher?: Teacher;
  class_room?: ClassRoom;
  created_at?: string;
  updated_at?: string;
}

export interface SlotSchedule {
  id: number;
  class_room_id: number;
  subject_id: number;
  teacher_id: number;
  day: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
  slot_number: number;
  status: 'normal' | 'pending_swap';
  generated_by: 'system' | 'admin';
  class_room?: ClassRoom;
  subject?: Subject;
  teacher?: Teacher;
  created_at?: string;
  updated_at?: string;
}

export interface SwapRequest {
  id: number;
  requester_teacher_id: number;
  target_teacher_id: number;
  schedule_id_1: number;
  schedule_id_2: number;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  notes?: string;
  requester_teacher?: Teacher;
  target_teacher?: Teacher;
  schedule_one?: SlotSchedule;
  schedule_two?: SlotSchedule;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  description: string;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationLog {
  id: number;
  user_id: number;
  schedule_date: string;
  message: string;
  sent_at?: string;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Donation Types
// ==========================================

export interface Donation {
  id: number;
  user_id: number;
  user?: User;
  donor_name?: string;
  transaction_number?: string;
  amount: number;
  message?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at?: string;
}

export interface DonationSetting {
  id: number;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Media Types
// ==========================================

export interface Media {
  name: string;
  path: string;
  url: string;
  size: number;
}

// ==========================================
// API Response Types
// ==========================================

export interface HomeData {
  sliderImages: string[];
  kepalaImage: string | null;
  students_count?: number;
  teachers_count?: number;
}

export interface ProfileData {
  sections: Record<string, ProfileSection>;
  philosophies: PhilosophyItem[];
  teachers: Teacher[];
  groupPhoto: ProfileSection | null;
  extracurriculars: Extracurricular[];
  sarpras: Sarpras[];
  achievements: Achievement[];
}

export interface DashboardStats {
  posts_count: number;
  ppdb_count: number;
  students_count: number;
  teachers_count: number;
  alumni_count: number;
  recent_posts: Post[];
}

export interface ParentDashboardData {
  student: Student | null;
  attendance: StudentAttendance[];
  summary: {
    hadir: number;
    izin: number;
    sakit: number;
    alpha: number;
  };
  filters: {
    month: number;
    year: number;
  };
  schedules?: Schedule[];
}

export interface LoginResponse {
  user: User;
  token: string;
  must_change_password: boolean;
}

// ==========================================
// Task Guru Types
// ==========================================

export interface Task {
  id: number;
  title: string;
  description?: string;
  type: 'simple' | 'upload' | 'text';
  deadline?: string;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  creator?: User;
  assignees?: TaskAssignee[];
  total_assigned?: number;
  pending_count?: number;
  submitted_count?: number;
  approved_count?: number;
  rejected_count?: number;
}

export interface TaskAssignee {
  id: number;
  task_id: number;
  user_id: number;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submitted_at?: string;
  completed_at?: string;
  submission_content?: string;
  submission_file?: string;
  submission_file_url?: string;
  admin_feedback?: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
  task?: Task;
}

