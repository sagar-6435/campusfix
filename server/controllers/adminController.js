const { User, Report } = require('../models');
const transporter = require('../config/nodemailer');

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

exports.getColleges = async (req, res) => {
  try {
    const colleges = await require('../models').College.find();
    res.json(colleges.map(c => ({ ...c.toObject(), id: c._id })));
  } catch (err) {
    console.error('Error fetching colleges for admin:', err);
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

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.toggleCollege = async (req, res) => {
  try {
    const { is_active } = req.body;
    const college = await require('../models').College.findOneAndUpdate(
      { slug: req.params.slug },
      { is_active },
      { new: true }
    );
    if (!college) return res.status(404).json({ error: 'College not found' });
    res.json({ success: true, college });
  } catch (err) {
    console.error('Error toggling college:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUserApproval = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { 
      approval_status: status,
      is_verified: status === 'Approved'
    }, { new: true });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.personal_email || user.email) {
      const emailTo = user.personal_email || user.email;
      const subject = status === 'Approved' ? 'CampusFix Account Approved' : 'CampusFix Account Rejected';
      const messageHtml = status === 'Approved'
        ? `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Account Approved</h2>
            <p>Your acc is approved</p>
            <p>Login at: <a href="https://campusfix12.vercel.app/login">https://campusfix12.vercel.app/login</a></p>
           </div>`
        : `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Account Rejected</h2>
            <p>Your acc is rejected</p>
           </div>`;
           
      try {
        await transporter.sendMail({
          from: `"CampusFix Admin" <${process.env.SMTP_USER}>`,
          to: emailTo,
          subject: subject,
          html: messageHtml,
        });
      } catch (emailErr) {
        console.error('Failed to send approval email:', emailErr);
      }
    }

    res.json({ success: true, user: { ...user.toObject(), id: user._id } });
  } catch (err) {
    console.error('Error updating user approval:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};