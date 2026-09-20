import { API_BASE_URL } from '../config/api';

const COURSE_STORAGE_KEY = 'app_courses';
const ENROLLMENT_STORAGE_KEY = 'app_enrollments';

const fallbackCourses = [
  {
    id: 'course-1',
    title: 'React Fundamentals',
    description: 'Learn components, state, and hooks.',
    instructor: 'instructor@example.com',
    category: 'Frontend',
    approved: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'course-2',
    title: 'Node.js Basics',
    description: 'Build modern backend services with Node.js.',
    instructor: 'instructor@example.com',
    category: 'Backend',
    approved: true,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const api = {
  getCourses: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`);
      if (response.ok) {
        const data = await response.json();
        const courses = Array.isArray(data) ? data : [];
        if (courses.length) {
          writeJson(COURSE_STORAGE_KEY, courses);
          return courses;
        }
      }
    } catch {
      // fallback
    }
    return readJson(COURSE_STORAGE_KEY, fallbackCourses);
  },

  getCourse: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${id}`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // fallback
    }
    const courses = readJson(COURSE_STORAGE_KEY, fallbackCourses);
    return courses.find((c) => String(c.id) === String(id)) || null;
  },

  createCourse: async (course) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
      });

      if (response.ok) {
        const data = await response.json();
        const courses = readJson(COURSE_STORAGE_KEY, fallbackCourses);
        const nextCourses = [data.course || data, ...courses];
        writeJson(COURSE_STORAGE_KEY, nextCourses);
        return data.course || data;
      }
    } catch {
      // fallback
    }

    const courses = readJson(COURSE_STORAGE_KEY, fallbackCourses);
    const nextCourse = { id: `course-${Date.now()}`, ...course, approved: true, createdAt: new Date().toISOString() };
    const nextCourses = [nextCourse, ...courses];
    writeJson(COURSE_STORAGE_KEY, nextCourses);
    return nextCourse;
  },

  updateCourse: async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const courses = readJson(COURSE_STORAGE_KEY, fallbackCourses);
        const nextCourses = courses.map((c) => (String(c.id) === String(id) ? { ...c, ...updates } : c));
        writeJson(COURSE_STORAGE_KEY, nextCourses);
        return { success: true };
      }
    } catch {
      // fallback
    }

    const courses = readJson(COURSE_STORAGE_KEY, fallbackCourses);
    const nextCourses = courses.map((c) => (String(c.id) === String(id) ? { ...c, ...updates } : c));
    writeJson(COURSE_STORAGE_KEY, nextCourses);
    return { success: true };
  },

  deleteCourse: async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/courses/${id}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
    const courses = readJson(COURSE_STORAGE_KEY, fallbackCourses);
    const nextCourses = courses.filter((c) => String(c.id) !== String(id));
    writeJson(COURSE_STORAGE_KEY, nextCourses);
    return { success: true };
  },

  assignInstructor: async (id, instructorEmail) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${id}/assign-instructor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructor: instructorEmail }),
      });
      if (response.ok) {
        const courses = readJson(COURSE_STORAGE_KEY, fallbackCourses);
        const nextCourses = courses.map((c) => (String(c.id) === String(id) ? { ...c, instructor: instructorEmail } : c));
        writeJson(COURSE_STORAGE_KEY, nextCourses);
        return { success: true };
      }
    } catch {
      // fallback
    }

    const courses = readJson(COURSE_STORAGE_KEY, fallbackCourses);
    const nextCourses = courses.map((c) => (String(c.id) === String(id) ? { ...c, instructor: instructorEmail } : c));
    writeJson(COURSE_STORAGE_KEY, nextCourses);
    return { success: true };
  },

  enrollCourse: async (courseId, email) => {
    const enrollments = readJson(ENROLLMENT_STORAGE_KEY, []);
    const nextEnrollments = enrollments.filter((entry) => entry.courseId !== courseId || entry.email !== email);
    nextEnrollments.push({ courseId, email, enrolledAt: new Date().toISOString() });
    writeJson(ENROLLMENT_STORAGE_KEY, nextEnrollments);
    return nextEnrollments;
  },

  getMyCourses: async (email) => {
    const allCourses = await api.getCourses();
    const enrollments = readJson(ENROLLMENT_STORAGE_KEY, []);
    const enrolledCourseIds = enrollments.filter((entry) => entry.email === email).map((entry) => entry.courseId);
    return allCourses.filter((course) => enrolledCourseIds.includes(course.id));
  },
};
