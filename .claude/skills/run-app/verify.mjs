// Drives the GreenThumb frontend through one representative flow using headless Edge/Chrome via
// playwright-core (no bundled browser download - reuses whatever's already installed on this
// Windows machine). Requires the full stack already running (`make up` from the repo root).
//
// Usage: node .claude/skills/run-app/verify.mjs
// Screenshots land in .dev-logs/screenshots/. Exits non-zero on any console/page error or a
// failed step. Cleans up the garden it creates on success.

import { chromium } from 'playwright-core';
import * as fs from 'node:fs';
import * as path from 'node:path';

const FRONTEND_URL = process.env.GREENTHUMB_FRONTEND_URL ?? 'http://localhost:5173';
const BACKEND_URL = process.env.GREENTHUMB_BACKEND_URL ?? 'http://localhost:8080';
const SHOT_DIR = path.resolve(import.meta.dirname, '../../../.dev-logs/screenshots');
const TEST_GARDEN_NAME = 'run-app-verify';

const BROWSER_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];

function findBrowser() {
  const found = BROWSER_CANDIDATES.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error(
      `No browser found at any of: ${BROWSER_CANDIDATES.join(', ')}. ` +
        `Install Edge/Chrome, or run "npx playwright install chromium" and adjust this script.`,
    );
  }
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

  try {
    console.log('--- plant catalog renders ---');
    await page.goto(`${FRONTEND_URL}/plants`, { waitUntil: 'networkidle' });
    await page.waitForSelector('h1:has-text("Plant catalog")');
    await page.waitForSelector('text=Tomato', { timeout: 10000 });
    await shot('01-plant-catalog');

    console.log('--- plant detail shows full care guide ---');
    await page.click('a:has-text("Tomato")');
    await page.waitForSelector('h1:has-text("Tomato")');
    await page.waitForSelector('text=Care guide');
    await page.waitForSelector('text=Harvest guide');
    await shot('02-plant-detail');

    console.log('--- create garden -> container -> planting ---');
    await page.goto(`${FRONTEND_URL}/gardens`, { waitUntil: 'networkidle' });
    await page.click('button:has-text("New garden")');
    await page.waitForSelector('#name');
    await page.fill('#name', TEST_GARDEN_NAME);
    await page.click('button[type="submit"]:has-text("Create")');
    await page.waitForSelector('text=Garden created', { timeout: 10000 });

    await page.click(`a:has-text("${TEST_GARDEN_NAME}")`);
    await page.waitForSelector('h1:has-text("' + TEST_GARDEN_NAME + '")');
    await page.click('button:has-text("New container")');
    await page.waitForSelector('#name');
    await page.fill('#name', 'Test Bed');
    await page.click('button[type="submit"]:has-text("Add")');
    await page.waitForSelector('text=Container added', { timeout: 10000 });

    await page.click('a:has-text("Test Bed")');
    await page.waitForSelector('h1:has-text("Test Bed")');
    await page.click('button:has-text("Plan a planting")');
    await page.waitForSelector('text=Choose a plant');
    await page.click('text=Choose a plant');
    await page.click('[role="option"]:has-text("Tomato")');
    await page.click('button[type="submit"]:has-text("Add")');
    await page.waitForSelector('text=Planting added', { timeout: 10000 });
    await page.waitForTimeout(300); // let the dialog-close animation finish before the shot
    await shot('03-planting-added');

    const bodyText = await page.evaluate(() => document.body.innerText);
    if (!bodyText.includes('Tomato')) throw new Error('Planted Tomato did not appear in the container view');

    console.log('\nAll steps passed.');
  } finally {
    await browser.close();
  }

  console.log('\n--- cleanup: deleting test garden via API ---');
  const gardens = await fetch(`${BACKEND_URL}/api/v1/gardens`, {
    headers: { 'X-Dev-User-Id': 'local-dev-user' },
  }).then((r) => r.json());
  const testGarden = gardens.find((g) => g.name === TEST_GARDEN_NAME);
  if (testGarden) {
    await fetch(`${BACKEND_URL}/api/v1/gardens/${testGarden.id}`, {
      method: 'DELETE',
      headers: { 'X-Dev-User-Id': 'local-dev-user' },
    });
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
