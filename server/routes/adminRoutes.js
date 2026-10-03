const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.use(authenticateToken, requireAdmin);
router.get('/users', adminController.getUsers);
router.get('/reports', adminController.getReports);
router.put('/reports/:id/status', adminController.updateReportStatus);

module.exports = router;