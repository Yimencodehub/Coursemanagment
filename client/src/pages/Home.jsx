import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="panel">
      <h1>Welcome to CourseHub</h1>
      <p>Manage courses, lessons, assignments, and quizzes in one place.</p>
      <Link className="btn btn-primary" to="/courses">Browse Courses</Link>
    </div>
  );
}
