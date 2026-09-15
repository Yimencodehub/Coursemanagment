import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (user?.email) {
      api.getMyCourses(user.email).then(setCourses);
    }
  }, [user?.email]);

  return (
    <div className="panel">
      <h1>My Courses</h1>
      <p>Welcome, {user?.name || 'student'}.</p>
      {courses.length === 0 ? (
        <p>You have not enrolled in any courses yet.</p>
      ) : (
        courses.map((course) => (
          <div key={course.id} className="panel" style={{ marginTop: '0.75rem' }}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
          </div>
        ))
      )}
    </div>
  );
}
