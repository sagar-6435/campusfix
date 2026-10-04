import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeIssue, setActiveIssue] = useState<number | null>(1);

  const mockIssues = [
    { id: 1, location: 'BLOCK B', title: 'Wi-Fi unavailable', students: 86, x: 20, y: 30 },
    { id: 2, location: 'LAB 3', title: 'Computers not starting', students: 12, x: 70, y: 45 },
    { id: 3, location: 'CANTEEN', title: 'No drinking water', students: 154, x: 40, y: 80 },
    { id: 4, location: 'TRANSPORT', title: 'Bus 4 delayed', students: 42, x: 85, y: 15 },
  ];

  return (
    <div className="landing-page">
      <div className="container">
        <section className="hero-section">
          <div className="hero-left">
            <h1 className="text-hero">
              Your campus.<br />
              Your voice.<br />
              Visible change.
            </h1>
            <p className="hero-description text-body-large">
              Report problems. Find existing issues. See what students are experiencing — and what gets resolved.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-large" onClick={() => navigate('/colleges')}>
                Explore your campus <ArrowRight size={20} />
              </button>
              <button className="btn btn-secondary btn-large" onClick={() => navigate('/report')}>
                Report an issue
              </button>
            </div>
          </div>
          
          <div className="hero-right">
            <div className="interactive-map-container">
              <div className="stylized-map">
                {/* Abstract map shapes */}
                <div className="map-building b1"></div>
                <div className="map-building b2"></div>
                <div className="map-building b3"></div>
                <div className="map-path"></div>
                
                {mockIssues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className={`map-marker ${activeIssue === issue.id ? 'active' : ''}`}
                    style={{ left: `${issue.x}%`, top: `${issue.y}%` }}
                    onClick={() => setActiveIssue(issue.id)}
                  >
                    <span className="pulse-ring"></span>
                    <MapPin size={16} />
                  </div>
                ))}

                <AnimatePresence>
                  {activeIssue && (
                    <motion.div 
                      key="issue-card"
                      className="map-issue-card"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        left: `${(mockIssues.find(i => i.id === activeIssue)?.x || 0) + 5}%`,
                        top: `${(mockIssues.find(i => i.id === activeIssue)?.y || 0) + 5}%`
                      }}
                    >
                      <div className="issue-card-header">
                        <span className="status-dot reported"></span>
                        <span className="text-meta">{mockIssues.find(i => i.id === activeIssue)?.location}</span>
                      </div>
                      <h4 className="issue-card-title">{mockIssues.find(i => i.id === activeIssue)?.title}</h4>
                      <p className="issue-card-stats">{mockIssues.find(i => i.id === activeIssue)?.students} students affected</p>
                      <div className="issue-card-footer">
                        Community Confirmed
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        <section className="mobile-quick-links mt-8">
          <h3 className="sub-heading mb-4">QUICK LINKS</h3>
          <div className="mobile-links-grid">
            <button className="mobile-link-card" onClick={() => navigate('/colleges')}>
              <span>Explore Colleges</span>
              <ArrowRight size={16} />
            </button>
            <button className="mobile-link-card" onClick={() => navigate('/how-it-works')}>
              <span>How it works</span>
              <ArrowRight size={16} />
            </button>
            <button className="mobile-link-card" onClick={() => navigate('/about')}>
              <span>About CampusFix</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
