import { useState, useEffect } from 'react';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ExplorePage.css';

interface College {
  id: number;
  name: string;
  slug: string;
  issueCount?: number;
}

const ExplorePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/colleges`)
      .then(res => res.json())
      .then(data => {
        setColleges(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch colleges:', err);
        setLoading(false);
      });
  }, []);

  const normalizeText = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

  const filteredColleges = colleges.filter(college => 
    normalizeText(college.name).includes(normalizeText(search))
  );

  return (
    <div className="explore-page container">
      <header className="explore-header">
        <h1 className="text-hero">FIND YOUR CAMPUS.</h1>
        <div className="search-container mt-8">
          <Search className="search-icon" size={24} />
          <input 
            type="text" 
            className="editorial-input lg search-input" 
            placeholder="Search college, city or university..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      </header>

      <section className="popular-campuses mt-16">
        <h3 className="sub-heading">ALL COLLEGES</h3>
        
        {loading ? (
          <p className="text-muted mt-4">Loading colleges...</p>
        ) : (
          <div className="campus-list mt-8">
            {filteredColleges.length > 0 ? (
              filteredColleges.map((college) => (
                <div className="campus-row" key={college.id} onClick={() => navigate(`/college/${college.slug}`)}>
                  <div className="campus-info">
                    <h4 className="campus-name">{college.name}</h4>
                    <p className="campus-location"><MapPin size={14} /> Andhra Pradesh</p>
                  </div>
                  <div className="campus-stats">
                    <span className="stat-highlight">{college.issueCount || 0}</span> reported issues
                    <ArrowRight className="arrow-icon" size={16} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No colleges found matching "{search}"</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ExplorePage;
