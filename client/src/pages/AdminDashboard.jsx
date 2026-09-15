import { useEffect, useMemo, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import './AdminDashboard.css';

const USER_STORAGE_KEY = 'app_registered_users';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);

  // Add User Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [addLoading, setAddLoading] = useState(false);

  // Fetch users platform-independently from Firebase Firestore + fallback
  const fetchUsers = async () => {
    setLoading(true);
    let combinedUsersMap = {};

    // 1. Read from Firebase Cloud Firestore
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      querySnapshot.forEach((document) => {
        const u = document.data();
        const email = normalizeEmail(u.email || document.id);
        combinedUsersMap[email] = {
          ...u,
          email,
          name: u.name || email.split('@')[0],
          role: u.role || 'student',
          active: u.active !== false,
        };
      });
    } catch (fsErr) {
      console.warn('Firestore fetch users warning:', fsErr.message);
    }

    // 2. Read from LocalStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '{}');
      if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
        Object.entries(stored).forEach(([storedEmail, u]) => {
          const email = normalizeEmail(u?.email || storedEmail);
          if (!combinedUsersMap[email]) {
            combinedUsersMap[email] = {
              ...u,
              email,
              name: u?.name || email.split('@')[0],
              role: u?.role || 'student',
              active: u?.active !== false,
            };
          }
        });
      }
    } catch {
      // ignore
    }

    setUsers(Object.values(combinedUsersMap));
    setLoading(false);
  };

  const fetchFeedbacks = async () => {
    setFeedbacksLoading(true);
    try {
      const qSnap = await getDocs(collection(db, 'feedbacks'));
      const fbList = [];
      qSnap.forEach((doc) => {
        fbList.push({ id: doc.id, ...doc.data() });
      });
      // Sort by newest first
      fbList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFeedbacks(fbList);
    } catch (err) {
      console.warn('Failed to fetch feedbacks:', err);
    }
    setFeedbacksLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchFeedbacks();
  }, []);

  const saveUsersLocally = (nextUsers) => {
    const payload = nextUsers.reduce((acc, user) => {
      const email = normalizeEmail(user.email);
      acc[email] = { ...user, email };
      return acc;
    }, {});
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload));
    setUsers(nextUsers);
  };

  // Add New User (Firestore + Local)
  const handleAddUser = async (e) => {
    e.preventDefault();
    const cleanEmail = normalizeEmail(newUser.email);
    if (!cleanEmail || !newUser.name) return;

    setAddLoading(true);
    const createdUserObj = {
      name: newUser.name.trim(),
      email: cleanEmail,
      role: newUser.role,
      active: true,
      createdAt: new Date().toISOString(),
    };

    // 1. Save to Cloud Firestore
    try {
      await setDoc(doc(db, 'users', cleanEmail), createdUserObj);
    } catch (fsErr) {
      console.warn('Firestore add user warning:', fsErr.message);
    }

    // 2. Save locally
    const nextUsers = [createdUserObj, ...users.filter((u) => normalizeEmail(u.email) !== cleanEmail)];
    saveUsersLocally(nextUsers);

    setNewUser({ name: '', email: '', password: '', role: 'student' });
    setShowAddModal(false);
    setAddLoading(false);
    setMessage(`✅ User ${cleanEmail} added successfully, you can see in DB.`);
  };

  const nonAdminUsers = useMemo(
    () => users.filter((u) => u.role && u.role !== 'admin'),
    [users]
  );

  const filteredUsers = useMemo(() => {
    let result = nonAdminUsers;

    if (activeTab === 'student') {
      result = result.filter((u) => u.role === 'student');
    } else if (activeTab === 'instructor') {
      result = result.filter((u) => u.role === 'instructor');
    } else if (activeTab === 'active') {
      result = result.filter((u) => u.active !== false);
    } else if (activeTab === 'inactive') {
      result = result.filter((u) => u.active === false);
    }

    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((u) =>
        [u.name, u.email, u.role].some((v) => String(v).toLowerCase().includes(term))
      );
    }

    return result;
  }, [nonAdminUsers, search, activeTab]);

  const removeUser = async (email) => {
    if (window.confirm(`Are you sure you want to delete user ${email}?`)) {
      const cleanEmail = normalizeEmail(email);
      try {
        await deleteDoc(doc(db, 'users', cleanEmail));
      } catch (fsErr) {
        console.warn('Firestore delete user warning:', fsErr.message);
      }
      const next = users.filter((u) => normalizeEmail(u.email) !== cleanEmail);
      saveUsersLocally(next);
      setMessage(`✅ User ${email} deleted successfully from Database.`);
    }
  };

  const updateRole = async (email, role) => {
    const cleanEmail = normalizeEmail(email);
    try {
      await updateDoc(doc(db, 'users', cleanEmail), { role });
    } catch (fsErr) {
      console.warn('Firestore role update warning:', fsErr.message);
    }
    const next = users.map((u) =>
      normalizeEmail(u.email) === cleanEmail ? { ...u, role } : u
    );
    saveUsersLocally(next);
    setMessage(`✅ Role for ${email} updated to "${role}".`);
  };

  const toggleActive = async (email) => {
    const cleanEmail = normalizeEmail(email);
    const targetUser = users.find((u) => normalizeEmail(u.email) === cleanEmail);
    const newActiveState = !(targetUser?.active !== false);

    try {
      await updateDoc(doc(db, 'users', cleanEmail), { active: newActiveState });
    } catch (fsErr) {
      console.warn('Firestore toggle active warning:', fsErr.message);
    }

    const next = users.map((u) =>
      normalizeEmail(u.email) === cleanEmail ? { ...u, active: newActiveState } : u
    );
    saveUsersLocally(next);
    setMessage(`✅ User status updated (${newActiveState ? 'Activated' : 'Deactivated'}).`);
  };

  const totalUsers = nonAdminUsers.length;
  const activeUsers = nonAdminUsers.filter((u) => u.active !== false).length;
  const inactiveUsers = nonAdminUsers.filter((u) => u.active === false).length;

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="admin-dashboard-header">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage users, roles, account status, and review reports.</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn-add-user" onClick={() => setShowAddModal(true)}>
            ➕ Add User
          </button>
          <button className="btn-refresh" onClick={() => { fetchUsers(); fetchFeedbacks(); }}>
            🔄 Refresh Database
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className="admin-alert-message">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage('')} className="btn-close-alert">✕</button>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <h3>➕ Add New User</h3>
            <form onSubmit={handleAddUser} className="admin-modal-form">
              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Account Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
              <div className="admin-modal-buttons">
                <button type="submit" className="btn-submit-modal" disabled={addLoading}>
                  {addLoading ? 'Saving...' : 'Save User to DB'}
                </button>
                <button type="button" className="btn-cancel-modal" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Overview Card */}
      <div className="admin-actions-card">
        <h3 className="admin-card-title">👥 Manage Users </h3>
        <div className="admin-actions-grid">
          <button
            type="button"
            className={`admin-action-item ${activeTab === 'all' && !search ? 'active' : ''}`}
            onClick={() => { setActiveTab('all'); setSearch(''); }}
          >
            📋 <strong>View Users</strong> ({totalUsers})
          </button>
          <button
            type="button"
            className="admin-action-item"
            onClick={() => setShowAddModal(true)}
          >
            ➕ <strong>Add User</strong>
          </button>
          <button
            type="button"
            className="admin-action-item"
            onClick={() => {
              const searchInput = document.getElementById('admin-user-search');
              if (searchInput) searchInput.focus();
            }}
          >
            🔍 <strong>Search Users</strong>
          </button>
          <button
            type="button"
            className={`admin-action-item ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => setActiveTab('student')}
          >
            🔄 <strong>Change Role</strong>
          </button>
          <button
            type="button"
            className={`admin-action-item ${(activeTab === 'active' || activeTab === 'inactive') ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'inactive' ? 'active' : 'inactive')}
          >
            ⚡ <strong>Activate / Deactivate</strong>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="admin-controls-section">
        <div className="admin-search-wrapper">
          <input
            id="admin-user-search"
            type="text"
            className="admin-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search users by name, email, or role..."
          />
          {search && (
            <button type="button" className="btn-clear-search" onClick={() => setSearch('')}>
              Clear
            </button>
          )}
        </div>

        <div className="admin-filter-tabs">
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            All Users ({nonAdminUsers.length})
          </button>
          <button className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`} onClick={() => setActiveTab('student')}>
            Students ({nonAdminUsers.filter((u) => u.role === 'student').length})
          </button>
          <button className={`tab-btn ${activeTab === 'instructor' ? 'active' : ''}`} onClick={() => setActiveTab('instructor')}>
            Instructors ({nonAdminUsers.filter((u) => u.role === 'instructor').length})
          </button>
          <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
            Active ({activeUsers})
          </button>
          <button className={`tab-btn ${activeTab === 'inactive' ? 'active' : ''}`} onClick={() => setActiveTab('inactive')}>
            Inactive ({inactiveUsers})
          </button>
        </div>
      </div>

      {/* User Cards Grid */}
      <div className="admin-users-section">
        <h3 className="section-heading">User List ({filteredUsers.length})</h3>

        {loading ? (
          <p className="loading-text">Loading users from DB...</p>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-empty-card">
            <p>No users found matching your criteria.</p>
          </div>
        ) : (
          <div className="admin-user-grid">
            {filteredUsers.map((user) => (
              <div key={user.email} className="admin-user-card">
                <div>
                  <div className="user-card-header">
                    <h4 className="user-name">{user.name || user.email.split('@')[0]}</h4>
                    <span className={`status-badge ${user.active === false ? 'inactive' : 'active'}`}>
                      {user.active === false ? 'Inactive' : 'Active'}
                    </span>
                  </div>
                  <p className="user-detail-row"><strong>Email:</strong> {user.email}</p>
                  <p className="user-detail-row"><strong>Role:</strong> <span className="capitalize">{user.role}</span></p>
                </div>

                <div className="user-card-actions">
                  <div className="role-selector-row">
                    <label>Change Role:</label>
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.email, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                    </select>
                  </div>

                  <div className="action-buttons-row">
                    <button
                      type="button"
                      className="btn-toggle-status"
                      onClick={() => toggleActive(user.email)}
                    >
                      {user.active === false ? 'Activate' : 'Deactivate'}
                    </button>
                    <button
                      type="button"
                      className="btn-delete-user"
                      onClick={() => removeUser(user.email)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reports Section */}
      <div className="admin-reports-section">
        <h3 className="section-heading">📊 Reports Overview</h3>

        <div className="reports-stats-grid">
          <div className="stat-card blue">
            <div className="stat-number">{totalUsers}</div>
            <p className="stat-label">Total Users</p>
          </div>
          <div className="stat-card green">
            <div className="stat-number">{activeUsers}</div>
            <p className="stat-label">Active Users</p>
          </div>
          <div className="stat-card red">
            <div className="stat-number">{inactiveUsers}</div>
            <p className="stat-label">Inactive Users</p>
          </div>
        </div>

        <div className="reports-distribution-card">
          <h4 className="distribution-title">User Roles Distribution</h4>
          {['student', 'instructor'].map((role) => {
            const count = nonAdminUsers.filter((u) => u.role === role).length;
            const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
            return (
              <div key={role} className="progress-row">
                <div className="progress-labels">
                  <span className="capitalize">{role}s ({count})</span>
                  <span>{percentage}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className={`progress-bar-fill ${role}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedbacks Section */}
      <div className="admin-reports-section" style={{ marginTop: '1.5rem' }}>
        <h3 className="section-heading">💬 User Feedback ({feedbacks.length})</h3>
        
        {feedbacksLoading ? (
          <p className="loading-text">Loading feedbacks...</p>
        ) : feedbacks.length === 0 ? (
          <div className="admin-empty-card">
            <p>No feedbacks submitted yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {feedbacks.map((fb) => (
              <div key={fb.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{fb.name} {fb.email ? `<${fb.email}>` : ''}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {new Date(fb.createdAt).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#334155', whiteSpace: 'pre-wrap' }}>{fb.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
