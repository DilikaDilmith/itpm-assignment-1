import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.swifttranslator.com/');
  await page.waitForTimeout(3000);
  const all = await page.$$eval('*', els => els.filter(e=> e.children.length===0 && e.textContent && e.textContent.trim().length>0).slice(0,200).map(e => ({tag: e.tagName, class: e.className, text: e.textContent.trim().slice(0,200)})));
  console.log('Found text nodes sample:');
  console.dir(all.slice(0,120), {depth: null});
  await browser.close();
})();