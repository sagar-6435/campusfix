import { useState, useEffect } from 'react';
import { Shield, Flag, Users, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import './AdminDashboardPage.css';

interface User {
  id: number;
  email: string;
  college_slug: string;
  is_verified: boolean;
  created_at: string;
}

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'analytics'>('reports');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'users') {
      setLoading(true);
      fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    } else if (activeTab === 'reports') {
      setLoading(true);
      fetch('http://localhost:5000/api/admin/reports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    }
  }, [activeTab]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reports/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="admin-dashboard-page container">
      <header className="admin-header">
        <div className="admin-brand">
          <Shield className="admin-icon" size={32} />
          <div>
            <h1 className="text-title text-uppercase">Moderator Portal</h1>
            <p className="text-meta">CampusFix Administration</p>
          </div>
        </div>
      </header>

      <div className="admin-stats mt-12">
        <div className="admin-stat-card">
          <span className="stat-value text-critical">{reports.filter(r => r.status === 'Under Review').length || 0}</span>
          <span className="stat-label">Pending Reviews</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-value text-warning">0</span>
          <span className="stat-label">Flagged Issues</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-value">{users.length || 0}</span>
          <span className="stat-label">Total Verified Users</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-value">0%</span>
          <span className="stat-label">Resolution Rate</span>
        </div>
      </div>

      <div className="admin-tabs mt-12">
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <Activity size={18} /> Manage Reports
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} /> Manage Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <Activity size={18} /> Platform Analytics
        </button>
      </div>

      <div className="editorial-divider"></div>

      {activeTab === 'reports' && (
        <section className="admin-section">
          <div className="section-header">
            <h3 className="section-heading">Pending Review Queue</h3>
            <div className="filter-group">
              <select className="editorial-input">
                <option>All Categories</option>
                <option>Infrastructure</option>
                <option>Wi-Fi</option>
              </select>
            </div>
          </div>
          
          <div className="admin-table">
            <div className="table-header">
              <div className="th">ISSUE</div>
              <div className="th">EVIDENCE</div>
              <div className="th">STATUS</div>
              <div className="th text-right">ACTIONS</div>
            </div>
            
            {loading ? (
              <div className="table-row">
                <div className="td text-muted">Loading reports...</div>
              </div>
            ) : reports.length === 0 ? (
              <div className="table-row">
                <div className="td text-muted">No reports found.</div>
              </div>
            ) : (
              reports.map(report => (
                <div className="table-row" key={report.id}>
                  <div className="td title-cell">
                    <strong>{report.title}</strong>
                    <span className="location-subtext">Location: {report.location} | Reported by {report.user?.email || 'Unknown'}</span>
                  </div>
                  <div className="td text-muted">
                    {report.imageUrl ? (
                      <a href={report.imageUrl} target="_blank" rel="noopener noreferrer" style={{color: 'var(--c-primary)', textDecoration: 'underline'}}>View Image</a>
                    ) : (
                      'No evidence'
                    )}
                  </div>
                  <div className="td">
                    <span className="flag-badge">{report.status}</span>
                  </div>
                  <div className="td actions-cell">
                    {report.status === 'Under Review' ? (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(report.id, 'Verified')}>Verify</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(report.id, 'Rejected')}>Reject</button>
                      </>
                    ) : report.status === 'Verified' ? (
                      <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(report.id, 'Resolved')}>Mark Resolved</button>
                    ) : (
                      <span className="text-muted">No actions</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === 'users' && (
        <section className="admin-section">
          <div className="section-header">
            <h3 className="section-heading">Verified User Database</h3>
          </div>
          
          <div className="admin-table">
            <div className="table-header">
              <div className="th">EMAIL</div>
              <div className="th">COLLEGE</div>
              <div className="th">JOINED</div>
              <div className="th text-right">STATUS</div>
            </div>
            
            {loading ? (
              <div className="table-row">
                <div className="td text-muted">Loading users...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="table-row">
                <div className="td text-muted">No users found.</div>
              </div>
            ) : (
              users.map(user => (
                <div className="table-row" key={user.id}>
                  <div className="td title-cell">
                    <strong>{user.email}</strong>
                  </div>
                  <div className="td text-muted">{user.college_slug || 'Unknown'}</div>
                  <div className="td text-muted">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                  <div className="td actions-cell">
                    {user.is_verified ? (
                      <span className="status-dot resolved" title="Verified"></span>
                    ) : (
                      <span className="status-dot reported" title="Unverified"></span>
                    )}
                    <span style={{marginLeft: '8px', fontSize: '14px'}}>{user.is_verified ? 'Verified' : 'Pending'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === 'analytics' && (
        <section className="admin-section">
          <h3 className="section-heading">Platform Analytics</h3>
          <p className="text-muted">Analytics dashboard placeholder.</p>
        </section>
      )}

    </div>
  );
};

export default AdminDashboardPage;
