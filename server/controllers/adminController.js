const { User, Report } = require('../models');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: -1 });
    const mapped = users.map(u => ({ ...u.toObject(), id: u._id }));
    res.json(mapped);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('user', 'email').sort({ created_at: -1 });
    const mapped = reports.map(r => ({ ...r.toObject(), id: r._id }));
    res.json(mapped);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ success: true, report: { ...report.toObject(), id: report._id } });
  } catch (err) {
    console.error('Error updating report status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};