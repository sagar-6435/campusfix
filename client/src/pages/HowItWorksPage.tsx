const HowItWorksPage = () => {
  return (
    <div className="container" style={{paddingTop: '6rem'}}>
      <h1 className="text-title text-uppercase">How CampusFix Works</h1>
      <div className="mt-8" style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
        <div>
          <h3>1. Find Your College</h3>
          <p className="text-muted mt-2">Anyone can search and view a college.</p>
        </div>
        <div>
          <h3>2. Verify Your Student Identity</h3>
          <p className="text-muted mt-2">Students use their official college email.</p>
        </div>
        <div>
          <h3>3. Verify Campus Location</h3>
          <p className="text-muted mt-2">Students must be physically inside campus to submit a report.</p>
        </div>
        <div>
          <h3>4. Report the Problem</h3>
          <p className="text-muted mt-2">Add category, location, description, and evidence.</p>
        </div>
        <div>
          <h3>5. Community Support</h3>
          <p className="text-muted mt-2">Other verified students can support the issue.</p>
        </div>
      </div>
      <div className="editorial-divider"></div>
      <h2 style={{color: 'var(--c-accent)'}}>Anyone can see. Only verified students can report.</h2>
    </div>
  );
};

export default HowItWorksPage;
