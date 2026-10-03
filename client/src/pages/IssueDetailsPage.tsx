import { useParams } from 'react-router-dom';
import { MapPin, Users, Calendar, AlertTriangle } from 'lucide-react';
import './IssueDetailsPage.css';

const IssueDetailsPage = () => {
  const { id } = useParams();

  return (
    <div className="issue-details-page container">
      <div className="issue-layout">
        <div className="issue-main">
          <div className="issue-meta-header">
            <span className="issue-category">WI-FI</span>
            <span className="issue-id">{id || 'CFX-10482'}</span>
          </div>
          
          <h1 className="issue-title-large">WI-FI UNAVAILABLE IN BLOCK B</h1>
          
          <div className="issue-info-strip">
            <div className="info-item">
              <MapPin size={16} />
              <span>Block B · 2nd Floor</span>
            </div>
            <div className="info-item">
              <Calendar size={16} />
              <span>Reported Oct 12</span>
            </div>
            <div className="info-item">
              <AlertTriangle size={16} />
              <span>High Priority</span>
            </div>
          </div>

          <div className="editorial-divider"></div>
          
          <div className="issue-description">
            <p>The student network has been unable to connect for the past two days on the second floor of Block B. This is affecting our ability to complete online lab assignments.</p>
          </div>

          <div className="issue-evidence">
            <h3 className="section-heading">Evidence</h3>
            <div className="evidence-placeholder">
              <span>No images provided</span>
            </div>
          </div>

          <div className="issue-comments">
            <h3 className="section-heading">Comments</h3>
            <div className="comment-box">
              <div className="comment-meta">
                <strong>Anonymous Student</strong>
                <span className="text-muted text-meta">2 HOURS AGO</span>
              </div>
              <p>I'm facing the same issue in Lab 3.</p>
            </div>
            
            <div className="add-comment mt-8">
              <textarea className="editorial-textarea" placeholder="Add a comment..." rows={3}></textarea>
              <button className="btn btn-secondary mt-4">Post Comment</button>
            </div>
          </div>
        </div>

        <div className="issue-sidebar">
          <div className="status-tracker">
            <h4 className="sidebar-heading">Status</h4>
            <div className="status-timeline">
              <div className="timeline-step completed">
                <div className="step-marker"></div>
                <div className="step-content">
                  <strong>Student Reported</strong>
                  <span className="step-date">Oct 12</span>
                </div>
              </div>
              <div className="timeline-step active">
                <div className="step-marker"></div>
                <div className="step-content">
                  <strong>Under Review</strong>
                  <span className="step-date">Oct 13</span>
                </div>
              </div>
              <div className="timeline-step pending">
                <div className="step-marker"></div>
                <div className="step-content">
                  <strong>Community Confirmed</strong>
                </div>
              </div>
              <div className="timeline-step pending">
                <div className="step-marker"></div>
                <div className="step-content">
                  <strong>College Acknowledged</strong>
                </div>
              </div>
              <div className="timeline-step pending">
                <div className="step-marker"></div>
                <div className="step-content">
                  <strong>Resolved</strong>
                </div>
              </div>
            </div>
          </div>
          
          <div className="support-section">
            <h4 className="sidebar-heading">Support</h4>
            <div className="support-count">
              <Users size={24} className="support-icon" />
              <span className="count-number">86</span>
              <span className="count-label">Students affected</span>
            </div>
            <button className="btn btn-primary w-full mt-6" onClick={() => alert('Supported!')}>
              I'm experiencing this too
            </button>
            <p className="privacy-note mt-4">
              Reported anonymously. Your identity will remain hidden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsPage;
