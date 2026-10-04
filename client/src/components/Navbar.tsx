import { Link, useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token') || !!localStorage.getItem('auth');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth');
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <nav className="navbar container">
      <div className="navbar-left">
        <Link to="/" className="brand-logo">
          <img src={new URL('../assets/logo.png', import.meta.url).href} alt="CampusFix" style={{width:"60px",height:"60px"}} />
          CampusFix
        </Link>
      </div>
      <div className="navbar-center hidden-mobile">
        <Link to="/colleges" className="nav-link">Explore</Link>
        <Link to="/how-it-works" className="nav-link">How it works</Link>
        <Link to="/about" className="nav-link">About</Link>
      </div>
      <div className="navbar-right">
        <button className="icon-btn" aria-label="Search">
          <Search size={20} />
        </button>
        {isAuthenticated ? (
          <button className="nav-link hidden-mobile" onClick={handleLogout} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px'}}>
            Sign out
          </button>
        ) : (
          <Link to="/login" className="nav-link hidden-mobile">Sign in</Link>
        )}
        <button className="icon-btn mobile-only" aria-label="Profile" onClick={() => isAuthenticated ? navigate('/dashboard') : navigate('/login')}>
          <User size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
