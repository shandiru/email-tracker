import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div>
          <div className="auth-brand">ET</div>
          <p className="eyebrow text-center">Account recovery</p>
          <h2 className="mt-2 text-center text-3xl font-bold text-slate-950">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Enter your email and we'll send you a reset link
          </p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}
          {message && (
            <div className="alert-success">
              {message}
            </div>
          )}
          <div>
            <input
              type="email"
              required
              className="input-field"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="link text-sm">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
