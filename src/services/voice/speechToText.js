const axios = require('axios');

// AssemblyAI API configuration
const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY;
const ASSEMBLY_API_UPLOAD_URL = 'https://api.assemblyai.com/v2/upload';
const ASSEMBLY_API_TRANSCRIPT_URL = 'https://api.assemblyai.com/v2/transcript';

async function uploadAudio(audioBuffer) {
    try {
        const response = await axios.post(ASSEMBLY_API_UPLOAD_URL, audioBuffer, {
            headers: {
                'authorization': ASSEMBLY_API_KEY,
                'content-type': 'application/octet-stream'
            }
        });
        return response.data.upload_url;
    } catch (error) {
        console.error('Error uploading audio:', error);
        throw error;
    }
}

async function createTranscription(audioUrl) {
    try {
        const response = await axios.post(ASSEMBLY_API_TRANSCRIPT_URL, {
            audio_url: audioUrl,
            language_code: 'en'
        }, {
            headers: {
                'authorization': ASSEMBLY_API_KEY,
                'content-type': 'application/json'
            }
        });
        return response.data.id;
    } catch (error) {
        console.error('Error creating transcription:', error);
        throw error;
    }
}

async function getTranscriptionResult(transcriptId) {
    try {
        while (true) {
            const response = await axios.get(`${ASSEMBLY_API_TRANSCRIPT_URL}/${transcriptId}`, {
                headers: {
                    'authorization': ASSEMBLY_API_KEY
                }
            });

            if (response.data.status === 'completed') {
                return response.data.text;
            } else if (response.data.status === 'error') {
                throw new Error(`Transcription failed: ${response.data.error}`);
            }

            // Wait for 1 second before checking again
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error('Error getting transcription result:', error);
        throw error;
    }
}

async function convertSpeechToText(audioData) {
    try {
        // Upload the audio file
        console.log('Uploading audio...');
        const uploadUrl = await uploadAudio(audioData);

        // Create transcription
        console.log('Creating transcription...');
        const transcriptId = await createTranscription(uploadUrl);

        // Get transcription result
        console.log('Getting transcription result...');
        const transcription = await getTranscriptionResult(transcriptId);

        // Log and process the transcription
        console.log('AssemblyAI transcription:', transcription);
        return await processTranscription(transcription);
    } catch (error) {
        console.error('Speech to text conversion error:', error);
        throw error;
    }
}

async function processTranscription(transcription) {
    try {
        // Create processed text object
        const processedText = {
            intent: 'unknown',
            parameters: {},
            originalText: transcription,
            confidence: 1.0
        };

        // Check for login command
        const loginMatch = transcription.match(/login with email ([\w@.]+) (?:and )?password ([\w]+)/i);
        if (loginMatch) {
            processedText.intent = 'login';
            processedText.parameters = {
                email: loginMatch[1],
                password: loginMatch[2]
            };
        }

        // Check for form filling commands
        const formPatterns = [
            /(?:fill|complete)(?: the)? patient form/i,
            /(?:add|create|input)(?: new)? patient (?:details|information)/i,
            /(?:submit|save)(?: the)? patient (?:form|details|information)/i
        ];

        for (const pattern of formPatterns) {
            if (pattern.test(transcription)) {
                processedText.intent = 'fillForm';
                processedText.parameters = {
                    formType: 'patient'
                };
                return processedText;
            }
        }

        // Check for navigation command with enhanced patterns
        const navigationPatterns = [
            /(?:navigate|go) to ([\w-/]+)(?: page)?/i,
            /(?:open|show|display) ([\w-/]+)(?: page)?/i,
            /(?:take me to) ([\w-/]+)(?: page)?/i
        ];

        let navigationMatch = null;
        for (const pattern of navigationPatterns) {
            const match = transcription.match(pattern);
            if (match) {
                navigationMatch = match;
                break;
            }
        }

        if (navigationMatch) {
            processedText.intent = 'navigate';
            let route = navigationMatch[1];
            
            // Enhanced route mapping with variations
            const routeMap = {
                // Patient Information variations
                'patient-information': '/patient-information',
                'patientinformation': '/patient-information',
                'patient information': '/patient-information',
                'patientinfo': '/patient-information',
                'patient details': '/patient-information',
                
                // Patient Journey variations
                'patientjourney': '/patientjourney',
                'patient-journey': '/patientjourney',
                'patient journey': '/patientjourney',
                'journey': '/patientjourney',
                
                // Other common variations
                'home': '/',
                'dashboard': '/dashboard',
                'settings': '/settings'
            };
            
            // Clean up the route text
            route = route.toLowerCase()
                .replace(/\s+/g, '-')     // Replace spaces with hyphens
                .replace(/[^\w-]/g, '');  // Remove any special characters
            
            // Get mapped route or create a normalized one
            route = routeMap[route] || `/${route}`;
            
            processedText.parameters = {
                route: route
            };
        }

        // Check for form filling command
        if (transcription.toLowerCase().includes('fill') && 
            transcription.toLowerCase().includes('patient') && 
            transcription.toLowerCase().includes('form')) {
            processedText.intent = 'fill_patient_form';
        }

        // If both login and navigation are present
        if (loginMatch && navigationMatch) {
            processedText.intent = 'login_and_navigate';
            processedText.parameters = {
                email: loginMatch[1],
                password: loginMatch[2],
                route: navigationMatch[1]
            };
        }

        // Add the transcription to the response for debugging
        return {
            ...processedText,
            transcription
        };
    } catch (error) {
        throw new Error(`Speech to text conversion error: ${error.message}`);
    }
}

module.exports = { convertSpeechToText };
