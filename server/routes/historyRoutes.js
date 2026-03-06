const express = require('express');
const router = express.Router();
const { getHistory, saveScanToUser } = require('../controllers/historyController');
const { authMiddleware } = require('../middleware/auth');

router.get('/history', authMiddleware, getHistory);
router.post('/save-scan', authMiddleware, saveScanToUser);

module.exports = router;
