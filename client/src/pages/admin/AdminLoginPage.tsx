import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import '../LoginPage.css'; // Reusing the login styling

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // Save admin token
      localStorage.setItem('auth', 'true');
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('role', 'admin');
      
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page container">
      <div className="login-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Shield size={32} style={{ color: 'var(--c-critical)' }} />
          <h1 className="text-hero login-title" style={{ marginBottom: 0 }}>ADMIN.</h1>
        </div>
        <p className="login-subtitle">
          Moderator portal access requires an authorization phrase.
        </p>

        <div className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--c-text-muted)' }}>ADMIN EMAIL</label>
            <input 
              type="email" 
              className="editorial-input lg w-full" 
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--c-text-muted)' }}>PASSWORD</label>
            <input 
              type="password" 
              className="editorial-input lg w-full" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
            />
          </div>
          {error && <p className="error-text mb-6">{error}</p>}
          {!error && <div className="mb-8"></div>}
          
          <button 
            className="btn btn-primary btn-large w-full" 
            style={{ backgroundColor: 'var(--c-critical)', borderColor: 'var(--c-critical)' }}
            onClick={handleLogin} 
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Access Portal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
