require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sessionMiddleware = require('./middleware/sessionHandler');
const { handleAutomation } = require('./services/automationService');
const { processPrompt } = require('./services/promptProcessor');

// Import routes
const textRoutes = require('./routes/textRoutes');
const voiceRoutes = require('./routes/voiceRoutes');

const app = express();
const port = 8000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);

const cors = require('cors');
// Allow CORS everywhere for all origins and methods
app.use(cors());

// Routes
app.use('/api/text', textRoutes);
app.use('/api/voice', voiceRoutes);

// Main endpoint to handle automation tasks through prompts
app.post('/automate', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ 
                success: false, 
                message: 'Prompt is required' 
            });
        }

        // Process the prompt to determine the task
        const task = await processPrompt(prompt);
        
        // Execute the automation task
        const result = await handleAutomation(task);
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: `Error: ${error.message}` 
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`MCP Automation server running at http://localhost:${port}`);
}); 