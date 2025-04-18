const { login, navigate, fillForm } = require('./automationService');

async function processPrompt(prompt) {
    // Convert prompt to lowercase for easier matching
    const lowerPrompt = prompt.toLowerCase();
    
    // Define task patterns for QMS-specific commands
    const taskPatterns = {
        login: /(login|sign in|log in)/i,
        navigate: /(go to|navigate to|open|visit|access|show)/i,
        fillForm: /(fill|complete|submit|enter)/i
    };

    // QMS-specific page mappings
    const pageAliases = {
        'triage': ['triage', 'triage list', 'triage waiting'],
        'department': ['department', 'department list', 'department waiting'],
        'patients': ['patients', 'registered patients', 'patient list'],
        'masterdata': ['master', 'masterdata', 'master data'],
        'tvscreen': ['tv', 'screen', 'tv screen', 'display'],
        'patient-table': ['patient table', 'patient-table', 'patients table']
    };

    // Determine the task type
    let taskType = null;
    for (const [type, pattern] of Object.entries(taskPatterns)) {
        if (pattern.test(lowerPrompt)) {
            taskType = type;
            break;
        }
    }

    // Extract parameters based on task type
    let task = { type: taskType };
    
    switch (taskType) {
        case 'login':
            // Extract credentials from prompt
            const emailMatch = lowerPrompt.match(/(?:email|username|user)[\s:]+([^\s]+)/i);
            const passwordMatch = lowerPrompt.match(/(?:password|pass)[\s:]+([^\s]+)/i);
            
            // Check for next route after login
            const nextRouteMatch = lowerPrompt.match(/(?:then|after|next|go to)[\s:]+(?:go to|navigate to|open|visit|access|show)\s+(.+?)(?:\s|$)/i);
            
            task.credentials = {
                email: emailMatch ? emailMatch[1] : null,
                password: passwordMatch ? passwordMatch[1] : null
            };

            // Add next route if specified
            if (nextRouteMatch) {
                const nextRoute = nextRouteMatch[1].trim();
                // Check if it's a direct route or needs mapping
                task.nextRoute = nextRoute.startsWith('/') ? nextRoute : 
                                nextRoute === 'patient-table' ? 'patient-table' : 
                                Object.entries(pageAliases).find(([_, aliases]) => 
                                    aliases.some(alias => nextRoute.includes(alias)))?.[0] || nextRoute;
            }
            break;
            
        case 'navigate':
            // Try to match QMS-specific pages
            let targetPage = null;

            // Check for direct route pattern
            const directRouteMatch = lowerPrompt.match(/(?:to|open|show)\s+\/([^\s]+)/i);
            if (directRouteMatch) {
                targetPage = '/' + directRouteMatch[1];
            } else {
                // Try to match against aliases
                for (const [page, aliases] of Object.entries(pageAliases)) {
                    if (aliases.some(alias => lowerPrompt.includes(alias))) {
                        targetPage = page;
                        break;
                    }
                }
                
                // If no specific page matched, extract any mentioned path
                if (!targetPage) {
                    const urlMatch = lowerPrompt.match(/(?:to|open|show)\s+(.+?)(?:\s|$)/i);
                    targetPage = urlMatch ? urlMatch[1] : null;
                }
            }
            
            task.url = targetPage;
            break;
            
        case 'fillForm':
            // Extract form fields with improved pattern matching
            const formFields = {};
            
            // Common field patterns in QMS
            const fieldPatterns = {
                name: /(?:name|patient name)[\s:]+([^\s,]+(?:\s+[^\s,]+)*)/i,
                email: /(?:email|mail)[\s:]+([^\s,]+)/i,
                phone: /(?:phone|mobile|contact)[\s:]+([^\s,]+)/i,
                message: /(?:message|description|details)[\s:]+([^,]+?)(?:,|\s*$)/i
            };
            
            for (const [field, pattern] of Object.entries(fieldPatterns)) {
                const match = lowerPrompt.match(pattern);
                if (match) {
                    formFields[field] = match[1].trim();
                }
            }
            
            task.formData = formFields;
            break;
    }

    return task;
}

module.exports = { processPrompt }; 