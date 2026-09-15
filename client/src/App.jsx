import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import MyCourses from './pages/MyCourses';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import Lessons from './pages/Lessons';
import Assignments from './pages/Assignments';
import Quizzes from './pages/Quizzes';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import Feedback from './pages/Feedback';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/instructor-dashboard" element={<ProtectedRoute><InstructorDashboard /></ProtectedRoute>} />
            <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/create-course" element={<ProtectedRoute><CreateCourse /></ProtectedRoute>} />
            <Route path="/edit-course/:courseId" element={<ProtectedRoute><EditCourse /></ProtectedRoute>} />
            <Route path="/courses/:courseId/lessons" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
            <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
            <Route path="/quizzes" element={<ProtectedRoute><Quizzes /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;

