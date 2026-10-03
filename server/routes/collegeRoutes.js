const express = require('express');
const router = express.Router();
const collegeController = require('../controllers/collegeController');

router.get('/', collegeController.getColleges);
router.get('/:slug', collegeController.getCollegeBySlug);

module.exports = router;