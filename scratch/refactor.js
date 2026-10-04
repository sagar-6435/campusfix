const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, '../server');
const dirs = ['models', 'controllers', 'routes', 'middlewares', 'config'];

dirs.forEach(d => {
    const dirPath = path.join(serverDir, d);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
});

// 1. server/config/db.js
fs.writeFileSync(path.join(serverDir, 'config', 'db.js'), `
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campusfix');
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
module.exports = connectDB;
`.trim());

// 2. server/models/index.js
fs.writeFileSync(path.join(serverDir, 'models', 'index.js'), `
const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true }
});
const College = mongoose.model('College', collegeSchema);

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  is_verified: { type: Boolean, default: false },
  college_slug: String,
  created_at: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const otpSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  otp: String,
  created_at: { type: Date, default: Date.now }
});
const Otp = mongoose.model('Otp', otpSchema);

const reportSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  imageUrl: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporter_email: String,
  reporter_name: String,
  college_slug: String,
  status: { type: String, default: 'Under Review' },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  created_at: { type: Date, default: Date.now }
});
const Report = mongoose.model('Report', reportSchema);

module.exports = { College, User, Otp, Report };
`.trim());

// 3. server/config/cloudinary.js
fs.writeFileSync(path.join(serverDir, 'config', 'cloudinary.js'), `
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
module.exports = cloudinary;
`.trim());

// 4. server/config/nodemailer.js
fs.writeFileSync(path.join(serverDir, 'config', 'nodemailer.js'), `
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  family: 4,
});
module.exports = transporter;
`.trim());

// 5. server/middlewares/authMiddleware.js
fs.writeFileSync(path.join(serverDir, 'middlewares', 'authMiddleware.js'), `
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

module.exports = { authenticateToken, requireAdmin };
`.trim());

// 6. server/middlewares/uploadMiddleware.js
fs.writeFileSync(path.join(serverDir, 'middlewares', 'uploadMiddleware.js'), `
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
module.exports = upload;
`.trim());

// 7. server/controllers/collegeController.js
fs.writeFileSync(path.join(serverDir, 'controllers', 'collegeController.js'), `
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
`.trim());

// 8. server/routes/collegeRoutes.js
fs.writeFileSync(path.join(serverDir, 'routes', 'collegeRoutes.js'), `
const express = require('express');
const router = express.Router();
const collegeController = require('../controllers/collegeController');

router.get('/', collegeController.getColleges);
router.get('/:slug', collegeController.getCollegeBySlug);

module.exports = router;
`.trim());

// 9. server/controllers/authController.js
fs.writeFileSync(path.join(serverDir, 'controllers', 'authController.js'), `
const { User, Otp } = require('../models');
const transporter = require('../config/nodemailer');
const jwt = require('jsonwebtoken');

exports.requestOtp = async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid college email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await Otp.findOneAndUpdate({ email }, { otp, created_at: new Date() }, { upsert: true });
    await transporter.sendMail({
      from: \`"CampusFix Security" <\${process.env.SMTP_USER}>\`,
      to: email,
      subject: 'Your CampusFix Login Verification Code',
      html: \`<div style="font-family: sans-serif; padding: 20px;">
          <h2>CampusFix Verification</h2>
          <p>Your one-time password (OTP) is:</p>
          <h1 style="color: #2457FF; letter-spacing: 4px;">\${otp}</h1>
          <p>This code will expire in 10 minutes. Do not share it with anyone.</p>
        </div>\`,
    });
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp, college_slug } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) return res.status(401).json({ error: 'Invalid or expired OTP' });
    await Otp.deleteOne({ email });

    const updateData = { is_verified: true };
    if (college_slug) updateData.college_slug = college_slug;

    const user = await User.findOneAndUpdate({ email }, updateData, { upsert: true, new: true });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: 'Authentication successful', token, user });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || email !== process.env.ADMIN_EMAIL || !password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  const token = jwt.sign({ role: 'admin', email: process.env.ADMIN_EMAIL }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ success: true, message: 'Admin login successful', token });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ...user.toObject(), id: user._id });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
`.trim());

// 10. server/routes/authRoutes.js
fs.writeFileSync(path.join(serverDir, 'routes', 'authRoutes.js'), `
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/request-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/admin-login', authController.adminLogin);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
`.trim());

// 11. server/controllers/adminController.js
fs.writeFileSync(path.join(serverDir, 'controllers', 'adminController.js'), `
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
`.trim());

// 12. server/routes/adminRoutes.js
fs.writeFileSync(path.join(serverDir, 'routes', 'adminRoutes.js'), `
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.use(authenticateToken, requireAdmin);
router.get('/users', adminController.getUsers);
router.get('/reports', adminController.getReports);
router.put('/reports/:id/status', adminController.updateReportStatus);

module.exports = router;
`.trim());

// 13. server/controllers/reportController.js
fs.writeFileSync(path.join(serverDir, 'controllers', 'reportController.js'), `
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
`.trim());

// 14. server/routes/reportRoutes.js
fs.writeFileSync(path.join(serverDir, 'routes', 'reportRoutes.js'), `
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/', authenticateToken, upload.single('image'), reportController.createReport);
router.get('/college', authenticateToken, reportController.getCollegeReports);
router.put('/:id/vote', authenticateToken, reportController.voteReport);
router.get('/public/:slug', reportController.getPublicReports);

module.exports = router;
`.trim());

// 15. server/index.js
fs.writeFileSync(path.join(serverDir, 'index.js'), `
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

// Import Routes
const collegeRoutes = require('./routes/collegeRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Register Routes
app.use('/api/colleges', collegeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`.trim());

if (fs.existsSync(path.join(serverDir, 'db.js'))) {
    fs.unlinkSync(path.join(serverDir, 'db.js'));
}
