require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

async function test() {
  console.log('Generating JWT Secret...');
  const secret = crypto.randomBytes(32).toString('hex');
  console.log('JWT_SECRET:', secret);

  console.log('Testing SMTP...');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS.replace(/"/g, ''), // Strip quotes if they exist
    },
  });

  try {
    await transporter.verify();
    console.log('SMTP Connection Successful!');
  } catch (e) {
    console.error('SMTP Connection Failed:', e);
  }
}

test();
