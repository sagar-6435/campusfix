import { useNavigate } from 'react-router-dom';

const ReportEvidencePage = () => {
  const navigate = useNavigate();
  return (
    <div className="container" style={{paddingTop: '6rem'}}>
      <h1>Evidence Upload</h1>
      <button className="btn btn-primary mt-4" onClick={() => navigate('/report/review')}>
        Continue to Review
      </button>
    </div>
  );
};

export default ReportEvidencePage;
