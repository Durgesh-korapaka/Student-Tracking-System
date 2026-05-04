import { useState } from 'react';
import Layout from './components/Layout';
import StudentTable from './components/StudentTable';
import StudentForm from './components/StudentForm';
import FileUpload from './components/FileUpload';
import { EnrollForm } from './components/EnrollForm';
import { useEffect } from 'react';
import { getDashboard } from './api/studentService';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500 py-6">Loading dashboard...</div>;
  if (!stats) return <div className="text-red-500">Could not load stats.</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-4xl font-bold text-blue-600">{stats.totalStudents}</p>
          <p className="text-gray-500 mt-1 text-sm">Total Students</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-4xl font-bold text-green-600">{stats.totalCourses}</p>
          <p className="text-gray-500 mt-1 text-sm">Total Courses</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Enrollments per Course</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-left">
              <th className="px-4 py-2 font-medium">Course</th>
              <th className="px-4 py-2 font-medium">Enrolled</th>
              <th className="px-4 py-2 font-medium">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.enrollmentStats.map((e, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2">{e.title}</td>
                <td className="px-4 py-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{e.enrolled}</span>
                </td>
                <td className="px-4 py-2">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{e.completed}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Recent Enrollments</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-left">
              <th className="px-4 py-2 font-medium">Student</th>
              <th className="px-4 py-2 font-medium">Course</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.recentEnrollments.map((e, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{e.name}</td>
                <td className="px-4 py-2 text-gray-600">{e.title}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                    ${e.status === 'completed' ? 'bg-green-100 text-green-700' :
                      e.status === 'active' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-600'}`}>
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState('dashboard');
  const [editData, setEditData] = useState(null);

  const handleEdit = (student) => {
    setEditData(student);
    setActive('add');
  };

  const handleSuccess = () => {
    setEditData(null);
    setActive('students');
  };

  const renderContent = () => {
    switch (active) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <StudentTable onEdit={handleEdit} />;
      case 'add': return <StudentForm editData={editData} onSuccess={handleSuccess} />;
      case 'enroll': return <EnrollForm />;
      case 'files': return <FileUpload />;
      default: return null;
    }
  };

  return (
    <Layout active={active} setActive={setActive}>
      {renderContent()}
    </Layout>
  );
}