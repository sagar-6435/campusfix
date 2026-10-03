import { useNavigate } from 'react-router-dom';

const ReportReviewPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container" style={{paddingTop: '6rem'}}>
      <h1>Review & Submit</h1>
      <button className="btn btn-accent mt-4" onClick={() => navigate('/report/success')}>
        Submit Issue
      </button>
    </div>
  );
};

export default ReportReviewPage;
