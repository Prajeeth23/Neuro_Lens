const Scan = require('../models/Scan');

const getHistory = async (req, res) => {
    try {
        const scans = await Scan.find({ user_id: req.userId })
            .sort({ created_at: -1 })
            .limit(50);

        res.json({ scans });
    } catch (err) {
        console.error('History error:', err);
        res.status(500).json({ error: 'Could not fetch history' });
    }
};

const saveScanToUser = async (req, res) => {
    try {
        const { scanId } = req.body;

        if (!scanId) {
            return res.status(400).json({ error: 'Scan ID is required' });
        }

        const scan = await Scan.findById(scanId);
        if (!scan) {
            return res.status(404).json({ error: 'Scan not found' });
        }

        scan.user_id = req.userId;
        await scan.save();

        res.json({ message: 'Scan saved to your account', scan });
    } catch (err) {
        console.error('Save scan error:', err);
        res.status(500).json({ error: 'Could not save scan' });
    }
};

module.exports = { getHistory, saveScanToUser };
