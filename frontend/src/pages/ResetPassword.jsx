import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div>
          <div className="auth-brand">ET</div>
          <p className="eyebrow text-center">Secure reset</p>
          <h2 className="mt-2 text-center text-3xl font-bold text-slate-950">
            Set new password
          </h2>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <input
                type="password"
                required
                className="input-field"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
