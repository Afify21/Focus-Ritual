import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/StylizedLogin.css';

const StylizedRegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error, setError } = useAuth();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/'); // Redirect to home page after successful registration
    } catch (err) {
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
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="user-box">
            <input type="text" id="name" value={name} onChange={(e) => { setName(e.target.value); if (error) setError(null); }} required />
            <label htmlFor="name">Name</label>
          </div>
          <div className="user-box">
            <input type="email" id="email" value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }} required />
            <label htmlFor="email">Email</label>
          </div>
          <div className="user-box">
            <input type="password" id="password" value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }} required />
            <label htmlFor="password">Password</label>
          </div>
          <div className="user-box">
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(null); }} required />
            <label htmlFor="confirmPassword">Confirm Password</label>
          </div>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <div className="login-links">
            <Link to="/login">Already have an account?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StylizedRegisterPage; 