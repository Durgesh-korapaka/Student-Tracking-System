import { useState, useEffect } from 'react';
import { getAllStudents } from '../api/studentService';
import { uploadFile, getStudentFiles } from '../api/uploadService';

export default function FileUpload() {
  const [students, setStudents]   = useState([]);
  const [studentId, setStudentId] = useState('');
  const [file, setFile]           = useState(null);
  const [files, setFiles]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState('');
  const [error, setError]         = useState('');

  useEffect(() => {
    getAllStudents().then(r => setStudents(r.data));
  }, []);

  const fetchFiles = async (id) => {
    if (!id) return;
    const res = await getStudentFiles(id);
    setFiles(res.data);
  };

  const handleStudentChange = (e) => {
    setStudentId(e.target.value);
    fetchFiles(e.target.value);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!studentId || !file) return setError('Select a student and file');
    setLoading(true); setError(''); setMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadFile(studentId, formData);
      setMsg('✅ File uploaded to S3 successfully!');
      setFile(null);
      fetchFiles(studentId);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl shadow p-6 max-w-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Upload File to AWS S3</h2>
        <p className="text-xs text-gray-400 mb-4">File will be stored in S3 and URL saved in MySQL</p>

        {msg   && <div className="mb-3 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">{msg}</div>}
        {error && <div className="mb-3 bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
            <select value={studentId} onChange={handleStudentChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">-- Choose student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Choose File</label>
            <input type="file" onChange={e => setFile(e.target.files[0])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"/>
            {file && <p className="text-xs text-gray-500 mt-1">Selected: {file.name}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg text-sm disabled:opacity-60 transition-colors">
            {loading ? 'Uploading to S3...' : '⬆ Upload to S3'}
          </button>
        </form>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Uploaded Files ({files.length})
          </h3>
          <div className="flex flex-col gap-2">
            {files.map(f => (
              <div key={f.id}
                className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">📄 {f.file_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(f.uploaded_at).toLocaleString()}
                  </p>
                </div>
                <a href={f.file_url} target="_blank" rel="noopener noreferrer"
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md text-xs font-medium transition-colors">
                  View File
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
