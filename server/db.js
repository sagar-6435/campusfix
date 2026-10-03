const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campusfix')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

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
