import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, MessageSquare } from 'lucide-react';
import './CampusPage.css';

const CampusPage = () => {
  const { slug } = useParams();
  const [collegeName, setCollegeName] = useState('Loading Campus...');
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/colleges/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setCollegeName(data.name);
        } else {
          setCollegeName(slug?.toUpperCase() || 'College');
        }
      })
      .catch(err => {
        console.error('Failed to fetch college:', err);
        setCollegeName(slug?.toUpperCase() || 'College');
      });

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/public/${slug}`)
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.error('Failed to fetch reports:', err));
  }, [slug]);

  const safeReports = Array.isArray(reports) ? reports : [];
  const openCount = safeReports.filter(r => r.status === 'Verified').length;
  const inProgressCount = safeReports.filter(r => r.status === 'In Progress').length;
  const resolvedCount = safeReports.filter(r => r.status === 'Resolved').length;

  return (
    <div className="campus-page container">
      <header className="campus-header">
        <h1 className="text-title text-uppercase">{collegeName}</h1>
        <div className="campus-meta">
          <MapPin size={16} /> Campus Issue Tracker
        </div>
      </header>

      <div className="stats-strip">
        <div className="stat-item">
          <span className="stat-value">{openCount.toString().padStart(2, '0')}</span>
          <span className="stat-label">OPEN</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{inProgressCount.toString().padStart(2, '0')}</span>
          <span className="stat-label">IN PROGRESS</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{resolvedCount.toString().padStart(2, '0')}</span>
          <span className="stat-label">RESOLVED</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{safeReports.length.toString().padStart(2, '0')}</span>
          <span className="stat-label">TOTAL REPORTS</span>
        </div>
      </div>

      <div className="editorial-divider"></div>

      {safeReports.length > 0 && safeReports[0] && (
        <section className="featured-issue">
          <div className="featured-content">
            <div className="issue-meta">
              <span className="status-dot reported"></span>
              <span className="text-meta">Top Community Issue</span>
              <span className="text-meta text-muted ml-auto">
                {safeReports[0].created_at ? new Date(safeReports[0].created_at).toLocaleDateString() : 'Recent'}
              </span>
            </div>
            
            <h2 className="featured-title">{safeReports[0].title ? safeReports[0].title.toUpperCase() : 'UNTITLED ISSUE'}</h2>
            
            <div className="featured-location">
              <MapPin size={16} /> {safeReports[0].location || 'Unknown location'}
            </div>
            
            <p className="featured-stats">{safeReports[0].upvotes || 0} students affected / support this</p>
            
            {safeReports[0].description && (
              <div className="featured-comments">
                <h4 className="comments-heading">Description</h4>
                <div className="comment-list">
                  <div className="comment-item">
                    <MessageSquare size={14} className="comment-icon" />
                    <p>"{safeReports[0].description}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="featured-visual" style={safeReports[0].imageUrl ? { background: `url(${safeReports[0].imageUrl}) no-repeat center center`, backgroundSize: 'cover' } : {}}>
            {!safeReports[0].imageUrl && (
              <div className="stylized-location-map">
                <div className="map-grid"></div>
                <div className="location-pin">
                  <span className="pulse-ring"></span>
                  <MapPin size={24} />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {safeReports.length > 0 && <div className="editorial-divider"></div>}

      <section className="issue-feed">
        <h3 className="feed-heading">Recent Reports</h3>
        
        <div className="feed-list">
          {safeReports.length === 0 ? (
            <div className="feed-item" style={{justifyContent: 'center', color: '#888'}}>
              No verified reports found for this college yet.
            </div>
          ) : (
            safeReports.map(report => (
              <div className="feed-item" key={report.id}>
                <div className="feed-col feed-category">ISSUE</div>
                <div className="feed-col feed-title">{report.title}</div>
                <div className="feed-col feed-location">{report.location}</div>
                <div className="feed-col feed-status">
                  <span className={`status-dot ${report.status === 'Resolved' ? 'resolved' : report.status === 'Verified' ? 'reported' : 'review'}`}></span> 
                  {report.status.toUpperCase()}
                </div>
                <div className="feed-col feed-support">{report.upvotes || 0} SUPPORT</div>
                <div className="feed-col feed-date">{report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Recent'}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default CampusPage;
