import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div>
          <div className="auth-brand brand-mail-icon" aria-hidden="true" />
          <p className="eyebrow text-center">EmailTracker</p>
          <h2 className="mt-2 text-center text-3xl font-bold text-zinc-100">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Or <Link to="/register" className="link">register a new account</Link>
          </p>
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
                type="email"
                required
                className="input-field"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/forgot-password" className="link text-sm">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
