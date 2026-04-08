import { test, expect, devices } from '@playwright/test'

test.describe('nopCommerce Mobile Tests', () => {

    test('homepage loads with mobile nav', async ({ page, isMobile }) => {
       await page.goto('/');
        await expect(page).toHaveTitle(/nopCommerce/i);

        if(isMobile) {
            // Verify menu is visible on mobile
            const menuToggle = page.locator('.menu__toggle, [class*="mobile"]').first();
            await expect(menuToggle).toBeVisible();
        }
    });


    test('homepage load with mobile nav and verify it opens menu when tapped', async ({ page, isMobile}) =>{
        await page.goto('/');
        await expect(page).toHaveTitle(/nopCommerce/i);

        if(isMobile) {
            const menuToggle = page.locator('.menu__toggle');
            await expect(menuToggle).toBeVisible({ timeout: 10000});

            // Optionally verify it opens the menu when tapped
            await menuToggle.tap();
            const menuList = page.locator('.menu__list-view').first();
            await expect(menuList).toBeVisible();
        }
    });

//    test('debug mobile nav selectors', async ({ page }) => {
//        await page.goto('/');

        // Print all class names containing "menu", "nav", "mobile", "hamburger"
//        const elements = await page.evaluate(() => {
//            return [...document.querySelectorAll('*')]
//                .map(el => el.className)
//                .filter(c => typeof c === 'string' && 
//                    /menu|nav|mobile|hamburger|toggle|responsive/i.test(c))
//                .filter((v, i, a) => a.indexOf(v) === i); // dedupe
//    });

//   console.log('Found classes:', elements);
//});
    
});