import { useState, useEffect } from 'react';
import { Shield, Users, Activity, Search } from 'lucide-react';
import './AdminDashboardPage.css';

interface User {
  id: number;
  email: string;
  email: string;
  personal_email?: string;
  college_name?: string;
  college_slug?: string;
  college_proof_url?: string;
  approval_status?: string;
  is_verified: boolean;
  created_at: string;
}

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'analytics' | 'colleges'>('reports');
  const [users, setUsers] = useState<User[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [reports, setReports] = useState<any[]>([]);
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
  const [collegeSearch, setCollegeSearch] = useState('');

  useEffect(() => {
    if (activeTab === 'users') {
      setLoading(true);
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, {
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
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/reports`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    } else if (activeTab === 'colleges') {
      setLoading(true);
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/colleges`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      .then(res => res.json())
      .then(data => setColleges(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    }
  }, [activeTab]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/reports/${id}/status`, {
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

  const deleteReport = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/reports/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setReports(reports.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const toggleCollegeVisibility = async (slug: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/colleges/${slug}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setColleges(colleges.map(c => c.slug === slug ? { ...c, is_active: !currentStatus } : c));
      }
    } catch (err) {
      console.error('Failed to toggle college visibility:', err);
    }
  };

  const handleSelectAllColleges = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedColleges(colleges.map(c => c.slug));
    } else {
      setSelectedColleges([]);
    }
  };

  const handleSelectCollege = (slug: string) => {
    if (selectedColleges.includes(slug)) {
      setSelectedColleges(selectedColleges.filter(s => s !== slug));
    } else {
      setSelectedColleges([...selectedColleges, slug]);
    }
  };

  const handleBulkToggleColleges = async (targetStatus: boolean) => {
    if (selectedColleges.length === 0) return;
    try {
      await Promise.all(selectedColleges.map(slug => 
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/colleges/${slug}/toggle`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({ is_active: targetStatus })
        })
      ));
      
      setColleges(colleges.map(c => 
        selectedColleges.includes(c.slug) ? { ...c, is_active: targetStatus } : c
      ));
      setSelectedColleges([]);
    } catch (err) {
      console.error('Failed to bulk toggle colleges:', err);
    }
  };

  const handleUserApproval = async (userId: number, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, approval_status: status, is_verified: status === 'Approved' } : u));
      }
    } catch (err) {
      console.error('Failed to update user approval:', err);
    }
  };

  const normalizeText = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

  const filteredColleges = colleges.filter(college => 
    normalizeText(college.name).includes(normalizeText(collegeSearch))
  );

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
          className={`tab-btn ${activeTab === 'colleges' ? 'active' : ''}`}
          onClick={() => setActiveTab('colleges')}
        >
          <Activity size={18} /> Manage Colleges
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
                        <button className="btn btn-secondary btn-sm" style={{color: 'red', marginLeft: '8px'}} onClick={() => deleteReport(report.id)}>Delete</button>
                      </>
                    ) : report.status === 'Verified' ? (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(report.id, 'Resolved')}>Mark Resolved</button>
                        <button className="btn btn-secondary btn-sm" style={{color: 'red', marginLeft: '8px'}} onClick={() => deleteReport(report.id)}>Delete</button>
                      </>
                    ) : (
                      <>
                        <span className="text-muted">No actions</span>
                        <button className="btn btn-secondary btn-sm" style={{color: 'red', marginLeft: '8px'}} onClick={() => deleteReport(report.id)}>Delete</button>
                      </>
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
            <h3 className="section-heading">User Database & Approvals</h3>
          </div>
          
          <div className="admin-table">
            <div className="table-header">
              <div className="th">EMAIL & DETAILS</div>
              <div className="th">COLLEGE</div>
              <div className="th">PROOF</div>
              <div className="th text-right">STATUS & ACTIONS</div>
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
                    <strong>{user.email || user.personal_email}</strong>
                    {user.personal_email && <div className="text-meta">Registered via Personal Email</div>}
                  </div>
                  <div className="td text-muted">{user.college_name || user.college_slug || 'Unknown'}</div>
                  <div className="td">
                    {user.college_proof_url ? (
                      <a href={user.college_proof_url} target="_blank" rel="noopener noreferrer" style={{color: 'var(--c-primary)', textDecoration: 'underline'}}>View Proof</a>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </div>
                  <div className="td actions-cell" style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {user.approval_status === 'Pending' ? (
                      <>
                        <button className="btn btn-sm btn-primary" onClick={() => handleUserApproval(user.id, 'Approved')}>Approve</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleUserApproval(user.id, 'Rejected')}>Reject</button>
                      </>
                    ) : (
                      <>
                        <span className={`status-dot ${user.is_verified ? 'resolved' : 'reported'}`} title={user.approval_status || 'Verified'}></span>
                        <span style={{fontSize: '14px'}}>{user.approval_status || (user.is_verified ? 'Verified' : 'Pending')}</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === 'colleges' && (
        <section className="admin-section">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="section-heading">Manage Colleges</h3>
            {selectedColleges.length > 0 && (
              <div className="bulk-actions" style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-sm btn-primary" onClick={() => handleBulkToggleColleges(true)}>Enable Selected</button>
                <button className="btn btn-sm btn-secondary" onClick={() => handleBulkToggleColleges(false)}>Disable Selected</button>
              </div>
            )}
          </div>

          <div className="search-container mb-6" style={{ position: 'relative' }}>
            <Search className="search-icon" size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              type="text" 
              className="editorial-input" 
              style={{ paddingLeft: '48px', width: '100%', maxWidth: '400px' }}
              placeholder="Search college by name..." 
              value={collegeSearch}
              onChange={(e) => setCollegeSearch(e.target.value)}
            />
          </div>
          
          <div className="admin-table">
            <div className="table-header">
              <div className="th" style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={colleges.length > 0 && selectedColleges.length === colleges.length}
                  onChange={handleSelectAllColleges}
                />
              </div>
              <div className="th">COLLEGE NAME</div>
              <div className="th">SLUG</div>
              <div className="th text-right">ACTIONS</div>
            </div>
            
            {loading ? (
              <div className="table-row">
                <div className="td text-muted">Loading colleges...</div>
              </div>
            ) : filteredColleges.length === 0 ? (
              <div className="table-row">
                <div className="td text-muted">No colleges found matching "{collegeSearch}".</div>
              </div>
            ) : (
              filteredColleges.map(college => (
                <div className="table-row" key={college.id}>
                  <div className="td" style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedColleges.includes(college.slug)}
                      onChange={() => handleSelectCollege(college.slug)}
                    />
                  </div>
                  <div className="td title-cell">
                    <strong>{college.name}</strong>
                  </div>
                  <div className="td text-muted">{college.slug}</div>
                  <div className="td actions-cell">
                    <button 
                      className={`btn btn-sm ${college.is_active === false ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => toggleCollegeVisibility(college.slug, college.is_active !== false)}
                    >
                      {college.is_active === false ? 'Enable' : 'Disable'}
                    </button>
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
