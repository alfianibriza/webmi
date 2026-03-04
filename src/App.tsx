import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import ParentScheduleView from './pages/dashboard/ParentScheduleView';
import ParentExamSchedule from './pages/dashboard/ParentExamSchedule';

// Public Pages
import Welcome from './pages/public/Welcome';
import Login from './pages/auth/Login';
import ChangePassword from './pages/auth/ChangePassword';
import ProfileSchool from './pages/public/ProfileSchool';
import Kesiswaan from './pages/public/Kesiswaan';
import PostPublic from './pages/public/Post';
import PostDetail from './pages/public/PostDetail';
import AchievementDetail from './pages/public/AchievementDetail';
import SarprasPublic from './pages/public/Sarpras';
import Ppdb from './pages/public/Ppdb';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import ScheduleIndex from './pages/dashboard/schedules/Index';
import Profile from './pages/dashboard/Profile'; // Assumed from Profile.tsx
import ProfileSectionEdit from './pages/dashboard/profile/Index';

// Feature Pages (Lazy load or direct import strategies - using direct for now for simplicity/stability)
// Note: Assuming 'Index.tsx' exists in each folder. If not, build might fail, but this is the standard pattern.
import PostIndex from './pages/dashboard/post/Index';
import MediaIndex from './pages/dashboard/media/Index';
import SarprasIndex from './pages/dashboard/sarpras/Index';
import PmbIndex from './pages/dashboard/pmb/Index';
import PmbCreate from './pages/dashboard/pmb/Create';
import PmbEdit from './pages/dashboard/pmb/Edit';
import PmbInfoSettings from './pages/dashboard/pmb/Info'; // Import the Info component
import PtkIndex from './pages/dashboard/ptk/Index';
import StudentIndex from './pages/dashboard/students/Index';
import CreateStudent from './pages/dashboard/students/Create';
import EditStudent from './pages/dashboard/students/Edit';
import ClassRoomIndex from './pages/dashboard/classrooms/Index';
import SubjectIndex from './pages/dashboard/subjects/Index';
import NotificationIndex from './pages/dashboard/notifications/Index';
import UserIndex from './pages/dashboard/users/Index';
import DonationIndex from './pages/dashboard/donations/FinancialWrapper';
import DonationSettings from './pages/dashboard/donations/Settings';
import AchievementIndex from './pages/dashboard/achievements/Index';
import CreateFinancialObligation from './pages/dashboard/financial/Create';
import EditFinancialObligation from './pages/dashboard/financial/Edit';
import ShowFinancialObligation from './pages/dashboard/financial/Show';
import AnnouncementIndex from './pages/dashboard/announcements/Index';
import ExtracurricularIndex from './pages/dashboard/extracurriculars/Index';
import PhilosophyIndex from './pages/dashboard/philosophy/Index';
import DetailKelas from './pages/dashboard/kelas/DetailKelas';
import Enrollment from './pages/dashboard/kelas/Enrollment';
import ClassStudents from './pages/dashboard/kelas/ClassStudents';
import CurriculumIndex from './pages/dashboard/curriculum/Index';
import PtsPasIndex from './pages/dashboard/pts-pas/Index';
import AlumniIndex from './pages/dashboard/alumni/Index';

// Academic Year Management
import AcademicIndex from './pages/dashboard/academic/Index';
import AcademicPromotion from './pages/dashboard/academic/Promotion';
import NewStudentActivation from './pages/dashboard/academic/NewStudentActivation';
import GenerateRombel from './pages/dashboard/academic/GenerateRombel';
import GenerateKelas from './pages/dashboard/academic/GenerateKelas';

// Teacher Specific
import TeacherSchedule from './pages/dashboard/guru/Schedule'; // Verify file name
import AdminTeacherAttendance from './pages/dashboard/attendance/AdminTeacherAttendance';
import TeacherAttendance from './pages/dashboard/attendance/TeacherAttendance';
import StudentAttendance from './pages/dashboard/attendance/StudentAttendance';
import StudentAttendanceReport from './pages/dashboard/attendance/StudentAttendanceReport';
import SlotSchedulesIndex from './pages/dashboard/slot-schedules/Index';
import SwapRequestsIndex from './pages/dashboard/swap-requests/Index';



import ProtectedRoute from './components/ProtectedRoute';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';

import AdminTaskList from './pages/dashboard/tasks/AdminTaskList';
import AdminTaskCreate from './pages/dashboard/tasks/AdminTaskCreate';
import AdminTaskDetail from './pages/dashboard/tasks/AdminTaskDetail';
import GuruTaskList from './pages/dashboard/tasks/GuruTaskList';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />

          {/* Public Routes */}
          <Route path="/profil-madrasah" element={<ProfileSchool />} />
          <Route path="/kesiswaan" element={<Kesiswaan />} />
          <Route path="/post" element={<PostPublic />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/prestasi/:id" element={<AchievementDetail />} />
          <Route path="/sarpras" element={<SarprasPublic />} />
          <Route path="/pmb" element={<Ppdb />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            {/* Core Dashboard */}
            <Route index element={<Dashboard />} />

            {/* User Profile */}
            <Route path="profile-settings" element={<Profile />} />
            <Route path="profile/:key" element={<ProfileSectionEdit />} />

            {/* Content Management */}
            <Route path="post" element={<PostIndex />} />
            <Route path="media" element={<MediaIndex />} />
            <Route path="announcements" element={<AnnouncementIndex />} />

            {/* Academic & Management */}
            <Route path="students" element={<StudentIndex />} />
            <Route path="students/create" element={<CreateStudent />} />
            <Route path="students/:id/edit" element={<EditStudent />} />
            <Route path="ptk" element={<PtkIndex />} />
            <Route path="classrooms" element={<ClassRoomIndex />} />
            <Route path="subjects" element={<SubjectIndex />} />
            <Route path="schedules" element={<ScheduleIndex />} />
            <Route path="pts-pas" element={<PtsPasIndex />} />
            <Route path="learning-schedule" element={<ParentScheduleView />} />
            <Route path="exam-schedule" element={<ParentExamSchedule />} />
            {/* Note: 'schedules' seems to be used for parents, need to verify if there's an admin schedule page */}

            {/* Facilities & Assets */}
            <Route path="sarpras" element={<SarprasIndex />} />

            {/* External Affairs */}
            <Route path="pmb" element={<PmbIndex />} />
            <Route path="pmb/create" element={<PmbCreate />} />
            <Route path="pmb/:id/edit" element={<PmbEdit />} />
            <Route path="pmb/info" element={<PmbInfoSettings />} />
            <Route path="donations" element={<DonationIndex />} />
            <Route path="donations/settings" element={<DonationSettings />} />

            {/* Financial Obligations */}
            <Route path="financial/create" element={<CreateFinancialObligation />} />
            <Route path="financial/:id/edit" element={<EditFinancialObligation />} />
            <Route path="financial/:id" element={<ShowFinancialObligation />} />

            {/* Academic Year Management */}
            <Route path="academic-years" element={<AcademicIndex />} />
            <Route path="academic-years/promotion" element={<AcademicPromotion />} />
            <Route path="academic-years/activate-new" element={<NewStudentActivation />} />
            <Route path="academic-years/generate-rombel" element={<GenerateRombel />} />
            <Route path="academic-years/generate-kelas" element={<GenerateKelas />} />

            {/* System */}
            <Route path="notifications" element={<NotificationIndex />} />
            <Route path="users" element={<UserIndex />} />

            <Route path="users" element={<UserIndex />} />



            <Route path="tasks" element={<AdminTaskList />} />
            <Route path="tasks/create" element={<AdminTaskCreate />} />
            <Route path="tasks/:id" element={<AdminTaskDetail />} />

            {/* Teacher Specific */}
            <Route path="guru/schedule" element={<TeacherSchedule />} />
            <Route path="guru/tasks" element={<GuruTaskList />} />
            <Route path="attendance/teachers" element={<TeacherAttendance />} />
            <Route path="attendance/teacher-approval" element={<AdminTeacherAttendance />} />
            <Route path="attendance/students" element={<StudentAttendance />} />
            <Route path="attendance/students/report" element={<StudentAttendanceReport />} />
            <Route path="alumni" element={<AlumniIndex />} />
            <Route path="detail-kelas" element={<DetailKelas />} />
            <Route path="enrollment" element={<Enrollment />} />
            <Route path="enrollment/:kelasId" element={<ClassStudents />} />


            {/* Other Modules inferred from folders */}
            <Route path="achievements" element={<AchievementIndex />} />
            <Route path="extracurriculars" element={<ExtracurricularIndex />} />
            <Route path="philosophy" element={<PhilosophyIndex />} />
            <Route path="curriculum" element={<CurriculumIndex />} />
            <Route path="slot-schedules" element={<SlotSchedulesIndex />} />
            <Route path="slot-schedules" element={<SlotSchedulesIndex />} />
            <Route path="swap-requests" element={<SwapRequestsIndex />} />

            {/* Student View */}


          </Route>

          {/* Standalone Protected Routes */}
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
