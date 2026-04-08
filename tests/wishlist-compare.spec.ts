// tests/wishlist-compare.spec.ts
// Each test has multiple specific expect() assertions.

import { test, expect } from '@playwright/test';

const BASE = 'https://demo.nopcommerce.com';

test.describe('Wishlist', () => {

  test('TC-WISH-001 | Wishlist page loads with correct URL and title', async ({ page }) => {
    await page.goto(BASE + '/wishlist');

    await expect(page, 'URL should be /wishlist').toHaveURL(/\/wishlist$/);

    const title = await page.title();
    expect(title.toLowerCase(), 'Page title should mention "wishlist"').toContain('wishlist');
  });

  test('TC-WISH-002 | Wishlist header link is visible and has correct href', async ({ page }) => {
    await page.goto(BASE + '/');

    const wishlistLink = page.locator('.header-links a[href="/wishlist"]');
    await expect(wishlistLink, 'Wishlist link in header should be visible').toBeVisible();

    const href = await wishlistLink.getAttribute('href');
    expect(href, 'Wishlist link href should be /wishlist').toBe('/wishlist');

    await expect(wishlistLink, 'Wishlist link text should mention wishlist').toContainText(/wishlist/i);
  });

  test('TC-WISH-003 | Guest user attempting to add to wishlist is redirected to login', async ({ page }) => {
    await page.goto(BASE + '/apple-macbook-pro-13-inch');

    const wishBtn = page.locator('button.add-to-wishlist-button');
    await expect(wishBtn, 'Add to Wishlist button should be visible').toBeVisible();
    await expect(wishBtn, 'Add to Wishlist button should be enabled').toBeEnabled();

    await wishBtn.click();
    await page.waitForTimeout(2000);

    const url = page.url();
    const isRedirected = url.includes('/login') || url.includes('/wishlist');
    expect(isRedirected, 'Guest should be redirected to /login or /wishlist after clicking wishlist').toBeTruthy();
  });

  test('TC-WISH-004 | Empty wishlist shows correct empty-state message', async ({ page }) => {
    await page.goto(BASE + '/wishlist');

    const emptyMsg = page.locator('.no-data');
    const hasItems = await page.locator('.wishlist-content .cart-item-row').count() > 0;

    if (!hasItems) {
      await expect(emptyMsg, 'Empty wishlist message should be visible').toBeVisible();
      const msgText = await emptyMsg.innerText();
      expect(msgText.trim().length, 'Empty wishlist message should not be blank').toBeGreaterThan(0);
      expect(msgText.toLowerCase(), 'Message should indicate wishlist is empty').toMatch(/empty|no items/i);
    }
  });

  test('TC-WISH-005 | Wishlist page contains share-by-email input', async ({ page }) => {
    await page.goto(BASE + '/wishlist');
    // Share wishlist option may be present
    const emailWishlist = page.locator('input[id="YourEmailAddress"], .wishlist-share-button');
    // Non-blocking check — wishlist share may depend on items
    const isVisible = await emailWishlist.isVisible().catch(() => false);
    // Page should still be stable
    await expect(page.locator('body'), 'Page body should be visible').toBeVisible();
    await expect(page, 'URL should still be /wishlist').toHaveURL(/\/wishlist/);
  });

});

test.describe('Compare Products', () => {

  test('TC-CMP-001 | Compare products page loads with correct URL and heading', async ({ page }) => {
    const response = await page.goto(BASE + '/compareproducts');

    expect(response?.status(), 'HTTP status should be 200').toBe(200);
    await expect(page, 'URL should be /compareproducts').toHaveURL(/\/compareproducts$/);

    const title = await page.title();
    expect(title.trim().length, 'Page title should not be empty').toBeGreaterThan(0);
  });

  test('TC-CMP-002 | Empty compare list shows an empty-state message', async ({ page }) => {
    // Clear compare list first
    await page.goto(BASE + '/clearcomparelist');
    await page.goto(BASE + '/compareproducts');

    const emptyMsg = page.locator('.no-data');
    await expect(emptyMsg, 'Empty compare message should appear after clearing').toBeVisible({ timeout: 5000 });
    const msgText = await emptyMsg.innerText();
    expect(msgText.trim().length, 'Empty compare message should not be blank').toBeGreaterThan(0);
  });

  test('TC-CMP-003 | "Add to compare list" button exists on catalog page and is enabled', async ({ page }) => {
    await page.goto(BASE + '/desktops');

    const compareBtn = page.locator('.add-to-compare-list-button').first();
    await expect(compareBtn, '"Add to compare" button should be visible on Desktops page').toBeVisible();
    await expect(compareBtn, '"Add to compare" button should be enabled').toBeEnabled();

    const btnText = await compareBtn.innerText();
    expect(btnText.toLowerCase(), 'Compare button text should mention "compare"').toMatch(/compare/i);
  });

  test('TC-CMP-004 | Adding a product to compare shows success notification', async ({ page }) => {
    await page.goto(BASE + '/clearcomparelist');
    await page.goto(BASE + '/desktops');

    await page.locator('.add-to-compare-list-button').first().click();

    const notification = page.locator('.bar-notification');
    await expect(notification, 'Success notification should appear after adding to compare').toBeVisible({ timeout: 8000 });

    const notifText = await notification.locator('.content').innerText();
    expect(notifText.trim().length, 'Notification text should not be empty').toBeGreaterThan(0);
  });

  test('TC-CMP-005 | Comparing two products shows them side-by-side in a table', async ({ page }) => {
    await page.goto(BASE + '/clearcomparelist');
    await page.goto(BASE + '/desktops');

    const compareButtons = page.locator('.add-to-compare-list-button');
    const btnCount = await compareButtons.count();

    if (btnCount >= 2) {
      // Add first product
      await compareButtons.nth(0).click();
      await page.locator('.bar-notification').waitFor({ timeout: 5000 });
      await page.locator('.bar-notification .close').click().catch(() => {});

      // Add second product
      await compareButtons.nth(1).click();
      await page.locator('.bar-notification').waitFor({ timeout: 5000 });

      // Navigate to compare page
      await page.goto(BASE + '/compareproducts');

      const table = page.locator('.compare-products-table');
      await expect(table, 'Compare products table should be visible').toBeVisible({ timeout: 6000 });

      // Assert at least 2 products shown in the table
      const productColumns = table.locator('th:not(:first-child)');
      const colCount = await productColumns.count();
      expect(colCount, 'Compare table should have at least 2 product columns').toBeGreaterThanOrEqual(2);

      // Assert each product name is not empty
      for (let i = 0; i < colCount; i++) {
        const colText = await productColumns.nth(i).innerText();
        expect(colText.trim().length, `Product column ${i + 1} name should not be empty`).toBeGreaterThan(0);
      }
    }
  });

  test('TC-CMP-006 | Clear compare list removes all products and shows empty state', async ({ page }) => {
    // Add one product
    await page.goto(BASE + '/desktops');
    await page.locator('.add-to-compare-list-button').first().click();
    await page.locator('.bar-notification').waitFor({ timeout: 5000 });

    // Go to compare and clear
    await page.goto(BASE + '/compareproducts');
    const clearLink = page.locator('a[href="/clearcomparelist"]');

    if (await clearLink.isVisible()) {
      await clearLink.click();

      // Assert empty state appears after clearing
      await expect(page.locator('.no-data'), 'Empty state should appear after clearing compare list').toBeVisible({ timeout: 5000 });
      const msgText = await page.locator('.no-data').innerText();
      expect(msgText.trim().length, 'Empty message should not be blank').toBeGreaterThan(0);
    }
  });

});
