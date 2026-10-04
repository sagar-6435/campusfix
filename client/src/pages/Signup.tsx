import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'; // Reusing the login page styles for consistency

interface College {
  id: number;
  name: string;
  slug: string;
}

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollegeSlug, setSelectedCollegeSlug] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [noCollegeEmail, setNoCollegeEmail] = useState(false);
  const [personalEmail, setPersonalEmail] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/colleges`)
      .then(res => res.json())
      .then(data => setColleges(data))
      .catch(err => console.error('Failed to fetch colleges:', err));
  }, []);

  const normalizeText = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

  const filteredColleges = colleges.filter(c => 
    normalizeText(c.name).includes(normalizeText(searchQuery))
  );

  const handleSignup = async () => {
    if (!selectedCollegeSlug) {
      setError('Please select your college.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }

    const domain = email.split('@')[1];
    const invalidDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    
    if (invalidDomains.includes(domain)) {
      setError('Please use your official college email domain.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // In a passwordless system, signup is the same as requesting an OTP
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request OTP');
      }

      localStorage.setItem('pendingEmail', email);
      localStorage.setItem('pendingCollegeSlug', selectedCollegeSlug);
      // If we had a name field in the backend, we would store it too
      navigate('/verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProofSignup = async () => {
    if (!selectedCollegeSlug) {
      setError('Please select your college from the search.');
      return;
    }
    if (!personalEmail || !proofFile) {
      setError('Please fill all fields and upload a proof document.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('personal_email', personalEmail);
    formData.append('college_name', searchQuery);
    formData.append('college_slug', selectedCollegeSlug);
    formData.append('proof', proofFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register-with-proof`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit registration');

      setSuccess('Registration submitted! Our team will review your proof. You will receive an email once approved.');
      setPersonalEmail('');
      setProofFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page container">
      <div className="login-container">
        <h1 className="text-hero login-title" style={{ fontSize: '3rem' }}>JOIN CAMPUS.</h1>
        <p className="login-subtitle">
          Create an account using your official college email to start reporting and fixing campus issues.
        </p>

        <div className="login-form">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="editorial-input lg mb-4"
              style={{ width: '100%' }}
              placeholder="Search your college..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
                setSelectedCollegeSlug('');
                setError('');
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {showDropdown && (
              <ul style={{
                position: 'absolute',
                top: 'calc(100% - 1rem)',
                left: 0,
                width: '100%',
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: '#fff',
                border: '1px solid #eaeaea',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                zIndex: 10,
                listStyle: 'none',
                padding: 0,
                margin: 0,
                textAlign: 'left'
              }}>
                {filteredColleges.length > 0 ? 
                  filteredColleges.map(college => (
                  <li 
                    key={college.id}
                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', fontSize: '0.95rem' }}
                    onMouseDown={() => {
                      setSearchQuery(college.name);
                      setSelectedCollegeSlug(college.slug);
                      setShowDropdown(false);
                      setError('');
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                  >
                    {college.name}
                  </li>
                )) : (
                  <li style={{ padding: '12px 16px', color: '#888', fontSize: '0.95rem' }}>No colleges found</li>
                )}
              </ul>
            )}
          </div>

          {noCollegeEmail ? (
            <>
              <input 
                type="email" 
                className="editorial-input lg mb-4" 
                placeholder="Personal Email (e.g. gmail.com)"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
              />
              <div className="mb-4">
                <label className="text-meta" style={{ display: 'block', marginBottom: '8px' }}>Upload College Proof (ID Card, Allotment Letter)</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)}
                  className="editorial-input lg"
                />
              </div>

              {error && <p className="error-text mb-6">{error}</p>}
              {success && <p className="success-text mb-6" style={{ color: 'green' }}>{success}</p>}
              {!error && !success && <div className="mb-6"></div>}

              <button className="btn btn-primary btn-large w-full mb-4" onClick={handleProofSignup} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </>
          ) : (
            <>

          <input 
            type="text" 
            className="editorial-input lg mb-4" 
            placeholder="Full Name (Optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
          {!error && <div className="mb-6"></div>}
          
          <button className="btn btn-primary btn-large w-full mb-4" onClick={handleSignup} disabled={loading}>
            {loading ? 'Sending Verification Code...' : 'Create Account'}
          </button>
          </>
          )}

          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <button 
              className="btn btn-text" 
              onClick={() => { setNoCollegeEmail(!noCollegeEmail); setError(''); setSuccess(''); }}
            >
              {noCollegeEmail ? "I have a college email" : "Don't have a college email?"}
            </button>
          </div>
          
          <div className="login-links" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Already have an account? <Link to="/login" style={{ color: '#000', fontWeight: 'bold', textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
