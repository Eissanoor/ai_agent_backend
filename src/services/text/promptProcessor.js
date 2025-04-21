const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

async function processPrompt(prompt, userId = null) {
    try {
        if (!prompt || typeof prompt !== 'string') {
            throw new Error('Invalid prompt format');
        }

        // Clean and normalize the prompt
        const cleanedPrompt = cleanPrompt(prompt);

        // Extract intent and parameters from the prompt
        const { intent, parameters } = await extractIntent(cleanedPrompt);
        
        // Determine if the prompt has an action to perform
        const hasAction = intent !== 'unknown';
        
        // Save the prompt to the database
        await savePromptToDatabase(prompt, intent, parameters, hasAction, userId);

        // If no action is found, provide suggestions
        let suggestions = [];
        if (!hasAction) {
            suggestions = await generateActionSuggestions(cleanedPrompt, userId);
        }

        return {
            intent,
            parameters,
            originalPrompt: prompt,
            hasAction,
            suggestions: hasAction ? [] : suggestions
        };
    } catch (error) {
        throw new Error(`Prompt processing error: ${error.message}`);
    }
}

async function savePromptToDatabase(text, intent, parameters, hasAction, userId) {
    try {
        // Convert parameters object to string for storage
        const parametersString = parameters ? JSON.stringify(parameters) : null;
        
        // Create a new prompt record in the database
        await prisma.prompt.create({
            data: {
                text,
                intent,
                parameters: parametersString,
                hasAction,
                userId
            }
        });
        
        console.log('Prompt saved to database successfully');
    } catch (error) {
        console.error('Error saving prompt to database:', error);
        // Don't throw the error to avoid disrupting the main flow
        // Just log it and continue
    }
}

async function generateActionSuggestions(prompt, userId = null) {
    // Generate suggestions based on the prompt content
    let suggestions = [];
    
    // Define known routes for navigation suggestions
    const knownRoutes = {
        'patient-information': 'Navigate to patient information screen',
        'patientjourney': 'Navigate to patient journey visualization',
        'kpi': 'View KPI page with metrics',
        'monitoring': 'Access patient monitoring',
        'patient-table': 'View comprehensive patient table and records',
        'Home': 'Return to home dashboard',
        'users': 'Manage user accounts and permissions',
        'login': 'Navigate to login screen',
        'tv-screen': 'View waiting room TV display settings',
        'reports': 'Access medical reports and analytics'
    };
    
    // First, try to get suggestions from historical data
    try {
        const historicalSuggestions = await getHistoricalSuggestions(userId);
        suggestions = [...historicalSuggestions];
    } catch (error) {
        console.error('Error getting historical suggestions:', error);
        // Continue with keyword-based suggestions if historical data fails
    }
    
    // Try to identify potential routes in the prompt
    let potentialRoutes = [];
    const cleanedPrompt = prompt.toLowerCase();
    
    // Handle partial keyword matching for common terms like 'tv' or 'patient'
    const keywordMappings = {
        'tv': ['tv-screen'],
        'patient': ['patient-information', 'patientjourney', 'patient-table'],
        'monitor': ['monitoring'],
        'login': ['login'],
        'user': ['users'],
        'report': ['reports'],
        'journey': ['patientjourney'],
        'info': ['patient-information'],
        'table': ['patient-table'],
        'home': ['Home'],
        'kpi': ['kpi'],
        'record': ['patientjourney', 'patient-table']
    };
    
    // Check for partial keywords first
    const words = cleanedPrompt.split(/\s+/);
    for (const word of words) {
        if (word.length < 2) continue; // Skip very short words
        
        // Check if the word is a known keyword or part of a known keyword
        for (const [keyword, routes] of Object.entries(keywordMappings)) {
            if (keyword.includes(word) || word.includes(keyword)) {
                potentialRoutes.push(...routes);
            }
        }
    }
    
    // If no keywords matched, try more specific route matching
    if (potentialRoutes.length === 0) {
        // Extract potential route mentions
        for (const [route, routeText] of Object.entries(knownRoutes)) {
            // Check for route name or variations
            if (cleanedPrompt.includes(route) || 
                (route === 'patientjourney' && (
                    cleanedPrompt.includes('patient journey') || 
                    cleanedPrompt.includes('journey') || 
                    cleanedPrompt.includes('patient path')
                )) || 
                (route === 'patient-information' && (
                    cleanedPrompt.includes('patient info') || 
                    cleanedPrompt.includes('patient record') || 
                    cleanedPrompt.includes('patient data')
                ))) {
                potentialRoutes.push(route);
            }
        }
    }
    
    // Use fuzzy matching for misspelled routes if still no matches
    if (potentialRoutes.length === 0) {
        for (const word of words) {
            if (word.length < 4) continue; // Skip very short words
            
            for (const route of Object.keys(knownRoutes)) {
                // Check for partial matches or common misspellings
                if (calculateSimilarity(word, route) > 0.6 || 
                    route.includes(word) || 
                    word.includes(route.replace('-', ''))) {
                    potentialRoutes.push(route);
                    break;
                }
            }
        }
    }
    
    // Add navigation suggestions for potential routes
    for (const route of potentialRoutes) {
        const suggestion = knownRoutes[route];
        if (!suggestions.includes(suggestion)) {
            suggestions.push(suggestion);
        }
    }
    
    // Check for keywords related to patient management
    if (cleanedPrompt.includes('patient') || cleanedPrompt.includes('medical') || 
        cleanedPrompt.includes('hospital') || cleanedPrompt.includes('form')) {
        if (!suggestions.includes('Fill in a new patient form')) {
            suggestions.push('Fill in a new patient form');
        }
    }
    
    // Check for keywords related to login
    if (cleanedPrompt.includes('login') || cleanedPrompt.includes('sign in') || 
        cleanedPrompt.includes('access') || cleanedPrompt.includes('account')) {
        const loginSuggestion = 'Navigate to login screen';
        const credentialSuggestion = 'Login with email: example@gmail.com password: example123';
        
        if (!suggestions.includes(loginSuggestion)) {
            suggestions.push(loginSuggestion);
        }
        if (!suggestions.includes(credentialSuggestion)) {
            suggestions.push(credentialSuggestion);
        }
    }
    
    // Check for record-related keywords to suggest both patient journey and patient table
    if (cleanedPrompt.includes('record') || cleanedPrompt.includes('records') || 
        cleanedPrompt.includes('patient record') || cleanedPrompt.includes('medical record')) {
        const journeySuggestion = 'View patient journey visualization';
        const tableSuggestion = 'View comprehensive patient table and records';
        
        if (!suggestions.includes(journeySuggestion)) {
            suggestions.push(journeySuggestion);
        }
        if (!suggestions.includes(tableSuggestion)) {
            suggestions.push(tableSuggestion);
        }
    }
    
    // Check for keywords related to navigation
    if (cleanedPrompt.includes('go to') || cleanedPrompt.includes('navigate') || 
        cleanedPrompt.includes('show') || cleanedPrompt.includes('view') || 
        cleanedPrompt.includes('open') || cleanedPrompt.includes('access')) {
        
        // If no specific route was identified but navigation intent is clear
        if (potentialRoutes.length === 0) {
            // Add common navigation options
            const commonRoutes = ['Navigate to patient information', 'Navigate to dashboard', 'Navigate to patient journey'];
            for (const routeSuggestion of commonRoutes) {
                if (!suggestions.includes(routeSuggestion)) {
                    suggestions.push(routeSuggestion);
                }
            }
        }
    }
    
    // Add some default suggestions if none were generated
    if (suggestions.length === 0) {
        suggestions.push('Fill in a new patient form');
        suggestions.push('Login to the system');
        suggestions.push('Navigate to patient information');
        suggestions.push('Navigate to patient journey');
    }
    
    // Limit to top 5 suggestions to avoid overwhelming the user
    return suggestions.slice(0, 5);
}

// Simple similarity calculation for fuzzy matching
function calculateSimilarity(str1, str2) {
    // If one is contained within the other, high similarity
    if (str1.includes(str2) || str2.includes(str1)) {
        return 0.8;
    }
    
    // Check for word-by-word partial matches
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    let matchCount = 0;
    
    for (const word1 of words1) {
        if (word1.length < 3) continue; // Skip very short words
        for (const word2 of words2) {
            if (word2.length < 3) continue;
            if (word1.includes(word2) || word2.includes(word1)) {
                matchCount++;
                break;
            }
        }
    }
    
    if (words1.length > 0 && words2.length > 0) {
        const wordSimilarity = matchCount / Math.max(words1.length, words2.length);
        if (wordSimilarity > 0.5) {
            return wordSimilarity;
        }
    }
    
    // Calculate character-level similarity for shorter strings
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    // Early return for very different length strings
    if (longer.length === 0) return 1.0;
    if (shorter.length === 0) return 0.0;
    if (longer.length - shorter.length > longer.length * 0.5) return 0.0;
    
    // Count matching characters
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
        if (longer.includes(shorter[i])) {
            matches++;
        }
    }
    
    return matches / longer.length;
}

async function getHistoricalSuggestions(userId = null) {
    try {
        // Query parameters
        const queryParams = {
            where: {
                hasAction: true,
                intent: { not: 'unknown' }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20 // Get recent prompts with actions
        };
        
        // Add userId filter if provided
        if (userId) {
            queryParams.where.userId = userId;
        }
        
        // Get recent prompts with actions
        const recentPrompts = await prisma.prompt.findMany(queryParams);
        
        // Count occurrences of each intent
        const intentCounts = {};
        recentPrompts.forEach(prompt => {
            if (!intentCounts[prompt.intent]) {
                intentCounts[prompt.intent] = 0;
            }
            intentCounts[prompt.intent]++;
        });
        
        // Sort intents by frequency
        const sortedIntents = Object.entries(intentCounts)
            .sort((a, b) => b[1] - a[1]) // Sort by count (descending)
            .map(entry => entry[0]); // Get just the intent name
        
        // Map intents to user-friendly suggestion texts
        const suggestions = sortedIntents.map(intent => {
            switch(intent) {
                case 'fill_patient_form':
                    return 'Fill in a new patient form';
                case 'login':
                    return 'Login to the system';
                case 'navigate':
                    return 'Navigate to patient information';
                case 'login_and_navigate':
                    return 'Login and navigate to patient information';
                default:
                    return null;
            }
        }).filter(suggestion => suggestion !== null); // Remove any null values
        
        return suggestions;
    } catch (error) {
        console.error('Error querying historical prompts:', error);
        return []; // Return empty array if there's an error
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

    // Define known routes and their variations for fuzzy matching
    const knownRoutes = {
        'patient-information': ['patient information', 'patient info', 'patient details', 'patient data'],
        'patientjourney': ['patient journey', 'patientjourney', 'patient-journey', 'journey', 'patient path', 'patient progress', 'patient history', 'record'],
        'kpi': ['kpi', 'kpi page', 'kpi dashboard'],
        'monitoring': ['monitoring', 'patient monitoring'],
        
        'patient-table': ['patient table', 'patient records', 'record', 'patient record', 'medical record'],
        'Home': ['home', 'main page', 'main screen', 'overview'],
        'login': ['login', 'login screen', 'login page'],
        'tv-screen': ['tv screen', 'tv display', 'tv display settings'],
        'reports': ['reports', 'reporting', 'analytics', 'statistics', 'data'],
        'users': ['users', 'user management', 'accounts', 'profiles']
    };

    // Define intent patterns with variations
    const intentPatterns = {
        navigation: [
            /(?:navigate|go|take me|open|show|visit|browse|access|view|get) (?:to |me |into |)?(?:the |a |)?([\w\s-]+)(?:\s|$|route|page|screen|section|area|tab|view|panel)/i,
            /(?:i want to|i need to|i'd like to|can i|please) (?:go|navigate|see|view|open|access|visit|browse) (?:to |the |)?([\w\s-]+)(?:\s|$|route|page|screen|section|area|tab|view|panel)/i,
            /(?:show|display|open|load|bring up) (?:the |a |)?([\w\s-]+)(?:\s|$|route|page|screen|section|area|tab|view|panel)/i
        ],
        patientForm: [
            /(?:fill|complete|submit|add)(?: in| out)?(?: the| a)?(?: new)? patient[- ](?:form|details|information)/i,
            /(?:create|make|start)(?: a)?(?: new)? patient(?: form| entry)/i,
            /(?:new|add)(?: a)? patient/i
        ],
        login: [
            /log(?:in)?(?: me)? (?:in )?with(?: my)? email ([\w@.]+)(?: and)? password ([\w]+)/i,
            /login with email ([\w@.]+)(?: and)? password ([\w]+)/i,
            /(?:sign|log) (?:in|on|into)/i
        ],
        loginAndNavigate: [
            /log(?:in)?(?: me)? (?:in )?with(?: my)? email ([\w@.]+)(?: and)? password ([\w]+) (?:and )?(?:then )?(?:navigate|go|take me|open|show) (?:to |me )?(?:the )?([\w\s-]+)/i
        ]
    };

    // Function to find the best matching route
    function findBestMatchingRoute(routeText) {
        if (!routeText) return null;
        
        // Clean the route text
        const cleanedRouteText = routeText.trim().toLowerCase();
        
        // Direct match check
        if (knownRoutes[cleanedRouteText]) {
            return cleanedRouteText;
        }
        
        // Check for exact matches in route variations
        for (const [route, variations] of Object.entries(knownRoutes)) {
            if (variations.includes(cleanedRouteText)) {
                return route;
            }
        }
        
        // Check for partial matches using fuzzy matching
        let bestMatch = null;
        let highestSimilarity = 0;
        
        for (const [route, variations] of Object.entries(knownRoutes)) {
            // Check the main route name
            const similarity = calculateSimilarity(cleanedRouteText, route);
            if (similarity > highestSimilarity && similarity > 0.6) { // 0.6 threshold for similarity
                highestSimilarity = similarity;
                bestMatch = route;
            }
            
            // Check variations
            for (const variation of variations) {
                const varSimilarity = calculateSimilarity(cleanedRouteText, variation);
                if (varSimilarity > highestSimilarity && varSimilarity > 0.6) {
                    highestSimilarity = varSimilarity;
                    bestMatch = route;
                }
            }
        }
        
        return bestMatch;
    }
    
    // Simple similarity calculation (Levenshtein distance based)
    function calculateSimilarity(str1, str2) {
        // If one is contained within the other, high similarity
        if (str1.includes(str2) || str2.includes(str1)) {
            return 0.8;
        }
        
        // Check for word-by-word partial matches
        const words1 = str1.split(/\s+/);
        const words2 = str2.split(/\s+/);
        let matchCount = 0;
        
        for (const word1 of words1) {
            if (word1.length < 3) continue; // Skip very short words
            for (const word2 of words2) {
                if (word2.length < 3) continue;
                if (word1.includes(word2) || word2.includes(word1)) {
                    matchCount++;
                    break;
                }
            }
        }
        
        if (words1.length > 0 && words2.length > 0) {
            const wordSimilarity = matchCount / Math.max(words1.length, words2.length);
            if (wordSimilarity > 0.5) {
                return wordSimilarity;
            }
        }
        
        // Calculate character-level similarity for shorter strings
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        // Early return for very different length strings
        if (longer.length === 0) return 1.0;
        if (shorter.length === 0) return 0.0;
        if (longer.length - shorter.length > longer.length * 0.5) return 0.0;
        
        // Count matching characters
        let matches = 0;
        for (let i = 0; i < shorter.length; i++) {
            if (longer.includes(shorter[i])) {
                matches++;
            }
        }
        
        return matches / longer.length;
    }

    // Check navigation patterns first (most common)
    for (const pattern of intentPatterns.navigation) {
        const match = prompt.match(pattern);
        if (match && match[1]) {
            const routeText = match[1].trim();
            const bestRoute = findBestMatchingRoute(routeText);
            
            if (bestRoute) {
                return {
                    intent: 'navigate',
                    parameters: {
                        route: bestRoute,
                        originalRouteText: routeText
                    }
                };
            }
        }
    }

    // Check each intent pattern
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
        // Skip navigation as we already checked it
        if (intent === 'navigation') continue;
        
        for (const pattern of patterns) {
            const match = prompt.match(pattern);
            if (match) {
                // Extract parameters based on intent
                const parameters = {};
                
                if (intent === 'login' && match.length >= 3) {
                    parameters.email = match[1];
                    parameters.password = match[2];
                } else if (intent === 'loginAndNavigate' && match.length >= 4) {
                    parameters.email = match[1];
                    parameters.password = match[2];
                    
                    const routeText = match[3].trim();
                    const bestRoute = findBestMatchingRoute(routeText);
                    parameters.route = bestRoute || 'patient-information';
                    parameters.originalRouteText = routeText;
                } else if (intent === 'patientForm') {
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
    
    // Generic checks for common actions
    
    // Check for navigation intent with route extraction
    if (prompt.includes('go to') || prompt.includes('navigate') || prompt.includes('open') || 
        prompt.includes('show') || prompt.includes('view') || prompt.includes('access')) {
        
        // Try to extract the route from the prompt
        const routeWords = prompt.split(/\s+/);
        let potentialRoutes = [];
        
        // Look for words that might be routes
        for (let i = 0; i < routeWords.length; i++) {
            if (['to', 'the', 'a', 'an'].includes(routeWords[i])) {
                // Check the next word(s) as potential route
                if (i + 1 < routeWords.length) {
                    // Try combinations of following words
                    for (let j = 1; j <= 3 && i + j < routeWords.length; j++) {
                        const routeCandidate = routeWords.slice(i + 1, i + j + 1).join(' ');
                        potentialRoutes.push(routeCandidate);
                    }
                }
            }
        }
        
        // Find the best matching route from candidates
        let bestRoute = null;
        for (const routeCandidate of potentialRoutes) {
            const matchedRoute = findBestMatchingRoute(routeCandidate);
            if (matchedRoute) {
                bestRoute = matchedRoute;
                break;
            }
        }
        
        // If we found a route, return navigation intent
        if (bestRoute) {
            return {
                intent: 'navigate',
                parameters: {
                    route: bestRoute
                }
            };
        }
    }

    // Check for login intent
    if (prompt.includes('login') || prompt.includes('sign in') || prompt.includes('log in')) {
        const emailMatch = prompt.match(/([\w.]+@[\w.]+\.[\w]+)/);
        const passwordMatch = prompt.match(/password[:\s]+([\w]+)/);
        
        if (emailMatch && passwordMatch) {
            return {
                intent: 'login',
                parameters: {
                    email: emailMatch[1],
                    password: passwordMatch[1]
                }
            };
        }
        
        return {
            intent: 'login',
            parameters: {
                requireCredentials: true
            }
        };
    }

    // Check for fill patient form intent
    if ((prompt.includes('fill') || prompt.includes('create') || prompt.includes('add') || prompt.includes('new')) && 
        prompt.includes('patient')) {
        return {
            intent: 'fill_patient_form',
            parameters: {}
        };
    }

    // Default fallback
    return {
        intent: 'unknown',
        parameters: {}
    };
}

module.exports = { processPrompt };
