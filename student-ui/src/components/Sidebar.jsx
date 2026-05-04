export default function Sidebar({ active, setActive }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'students', label: 'Students' },
    { id: 'add', label: 'Add Student' },
    { id: 'enroll', label: 'Enroll Student' },
    { id: 'files', label: '☁ File Upload' },
  ];
  return (
    <aside className="w-56 bg-gray-800 text-white min-h-screen pt-6">
      <nav className="flex flex-col gap-1 px-3">
        {links.map(link => (
          <button
            key={link.id}
            onClick={() => setActive(link.id)}
            className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors
              ${active === link.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            {link.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}