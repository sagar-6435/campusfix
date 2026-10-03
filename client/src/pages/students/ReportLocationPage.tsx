import { useNavigate } from 'react-router-dom';

const ReportLocationPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container" style={{paddingTop: '6rem'}}>
      <h1>Location Verification</h1>
      <button className="btn btn-primary mt-4" onClick={() => navigate('/report/details')}>
        Simulate Inside Campus
      </button>
    </div>
  );
};

export default ReportLocationPage;
