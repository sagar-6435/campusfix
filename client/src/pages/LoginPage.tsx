import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleContinue = async () => {

    if (!email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request OTP');
      }

      // Save email for verify page (leave collegeSlug empty for login)
      localStorage.setItem('pendingEmail', email);
      localStorage.removeItem('pendingCollegeSlug');
      navigate('/verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page container">
      <div className="login-container">
        <h1 className="text-hero login-title">SIGN IN.</h1>
        <p className="login-subtitle">
          Select your college and enter your official email to access your campus dashboard.
        </p>

        <div className="login-form">

          <input 
            type="email" 
            className="editorial-input lg mb-2" 
            placeholder="name@college.edu"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
          />
          {error && <p className="error-text mb-6">{error}</p>}
          {!error && <div className="mb-8"></div>}
          
          <button className="btn btn-primary btn-large w-full mb-4" onClick={handleContinue} disabled={loading}>
            {loading ? 'Sending Code...' : 'Continue'}
          </button>
          
          <div className="login-links" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            <Link to="/forgot-password" style={{ color: 'inherit', textDecoration: 'none' }}>Forgot Password?</Link>
            <Link to="/signup" style={{ color: 'inherit', textDecoration: 'none' }}>Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
