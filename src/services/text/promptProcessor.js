async function processPrompt(prompt) {
    try {
        if (!prompt || typeof prompt !== 'string') {
            throw new Error('Invalid prompt format');
        }

        // Clean and normalize the prompt
        const cleanedPrompt = cleanPrompt(prompt);

        // Extract intent and parameters from the prompt
        const { intent, parameters } = await extractIntent(cleanedPrompt);

        return {
            intent,
            parameters,
            originalPrompt: prompt
        };
    } catch (error) {
        throw new Error(`Prompt processing error: ${error.message}`);
    }
}

function cleanPrompt(prompt) {
    return prompt
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

async function extractIntent(prompt) {
    // Convert prompt to lowercase for case-insensitive matching
    prompt = prompt.toLowerCase();

    // Define intent patterns with variations
    const intentPatterns = {
        navigation: [
            /(?:navigate|go|take me|open|show) (?:to |me )?(?:the )?patient[- ](?:information|details|records|table)/,
            /(?:open|show|display|view) (?:the )?patient[- ](?:information|details|records|table)/
        ],
        patientForm: [
            /(?:fill|complete|submit|add)(?: in| out)?(?: the| a)?(?: new)? patient[- ](?:form|details|information)/,
            /(?:create|make|start)(?: a)?(?: new)? patient(?: form| entry)/
        ],
        login: [
            /log(?:in)?(?: me)? (?:in )?with(?: my)? email ([\w@.]+)(?: and)? password ([\w]+)/,
            /login with email ([\w@.]+)(?: and)? password ([\w]+)/
        ],
        loginAndNavigate: [
            /log(?:in)?(?: me)? (?:in )?with(?: my)? email ([\w@.]+)(?: and)? password ([\w]+) (?:and )?(?:then )?(?:navigate|go|take me|open|show) (?:to |me )?(?:the )?patient[- ](?:information|details|records|table)/
        ]
    };

    // Check each intent pattern
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
        for (const pattern of patterns) {
            const match = prompt.match(pattern);
            if (match) {
                // Extract parameters based on intent
                const parameters = {};
                
                if (intent === 'login' && match.length >= 3) {
                    parameters.email = match[1];
                    parameters.password = match[2];
                } else if (intent === 'loginAndNavigate' && match.length >= 3) {
                    parameters.email = match[1];
                    parameters.password = match[2];
                    parameters.route = 'patient-information';
                } else if (intent === 'navigation') {
                    parameters.route = 'patient-information';
                } else if (intent === 'patientForm') {
                    // Generate random patient data for testing
                    parameters.formData = {
                        action: 'fill_patient_form'
                    };
                }

                // Map patientForm intent to the correct handler name
                if (intent === 'patientForm') {
                    return { intent: 'fill_patient_form', parameters };
                }
                
                // Map loginAndNavigate to the correct handler name
                if (intent === 'loginAndNavigate') {
                    return { intent: 'login_and_navigate', parameters };
                }

                return { intent, parameters };
            }
        }
    }
    
    // Check for login intent
    const loginMatch = prompt.match(/login with email: ([^\s]+) password: ([^\s]+)/i);
    if (loginMatch) {
        return {
            intent: 'login',
            parameters: {
                email: loginMatch[1],
                password: loginMatch[2]
            }
        };
    }

    // Check for navigation intent
    const navigationMatch = prompt.match(/navigate to ([^\s]+)/i);
    if (navigationMatch) {
        return {
            intent: 'navigate',
            parameters: {
                route: navigationMatch[1]
            }
        };
    }

    // Check for fill patient form intent
    if (prompt.includes('fill') && prompt.includes('patient') && prompt.includes('form')) {
        return {
            intent: 'fill_patient_form',
            parameters: {}
        };
    }

    // If multiple intents are found in the same prompt
    if (loginMatch && navigationMatch) {
        return {
            intent: 'login_and_navigate',
            parameters: {
                email: loginMatch[1],
                password: loginMatch[2],
                route: navigationMatch[1]
            }
        };
    }

    // Default fallback
    return {
        intent: 'unknown',
        parameters: {}
    };
}

module.exports = { processPrompt };
