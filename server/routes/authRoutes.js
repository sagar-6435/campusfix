const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/request-otp', authController.requestOtp);
router.post('/register-with-proof', upload.single('proof'), authController.registerWithProof);
router.post('/verify-otp', authController.verifyOtp);
router.post('/admin-login', authController.adminLogin);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;