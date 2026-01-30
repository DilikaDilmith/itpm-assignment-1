import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('https://www.swifttranslator.com/');
  await page.waitForTimeout(2000);
  // Fill textarea by placeholder
  await page.fill('textarea[placeholder="Input Your Singlish Text Here."]', 'api gedhara yamudha?');
  // Scroll the translate button into view and click
  await page.evaluate(() => { const btn = document.querySelector('button[aria-label="Translate"]'); if (btn) btn.scrollIntoView(); });
  await page.waitForTimeout(500);
  // Click via DOM API to bypass visibility constraints
  await page.evaluate(() => document.querySelector('button[aria-label="Translate"]')?.click());
  // Wait up to 5s for translation result
  await page.waitForTimeout(2000);
  // Find elements containing the expected translated text
  const found = await page.$$eval('*', els => els.filter(e => (e.textContent || '').includes('අපි')).map(e=>({tag:e.tagName, class: e.className, text: (e.textContent||'').trim().slice(0,300)})).slice(0,20));
  console.log('Elements containing "අපි":', found.length);
  console.dir(found, {depth:null});
  await browser.close();
})();