import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || 'student';

  const isActive = (path) => location.pathname === path;

  const adminLinks = [
    { to: '/admin-dashboard', label: 'Admin Dashboard', icon: '📊' },
    { to: '/profile', label: 'Manage Profiles', icon: '👤' },
  ];

  const instructorLinks = [
    { to: '/instructor-dashboard', label: 'Instructor Dashboard', icon: '👨‍🏫' },
    { to: '/create-course', label: 'Add New Course', icon: '➕' },
    { to: '/courses', label: 'Manage Courses', icon: '📖' },
    { to: '/assignments', label: 'Assignments', icon: '📝' },
    { to: '/quizzes', label: 'Quizzes', icon: '❓' },
    { to: '/profile', label: 'Profile Settings', icon: '👤' },
  ];

  const studentLinks = [
    { to: '/student-dashboard', label: 'Student Dashboard', icon: '🎓' },
    { to: '/courses', label: 'Explore Courses', icon: '🔍' },
    { to: '/my-courses', label: 'Enrolled Courses', icon: '⭐' },
    { to: '/assignments', label: 'My Assignments', icon: '📝' },
    { to: '/quizzes', label: 'My Quizzes', icon: '❓' },
    { to: '/profile', label: 'My Profile', icon: '👤' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'instructor' ? instructorLinks : studentLinks;

  return (
    <aside className="sidebar-nav">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Menu</h3>
        <ul className="sidebar-menu">
          <li>
            <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
              <span className="sidebar-icon">🏠</span>
              <span>Home</span>
            </Link>
          </li>
          {links.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className={`sidebar-link ${isActive(link.to) ? 'active' : ''}`}>
                <span className="sidebar-icon">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <span className="sidebar-user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </span>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name || user.email.split('@')[0]}</span>
              <span className="sidebar-user-role">{role.toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
