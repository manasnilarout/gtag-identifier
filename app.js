const puppeteer = require('puppeteer');
const readline = require('readline');

const question = (q) => new Promise((res, rej) => {
    // Create a new readline interface.
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question(q, (a) => {
        return res(a);
    });
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    // Prompt the user for the domain name.
    const domainName = await question('Enter a domain name: ');
    console.log(`Domain name entered: ${domainName}`);

    // Create a new browser instance.
    const browser = await puppeteer.launch({ headless: true });
    console.log('Browser launched');

    // Create a new page.
    const page = await browser.newPage();
    console.log('Page created');

    // Navigate to the Tag Assistant website.
    await page.goto('https://tagassistant.google.com/');
    console.log('Navigated to Tag Assistant website');

    // Wait for the page to load.
    await sleep(8000);
    console.log('Page loaded');

    // Click on the button with the selector 'button.btn--new-domain'.
    const button = await page.waitForSelector('button.btn--new-domain');
    console.log('Found button');

    // Click on the button.
    await button.click();
    console.log('Clicked on button');

    await sleep(3000);

    // Find the input element with the selector 'input#domain-start-url'.
    const inputElement = await page.waitForSelector('input#domain-start-url');
    console.log('Found input element');

    // Enter the domain name in the input element.
    await inputElement.type(domainName);
    console.log('Entered domain name in input element');

    await sleep(3000);

    // Find the connect button with the selector '#domain-start-button'.
    const connectButton = await page.waitForSelector('#domain-start-button');
    console.log('Found connect button');

     // Click on the button.
     await connectButton.click();
     console.log('Clicked on connect button, waiting for popup to render fully');

     await sleep(20000);

    // Check for G- tag in the parent window.
    try {
        console.log('Checking for G- tag element to be loaded');
        const gTagElement = await page.waitForXPath('//div[@class="container-picker__chips"]/div[contains(.,"G-")]');
        console.log('G- tag loaded', gTagElement);
    } catch (e) {
        console.log('G-Tag didn\'t load');
    }

    // Take a screenshot of the page.
    await page.screenshot({ path: 'screenshot.png' });
    console.log('Screenshot taken');

    // Close the browser.
    await browser.close();
    console.log('Browser closed');

    // Exit gracefully
    process.exit(0);
}

main();
