import { useState } from 'react';
import { createStudent, updateStudent } from '../api/studentService';
import MultiSelect from './MultiSelect';

const COURSE_OPTIONS = ['Node.js Basics', 'MySQL Fundamentals', 'React Frontend'];

export default function StudentForm({ editData, onSuccess }) {
  const [form, setForm] = useState({
    name: editData?.name || '',
    email: editData?.email || '',
    phone: editData?.phone || '',
  });
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email is required';
    if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone = 'Phone must be exactly 10 digits';
    return e;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);
    setLoading(true);
    try {
      if (editData) await updateStudent(editData.id, form);
      else await createStudent(form);
      setSuccessMsg(editData ? 'Student updated!' : 'Student added!');
      setForm({ name: '', email: '', phone: '' });
      setSelectedCourses([]);
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.join(', ') || 'Something went wrong';
      setErrors({ api: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        {editData ? 'Edit Student' : 'Add New Student'}
      </h2>

      {successMsg && <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">{successMsg}</div>}
      {errors.api && <div className="mb-4 bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">{errors.api}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input name="name" value={form.name} onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
              ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="Enter full name" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input name="email" value={form.email} onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
              ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="example@email.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
              ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="10-digit phone number" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Courses (multi-select)</label>
          <MultiSelect
            options={COURSE_OPTIONS}
            selected={selectedCourses}
            onChange={setSelectedCourses}
            placeholder="Select courses..."
          />
        </div>

        <button type="submit" disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors disabled:opacity-60">
          {loading ? 'Saving...' : editData ? 'Update Student' : 'Add Student'}
        </button>
      </form>
    </div>
  );
}