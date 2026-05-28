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
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('recipientEmail', recipientEmail);
      formData.append('subject', subject);
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
      <div className="mx-auto w-full max-w-3xl">
        <div className="page-header">
          <div>
            <p className="eyebrow">New message</p>
            <h1 className="page-title">Compose Email</h1>
            <p className="page-subtitle">Send a tracked email with optional attachment.</p>
          </div>
        </div>

      <div className="panel">
        <div className="panel-body">
        {error && (
          <div className="alert-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-stack">
          <div>
            <label className="field-label">
              To
            </label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">
              Subject
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">
              Body
            </label>
            <textarea
              required
              rows={10}
              className="textarea-field"
              placeholder="Write your email body here... (HTML supported)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">
              Attachment (optional)
            </label>
            <input
              type="file"
              className="input-field file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
              onChange={(e) => setAttachment(e.target.files[0])}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Sending...' : 'Send Email'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
        </div>
      </div>
      </div>
    </main>
  );
};

export default Compose;
