const express = require('express');
const multer = require('multer');
const path = require('path');
const Scan = require('../models/Scan');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, and MP4 files are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

router.post('/upload', optionalAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileType = req.file.mimetype.startsWith('image') ? 'image' : 'video';

        let scan;
        try {
            scan = new Scan({
                user_id: req.userId || null,
                file_url: 'uploads/' + req.file.filename,
                file_type: fileType,
                original_name: req.file.originalname
            });
            await scan.save();
        } catch (dbErr) {
            // If DB is not connected, return a temporary ID
            scan = {
                _id: 'temp_' + Date.now(),
                file_url: 'uploads/' + req.file.filename,
                file_type: fileType,
                original_name: req.file.originalname
            };
        }

        res.json({
            message: 'File uploaded successfully',
            scan: {
                id: scan._id,
                file_url: scan.file_url,
                file_type: scan.file_type,
                original_name: scan.original_name
            }
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message || 'Upload failed' });
    }
});

module.exports = router;
