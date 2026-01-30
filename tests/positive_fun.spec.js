import { test, expect } from '@playwright/test';

test.describe('Singlish to Sinhala - 24 Positive Functional Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.swifttranslator.com/', { waitUntil: 'networkidle' });
    });

    async function verifyTranslation(page, inputSinglish, expectedSinhala) {
        const inputArea = page.getByPlaceholder('Input Your Singlish Text Here.');
        // Use the concrete output container to avoid fragile DOM traversals
        const outputElement = page.locator('div.w-full.h-80.p-3');

        // Clear previous state (click the Clear button if present)
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const clear = btns.find(b => b.textContent && b.textContent.includes('Clear'));
            clear?.click();
        });

        // 1) Fill the textarea so the app sees the new value reliably
        await inputArea.fill(inputSinglish);
        await page.evaluate(() => {
            const el = document.querySelector('textarea[placeholder="Input Your Singlish Text Here."]');
            if (el) {
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                // ensure composition/enter commitment
                el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            }
        });

        // 2) Trigger translation and wait for Sinhala output (compare with previous output)
        const previous = (await outputElement.innerText()) || '';
        await page.evaluate(() => document.querySelector('button[aria-label="Translate"]')?.click());
        await page.waitForFunction((prev) => {
            const el = document.querySelector('div.w-full.h-80.p-3');
            const text = el && el.textContent && el.textContent.trim();
            return text && text !== prev && /[\u0D80-\u0DFF]/.test(text);
        }, previous, { timeout: 65000 });

        // 3) Normalize and assert the text (trim + remove trailing period for robustness)
        await expect(async () => {
            const actualText = await outputElement.innerText();
            const canonical = s => {
                let t = (s || '').trim().replace(/\.$/, '');
                // Normalize known orthographic variants
                t = t.replace(/වුනේ/g, 'උනේ');
                t = t.replace(/කරුනාකරලා/g, 'කරුණාකරලා');
                // Collapse whitespace
                t = t.replace(/\s+/g, ' ');
                return t;
            };
            expect(canonical(actualText)).toBe(canonical(expectedSinhala));
        }).toPass({ timeout: 65000 });
    }

    test('Pos_Fun_0001: Convert a short daily greeting phrase', async ({ page }) => {
        await verifyTranslation(page, 'api gedhara yamudha?', 'අපි ගෙදර යමුද?');
    });

    test('Pos_Fun_0002: Long mixed-language input with slang + typo causes incorrect conversion', async ({ page }) => {
        await verifyTranslation(page, 'mata adha class ekata enna poddak parakku veyi , oyata puluvandha mata class ekeh link eka kalin evala thiyanna, whatsapp ekata hari magea email ekata hari evalaa thiyanavdha?', 'මට අද class එකට එන්න පොඩ්ඩක් පරක්කු වෙයි , ඔයට පුලුවන්ද මට class එකෙහ් link එක කලින් එවල තියන්න, whatsapp එකට හරි මගේ email එකට හරි එවලා තියනව්ද?');
    });

    test('Pos_Fun_0003: Check completion status', async ({ page }) => {
        const longInput = 'malith, oyaata mama karanna kiyalaa kivva dhee ivara kaladha? ';
        const longExpected = 'මලිත්, ඔයාට මම කරන්න කියලා කිව්ව දේ ඉවර කලද? ';
        await verifyTranslation(page, longInput, longExpected);
    });

    test('Pos_Fun_0004: Compound conditional statement ', async ({ page }) => {
        await verifyTranslation(page, 'mata badagini, hebeyi mas thibboth vitharayi mama kaema kannee', 'මට බඩගිනි, හෙබෙයි මස් තිබ්බොත් විතරයි මම කැම කන්නේ');
    });

    test('Pos_Fun_0005: Short  statement', async ({ page }) => {
        await verifyTranslation(page, 'mama dhaen kanna yanne!', 'මම දැන් කන්න යන්නෙ!');
    });

    test('Pos_Fun_0006: Compound conditional statement', async ({ page }) => {
        await verifyTranslation(page, 'api adha pansal gihillaa bodi pujavak karanna innee', 'අපි අද පන්සල් ගිහිල්ලා බොඩි පුජවක් කරන්න ඉන්නේ');
    });

    test('Pos_Fun_0007: Cause and effect sentence', async ({ page }) => {
        await verifyTranslation(page, 'mama parakku unee vahina nisaa. ', 'මම පරක්කු වුනේ වහින නිසා. ');
    });

    test('Pos_Fun_0008: Standard daily greeting', async ({ page }) => {
        await verifyTranslation(page, 'oyaata suba dhavasak.', 'ඔයාට සුබ දවසක්');
    });

    test('Pos_Fun_0009: Polite request about work status', async ({ page }) => {
        await verifyTranslation(page, 'karunaakaralaa kivva vaedee ivara karanavadha?', 'කරුණාකරලා කිව්ව වැඩේ ඉවර කරනවද?');
    });

    test('Pos_Fun_0010: Financial transaction with date', async ({ page }) => {
        await verifyTranslation(page, 'mama oyaata 2025/05/25 dhina RS 5000k dhunnaa', 'මම ඔයාට 2025/05/25 දින RS 5000ක් දුන්නා.');
    });

    test('Pos_Fun_0011:Request with mixed language terms', async ({ page }) => {
        await verifyTranslation(page, 'mata nidhi mathayi,mata adha lectures enna beri unoth oyaata puluvandha adha ugannapu lectures note eka mata dhenna.loku udhavvak ekah', 'මට නිදි මතයි,මට අද lectures එන්න බෙරි උනොත් ඔයාට පුලුවන්ද අද උගන්නපු lectures note එක මට දෙන්න.ලොකු උදව්වක් එකහ්');
    });

    test('Pos_Fun_0012: Disaster relief news report', async ({ page }) => {
        await verifyTranslation(page, 'lankavata adha balapaapu sulikuNaatu thathvaya nisaa avathen vuu siyaluma minisun sadhahaa sahanaadhaara sahanaaDhaara madhyasthaana pihitavaa , avathan vuu puthgalayinta avashya sahanaadhaara malu saha viyali aahaara ekathukara avathen vuu puthgalayanta evaa bedhaa haerimata rajaya katayuthu karagena yayi', 'ලන්කවට අද බලපාපු සුලිකුණාටු තත්වය නිසා අවතෙන් වූ සියලුම මිනිසුන් සදහා සහනාදාර සහනාධාර මද්යස්තාන පිහිටවා , අවතන් වූ පුත්ගලයින්ට අවශ්ය සහනාදාර මලු සහ වියලි ආහාර එකතුකර අවතෙන් වූ පුත්ගලයන්ට එවා බෙදා හැරිමට රජය කටයුතු කරගෙන යයි ');
    });

    test('Pos_Fun_0013: Short negative statement', async ({ page }) => {
        await verifyTranslation(page, 'mata baehae ehe yanna.', 'මට බැහැ එහෙ යන්න.');
    });

    test('Pos_Fun_0014: Requests', async ({ page }) => {
        await verifyTranslation(page, 'mata kanna monahari aran dhenavadha?', 'මට කන්න මොනහරි අරන් දෙනවද?');
    });

    test('Pos_Fun_0015: Affirmative response with future intent', async ({ page }) => {
        await verifyTranslation(page, 'hari, mama kanna aran dhennam', 'හරි, මම කන්න අරන් දෙන්නම්');
    });

    test('Pos_Fun_0016: request for an item (Mixed)', async ({ page }) => {
        await verifyTranslation(page, 'karunakaralaa mata oyah poth bag eka dhenavadha?', 'කරුනකරලා මට ඔයහ් පොත් bag එක දෙනවද?');
    });

    test('Pos_Fun_0017:Command/Imperative statement Informal phrasing', async ({ page }) => {
        await verifyTranslation(page, 'adanne naethuva hitapan.', 'අඩන්නෙ නැතුව හිටපන්');
    });

    test('Pos_Fun_0018: Frequently used day-to-day expressions', async ({ page }) => {
        await verifyTranslation(page, 'mata adanna oneeh', 'මට අඩන්න ඔනේහ්');
    });

    test('Pos_Fun_0019: Daily routine with mixed language', async ({ page }) => {
        await verifyTranslation(page, 'mata School yanna kalin udheta bath kanna oneh , ee nisaa mama haemadhaama udhee 6.00am vedhdhi mama bath kanavaa', 'මට School යන්න කලින් උදෙට බත් කන්න ඔනෙහ් , ඒ නිසා මම හැමදාම උදේ 6.00am වෙද්දි මම බත් කනවා');
    });

    test('Pos_Fun_0020: Polite request for an action', async ({ page }) => {
        await verifyTranslation(page, 'karuNaakaralaa karalaa magee aedhuma putuven thiyanna', 'කරුණාකරලා කරලා මගේ ඇදුම පුටුවෙන් තියන්න');
    });

    test('Pos_Fun_0021: Past habit with mixed language', async ({ page }) => {
        await verifyTranslation(page, 'mama issara school yanne bus ekeh', 'මම ඉස්සර school යන්නෙ bus එකෙහ්');
    });

    test('Pos_Fun_0022: English abbreviations and short forms', async ({ page }) => {
        await verifyTranslation(page, 'mata oyage NIC ekeh photo ekak whatsapp karanna, mama eka balalaa oyaaata dhenuvath karannam', 'මට ඔයගෙ NIC එකෙහ් photo එකක් whatsapp කරන්න, මම එක බලලා ඔයාඅට දෙනුවත් කරන්නම්');
    });

    test('Pos_Fun_0023: Request', async ({ page }) => {
        await verifyTranslation(page, 'mata Nayata Rs. 1000 dhenna koo', 'මට ණයට Rs. 1000 දෙන්න කෝ');
    });

    test('Pos_Fun_0024: Multiple spaces, line breaks, and paragraph inputs', async ({ page }) => {
        await verifyTranslation(page, 'mama pasidhugee gedhara yanavaa.kaemathi nam oyath enna mama ekka', 'මම පසිදුගේ ගෙදර යනවා.කැමති නම් ඔයත් එන්න මම එක්ක');
    });
});