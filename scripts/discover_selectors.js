import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.swifttranslator.com/');
  await page.waitForTimeout(3000);
  const inputs = await page.$$eval('input, textarea, [contenteditable="true"]', els => els.map(e => ({tag: e.tagName, id: e.id, class: e.className, name: e.name, placeholder: e.placeholder, outerHTML: e.outerHTML.slice(0,200)})));
  console.log('Found inputs:', inputs.length);
  console.dir(inputs, {depth: null});
  const possible = await page.$$eval('*', els => els.filter(e => e.textContent && e.textContent.toLowerCase().includes('type here') || e.placeholder && e.placeholder.toLowerCase().includes('type')).slice(0,20).map(e=> ({tag:e.tagName, id:e.id, class:e.className, placeholder:e.placeholder, text: e.textContent.slice(0,100)})));
  console.log('Possible text areas/searches:', possible);
  await browser.close();
})();