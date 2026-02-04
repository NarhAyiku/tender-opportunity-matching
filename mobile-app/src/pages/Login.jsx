import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

// Google icon component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// GitHub icon component
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

export default function Login() {
  const { login, loginWithGoogle, loginWithGitHub } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/feed';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('[Login Error]', err);
      if (err?.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err?.message?.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account first.');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network.');
      } else {
        setError(err?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading('google');
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err?.message || 'Google login failed');
      setOauthLoading(null);
    }
  };

  const handleGitHubLogin = async () => {
    setOauthLoading('github');
    setError(null);
    try {
      await loginWithGitHub();
    } catch (err) {
      setError(err?.message || 'GitHub login failed');
      setOauthLoading(null);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Briefcase />
          </div>
          <div className="brand-name">TENDER</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue matching with opportunities</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="auth-error">
            <AlertCircle />
            <span>{error}</span>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="auth-social">
          <button
            type="button"
            className="btn btn-social"
            onClick={handleGoogleLogin}
            disabled={loading || oauthLoading}
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="spinner" size={20} />
            ) : (
              <GoogleIcon />
            )}
            <span>Google</span>
          </button>
          <button
            type="button"
            className="btn btn-social"
            onClick={handleGitHubLogin}
            disabled={loading || oauthLoading}
          >
            {oauthLoading === 'github' ? (
              <Loader2 className="spinner" size={20} />
            ) : (
              <GitHubIcon />
            )}
            <span>GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        {/* Login Form */}
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || oauthLoading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="password">Password</label>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input has-toggle"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading || oauthLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || oauthLoading}
          >
            {loading ? (
              <span className="btn-loading">
                <Loader2 className="spinner" size={20} />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-footer-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
