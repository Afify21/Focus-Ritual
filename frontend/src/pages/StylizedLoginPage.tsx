import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/StylizedLogin.css';

const StylizedLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/'); // Redirect to home page after successful login
    } catch (err) {
      // Error is already set in the auth context
      setIsSubmitting(false);
    }
  };

  // Determine background style
  const backgroundStyle: React.CSSProperties = {};
  if (Array.isArray(currentTheme.backgrounds.focus)) {
    // Handle array of backgrounds if necessary, for now using the first
    backgroundStyle.backgroundImage = `url(${currentTheme.backgrounds.focus[0]})`;
  } else if (typeof currentTheme.backgrounds.focus === 'string') {
    if (currentTheme.backgrounds.focus.endsWith('.mp4') || currentTheme.backgrounds.focus.endsWith('.mov')) {
      // Video background handled by a video tag
    } else {
      backgroundStyle.backgroundImage = `url(${currentTheme.backgrounds.focus})`;
      backgroundStyle.backgroundSize = 'cover';
      backgroundStyle.backgroundPosition = 'center';
    }
  }

  const isVideo = !Array.isArray(currentTheme.backgrounds.focus) && (typeof currentTheme.backgrounds.focus === 'string' && (currentTheme.backgrounds.focus.endsWith('.mp4') || currentTheme.backgrounds.focus.endsWith('.mov')));

  return (
    <div className="login-container" style={!isVideo ? backgroundStyle : {}}>
      {isVideo && (
        <video autoPlay loop muted className="background-video">
          <source src={Array.isArray(currentTheme.backgrounds.focus) ? currentTheme.backgrounds.focus[0] : currentTheme.backgrounds.focus} type="video/mp4" />
        </video>
      )}
      <div className="login-box">
        <h2>Login</h2>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="user-box">
            <input 
              type="text"
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
          <div className="user-box">
            <input 
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              required
            />
            <label htmlFor="password">Password</label>
          </div>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <div className="login-links">
            <Link to="/register">Create Account</Link>
            <Link to="/forgot-password">Forgot Password</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StylizedLoginPage; 