import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const VerifyPage = () => {
  const [email, setEmail] = useState('');
  const [collegeSlug, setCollegeSlug] = useState('');
  const [collegeName, setCollegeName] = useState('Verifying Domain...');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('pendingEmail');
    const savedSlug = localStorage.getItem('pendingCollegeSlug');
    
    if (!savedEmail) {
      navigate('/login');
      return;
    }
    
    setEmail(savedEmail);
    if (savedSlug) {
      setCollegeSlug(savedSlug);
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/colleges/${savedSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.name) setCollegeName(data.name);
        })
        .catch(err => console.error('Failed to fetch college name:', err));
    } else {
      setCollegeName('CampusFix'); // generic or skip
    }
  }, [navigate]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    setResendMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setResendMessage('OTP has been resent to your email.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString, college_slug: collegeSlug })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      // Success! Set auth token
      localStorage.setItem('auth', 'true');
      if (data.token) localStorage.setItem('token', data.token);
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page container">
      <div className="login-container">
        <h1 className="text-hero login-title">VERIFY.</h1>
        
        <div className="college-detected mb-8">
          <span className="text-meta">College Detected</span>
          <h3 className="detected-name">{collegeName}</h3>
        </div>

        <p className="login-subtitle">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>

        <div className="login-form">
          <div className="otp-container mb-2">
            {otp.map((digit, index) => (
              <input 
                key={index}
                type="text" 
                maxLength={1}
                className="otp-input" 
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                autoFocus={index === 0}
              />
            ))}
          </div>
          
          {error && <p className="error-text mb-4" style={{textAlign: 'center'}}>{error}</p>}
          {!error && <div className="mb-8"></div>}

          {resendMessage && <p className="success-text mb-4" style={{textAlign: 'center', color: '#4caf50', fontSize: '0.9rem'}}>{resendMessage}</p>}
          <button className="btn btn-primary btn-large w-full" onClick={handleVerify} disabled={loading || resending}>
            {loading ? 'Verifying...' : 'Verify & Sign In'}
          </button>
          <button className="btn btn-text w-full mt-4" onClick={handleResendOTP} disabled={resending || loading}>
            {resending ? 'Resending...' : 'Resend OTP'}
          </button>
          <button className="btn btn-text w-full mt-2" onClick={() => navigate('/login')}>
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
