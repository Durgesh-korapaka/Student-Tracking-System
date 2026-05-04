import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children, active, setActive }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar active={active} setActive={setActive} />
        <main className="flex-1 bg-gray-100 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}