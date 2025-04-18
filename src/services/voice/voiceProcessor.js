const { convertSpeechToText } = require('./speechToText');
const { handleNavigation, handlePatientForm, getActivePage } = require('../automation/automationService');

async function processVoice(audioData) {
    try {
        if (!Buffer.isBuffer(audioData)) {
            throw new Error('Audio data must be a buffer');
        }

        // Log the audio data size
        console.log('Audio size:', audioData.length, 'bytes');

        // Process the audio buffer directly
        const result = await preprocessAudio(audioData);
        
        // Return the processed result
        return result;
    } catch (error) {
        throw new Error(`Voice processing error: ${error.message}`);
    }
}

async function preprocessAudio(audioData) {
    try {
        // Convert buffer to blob and process speech
        const audioBlob = new Blob([audioData], { type: 'audio/webm' });
        const result = await convertSpeechToText(audioBlob);
        
        // Handle different intents
        switch (result.intent) {
            case 'navigate':
                await handleNavigation({ route: result.parameters.route });
                return { success: true, message: `Navigated to ${result.parameters.route}` };
            
            case 'fillForm':
                if (result.parameters.formType === 'patient') {
                    // Make sure we're on the patient information page first
                    const page = await getActivePage();
                    const currentUrl = page.url();
                    if (!currentUrl.includes('/patient-information')) {
                        await handleNavigation({ route: '/patient-information' });
                    }
                    
                    // Fill the form with random data
                    await handlePatientForm({});
                    return { success: true, message: 'Patient form filled with random data' };
                }
                break;
        }
        
        // For unhandled intents, return the processed text result
        return result;
    } catch (error) {
        throw new Error(`Audio preprocessing error: ${error.message}`);
    }
}


module.exports = { processVoice };
