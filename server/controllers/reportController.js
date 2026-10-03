const { Report, User } = require('../models');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.createReport = async (req, res) => {
  try {
    const { title, description, location } = req.body;
    let imageUrl = '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'Home/campusfix/issues' });
      imageUrl = result.secure_url;
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const slug = user.college_slug || (user.email ? user.email.split('@')[1].split('.')[0] : null);

    const report = await Report.create({
      title, description, location, imageUrl,
      user: user._id, reporter_email: user.email,
      reporter_name: user.email ? user.email.split('@')[0] : 'Unknown',
      college_slug: slug
    });

    res.json({ success: true, report });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: 'Internal error: ' + (err.message || 'Failed to submit report') });
  }
};

exports.getCollegeReports = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const slug = user?.college_slug || (user?.email ? user.email.split('@')[1].split('.')[0] : null);
    if (!slug) return res.status(400).json({ error: 'User college not found' });
    
    const reports = await Report.find({ college_slug: slug }).sort({ created_at: -1 });
    const mapped = reports.map(r => ({
      ...r.toObject(), id: r._id,
      upvotes: r.votes ? r.votes.length : 0,
      hasVoted: r.votes ? r.votes.includes(user._id) : false
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Error fetching college reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.voteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const userIndex = report.votes.indexOf(req.user.id);
    if (userIndex === -1) {
      report.votes.push(req.user.id);
    } else {
      report.votes.splice(userIndex, 1);
    }
    await report.save();
    res.json({ success: true, upvotes: report.votes.length, hasVoted: userIndex === -1 });
  } catch (err) {
    console.error('Error voting on report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPublicReports = async (req, res) => {
  try {
    const reports = await Report.find({ 
      college_slug: req.params.slug, 
      status: { $in: ['Verified', 'In Progress', 'Resolved'] } 
    }).sort({ created_at: -1 });
    
    const mapped = reports.map(r => ({
      ...r.toObject(), id: r._id, upvotes: r.votes ? r.votes.length : 0
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Error fetching public reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};