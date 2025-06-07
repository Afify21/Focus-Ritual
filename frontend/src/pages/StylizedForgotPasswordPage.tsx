import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/StylizedLogin.css';

const StylizedForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, error, setError } = useAuth();
  const { currentTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      // Error is set in auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const backgroundStyle: React.CSSProperties = {};
  if (Array.isArray(currentTheme.backgrounds.focus)) {
    backgroundStyle.backgroundImage = `url(${currentTheme.backgrounds.focus[0]})`;
  } else if (typeof currentTheme.backgrounds.focus === 'string' && !currentTheme.backgrounds.focus.endsWith('.mp4') && !currentTheme.backgrounds.focus.endsWith('.mov')) {
    backgroundStyle.backgroundImage = `url(${currentTheme.backgrounds.focus})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
  }

  const isVideo = !Array.isArray(currentTheme.backgrounds.focus) && typeof currentTheme.backgrounds.focus === 'string' && (currentTheme.backgrounds.focus.endsWith('.mp4') || currentTheme.backgrounds.focus.endsWith('.mov'));

  return (
    <div className="login-container" style={!isVideo ? backgroundStyle : {}}>
      {isVideo && (
        <video autoPlay loop muted className="background-video">
          <source src={Array.isArray(currentTheme.backgrounds.focus) ? currentTheme.backgrounds.focus[0] : currentTheme.backgrounds.focus} type="video/mp4" />
        </video>
      )}
      <div className="login-box">
        {isSubmitted ? (
          <>
            <h2>Request Sent</h2>
            <div className="success-message">
              If your email is registered, you will receive a password reset link shortly.
            </div>
            <div className="login-links">
              <Link to="/login">Return to Login</Link>
            </div>
          </>
        ) : (
          <>
            <h2>Reset Password</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="user-box">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                />
                <label htmlFor="email">Email</label>
              </div>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                {isSubmitting ? 'Submitting...' : 'Send Reset Link'}
              </button>
              <div className="login-links">
                <Link to="/login">Back to Login</Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default StylizedForgotPasswordPage; 