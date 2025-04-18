const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processVoice } = require('../services/voice/voiceProcessor');
const { convertSpeechToText } = require('../services/voice/speechToText');
const { handleAutomation } = require('../services/automation/automationService');

// Configure multer for handling audio files
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept only audio files
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    }
});

// Handle voice-based automation requests
router.post('/process', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No audio file provided');
        }

        // Process the voice data directly with the buffer
        const processedText = await convertSpeechToText(req.file.buffer);
        
        // Execute the automation based on the intent
        const result = await handleAutomation(processedText);
        
        res.json({
            success: true,
            transcription: processedText,
            result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
