import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [emails, setEmails] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmails();
  }, [search]);

  const fetchEmails = async () => {
    try {
      const response = await api.get(`/emails?search=${search}`);
      setEmails(response.data.emails);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  const openedCount = emails.filter((email) => email.status === 'opened').length;
  const totalOpens = emails.reduce((count, email) => count + (email.openCount || 0), 0);

  return (
    <main className="app-shell">
      <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Tracking overview</p>
          <h1 className="page-title">Email Dashboard</h1>
          <p className="page-subtitle">Monitor sent emails, opens, and recipient activity.</p>
        </div>
        <Link
          to="/compose"
          className="btn-primary w-full sm:w-auto"
        >
          Compose New Email
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-label">Sent emails</p>
          <p className="stat-value">{emails.length}</p>
        </div>
        <div className="stat-card border-l-4 border-l-emerald-500">
          <p className="stat-label">Opened</p>
          <p className="stat-value">{openedCount}</p>
        </div>
        <div className="stat-card border-l-4 border-l-slate-900">
          <p className="stat-label">Total opens</p>
          <p className="stat-value">{totalOpens}</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by recipient or subject..."
          className="input-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-shell">
        {loading ? (
          <div className="loader-wrap">
            <div className="mail-loader" aria-label="Loading emails">
              <span className="sr-only">Loading emails</span>
            </div>
          </div>
        ) : emails.length === 0 ? (
          <div className="p-10 text-center">
            <div className="empty-mail-icon" aria-hidden="true">
              <div className="h-7 w-9 rounded border-2 border-slate-400 bg-white" />
            </div>
            <p className="text-base font-semibold text-slate-900">No emails found</p>
            <p className="mt-1 text-sm text-slate-500">Send your first email to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Opens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Last Opened
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {emails.map((email) => (
                  <tr key={email._id} className="transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      {email.recipientEmail}
                    </td>
                    <td className="max-w-xs truncate whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                      {email.subject}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`status-pill ${
                          email.status === 'opened'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {email.status === 'opened' ? 'Opened' : 'Sent'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {email.openCount === 0
                        ? 'Not opened'
                        : `Opened ${email.openCount} time${email.openCount > 1 ? 's' : ''}`}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {formatDate(email.sentAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {formatDate(email.lastOpenedAt)}
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

export default Dashboard;
