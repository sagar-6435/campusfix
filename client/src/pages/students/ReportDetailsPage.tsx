import { useNavigate } from 'react-router-dom';

const ReportDetailsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container" style={{paddingTop: '6rem'}}>
      <h1>Issue Details Form</h1>
      <button className="btn btn-primary mt-4" onClick={() => navigate('/report/evidence')}>
        Continue to Evidence
      </button>
    </div>
  );
};

export default ReportDetailsPage;
