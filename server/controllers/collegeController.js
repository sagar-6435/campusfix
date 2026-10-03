const { College, Report } = require('../models');

exports.getColleges = async (req, res) => {
  try {
    const colleges = await College.find();
    const issueCounts = await Report.aggregate([
      { $match: { status: { $in: ['Verified', 'In Progress', 'Resolved', 'Under Review'] } } },
      { $group: { _id: "$college_slug", count: { $sum: 1 } } }
    ]);
    const countMap = {};
    issueCounts.forEach(c => countMap[c._id] = c.count);

    const mapped = colleges.map(c => ({ 
      ...c.toObject(),
      id: c._id, 
      issueCount: countMap[c.slug] || 0
    }));

    mapped.sort((a, b) => b.issueCount - a.issueCount);
    res.json(mapped);
  } catch (err) {
    console.error('Error fetching colleges:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCollegeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const college = await College.findOne({ slug });
    if (!college) return res.status(404).json({ error: 'College not found' });
    res.json({ ...college.toObject(), id: college._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};