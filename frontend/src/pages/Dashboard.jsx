import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [emails, setEmails] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
      const response = await api.get(`/emails?search=${encodeURIComponent(searchRef.current)}`);
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
  const openRate = emails.length ? Math.round((openedCount / emails.length) * 100) : 0;
  const visibleEmails = emails.filter((email) => (
    statusFilter === 'all' || (statusFilter === 'opened' ? email.status === 'opened' : email.status !== 'opened')
  ));

  return (
    <main className="app-shell">
      {notification && (
        <div className="open-toast" role="status" aria-live="polite">
          <div className="open-toast-icon" aria-hidden="true">
            <span />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Opened now</p>
              <button
                type="button"
                className="toast-close"
                onClick={() => setNotification(null)}
                aria-label="Dismiss notification"
              >
                x
              </button>
            </div>
            <p className="mt-1 truncate text-sm text-slate-200">
              {notification.subject}
            </p>
            <p className="mt-1 truncate text-xs text-slate-300">
              {notification.recipient}
            </p>
            <p className="mt-1 text-xs text-slate-300">
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
          <div className="stat-card border-l-4 border-l-blue-500">
            <p className="stat-label">Open rate</p>
            <p className="stat-value">{openRate}%</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total opens</p>
            <p className="stat-value">{totalOpens}</p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by recipient or subject..."
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Filter emails by status">
            {[
              ['all', 'All'],
              ['opened', 'Opened'],
              ['unopened', 'Not opened']
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className="filter-button"
                aria-pressed={statusFilter === value}
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-shell">
          {loading ? (
            <div className="loader-wrap">
              <div className="mail-loader" aria-label="Loading emails">
                <span className="sr-only">Loading emails</span>
              </div>
            </div>
          ) : visibleEmails.length === 0 ? (
            <div className="p-10 text-center">
              <div className="empty-mail-icon" aria-hidden="true">
                <div className="h-7 w-9 rounded border-2 border-slate-400 bg-[#0b1220]" />
              </div>
              <p className="text-base font-semibold text-white">
                {emails.length === 0 ? 'No emails found' : 'No emails match this filter'}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {emails.length === 0 ? 'Send your first email to get started.' : 'Choose another status or search term.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-[#080e19]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Opens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Last Opened
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#0b1220]">
                  {visibleEmails.map((email) => (
                    <tr key={email._id} className="transition hover:bg-[#111c2e]">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                        {email.recipientEmail}
                      </td>
                      <td className="max-w-xs truncate whitespace-nowrap px-6 py-4 text-sm text-slate-200">
                        {email.subject}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`status-pill ${
                            email.status === 'opened'
                              ? 'border border-emerald-800 bg-emerald-950 text-emerald-300'
                              : 'border border-slate-700 bg-[#111c2e] text-slate-200'
                          }`}
                        >
                          {email.status === 'opened' ? 'Opened' : 'Sent'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                        {email.openCount === 0
                          ? 'Not opened'
                          : `Opened ${email.openCount} time${email.openCount > 1 ? 's' : ''}`}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                        {formatDate(email.sentAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
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
