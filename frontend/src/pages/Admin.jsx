import { useEffect, useState } from 'react';
import api from '../services/api';
import BrandMark from '../components/BrandMark';

const Admin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUsers(token);
    }
  }, [token]);

  const fetchUsers = async (adminToken = token) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.get('/admin/users', {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      setUsers(response.data.users);
      setSummary(response.data.summary);
    } catch (err) {
      localStorage.removeItem('adminToken');
      setToken('');
      setError(err.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/admin/login', { username, password });
      localStorage.setItem('adminToken', response.data.token);
      setToken(response.data.token);
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
    setUsers([]);
    setSummary(null);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  if (!token) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div>
            <BrandMark className="auth-brand" />
            <p className="eyebrow text-center">Admin access</p>
            <h1 className="mt-2 text-center text-3xl font-bold text-white">
              Admin Login
            </h1>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            {error && <div className="alert-error">{error}</div>}

            <input
              type="text"
              required
              className="input-field"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              required
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="app-shell">
      <div className="page-container">
        <div className="page-header">
          <div>
            <p className="eyebrow">Admin panel</p>
            <h1 className="page-title">Application Users</h1>
            <p className="page-subtitle">View registered users and email tracking usage.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="btn-secondary" type="button" onClick={() => fetchUsers()}>
              Refresh
            </button>
            <button className="btn-primary" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {error && <div className="alert-error mb-4">{error}</div>}

        <div className="stat-grid lg:grid-cols-4">
          <div className="stat-card">
            <p className="stat-label">Users</p>
            <p className="stat-value">{summary?.totalUsers || 0}</p>
          </div>
          <div className="stat-card border-l-4 border-l-emerald-500">
            <p className="stat-label">Verified</p>
            <p className="stat-value">{summary?.verifiedUsers || 0}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Emails sent</p>
            <p className="stat-value">{summary?.totalSent || 0}</p>
          </div>
          <div className="stat-card border-l-4 border-l-slate-900">
            <p className="stat-label">Total opens</p>
            <p className="stat-value">{summary?.totalOpens || 0}</p>
          </div>
        </div>

        <div className="table-shell">
          {loading ? (
            <div className="loader-wrap">
              <div className="mail-loader" aria-label="Loading admin users">
                <span className="sr-only">Loading admin users</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-[#080e19]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                      User Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Sender Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Opens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#0b1220]">
                  {users.map((user) => (
                    <tr key={user.id} className="transition hover:bg-[#111c2e]">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                        {user.senderEmail || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`status-pill ${
                            user.isVerified
                              ? 'border border-emerald-800 bg-emerald-950 text-emerald-300'
                              : 'border border-amber-800 bg-amber-950 text-amber-300'
                          }`}
                        >
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                        {user.sentCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                        {user.totalOpens}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Admin;
