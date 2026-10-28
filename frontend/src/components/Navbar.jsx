import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
    }`;

  return (
    <nav className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/dashboard" className="flex shrink-0 items-center gap-2">
              <span className="brand-mail-icon" aria-hidden="true" />
              <span className="text-lg font-bold text-zinc-100">EmailTracker</span>
            </Link>
            <div className="flex items-center gap-2">
              <NavLink
                to="/dashboard"
                className={navClass}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/compose"
                className={navClass}
              >
                Compose
              </NavLink>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NavLink
              to="/profile"
              className={navClass}
            >
              Profile
            </NavLink>
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
