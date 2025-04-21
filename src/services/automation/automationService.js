const puppeteer = require('puppeteer');

// Store browser instance globally
let globalBrowser = null;
let activePage = null;

// Function to get or create browser instance
async function getBrowser() {
    if (!globalBrowser) {
        globalBrowser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });
    }
    return globalBrowser;
}

// Function to get or create active page
async function getActivePage() {
    const browser = await getBrowser();
    
    if (!activePage) {
        activePage = await browser.newPage();
    }
    
    return activePage;
}

async function handleAutomation(input) {
    try {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new Error('Invalid input format');
        }

        const { intent, parameters, hasAction, suggestions } = input;

        // If there's no action to perform but we have suggestions, return them
        if (!hasAction && suggestions && suggestions.length > 0) {
            return {
                success: true,
                result: {
                    message: 'No specific action detected in your prompt. Here are some suggestions:',
                    suggestions
                },
                intent: 'suggestions',
                hasAction: false
            };
        }

        // Get browser instance (creates if doesn't exist)
        const browser = await getBrowser();

        // Map intent to specific automation function
        const automationFunction = getAutomationFunction(intent);

        // Execute the automation with browser instance
        const result = await automationFunction(parameters);

        return {
            success: true,
            result,
            intent,
            hasAction: true
        };
    } catch (error) {
        throw new Error(`Automation error: ${error.message}`);
    }
}

async function handleSuggestionSelection(selectedSuggestion) {
    try {
        // Map the selected suggestion to an intent and parameters
        let intent = 'unknown';
        let parameters = {};
        
        // Process the suggestion text to determine the appropriate action
        const suggestion = selectedSuggestion.toLowerCase();
        
        if (suggestion.includes('fill') && suggestion.includes('patient form')) {
            intent = 'fill_patient_form';
        } else if (suggestion.includes('login')) {
            intent = 'login';
            // For login, we'll need to prompt for credentials in the UI
            parameters = { requireCredentials: true };
        } else if (suggestion.includes('navigate')) {
            intent = 'navigate';
            
            // Extract the destination if specified
            if (suggestion.includes('patient information')) {
                parameters = { route: '/patient-information' };
            } else {
                // For general navigation, we'll need to prompt for the destination in the UI
                parameters = { requireDestination: true };
            }
        }
        
        // Return the mapped intent and parameters
        return {
            intent,
            parameters,
            hasAction: true
        };
    } catch (error) {
        throw new Error(`Suggestion processing error: ${error.message}`);
    }
}

function getRandomName() {
    const firstNames = ['Mohammed', 'Abdullah', 'Ahmed', 'Ali', 'Omar', 'Sara', 'Fatima', 'Aisha', 'Noor', 'Layla'];
    const lastNames = ['Al-Saud', 'Al-Qahtani', 'Al-Ghamdi', 'Al-Harbi', 'Al-Dossari', 'Al-Shammari', 'Al-Otaibi', 'Al-Malki'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function getRandomIdNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function getRandomMobileNumber() {
    return `966${Math.floor(500000000 + Math.random() * 500000000)}`;
}

function getRandomAge() {
    return Math.floor(18 + Math.random() * 62).toString();
}

function getRandomBloodGroup() {
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return groups[Math.floor(Math.random() * groups.length)];
}

function getRandomDate() {
    const start = new Date(1960, 0, 1);
    const end = new Date(2005, 11, 31);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}

function getRandomMRN() {
    return `MRN${Math.floor(100000 + Math.random() * 900000)}`;
}

function getAutomationFunction(intent) {
    const automationMap = {
        'login': handleLogin,
        'navigate': handleNavigation,
        'login_and_navigate': handleLoginAndNavigate,
        'fill_patient_form': handlePatientForm,
        'unknown': async (parameters) => {
            return { message: 'Unknown command. Please try again.' };
        }
    };

    return automationMap[intent] || automationMap['unknown'];
}

async function handleLogin(parameters) {
    const { email, password } = parameters;
    
    try {
        const page = await getActivePage();
        
        // Navigate to login page
        await page.goto('https://qms.groute.online/');
        
        // Wait for email input and type
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', email);
        
        // Wait for password input and type
        await page.waitForSelector('input[type="password"]');
        await page.type('input[type="password"]', password);
        
        // Click login button
        await page.click('button[type="submit"]');
        
        // Wait for navigation
        await page.waitForNavigation();
        
        return {
            message: 'Login successful',
            user: { email }
        };
    } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
    }
}

async function handleNavigation(parameters) {
    const { route } = parameters;
    
    try {
        const page = await getActivePage();
        
        // Ensure route starts with a slash
        const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
        
        // Navigate to the specified route
        await page.goto(`${"https://qms.groute.online"}${normalizedRoute}`);
        
        return {
            message: `Successfully navigated to ${route}`,
            route
        };
    } catch (error) {
        throw new Error(`Navigation failed: ${error.message}`);
    }
}

async function handleLoginAndNavigate(parameters) {
    const { email, password, route } = parameters;
    
    try {
        // First login
        const loginResult = await handleLogin({ email, password });
        
        // Then navigate
        const navResult = await handleNavigation({ route });
        
        return {
            message: `${loginResult.message} and ${navResult.message.toLowerCase()}`,
            user: loginResult.user,
            route: navResult.route
        };
    } catch (error) {
        throw new Error(`Login and navigation failed: ${error.message}`);
    }
}

async function handlePatientForm(parameters) {
    try {
        const page = await getActivePage();

        // Wait for the patient form page to load with increased timeout
        await page.waitForSelector('input#patientName', { timeout: 10000 });
        
        // Ensure we're on the patient form page
        const currentUrl = page.url();
        if (!currentUrl.includes('/patient-information')) {
            await handleNavigation({ route: '/patient-information' });
            await page.waitForSelector('input#patientName', { timeout: 10000 });
        }

        // Fill in random data for each field
        await page.waitForSelector('input#patientName');
        await page.type('input#patientName', getRandomName());

        await page.waitForSelector('input#idNumber');
        await page.type('input#idNumber', getRandomIdNumber());

        // Handle age input with special care
        await page.waitForSelector('input#age', { timeout: 10000 });
        
        // Clear the field first
        await page.evaluate(() => {
            const ageInput = document.querySelector('input#age');
            if (ageInput) ageInput.value = '';
        });
        
        // Type age and ensure it's accepted
        const age = getRandomAge();
        console.log(`Entering age: ${age}`);
        await page.type('input#age', age);
        
        // Press Tab to move to next field
        await page.keyboard.press('Tab');
        
        // Wait a moment for the field to process
        await page.waitForTimeout(1000);

        // Select gender
        await page.waitForSelector('select#sex', { timeout: 10000 });
        await page.select('select#sex', Math.random() > 0.5 ? 'M' : 'F');
        await page.waitForTimeout(500); // Wait for dropdown to close

        // Fill in the mobile number - try different selector approaches
        try {
            // Try by name attribute
            await page.waitForSelector('input[name="mobileNumber"]', { timeout: 5000 });
            const mobileNumber = `+966${Math.floor(100000000 + Math.random() * 900000000)}`;
            await page.evaluate((value) => {
                const input = document.querySelector('input[name="mobileNumber"]');
                if (input) input.value = value;
            }, mobileNumber);
        } catch (err) {
            console.log('Mobile number selector not found, trying alternative approach');
            // Try by type attribute (phone inputs often have type="tel")
            await page.waitForSelector('input[type="tel"]', { timeout: 5000 });
            const mobileNumber = `+966${Math.floor(100000000 + Math.random() * 900000000)}`;
            await page.evaluate((value) => {
                const input = document.querySelector('input[type="tel"]');
                if (input) input.value = value;
            }, mobileNumber);
        }

        // Handle date picker calendar widget
        try {
            console.log('Handling birth date with calendar widget approach');
            
            // First, find and click the calendar icon or date input field to open the calendar
            try {
                // Look for the date input field or calendar icon
                await page.waitForSelector('input[placeholder*="mm/dd"], input[type="date"], input#birthDate, input[name="birthDate"]', { timeout: 5000 });
                
                // Click on the field to open the calendar
                await page.click('input[placeholder*="mm/dd"], input[type="date"], input#birthDate, input[name="birthDate"]');
                console.log('Clicked on date field to open calendar');
                await page.waitForTimeout(1000);
                
                // If there's a calendar icon, try clicking that too
                try {
                    await page.waitForSelector('svg[data-testid="CalendarIcon"], button.calendar-button, .calendar-icon, input[type="date"]::-webkit-calendar-picker-indicator', { timeout: 2000 });
                    await page.click('svg[data-testid="CalendarIcon"], button.calendar-button, .calendar-icon');
                    console.log('Clicked on calendar icon');
                    await page.waitForTimeout(1000);
                } catch (iconErr) {
                    console.log('No separate calendar icon found, continuing with date selection');
                }
                
                // Now the calendar should be open, select a date
                // First, try to find any day in the calendar that's clickable
                try {
                    // Wait for calendar to appear
                    await page.waitForSelector('td[role="gridcell"], .calendar-day, .react-datepicker__day, .MuiPickersDay-root, .day', { timeout: 3000 });
                    
                    // Select a date from a previous year to ensure it's a valid birth date
                    // Try to click on a year selector if available
                    try {
                        // Look for year selector button or dropdown
                        await page.waitForSelector('button.MuiPickersYear-yearButton, .react-datepicker__year-select, .year-selector', { timeout: 2000 });
                        await page.click('button.MuiPickersYear-yearButton, .react-datepicker__year-select, .year-selector');
                        console.log('Clicked on year selector');
                        await page.waitForTimeout(1000);
                        
                        // Select a year from 5-20 years ago
                        const pastYear = new Date().getFullYear() - Math.floor(Math.random() * 15 + 5);
                        console.log(`Attempting to select year: ${pastYear}`);
                        
                        // Try to find and click on the past year
                        await page.evaluate((year) => {
                            // Look for elements containing the year text
                            const yearElements = Array.from(document.querySelectorAll('*')).filter(el => 
                                el.textContent && el.textContent.trim() === year.toString() && 
                                (el.tagName === 'BUTTON' || el.tagName === 'OPTION' || el.tagName === 'DIV' || el.tagName === 'SPAN')
                            );
                            
                            if (yearElements.length > 0) {
                                yearElements[0].click();
                                return true;
                            }
                            return false;
                        }, pastYear);
                        
                        await page.waitForTimeout(1000);
                    } catch (yearErr) {
                        console.log('Could not select year specifically:', yearErr.message);
                    }
                    
                    // Now click on a day (try to select 15th of the month as it's usually available)
                    await page.evaluate(() => {
                        // Look for day elements with text content "15"
                        const dayElements = Array.from(document.querySelectorAll('td[role="gridcell"], .calendar-day, .react-datepicker__day, .MuiPickersDay-root, .day')).filter(el => 
                            el.textContent && el.textContent.trim() === '15'
                        );
                        
                        if (dayElements.length > 0) {
                            dayElements[0].click();
                            return true;
                        }
                        
                        // If 15 not found, click on any available day
                        const anyDay = document.querySelector('td[role="gridcell"], .calendar-day, .react-datepicker__day, .MuiPickersDay-root, .day');
                        if (anyDay) {
                            anyDay.click();
                            return true;
                        }
                        
                        return false;
                    });
                    
                    console.log('Selected a date from the calendar');
                    await page.waitForTimeout(1000);
                } catch (calendarErr) {
                    console.log('Could not interact with calendar days:', calendarErr.message);
                    
                    // Fallback: Try to type a date directly
                    const birthDate = `01/01/${new Date().getFullYear() - 20}`;
                    await page.keyboard.type(birthDate);
                    await page.keyboard.press('Tab');
                    console.log('Typed date directly as fallback');
                }
            } catch (dateFieldErr) {
                console.log('Could not find date field:', dateFieldErr.message);
                
                // Last resort: Try direct JavaScript injection
                const birthDate = `01/01/${new Date().getFullYear() - 20}`;
                await page.evaluate((date) => {
                    const dateInputs = document.querySelectorAll('input[type="date"], input[placeholder*="mm/dd"], input#birthDate, input[name="birthDate"]');
                    for (const input of dateInputs) {
                        input.value = date;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }, birthDate);
                console.log('Attempted to set date via JavaScript injection');
            }
            
            // Verify if a date was selected
            const dateValue = await page.evaluate(() => {
                const dateInput = document.querySelector('input[placeholder*="mm/dd"], input[type="date"], input#birthDate, input[name="birthDate"]');
                return dateInput ? dateInput.value : 'Not found';
            });
            
            console.log(`Final date field value: ${dateValue}`);
            
        } catch (err) {
            console.error('Failed to set birth date with calendar approach:', err.message);
        }

        // Select status from dropdown
        try {
            await page.waitForSelector('select#status', { timeout: 5000 });
            const statuses = ['Non-urgent', 'Urgent', 'Critical'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            console.log(`Selecting status: ${randomStatus}`);
            await page.select('select#status', randomStatus);
            await page.waitForTimeout(500); // Wait for dropdown to close
        } catch (err) {
            console.log('Status selector not found, trying alternative approach');
            // Try clicking on the dropdown and selecting an option
            await page.click('div:has(> select#status)');
            await page.waitForTimeout(500);
            await page.click('option[value="Non-urgent"]');
            await page.waitForTimeout(500);
        }
        
        // Select blood group
        try {
            await page.waitForSelector('select#bloodGroup', { timeout: 5000 });
            const bloodGroup = getRandomBloodGroup();
            console.log(`Selecting blood group: ${bloodGroup}`);
            await page.select('select#bloodGroup', bloodGroup);
            await page.waitForTimeout(500); // Wait for dropdown to close
        } catch (err) {
            console.log('Blood group selector not found, trying alternative approach');
            // Try clicking on the dropdown and selecting an option
            await page.click('div:has(> select#bloodGroup)');
            await page.waitForTimeout(500);
            await page.click('option[value="B+"]');
            await page.waitForTimeout(500);
        }

        // Set MRN number
        await page.type('input#mrnNumber', getRandomMRN());

        // Set chief complaint
        await page.type('textarea#cheifComplaint', 'General checkup and routine examination');

        // Wait for a moment to ensure all fields are filled
        await page.waitForTimeout(2000);

        // Click the Issue Ticket button
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const issueButton = buttons.find(button => 
                button.textContent.includes('Issue Ticket') || 
                button.textContent.includes('Print Ticket')
            );
            console.log('Found button:', issueButton ? issueButton.textContent : 'No button found');
            if (issueButton) {
                console.log('Clicking Issue Ticket button');
                issueButton.click();
            }
        });
        
        // Additional wait after clicking the button
        await page.waitForTimeout(3000);

        return {
            message: 'Successfully filled patient form and submitted'
        };
    } catch (error) {
        console.error(`Failed to fill patient form: ${error.message}`);
        throw new Error(`Failed to fill patient form: ${error.message}`);
    }
}

module.exports = { handleAutomation, handleNavigation, handlePatientForm, getActivePage, handleSuggestionSelection };
