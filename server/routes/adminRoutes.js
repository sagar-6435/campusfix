const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.use(authenticateToken, requireAdmin);
router.get('/users', adminController.getUsers);
router.get('/colleges', adminController.getColleges);
router.get('/reports', adminController.getReports);
router.put('/reports/:id/status', adminController.updateReportStatus);
router.delete('/reports/:id', adminController.deleteReport);
router.put('/colleges/:slug/toggle', adminController.toggleCollege);
router.put('/users/:id/approval', adminController.updateUserApproval);

module.exports = router;