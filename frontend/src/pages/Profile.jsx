import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [senderEmail, setSenderEmail] = useState('');
  const [appPasskey, setAppPasskey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSenderEmail(user.senderEmail || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await updateProfile({ senderEmail, appPasskey });
      setMessage('Profile updated successfully');
      setAppPasskey('');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="mx-auto w-full max-w-2xl">
        <div className="page-header">
          <div>
            <p className="eyebrow">SMTP setup</p>
            <h1 className="page-title">Profile Settings</h1>
            <p className="page-subtitle">Manage the sender account used for tracked emails.</p>
          </div>
        </div>

      <div className="panel">
        <div className="panel-body">
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Account</h2>
          <p className="mt-1 text-base font-semibold text-slate-950">{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {message && (
            <div className="alert-success mb-4">
              {message}
            </div>
          )}
          {error && (
            <div className="alert-error mb-4">
              {error}
            </div>
          )}

          <div className="form-stack">
            <div>
              <label className="field-label">
                Sender Email (SMTP)
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="your-email@gmail.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
              <p className="field-help">
                This email will be used to send your tracked emails
              </p>
            </div>

            <div>
              <label className="field-label">
                App Passkey (SMTP Password)
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter your app password"
                value={appPasskey}
                onChange={(e) => setAppPasskey(e.target.value)}
              />
              <p className="field-help">
                Generate an app password from your email provider settings
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
        </div>
      </div>
      </div>
    </main>
  );
};

export default Profile;
