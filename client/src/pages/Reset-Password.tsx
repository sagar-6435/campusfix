import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }
    
    setStatus('loading');
    
    // Simulate API call for password reset
    setTimeout(() => {
      setStatus('success');
      setMessage('If an account exists, a reset link has been sent to your email.');
    }, 1500);
  };

  return (
    <div className="login-page container">
      <div className="login-container">
        <h1 className="text-hero login-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>RECOVER.</h1>
        <p className="login-subtitle">
          Enter your college email address and we'll send you a link to reset your password.
        </p>

        <form className="login-form" onSubmit={handleReset}>
          <input 
            type="email" 
            className="editorial-input lg mb-4" 
            placeholder="name@college.edu"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus('idle');
            }}
            disabled={status === 'success'}
          />
          
          {status === 'error' && <p className="error-text mb-6">{message}</p>}
          {status === 'success' && <p className="mb-6" style={{ color: 'var(--c-success)', fontWeight: 500 }}>{message}</p>}
          {status === 'idle' && <div className="mb-6"></div>}
          
          {status !== 'success' ? (
            <button type="submit" className="btn btn-primary btn-large w-full mb-4" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-large w-full mb-4" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Return to Login
            </Link>
          )}
          
          <div className="login-links" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Remember your password? <Link to="/login" style={{ color: '#000', fontWeight: 'bold', textDecoration: 'none' }}>Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
