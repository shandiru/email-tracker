import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const passkeyGuideUrl = 'https://www.youtube.com/embed/JremHKp4i1U';

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

    if (senderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail.trim())) {
      setError('Please enter a valid sender email');
      return;
    }

    setLoading(true);

    try {
      await updateProfile({ senderEmail: senderEmail.trim().toLowerCase(), appPasskey });
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
      <div className="mx-auto w-full max-w-3xl">
        <div className="page-header">
          <div>
            <h1 className="page-title">Profile</h1>
            <p className="page-subtitle">Update your account and sender email settings.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="panel">
          <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-white">Account settings</h2>
          </div>

          <div className="panel-body">
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

            <div className="settings-form">
              <div className="form-row">
                <div>
                  <label className="field-label">Account Email</label>
                  <p className="field-help">Login email for this account.</p>
                </div>
                <div className="form-control">
                <input
                  type="email"
                  className="input-field bg-[#080e19] text-slate-300"
                  value={user?.email || ''}
                  readOnly
                />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="field-label">Sender Email</label>
                  <p className="field-help">SMTP email used to send tracked emails.</p>
                </div>
                <div className="form-control">
                <input
                  type="email"
                  className="input-field"
                  placeholder="your-email@gmail.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value.trimStart())}
                />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="field-label">App Passkey</label>
                  <p className="field-help">Use your email provider app password.</p>
                </div>
                <div className="form-control">
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Enter app password"
                    value={appPasskey}
                    onChange={(e) => setAppPasskey(e.target.value)}
                  />
                  <div className="mt-4 overflow-hidden rounded-lg border border-slate-800 bg-[#080e19]">
                    <div className="aspect-video">
                      <iframe
                        className="h-full w-full"
                        src={passkeyGuideUrl}
                        title="How to get an email app passkey"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-800 pt-5">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Profile;
