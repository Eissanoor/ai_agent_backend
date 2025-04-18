const express = require('express');
const router = express.Router();
const { processPrompt } = require('../services/text/promptProcessor');
const { handleAutomation } = require('../services/automation/automationService');

// Handle text-based automation requests
router.post('/process', async (req, res) => {
    try {
        const { prompt } = req.body;
        const processedPrompt = await processPrompt(prompt);
        const result = await handleAutomation(processedPrompt);
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
