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

        const { intent, parameters } = input;

        // Get browser instance (creates if doesn't exist)
        const browser = await getBrowser();

        // Map intent to specific automation function
        const automationFunction = getAutomationFunction(intent);

        // Execute the automation with browser instance
        const result = await automationFunction(parameters);

        return {
            success: true,
            result,
            intent
        };
    } catch (error) {
        throw new Error(`Automation error: ${error.message}`);
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

        // Calculate and fill in the birth date
        try {
            await page.waitForSelector('input[name="birthDate"]', { timeout: 5000 });
            const currentYear = new Date().getFullYear();
            const birthYear = currentYear - 27;
            const birthDate = `01/01/${birthYear}`;
            await page.evaluate((value) => {
                const input = document.querySelector('input[name="birthDate"]');
                if (input) input.value = value;
            }, birthDate);
        } catch (err) {
            console.log('Birth date selector not found, trying alternative approach');
            // Try by id
            await page.waitForSelector('input#birthDate', { timeout: 5000 });
            const currentYear = new Date().getFullYear();
            const birthYear = currentYear - 27;
            const birthDate = `01/01/${birthYear}`;
            await page.evaluate((value) => {
                const input = document.querySelector('input#birthDate');
                if (input) input.value = value;
            }, birthDate);
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

module.exports = { handleAutomation, handleNavigation, handlePatientForm, getActivePage };
