const express = require('express');
const router = express.Router();
const { detectMedia } = require('../controllers/detectController');

router.post('/detect', detectMedia);

module.exports = router;
