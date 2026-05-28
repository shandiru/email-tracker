import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/dashboard" className="flex shrink-0 items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-200">
                ET
              </span>
              <span className="text-lg font-bold text-slate-950">EmailTracker</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-700"
              >
                Dashboard
              </Link>
              <Link
                to="/compose"
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-700"
              >
                Compose
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-700"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="btn-secondary min-h-9 px-3 py-1.5"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
