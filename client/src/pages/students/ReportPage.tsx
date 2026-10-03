import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';
import './ReportPage.css';

const ReportPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !file) {
      setError('Title, Location, and Evidence (Image) are required to submit a report.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('location', location);
      formData.append('description', description);
      if (file) {
        formData.append('image', file);
      }

      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit report. Please check your connection or try again later.');

      navigate('/report/success');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{paddingTop: '6rem', paddingBottom: '4rem'}}>
      <h1 className="text-hero" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>REPORT ISSUE.</h1>
      <p className="text-body-large text-muted" style={{maxWidth: '600px', marginBottom: '3rem'}}>
        Help improve your campus by providing details about the issue you are facing.
      </p>
      
      {error && <p className="error-text mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Issue Title</label>
          <input 
            type="text" 
            className="editorial-input lg w-full" 
            placeholder="e.g. Wi-Fi down in Library" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Location Details</label>
          <input 
            type="text" 
            className="editorial-input lg w-full" 
            placeholder="e.g. 2nd Floor, Main Block" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description (Optional)</label>
          <textarea 
            className="editorial-input w-full" 
            placeholder="Provide any additional details that might help..." 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Upload Evidence (Image)</label>
          <label className="upload-zone" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', border: '2px dashed #ccc', borderRadius: '8px', cursor: 'pointer',
            backgroundColor: '#f9f9f9', transition: 'border-color 0.2s'
          }}>
            <UploadCloud size={32} color="#888" style={{ marginBottom: '0.5rem' }} />
            <span style={{ color: '#555' }}>
              {file ? file.name : 'Click to upload or drag and drop'}
            </span>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-large w-full" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportPage;
