const ProfilePage = () => {
  return (
    <div className="container" style={{paddingTop: '6rem'}}>
      <h1>Profile & Settings</h1>
      <div className="mt-8">
        <p><strong>Name:</strong> Sagar</p>
        <p><strong>Email:</strong> 24******87@srkrec.ac.in</p>
        <p><strong>College:</strong> SRKR Engineering College</p>
      </div>
      <button className="btn btn-secondary mt-8" onClick={() => {
        localStorage.removeItem('auth');
        window.location.href = '/login';
      }}>
        Logout
      </button>
    </div>
  );
};

export default ProfilePage;
