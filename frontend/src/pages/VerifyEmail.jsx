import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('OTP sent to your email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter the 6 digit OTP');
      return;
    }

    setLoading(true);

    try {
      await verifyEmail(email.trim().toLowerCase(), otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError('');
    setMessage('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setResending(true);

    try {
      const response = await api.post('/auth/resend-verification-otp', {
        email: email.trim().toLowerCase()
      });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div>
          <div className="auth-brand brand-mail-icon" aria-hidden="true" />
          <p className="eyebrow text-center">Email verification</p>
          <h2 className="mt-2 text-center text-3xl font-bold text-slate-950">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Enter the OTP sent to your email address.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}

          <input
            type="email"
            required
            className="input-field"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value.trimStart())}
          />

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            className="input-field text-center text-lg font-semibold tracking-[0.35em]"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <button
            type="button"
            disabled={resending}
            className="btn-secondary w-full"
            onClick={resendOtp}
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>

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

export default VerifyEmail;
