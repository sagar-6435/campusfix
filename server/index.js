const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { College, User, Otp, Report } = require('./db');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for local temporary storage
const upload = multer({ dest: 'uploads/' });

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API: Get all colleges
app.get('/api/colleges', async (req, res) => {
  try {
    const colleges = await College.find();
    
    // Get issue counts
    const issueCounts = await Report.aggregate([
      { $match: { status: { $in: ['Verified', 'In Progress', 'Resolved', 'Under Review'] } } },
      { $group: { _id: "$college_slug", count: { $sum: 1 } } }
    ]);
    
    const countMap = {};
    issueCounts.forEach(c => {
      countMap[c._id] = c.count;
    });

    const mapped = colleges.map(c => ({ 
      ...c.toObject(),
      id: c._id, 
      issueCount: countMap[c.slug] || 0
    }));

    // Sort by issue count descending
    mapped.sort((a, b) => b.issueCount - a.issueCount);

    res.json(mapped);
  } catch (err) {
    console.error('Error fetching colleges:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Get single college by slug
app.get('/api/colleges/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const college = await College.findOne({ slug });
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    res.json({ ...college.toObject(), id: college._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Request OTP
app.post('/api/auth/request-otp', async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid college email is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await Otp.findOneAndUpdate(
      { email },
      { otp, created_at: new Date() },
      { upsert: true }
    );

    await transporter.sendMail({
      from: `"CampusFix Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your CampusFix Login Verification Code',
      html: `<div style="font-family: sans-serif; padding: 20px;">
          <h2>CampusFix Verification</h2>
          <p>Your one-time password (OTP) is:</p>
          <h1 style="color: #2457FF; letter-spacing: 4px;">${otp}</h1>
          <p>This code will expire in 10 minutes. Do not share it with anyone.</p>
        </div>`,
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// API: Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp, college_slug } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    const otpRecord = await Otp.findOne({ email, otp });
    
    if (!otpRecord) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    await Otp.deleteOne({ email });

    const updateData = { is_verified: true };
    if (college_slug) updateData.college_slug = college_slug;

    const user = await User.findOneAndUpdate(
      { email },
      updateData,
      { upsert: true, new: true }
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, message: 'Authentication successful', token, user });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
  const { email, password } = req.body;
  
  if (
    !email || email !== process.env.ADMIN_EMAIL ||
    !password || password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  // Generate JWT token for admin
  const token = jwt.sign(
    { role: 'admin', email: process.env.ADMIN_EMAIL },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ success: true, message: 'Admin login successful', token });
});

// Middleware: Authenticate JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// Middleware: Check if Admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// API: Get all registered users (Admin Only)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: -1 });
    const mapped = users.map(u => ({ ...u.toObject(), id: u._id }));
    res.json(mapped);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Get all reports (Admin Only)
app.get('/api/admin/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const reports = await Report.find().populate('user', 'email').sort({ created_at: -1 });
    const mapped = reports.map(r => ({ ...r.toObject(), id: r._id }));
    res.json(mapped);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Update Report Status (Admin Only)
app.put('/api/admin/reports/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ success: true, report: { ...report.toObject(), id: report._id } });
  } catch (err) {
    console.error('Error updating report status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Get current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ...user.toObject(), id: user._id });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Submit a new report
app.post('/api/reports', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, location } = req.body;
    let imageUrl = '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'Home/campusfix/issues'
      });
      imageUrl = result.secure_url;
      // Clean up temporary local file
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const slug = user.college_slug || (user.email ? user.email.split('@')[1].split('.')[0] : null);

    const report = await Report.create({
      title,
      description,
      location,
      imageUrl,
      user: user._id,
      reporter_email: user.email,
      reporter_name: user.email ? user.email.split('@')[0] : 'Unknown',
      college_slug: slug
    });

    res.json({ success: true, report });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: 'Internal error: ' + (err.message || 'Failed to submit report') });
  }
});

// API: Get reports for user's college
app.get('/api/reports/college', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const slug = user?.college_slug || (user?.email ? user.email.split('@')[1].split('.')[0] : null);
    
    if (!slug) return res.status(400).json({ error: 'User college not found' });
    
    // Aggregate to add vote count and whether user voted
    const reports = await Report.find({ college_slug: slug }).sort({ created_at: -1 });
    
    const mapped = reports.map(r => ({
      ...r.toObject(),
      id: r._id,
      upvotes: r.votes ? r.votes.length : 0,
      hasVoted: r.votes ? r.votes.includes(user._id) : false
    }));
    
    res.json(mapped);
  } catch (err) {
    console.error('Error fetching college reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Vote on a report
app.put('/api/reports/:id/vote', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const userIndex = report.votes.indexOf(req.user.id);
    if (userIndex === -1) {
      report.votes.push(req.user.id); // Add vote
    } else {
      report.votes.splice(userIndex, 1); // Remove vote
    }
    
    await report.save();
    res.json({ success: true, upvotes: report.votes.length, hasVoted: userIndex === -1 });
  } catch (err) {
    console.error('Error voting on report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Get public reports for a college
app.get('/api/reports/public/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const reports = await Report.find({ 
      college_slug: slug, 
      status: { $in: ['Verified', 'In Progress', 'Resolved'] } 
    }).sort({ created_at: -1 });
    
    const mapped = reports.map(r => ({
      ...r.toObject(),
      id: r._id,
      upvotes: r.votes ? r.votes.length : 0
    }));
    
    res.json(mapped);
  } catch (err) {
    console.error('Error fetching public reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
