import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Heart, CheckCircle, Clock } from 'lucide-react';
import './DashboardPage.css';

interface User {
  id: string;
  email: string;
  college_slug: string;
  college_name?: string;
}

interface College {
  name: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [collegeName, setCollegeName] = useState<string>('Loading...');
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: User) => {
        setUser(data);
        
        // Fallback: If college_slug was lost during the buggy login earlier, extract it from email domain
        let slug = data.college_slug;
        if (!slug && data.email) {
          const domain = data.email.split('@')[1];
          if (!['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(domain)) {
             slug = domain.split('.')[0];
          }
        }

        if (slug) {
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/colleges/${slug}`)
            .then(res => res.json())
            .then((cData: College) => setCollegeName(cData.name || slug.toUpperCase()))
            .catch(() => setCollegeName(slug.toUpperCase()));
            
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/college`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(rData => {
              if (Array.isArray(rData)) setReports(rData);
            })
            .catch(err => console.error(err));
        } else {
          // If no slug, we might still have a generic college_name
          setCollegeName(data.college_name || 'Your College');
          
          // Fetch all user reports if we don't have a specific college scope to fetch
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/college`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(rData => {
              if (Array.isArray(rData)) setReports(rData);
            })
            .catch(err => console.error(err));
        }
      })
      .catch(err => {
        console.error('Failed to fetch user:', err);
        setCollegeName('Unknown College');
      });
  }, []);

  const handleVote = async (reportId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/${reportId}/vote`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReports(reports.map(r => 
          r.id === reportId ? { ...r, upvotes: data.upvotes, hasVoted: data.hasVoted } : r
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReports(reports.filter(r => r.id !== reportId));
      } else {
        alert('Failed to delete report');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (report: any) => {
    const newTitle = window.prompt('Edit Title:', report.title);
    if (newTitle === null) return;
    const newLocation = window.prompt('Edit Location:', report.location);
    if (newLocation === null) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/${report.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle, location: newLocation })
      });
      const data = await res.json();
      if (data.success) {
        setReports(reports.map(r => r.id === report.id ? { ...r, title: newTitle, location: newLocation } : r));
      } else {
        alert('Failed to update report');
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div className="dashboard-page container">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1 className="text-title">Welcome, {user ? user.email.split('@')[0] : 'Student'}</h1>
          <p className="college-name text-meta">{collegeName}</p>
        </div>
        <button className="btn btn-primary btn-large" onClick={() => navigate('/report')}>
          Report an Issue <ArrowRight size={18} />
        </button>
      </header>

      <div className="dashboard-stats mt-12">
        <div className="stat-card">
          <FileText className="stat-icon" size={24} />
          <div className="stat-info">
            <span className="stat-value">{reports.filter(r => r.user === user?.id).length || 0}</span>
            <span className="stat-label">My Reports</span>
          </div>
        </div>
        <div className="stat-card">
          <Heart className="stat-icon" size={24} />
          <div className="stat-info">
            <span className="stat-value">{reports.filter(r => r.hasVoted).length || 0}</span>
            <span className="stat-label">Supported Issues</span>
          </div>
        </div>
        <div className="stat-card">
          <Clock className="stat-icon" size={24} />
          <div className="stat-info">
            <span className="stat-value">{reports.filter(r => r.status === 'Under Review').length || 0}</span>
            <span className="stat-label">Active Reports</span>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle className="stat-icon" size={24} />
          <div className="stat-info">
            <span className="stat-value">{reports.filter(r => r.status === 'Resolved').length || 0}</span>
            <span className="stat-label">Resolved Reports</span>
          </div>
        </div>
      </div>

      <div className="editorial-divider"></div>

      <section className="dashboard-section">
        <h3 className="section-heading">Campus Issues</h3>
        <p className="text-meta mb-6">Vote on issues to prioritize them for your college administration.</p>
        
        <div className="issue-table">
          <div className="table-header">
            <div className="th">ISSUE</div>
            <div className="th text-center">VOTES</div>
            <div className="th">STATUS</div>
            <div className="th text-right">DATE</div>
          </div>
          
          {reports.length === 0 ? (
            <div className="table-row">
              <div className="td text-muted">No issues reported yet. Be the first!</div>
            </div>
          ) : reports.map(report => (
            <div className="table-row" key={report.id}>
              <div className="td title-cell">
                <strong>{report.title}</strong>
                <span className="location-subtext">{report.location}</span>
                {report.user === user?.id && (
                  <div className="report-actions" style={{ marginTop: '4px', display: 'flex', gap: '8px' }}>
                    <button className="btn btn-sm btn-text" style={{ padding: 0, fontSize: '0.8rem', color: '#666' }} onClick={(e) => { e.stopPropagation(); handleEdit(report); }}>Edit</button>
                    <button className="btn btn-sm btn-text" style={{ padding: 0, fontSize: '0.8rem', color: '#d32f2f' }} onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }}>Delete</button>
                  </div>
                )}
              </div>
              <div className="td text-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleVote(report.id); }}
                  className={`btn btn-sm ${report.hasVoted ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Heart size={14} fill={report.hasVoted ? "currentColor" : "none"} /> 
                  {report.upvotes}
                </button>
              </div>
              <div className="td status-cell">
                <span className={`status-dot ${report.status === 'Resolved' ? 'resolved' : 'review'}`}></span> {report.status}
              </div>
              <div className="td text-right text-muted">{new Date(report.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
