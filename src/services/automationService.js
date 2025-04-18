const puppeteer = require('puppeteer');

const BASE_URL = 'https://qms.groute.online';

let browserInstance = null;
let isInitialized = false;
let currentPage = null;

async function getBrowser() {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({ 
            headless: false,
            defaultViewport: {
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1
            },
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--start-maximized',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });
    }
    return browserInstance;
}

async function setupPage(page) {
    // Set viewport to a more standard size
    await page.setViewport({
        width: 1366,
        height: 768,
        deviceScaleFactor: 1
    });
    
    // Set zoom level to 100%
    await page.evaluate(() => {
        document.body.style.zoom = '100%';
    });
    
    // Enable proper viewport emulation
    await page.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: 'light' }
    ]);
}

async function login(page, credentials) {
    try {
        await page.goto(`${BASE_URL}/`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        
        // Wait for and fill in the login form
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', credentials.email, { delay: 50 });
        await page.type('input[type="password"]', credentials.password, { delay: 50 });
        
        // Click the login button and wait for navigation
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);
        
        return { success: true, message: 'Login successful' };
    } catch (error) {
        return { success: false, message: `Login failed: ${error.message}` };
    }
}

async function navigate(page, path) {
    try {
        // Handle specific navigation patterns based on the QMS interface
        const navigationMap = {
            'triage': 'Triage Waiting List',
            'department': 'Department Waiting List',
            'masterdata': 'MasterData',
            'tvscreen': '/TV Screen',
            'patients': 'Registered Patients',
            'kpi': 'KPI',
            'patient-journey': 'Patient Journey',
            'patient-table': 'patient-table',
            'patient-information': '/patient-information'  // Added patient-information route
        };

        // Check if it's a direct route navigation or mapped route
        const isDirectRoute = path.startsWith('/');
        const isMappedDirectRoute = navigationMap[path.toLowerCase()]?.startsWith('/');
        
        if (isDirectRoute || isMappedDirectRoute) {
            const targetUrl = isDirectRoute ? 
                `${BASE_URL}${path}` : 
                `${BASE_URL}${navigationMap[path.toLowerCase()]}`;
                
            await page.goto(targetUrl, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            
            // Wait for the page content to be loaded
            await page.waitForSelector('.container', { timeout: 5000 })
                .catch(() => console.log('Container not found, but continuing...'));
                
        } else {
            // Wait for the menu to be available
            await page.waitForSelector('.container', { visible: true });

            // Find the matching navigation item
            const targetText = navigationMap[path.toLowerCase()] || path;
            
            // Try multiple methods to find and click the navigation element
            const clicked = await page.evaluate((text) => {
                const elements = Array.from(document.querySelectorAll('a, button, div[role="button"]'));
                const element = elements.find(el => el.textContent.includes(text));
                if (element) {
                    element.click();
                    return true;
                }
                return false;
            }, targetText);

            if (!clicked) {
                throw new Error(`Could not find navigation element for ${path}`);
            }

            // Wait for navigation and content load
            await page.waitForTimeout(1000);
        }
        
        return { success: true, message: `Navigated to ${path}` };
    } catch (error) {
        return { success: false, message: `Navigation failed: ${error.message}` };
    }
}

function generateRandomName() {
    const names = ['John Smith', 'Sarah Johnson', 'Mohammed Ali', 'Maria Garcia', 'Ahmed Hassan'];
    return names[Math.floor(Math.random() * names.length)];
}

function generateRandomMobile() {
    return Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

function generateRandomAge() {
    return Math.floor(Math.random() * (80 - 18) + 18).toString();
}

function generateRandomMRN() {
    return 'MRN' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
}

async function fillForm(page, formData) {
    try {
        // Wait for the patient name input to be visible (since there is no <form>)
        await page.waitForSelector('input[id="patientName"]', { timeout: 5000 });

        if (!formData || Object.keys(formData).length === 0) {
            // Fill patient name
            await page.type('input[id="patientName"]', generateRandomName());

            // Select nationality (Saudi Arabia is default)
            // Click to open dropdown
            await page.click('.MuiAutocomplete-root input');
            await page.waitForTimeout(500);
            await page.keyboard.type('Saudi Arabia');
            await page.keyboard.press('Enter');

            // Fill ID number
            await page.type('input[id="idNumber"]', Math.random().toString().slice(2, 12));

            // Fill mobile number (after +966)
            await page.waitForSelector('.react-tel-input input');
            await page.type('.react-tel-input input', generateRandomMobile());

            // Select gender
            await page.select('select[id="sex"]', ['M', 'F'][Math.floor(Math.random() * 2)]);

            // Fill age
            await page.type('input[id="age"]', generateRandomAge());

            // Select status (Non-urgent is default)
            const statuses = ['Non-urgent', 'Urgent', 'Critical'];
            await page.select('select[id="status"]', statuses[Math.floor(Math.random() * 3)]);

            // Select blood group
            const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
            await page.select('select[id="bloodGroup"]', bloodGroups[Math.floor(Math.random() * 8)]);

            // Fill birth date
            const today = new Date();
            const randomDate = new Date(today.getFullYear() - Math.floor(Math.random() * 80), 
                                     Math.floor(Math.random() * 12),
                                     Math.floor(Math.random() * 28) + 1);
            await page.type('input[id="birthDate"]', 
                           randomDate.toISOString().split('T')[0]);

            // Fill MRN number
            await page.type('input[id="mrnNumber"]', generateRandomMRN());

            // Fill chief complaint
            const complaints = ['Headache', 'Fever', 'Back pain', 'Stomach ache', 'Chest pain'];
            await page.type('textarea[id="cheifComplaint"]', 
                           complaints[Math.floor(Math.random() * complaints.length)]);

            // Click the Issue Ticket button
            const [issueBtn] = await page.$x("//button[contains(., 'Issue Ticket')]");
            if (issueBtn) {
                await issueBtn.click();
            } else {
                throw new Error('Issue Ticket button not found');
            }

            // Handle the popup if it appears
            const popupVisible = await page.$('.bg-black.bg-opacity-50');
            if (popupVisible) {
                // Wait for the print button to be ready
                await page.waitForTimeout(1000);
                // Click print button
                const [printBtn] = await page.$x("//button[contains(., 'Print')]");
                if (printBtn) {
                    await printBtn.click();
                }
            }
        } else {
            // Fill each field by id if present in formData
            if (formData.PatientName) {
                await page.type('input[id="patientName"]', formData.PatientName);
            }
            if (formData.Nationality) {
                await page.click('.MuiAutocomplete-root input');
                await page.waitForTimeout(500);
                await page.keyboard.type(formData.Nationality);
                await page.keyboard.press('Enter');
            }
            if (formData.IDNumber) {
                await page.type('input[id="idNumber"]', formData.IDNumber);
            }
            if (formData.MobileNumber) {
                await page.waitForSelector('.react-tel-input input');
                await page.type('.react-tel-input input', formData.MobileNumber);
            }
            if (formData.Sex) {
                await page.select('select[id="sex"]', formData.Sex);
            }
            if (formData.Age) {
                await page.type('input[id="age"]', formData.Age);
            }
            if (formData.Status) {
                await page.select('select[id="status"]', formData.Status);
            }
            if (formData.bloodGroup) {
                await page.select('select[id="bloodGroup"]', formData.bloodGroup);
            }
            if (formData.birthDate) {
                await page.type('input[id="birthDate"]', formData.birthDate);
            }
            if (formData.mrnNumber) {
                await page.type('input[id="mrnNumber"]', formData.mrnNumber);
            }
            if (formData.cheifComplaint) {
                await page.type('textarea[id="cheifComplaint"]', formData.cheifComplaint);
            }

            // Click the Issue Ticket button
            const [issueBtn] = await page.$x("//button[contains(., 'Issue Ticket')]");
            if (issueBtn) {
                await issueBtn.click();
            } else {
                throw new Error('Issue Ticket button not found');
            }
            // Wait for the popup or response
            await page.waitForSelector('.bg-black.bg-opacity-50', { visible: true }).catch(() => {});
        }
        
        return { success: true, message: 'Form submitted successfully' };
    } catch (error) {
        return { success: false, message: `Form submission failed: ${error.message}` };
    }
}

async function handleAutomation(task) {
    try {
        const browser = await getBrowser();
        
        // Reuse existing page or create new one if doesn't exist
        if (!currentPage) {
            currentPage = await browser.newPage();
            await currentPage.setViewport({
                width: 1530,
                height: 755,
                deviceScaleFactor: 1
            });
        }
        
        let result;
        
        switch (task.type) {
            case 'login':
                result = await login(currentPage, task.credentials);
                if (result.success && task.nextRoute) {
                    const navResult = await navigate(currentPage, task.nextRoute);
                    if (!navResult.success) {
                        result.message += ` but ${navResult.message}`;
                    }
                }
                break;
            case 'navigate':
                result = await navigate(currentPage, task.url);
                break;
            case 'fillForm':
                result = await fillForm(currentPage, task.formData);
                break;
            default:
                result = { success: false, message: 'Unknown task type' };
        }
        
        // Don't close the page after each task
        return result;
    } catch (error) {
        return { success: false, message: `Error: ${error.message}` };
    }
}

// Update cleanup function to also reset currentPage
async function cleanup() {
    if (currentPage) {
        await currentPage.close();
        currentPage = null;
    }
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}

module.exports = {
    handleAutomation,
    login,
    navigate,
    fillForm,
    cleanup
}; 