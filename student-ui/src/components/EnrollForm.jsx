import { useState, useEffect } from 'react';
import { getAllStudents, enrollStudent, getDashboard } from '../api/studentService';

export function EnrollForm() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ student_id: '', course_id: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const courses = [
    { id: 1, title: 'Node.js Basics' },
    { id: 2, title: 'MySQL Fundamentals' },
    { id: 3, title: 'React Frontend' },
  ];

  useEffect(() => {
    getAllStudents().then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.student_id || !form.course_id)
      return setError('Please select both student and course');
    setLoading(true); setError(''); setMsg('');
    try {
      const res = await enrollStudent({
        student_id: parseInt(form.student_id),
        course_id: parseInt(form.course_id)
      });
      setMsg(`✅ ${res.data.student} enrolled in ${res.data.course}!`);
      setForm({ student_id: '', course_id: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Enroll Student in Course</h2>

      {msg && <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">{msg}</div>}
      {error && <div className="mb-4 bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
          <select
            value={form.student_id}
            onChange={e => setForm({ ...form, student_id: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Choose a student --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
          <select
            value={form.course_id}
            onChange={e => setForm({ ...form, course_id: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Choose a course --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors disabled:opacity-60">
          {loading ? 'Enrolling...' : 'Enroll Student'}
        </button>
      </form>
    </div>
  );
}