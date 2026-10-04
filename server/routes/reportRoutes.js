const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/', authenticateToken, upload.single('image'), reportController.createReport);
router.get('/college', authenticateToken, reportController.getCollegeReports);
router.put('/:id/vote', authenticateToken, reportController.voteReport);
router.put('/:id', authenticateToken, reportController.updateReport);
router.delete('/:id', authenticateToken, reportController.deleteReport);
router.get('/public/:slug', reportController.getPublicReports);

module.exports = router;