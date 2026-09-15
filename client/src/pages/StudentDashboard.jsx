export default function StudentDashboard() {
  return (
    <div className="panel">
      <h1>Student Dashboard</h1>
      <p>Browse courses, enroll, watch lessons, download materials, submit assignments, take quizzes, view grades, and track progress.</p>
      <div className="grid">
        <div className="card">
          <h3>Browse Courses</h3>
          <p>Discover new learning paths.</p>
        </div>
        <div className="card">
          <h3>My Learning</h3>
          <p>Follow lessons, grades, and your progress.</p>
        </div>
        <div className="card">
          <h3>Assignments & Quizzes</h3>
          <p>Submit your work and review outcomes.</p>
        </div>
      </div>
    </div>
  );
}
