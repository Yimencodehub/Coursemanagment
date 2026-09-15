import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useEffect, useState } from 'react';

export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    api.getCourses().then((courses) => {
      setCourse(courses.find((c) => String(c.id) === String(courseId)) || null);
    });
  }, [courseId]);

  if (!course) return <div className="panel">Loading...</div>;

  return (
    <div className="panel">
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p><strong>Instructor:</strong> {course.instructor}</p>
      <p><strong>Category:</strong> {course.category}</p>
      <p><strong>Status:</strong> {course.approved ? 'Approved' : 'Pending Approval'}</p>
      <ul>
        <li>Watch lessons</li>
        <li>Download materials</li>
        <li>Submit assignments</li>
        <li>Take quizzes</li>
      </ul>
    </div>
  );
}
