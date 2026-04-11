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

            //  Tap to open the menu
            await menuToggle.tap();

            // Check the top-level menu container is visible
            const menu = page.locator('.menu-container');
            await expect(menu).toBeVisible();

            // Check at least one nav link is visible inside it
            const firstMenuItem = page.locator('.menu__item').first();
            await expect(firstMenuItem).toBeVisible();
        }
    });


    test('Search works via tap', async ({ page }) => {
        await page.goto('/');
        await page.tap('.search-box-button');
        await page.fill('#small-searchterms', 'laptop');
        await page.tap('.search-box-button');
        await expect(page).toHaveURL(/search/i);
    });


    test('Add item to cart on Mobile', async ({ page }) => {
        // Go directly to a simple product page instead of the listing
        await page.goto('/asus-laptop');
        await page.waitForLoadState('domcontentloaded');

        // Add to cart from product detail page
        const addToCartBtn = page.locator('#add-to-cart-button-1');
        await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
        await addToCartBtn.tap();

        // Wait for the cart badge to update after the AJAX call
        const cartBadge = page.locator('.cart-qty');
        await expect(cartBadge).toContainText('1', { timeout: 15000 });
    });


    test('Mobile screenshot', async ({ page }) => {
        await page.goto('/');
        await page.screenshot({ path: 'screenshots/home-mobile.png', fullPage: true});
    });



//    test('debug product buttons on notebooks page', async ({ page }) => {
//        await page.goto('/notebooks');
//        await page.waitForLoadState('domcontentloaded');
//        await page.evaluate(() => window.scrollBy(0, 500));
//        await page.waitForTimeout(1000);

        // Log every button/input on the page regardless of text
//       const interactive = await page.evaluate(() => {
//           return [...document.querySelectorAll('button, input[type="button"], input[type="submit"]')]
//            .map(el => ({
//                tag: el.tagName,
//                class: el.className,
//                text: el.textContent?.trim(),
//                value: el.getAttribute('value'),
//                visible: el.getBoundingClientRect().height > 0,
//            }));
//        });

//        console.log('ALL buttons:', JSON.stringify(interactive, null, 2));

        // Also take a screenshot to see what the page looks like
//        await page.screenshot({ path: 'notebooks-mobile.png', fullPage: true });
//    });



//    test('debug correct URL', async ({ page }) => {
//        await page.goto('/');
//        await page.waitForLoadState('domcontentloaded');

        // Find all navigation links to locate the correct laptops URL
//        const links = await page.evaluate(() => {
//            return [...document.querySelectorAll('a')]
//            .map(el => ({
//                text: el.textContent?.trim(),
//                href: el.getAttribute('href'),
//            }))
//            .filter(el => /laptop|computer|notebook/i.test(`${el.text} ${el.href}`));
//        });

//        console.log('Laptop links found:', JSON.stringify(links, null, 2));
//    });


//    test('debug product page', async ({ page }) => {
//        await page.goto('/laptops');
//        await page.waitForLoadState('networkidle');
//        await page.evaluate(() => window.scrollBy(0, 500));
//        await page.waitForTimeout(1000);

        // Log ALL buttons and inputs on the page
//        const interactive = await page.evaluate(() => {
//            return [...document.querySelectorAll('button, input[type="button"], a, input[type="submit"]')]
//            .map(el => ({
//                tag: el.tagName,
//                type: el.getAttribute('type'),
//                class: el.className,
//                text: el.textContent?.trim().slice(0, 50),
//                value: el.getAttribute('value'),
//                visible: el.getBoundingClientRect().height > 0,
//            }))
//            .filter(el => /cart|add|buy|shop|laptop/i.test(
//                `${el.text} ${el.class} ${el.value}`
//            ));
 //       });

//        console.log('Interactive elements:', JSON.stringify(interactive, null, 2));
//    });


//   test('debug product selectors', async ({ page }) => {
//        await page.goto('/laptops');

//        const elements = await page.evaluate(() => {
//            return [...document.querySelectorAll('*')]
//            .map(el => el.className)
//            .filter(c => typeof c === 'string' &&
//                /product|cart|add|button|item/i.test(c))
//            .filter((v, i, a) => a.indexOf(v) === i); // dedupe
//        });

//        console.log('Found classes:', elements);
//    });


//   test('debug CATEGORIES menu state after tap', async ({ page, isMobile }) => {
//       await page.goto('/');

//        const menuToggle = page.locator('.menu__toggle');
//        await menuToggle.tap();

        // Log visibility state of all menu-related elements
//        const states = await page.evaluate(() => {
//            return [...document.querySelectorAll('.menu-container, .menu__toggle, .menu, .menu__list-view')]
//                .map(el => ({
//                    class: el.className,
//                    visible: el.getBoundingClientRect().height > 0,
//                    display: getComputedStyle(el).display,
//                    visibility: getComputedStyle(el).visibility,
//                    height: el.getBoundingClientRect().height,
//                }));
//        });

//        console.log('Menu state after tap:', JSON.stringify(states, null, 2));
//    });

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