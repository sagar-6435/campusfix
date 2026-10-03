import { useNavigate } from 'react-router-dom';

const ReportSuccessPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container" style={{paddingTop: '6rem'}}>
      <h1 style={{color: 'var(--c-success)'}}>Issue Reported Successfully!</h1>
      <p className="mt-4">Issue ID: CFX-10482</p>
      <div className="mt-8" style={{display: 'flex', gap: '1rem'}}>
        <button className="btn btn-primary" onClick={() => navigate('/issue/CFX-10482')}>
          View Issue
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ReportSuccessPage;
