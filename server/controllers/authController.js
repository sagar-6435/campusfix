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