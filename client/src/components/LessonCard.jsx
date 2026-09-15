export default function LessonCard({ lesson, onOpen }) {
  return (
    <div className="card">
      <h3>{lesson.title}</h3>
      <p>{lesson.description}</p>
      {lesson.material && <p><strong>Material:</strong> {lesson.material}</p>}
      {lesson.videoUrl && <a href={lesson.videoUrl} target="_blank" rel="noreferrer">Open lesson</a>}
      <button className="btn btn-secondary" type="button" onClick={() => onOpen(lesson)} style={{ marginTop: '0.5rem' }}>View</button>
    </div>
  );
}
