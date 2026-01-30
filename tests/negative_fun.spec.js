import { test, expect } from '@playwright/test';

test.describe('Singlish to Sinhala - 10 Negative Functional Tests', () => {
    
    test.beforeEach(async ({ page }) => {
        // SwiftTranslator වෙබ් අඩවියට පිවිසීම
        await page.goto('https://www.swifttranslator.com/', { waitUntil: 'networkidle' });
    });

    /**
     * පද්ධතියේ දෝෂ (Bugs) හඳුනාගැනීම සඳහා සකස් කළ පොදු ශ්‍රිතය
     */
    async function verifyNegativeTranslation(page, testId, inputSinglish, expectedSinhala) {
        const inputArea = page.getByPlaceholder('Input Your Singlish Text Here.');
        const outputElement = page.locator('div.w-full.h-80.p-3');

        // 1) කලින් තිබූ දත්ත මැකීම (Clear)
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const clear = btns.find(b => b.textContent && b.textContent.includes('Clear'));
            clear?.click();
        });

        // 2) Singlish Input එක ඇතුළත් කිරීම
        await inputArea.fill(inputSinglish);
        
        // Input event එක trigger කිරීම
        await page.evaluate(() => {
            const el = document.querySelector('textarea[placeholder="Input Your Singlish Text Here."]');
            if (el) {
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        // 3) Translate බටන් එක ක්ලික් කිරීම
        await page.evaluate(() => {
            const translateBtn = document.querySelector('button[aria-label="Translate"]');
            translateBtn?.click();
        });

        // 4) පරිවර්තනය වීමට තත්පර 2ක් රැඳී සිටීම
        await page.waitForTimeout(2000); 

        // 5) ප්‍රතිඵලය ලබාගෙන බලාපොරොත්තු වූ අගය සමඟ සැසඳීම
        const actualText = (await outputElement.innerText()).trim();
        const expectedText = expectedSinhala.trim();
        
        console.log(`Running ${testId}...`);
        console.log(`Input: ${inputSinglish}`);
        console.log(`Expected: ${expectedText}`);
        console.log(`Actual Output: ${actualText}`);

        // වෙබ් අඩවියේ දෝෂ ඇති නිසා මෙම පරීක්ෂණ FAIL වනු ඇත (එය නිවැරදි තත්ත්වයකි)
        expect(actualText).toBe(expectedText);
    }

    test('Neg_Fun_0001: Numbers within words', async ({ page }) => {
        await verifyNegativeTranslation(page, 'Neg_Fun_0001', 'h3ll0', 'හලෝ');
    });

    test('Neg_Fun_0002: Disaster relief news report', async ({ page }) => {
        await verifyNegativeTranslation(page, 'Neg_Fun_0002', 'mama gedhara yanawa සහ ammaa enavaa', 'මම ගෙදර යනවා සහ අම්මා එනවා');
    });

    test('Neg_Fun_0003: Use of excessive symbols within words', async ({ page }) => {
        await verifyNegativeTranslation(page, 'Neg_Fun_0003', 'ma@m#a $gedh%ara^', 'මම ගෙදර');
    });

    test('Neg_Fun_0004: Pure English sentence', async ({ page }) => {
        await verifyNegativeTranslation(page, 'Neg_Fun_0004', 'The quick brown fox jumps over the lazy dog.', 'The quick brown fox jumps over the lazy dog.');
    });

    test('Neg_Fun_0005: Numeric characters within words', async ({ page }) => {
        await verifyNegativeTranslation(page, 'Neg_Fun_0005', 'ma2ma gedhara yanava', 'මම ගෙදර යනවා');
    });

    test('Neg_Fun_0006: Informal abbreviation handling', async ({ page }) => {
        await verifyNegativeTranslation(page, 'Neg_Fun_0006', 'oyaa clz yanavadha?', 'ඔයා clz යනවද?');
    });

    test('Neg_Fun_0007: Large block of text without spaces', async ({ page }) => {
        await verifyNegativeTranslation(page, 'Neg_Fun_0007', 'mamaadhakadenkaemakannee', 'මම අද කඩෙන් කැම කන්නේ'); 
    });

    test('Neg_Fun_0008: Excessive use of special symbols', async ({ page }) => {
        await verifyNegativeTranslation(page, 'Neg_Fun_0008', '!@#$%^&*', '');
    });

    test('Neg_Fun_0009: Excessive capitalization within words', async ({ page }) => {
        await verifyNegativeTranslation(page, 'Neg_Fun_0009', 'api kaDEETA yaMUDHa?', 'අපි කඩේට යමුද?');
    });

    test('Neg_Fun_0010: Punctuation marks within words bug check', async ({ page }) => {
        await verifyNegativeTranslation(page, 'Neg_Fun_0010', 'oya.a dh_ath mae.dhd_hadha?', 'ඔයා දත් මැද්දද?');
    });
});