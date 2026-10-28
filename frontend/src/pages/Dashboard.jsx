import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [emails, setEmails] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const openCountsRef = useRef({});
  const hasLoadedRef = useRef(false);
  const searchRef = useRef(search);

  useEffect(() => {
    searchRef.current = search;
    fetchEmails();
  }, [search]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchEmails({ silent: true });
    }, 8000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!notification) return undefined;

    const timeoutId = setTimeout(() => {
      setNotification(null);
    }, 6000);

    return () => clearTimeout(timeoutId);
  }, [notification]);

  const detectNewOpens = (nextEmails) => {
    const nextOpenCounts = {};
    const newlyOpened = [];

    nextEmails.forEach((email) => {
      const previousCount = openCountsRef.current[email._id] ?? 0;
      const currentCount = email.openCount || 0;

      nextOpenCounts[email._id] = currentCount;

      if (hasLoadedRef.current && currentCount > previousCount) {
        newlyOpened.push(email);
      }
    });

    openCountsRef.current = nextOpenCounts;
    hasLoadedRef.current = true;

    if (newlyOpened.length > 0) {
      const latestEmail = newlyOpened.sort((a, b) => {
        return new Date(b.lastOpenedAt || 0) - new Date(a.lastOpenedAt || 0);
      })[0];

      setNotification({
        subject: latestEmail.subject,
        recipient: latestEmail.recipientEmail,
        openCount: latestEmail.openCount || 1,
        openedAt: latestEmail.lastOpenedAt
      });
    }
  };

  const fetchEmails = async ({ silent = false } = {}) => {
    try {
      const response = await api.get(`/emails?search=${searchRef.current}`);
      const nextEmails = response.data.emails;
      detectNewOpens(nextEmails);
      setEmails(nextEmails);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
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
      {notification && (
        <div className="open-toast" role="status" aria-live="polite">
          <div className="open-toast-icon" aria-hidden="true">
            <span />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-zinc-100">Opened now</p>
              <button
                type="button"
                className="toast-close"
                onClick={() => setNotification(null)}
                aria-label="Dismiss notification"
              >
                x
              </button>
            </div>
            <p className="mt-1 truncate text-sm text-zinc-300">
              {notification.subject}
            </p>
            <p className="mt-1 truncate text-xs text-zinc-400">
              {notification.recipient}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {notification.openCount} open{notification.openCount > 1 ? 's' : ''} - {formatDate(notification.openedAt)}
            </p>
          </div>
          <div className="toast-progress" />
        </div>
      )}

      <div className="page-container">
        <div className="page-header">
          <div>
            <p className="eyebrow">Tracking overview</p>
            <h1 className="page-title">Email Dashboard</h1>
            <p className="page-subtitle">Monitor sent emails, opens, and recipient activity.</p>
          </div>
          <Link to="/compose" className="btn-primary w-full sm:w-auto">
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
                <div className="h-7 w-9 rounded border-2 border-slate-400 bg-zinc-900" />
              </div>
              <p className="text-base font-semibold text-zinc-100">No emails found</p>
              <p className="mt-1 text-sm text-zinc-400">Send your first email to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Opens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Last Opened
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                  {emails.map((email) => (
                    <tr key={email._id} className="transition hover:bg-zinc-950">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-100">
                        {email.recipientEmail}
                      </td>
                      <td className="max-w-xs truncate whitespace-nowrap px-6 py-4 text-sm text-zinc-300">
                        {email.subject}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`status-pill ${
                            email.status === 'opened'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {email.status === 'opened' ? 'Opened' : 'Sent'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-400">
                        {email.openCount === 0
                          ? 'Not opened'
                          : `Opened ${email.openCount} time${email.openCount > 1 ? 's' : ''}`}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-400">
                        {formatDate(email.sentAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-400">
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
