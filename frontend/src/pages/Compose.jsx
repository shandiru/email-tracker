import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Compose = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedRecipientEmail = recipientEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedRecipientEmail)) {
      setError('Please enter a valid recipient email');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('recipientEmail', normalizedRecipientEmail);
      formData.append('subject', subject.trim());
      formData.append('body', body);
      if (attachment) {
        formData.append('attachment', attachment);
      }

      await api.post('/emails/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="mx-auto w-full max-w-5xl">
        <div className="page-header">
          <div>
            <h1 className="page-title">Compose Email</h1>
            <p className="page-subtitle">Send a tracked email with optional attachment.</p>
          </div>
        </div>

        {error && (
          <div className="alert-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="compose-shell">
          <div className="compose-row">
            <label className="compose-label">To</label>
            <input
              type="email"
              required
              className="compose-input"
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value.trimStart())}
            />
          </div>

          <div className="compose-row">
            <label className="compose-label">Subject</label>
            <input
              type="text"
              required
              className="compose-input"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <textarea
            required
            className="compose-body"
            placeholder="Write your message here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <div className="compose-footer">
            <div className="min-w-0">
              <label className="btn-secondary min-h-10 cursor-pointer">
                Attach File
                <input
                  type="file"
                  className="sr-only"
                  onChange={(e) => setAttachment(e.target.files[0])}
                />
              </label>
              {attachment && (
                <span className="ml-3 inline-block max-w-xs truncate align-middle text-sm text-slate-300">
                  {attachment.name}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Compose;
