const puppeteer = require('puppeteer');
const readline = require('readline');
const { logger } = require('./logger');

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

async function main(domain) {
    let domainName = domain;
    let isGtagLoaded = 'No';
    if (!domainName) {
        // Prompt the user for the domain name.
        domainName = await question('Enter a domain name: ');
    }
    logger(`Domain name entered: ${domainName}`);

    // Create a new browser instance.
    const browser = await puppeteer.launch({ headless: true });
    logger('Browser launched', true);

    // Create a new page.
    const page = await browser.newPage();
    logger('Page created', true);

    // Navigate to the Tag Assistant website.
    await page.goto('https://tagassistant.google.com/');
    logger('Navigated to Tag Assistant website', true);

    // Wait for the page to load.
    await sleep(8000);
    logger('Page loaded', true);

    // Click on the button with the selector 'button.btn--new-domain'.
    const button = await page.waitForSelector('button.btn--new-domain');
    logger('Found button', true);

    // Click on the button.
    await button.click();
    logger('Clicked on button', true);

    await sleep(3000);

    // Find the input element with the selector 'input#domain-start-url'.
    const inputElement = await page.waitForSelector('input#domain-start-url');
    logger('Found input element', true);

    // Enter the domain name in the input element.
    await inputElement.type(domainName);
    logger('Entered domain name in input element', true);

    await sleep(3000);

    // Find the connect button with the selector '#domain-start-button'.
    const connectButton = await page.waitForSelector('#domain-start-button');
    logger('Found connect button', true);

    // Click on the button.
    await connectButton.click();
    logger('Clicked on connect button, waiting for popup to render fully', true);

    await sleep(20000);

    // Check for G- tag in the parent window.
    try {
        logger('Checking for G- tag element to be loaded', true);
        const gTagElement = await page.waitForXPath('//div[@class="container-picker__chips"]/div[contains(.,"G-")]');
        logger('G- tag loaded', true);
        isGtagLoaded = 'Yes';
    } catch (e) {
        logger('G-Tag didn\'t load');
    }

    // Take a screenshot of the page.
    const screenShotPath = `./screenshots/screenshot-${domainName.replace(/\//g, '#')}_${new Date().getTime()}.png`;
    await page.screenshot({ path: screenShotPath });
    logger(`Screenshot taken - ${screenShotPath}`);

    // Close the browser.
    await browser.close();
    logger('Browser closed', true);

    return { isGtagLoaded, screenShotPath };
}

exports.handler = main;
