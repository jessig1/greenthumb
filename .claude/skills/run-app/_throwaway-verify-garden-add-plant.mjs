// Throwaway verification script (not part of the run-app skill's verify.mjs) for the new
// "add plant directly to a garden, no container required" feature on GardenDetailPage.
import { chromium } from 'playwright-core';
import * as fs from 'node:fs';
import * as path from 'node:path';

const FRONTEND_URL = process.env.GREENTHUMB_FRONTEND_URL ?? 'http://localhost:5173';
const BACKEND_URL = process.env.GREENTHUMB_BACKEND_URL ?? 'http://localhost:8080';
const SHOT_DIR = path.resolve('C:\\Users\\essig\\Desktop\\greenthumb\\.dev-logs\\screenshots');
const TEST_GARDEN_NAME = 'garden-add-plant-verify';
const TEST_EMAIL = `garden-add-plant-verify-${Date.now()}@example.com`;
const TEST_PASSWORD = 'garden-add-plant-verify-password';

const BROWSER_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];

function findBrowser() {
  const found = BROWSER_CANDIDATES.find((p) => fs.existsSync(p));
  if (!found) throw new Error('No browser found');
  return found;
}

async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const consoleErrors = [];
  const pageErrors = [];

  const browser = await chromium.launch({ executablePath: findBrowser(), headless: true });
  const page = await (await browser.newContext()).newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  const shot = async (name) => {
    await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: true });
    console.log('  screenshot:', name);
  };

  let authToken;
  try {
    console.log('--- register a fresh user ---');
    await page.goto(`${FRONTEND_URL}/register`, { waitUntil: 'networkidle' });
    await page.fill('#displayName', 'Garden Add Plant Verify');
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('button[type="submit"]:has-text("Create account")');
    await page.waitForSelector('h1:has-text("Your gardens")', { timeout: 10000 });
    authToken = await page.evaluate(() => localStorage.getItem('greenthumb.authToken'));
    if (!authToken) throw new Error('No auth token found in localStorage after registration');

    console.log('--- create a garden with no container/plant via the wizard ---');
    await page.goto(`${FRONTEND_URL}/gardens`, { waitUntil: 'networkidle' });
    await page.click('button:has-text("New garden")');
    await page.waitForSelector('#name');
    await page.fill('#name', TEST_GARDEN_NAME);
    await page.click('button:has-text("Next")');

    await page.waitForSelector('#containerName', { timeout: 10000 });
    await page.click('button:has-text("Next")'); // skip adding a container - wizard skips the Plants step too since there's no container to assign one to

    await page.waitForSelector('button:has-text("Create garden")', { timeout: 10000 });
    await page.click('button:has-text("Create garden")');
    await page.waitForSelector('text=Garden created', { timeout: 10000 });
    await page.waitForSelector(`h1:has-text("${TEST_GARDEN_NAME}")`, { timeout: 10000 });
    await shot('g01-garden-created-empty');

    console.log('--- add a plant directly to the garden, no container ---');
    // "Add plant" also appears as a global header nav button - the page-scoped one (next to the
    // "Plant inventory" heading) comes later in DOM order.
    await page.locator('button:has-text("Add plant")').last().click();
    await page.waitForSelector('text=Add plants', { timeout: 10000 });
    // Garden field should be hidden/locked (no "Garden (optional)" label) since opened from the garden page.
    const gardenLabelVisible = await page.locator('text=Garden (optional)').count();
    if (gardenLabelVisible !== 0) throw new Error('Garden picker should be hidden when locked to this garden');
    await page.click('text=Choose a plant');
    await page.click('[role="option"]:has-text("Tomato")');
    await shot('g02-add-plant-dialog-filled');
    // The dialog title and footer submit button both say "Add plants" - the footer one is a
    // <button>, the title an <h2>, so a button-role locator disambiguates.
    await page.locator('div[role="dialog"]').getByRole('button', { name: 'Add plants' }).click();
    await page.waitForSelector('text=Plant added', { timeout: 10000 });
    await page.waitForSelector('h2:has-text("Plant inventory")', { timeout: 10000 });
    await page.click('button:has-text("Tomato")'); // expand the accordion row to reveal its location tags
    await page.waitForTimeout(200);
    await shot('g03-after-add-no-container');

    const bodyText1 = await page.evaluate(() => document.body.innerText);
    if (!bodyText1.includes('Tomato')) throw new Error('Tomato did not appear in garden inventory');
    if (!bodyText1.includes('Unassigned')) throw new Error('Containerless planting should be tagged "Unassigned"');
    console.log('  OK: containerless planting shows up tagged "Unassigned"');

    console.log('--- verify container-scoped add still works ---');
    await page.click('button:has-text("New container")');
    await page.waitForSelector('div[role="dialog"] input#name', { timeout: 10000 });
    await page.locator('div[role="dialog"] input#name').fill('Test Bed');
    await page.locator('div[role="dialog"]').getByRole('button', { name: 'Add', exact: true }).click();
    await page.waitForSelector('text=Test Bed', { timeout: 10000 });
    await shot('g04-container-created');

    await page.click('a:has-text("Test Bed")');
    await page.waitForSelector('h1:has-text("Test Bed")', { timeout: 10000 });
    await page.click('button:has-text("Add Plants")');
    await page.waitForSelector('text=Add Plants', { timeout: 10000 });
    await page.click('text=Choose a plant');
    await page.click('[role="option"]:has-text("Basil")');
    await page.locator('div[role="dialog"]').getByRole('button', { name: 'Add Plants' }).click();
    await page.waitForSelector('text=Plant added', { timeout: 10000 });
    await shot('g05-container-scoped-add');

    const bodyText2 = await page.evaluate(() => document.body.innerText);
    if (!bodyText2.includes('Basil')) throw new Error('Basil did not appear in container view');
    console.log('  OK: container-scoped add still works');

    console.log('\nAll steps passed.');
  } finally {
    await browser.close();
  }

  console.log('\n--- cleanup: deleting test garden via API ---');
  const authHeaders = { Authorization: `Bearer ${authToken}` };
  const gardens = await fetch(`${BACKEND_URL}/api/v1/gardens`, { headers: authHeaders }).then((r) => r.json());
  const testGarden = gardens.find((g) => g.name === TEST_GARDEN_NAME);
  if (testGarden) {
    await fetch(`${BACKEND_URL}/api/v1/gardens/${testGarden.id}`, { method: 'DELETE', headers: authHeaders });
    console.log('  deleted', testGarden.id);
  }

  console.log('\n=== console errors:', consoleErrors.length, '===');
  consoleErrors.forEach((e) => console.log(' -', e));
  console.log('=== page errors:', pageErrors.length, '===');
  pageErrors.forEach((e) => console.log(' -', e));

  if (consoleErrors.length || pageErrors.length) process.exit(1);
}

main().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
