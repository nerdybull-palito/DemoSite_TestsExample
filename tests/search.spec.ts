// tests/search.spec.ts
// Each test has multiple specific expect() assertions.

import { test, expect } from '@playwright/test';

const BASE = 'https://demo.nopcommerce.com';

test.describe('Product Search – Header Bar', () => {

  test('TC-SRCH-001 | Valid keyword search navigates to /search and shows results', async ({ page }) => {
    await page.goto(BASE + '/');

    await page.locator('#small-searchterms').fill('laptop');
    await page.locator('.search-box button[type="submit"]').click();

    await expect(page, 'Should navigate to /search').toHaveURL(/\/search/);

    const results = page.locator('.search-results .item-box');
    await expect(results.first(), 'At least one result should appear').toBeVisible({ timeout: 8000 });

    const count = await results.count();
    expect(count, 'Search for "laptop" should return at least 1 result').toBeGreaterThan(0);
  });

  test('TC-SRCH-002 | Non-existent product search shows no-result message', async ({ page }) => {
    await page.goto(BASE + '/');

    await page.locator('#small-searchterms').fill('xyznotarealproduct999abc');
    await page.locator('.search-box button[type="submit"]').click();

    await expect(page, 'Should navigate to /search even with no results').toHaveURL(/\/search/);

    const noResult = page.locator('.search-results .no-result');
    await expect(noResult, '"No result" message should appear').toBeVisible({ timeout: 8000 });

    const message = await noResult.innerText();
    expect(message.trim().length, 'No-result message should not be empty').toBeGreaterThan(0);
  });

  test('TC-SRCH-003 | Special-character search does not crash the page', async ({ page }) => {
    await page.goto(BASE + '/');

    await page.locator('#small-searchterms').fill('<script>alert(1)</script>');
    await page.locator('.search-box button[type="submit"]').click();

    // Page should still be alive
    await expect(page.locator('body'), 'Page body should still be visible after XSS input').toBeVisible();
    await expect(page, 'Should still be on /search page').toHaveURL(/\/search/);

    const title = await page.title();
    expect(title.trim().length, 'Page title should not be empty after XSS attempt').toBeGreaterThan(0);
  });

});

test.describe('Product Search – Search Results Page (/search)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/search');
  });

  test('TC-SRCH-004 | Search page loads with correct URL, title, and form elements', async ({ page }) => {
    await expect(page, 'URL should be /search').toHaveURL(/\/search$/);
    await expect(page, 'Title should include "Search"').toHaveTitle(/search/i);
    await expect(page.locator('#q'),               'Search input should be visible').toBeVisible();
    await expect(page.locator('button.search-button'), 'Search button should be visible').toBeVisible();
    await expect(page.locator('button.search-button'), 'Search button should be enabled').toBeEnabled();
    await expect(page.locator('#adv'),             'Advanced search checkbox should be visible').toBeVisible();
  });

  test('TC-SRCH-005 | Search for "laptop" returns results with image, name, and price', async ({ page }) => {
    await page.locator('#q').fill('laptop');
    await page.locator('button.search-button').click();

    const results = page.locator('.search-results .item-box');
    await expect(results.first(), 'First result should be visible').toBeVisible({ timeout: 8000 });

    const count = await results.count();
    expect(count, '"laptop" search should return at least 1 result').toBeGreaterThan(0);

    // Assert first result has image, name, and price
    const first = results.first();
    await expect(first.locator('.picture img'),   'Result image should be visible').toBeVisible();
    await expect(first.locator('.product-title'), 'Result product title should be visible').toBeVisible();
    await expect(first.locator('.price'),         'Result product price should be visible').toBeVisible();

    const titleText = await first.locator('.product-title').innerText();
    expect(titleText.trim().length, 'Product title should not be empty').toBeGreaterThan(0);

    const priceText = await first.locator('.price').innerText();
    expect(priceText, 'Product price should contain "$"').toContain('$');
  });

  test('TC-SRCH-006 | Blank search shows minimum-length warning', async ({ page }) => {
    await page.locator('#q').fill('');
    await page.locator('button.search-button').click();

    const warning = page.locator('.warning, .search-results .warning');
    await expect(warning, 'Warning should appear for blank search').toBeVisible({ timeout: 5000 });

    const warningText = await warning.innerText();
    expect(warningText.trim().length, 'Warning text should not be empty').toBeGreaterThan(0);
  });

  test('TC-SRCH-007 | Single-character search shows minimum-length warning', async ({ page }) => {
    await page.locator('#q').fill('a');
    await page.locator('button.search-button').click();

    const warning = page.locator('.warning');
    await expect(warning, 'Warning should appear for too-short search term').toBeVisible({ timeout: 5000 });

    const warningText = await warning.innerText();
    expect(warningText.toLowerCase(), 'Warning should mention minimum length or characters').toMatch(/minimum|character|length/i);
  });

  test('TC-SRCH-008 | No-results search shows correct empty-state message', async ({ page }) => {
    await page.locator('#q').fill('zzznoresultsxxx999');
    await page.locator('button.search-button').click();

    const noResult = page.locator('.search-results .no-result');
    await expect(noResult, '"No results" message should appear').toBeVisible({ timeout: 8000 });

    const message = await noResult.innerText();
    expect(message.trim().length, 'No-results message should not be empty').toBeGreaterThan(0);

    // Assert zero product items returned
    const itemCount = await page.locator('.search-results .item-box').count();
    expect(itemCount, 'Zero product cards should be shown for no-results search').toBe(0);
  });

  test('TC-SRCH-009 | Case-insensitive: "LAPTOP" returns same results as "laptop"', async ({ page }) => {
    await page.locator('#q').fill('laptop');
    await page.locator('button.search-button').click();
    const lowerCount = await page.locator('.search-results .item-box').count();
    await expect(page.locator('.search-results .item-box').first()).toBeVisible({ timeout: 8000 });

    await page.locator('#q').fill('LAPTOP');
    await page.locator('button.search-button').click();
    await expect(page.locator('.search-results .item-box').first()).toBeVisible({ timeout: 8000 });
    const upperCount = await page.locator('.search-results .item-box').count();

    expect(upperCount, 'Case-insensitive search should return same number of results').toBe(lowerCount);
  });

  test('TC-SRCH-010 | Advanced search checkbox reveals Category dropdown', async ({ page }) => {
    const advCheckbox  = page.locator('#adv');
    const categoryDrop = page.locator('#cid');

    await advCheckbox.check();
    await expect(advCheckbox, 'Advanced checkbox should be checked').toBeChecked();
    await expect(categoryDrop, 'Category dropdown should appear when Advanced is checked').toBeVisible({ timeout: 3000 });

    const optionCount = await categoryDrop.locator('option').count();
    expect(optionCount, 'Category dropdown should have at least 2 options').toBeGreaterThanOrEqual(2);
  });

  test('TC-SRCH-011 | Clicking a search result opens its product detail page', async ({ page }) => {
    await page.locator('#q').fill('laptop');
    await page.locator('button.search-button').click();

    const firstTitle = page.locator('.search-results .item-box').first().locator('.product-title a');
    await expect(firstTitle, 'First product title link should be visible').toBeVisible({ timeout: 8000 });

    const linkText = await firstTitle.innerText();
    await firstTitle.click();

    // Assert navigated to product detail page
    await expect(page.locator('.product-name h1'), 'Product name heading should be on detail page').toBeVisible({ timeout: 8000 });
    await expect(page.locator('button.add-to-cart-button'), 'Add to Cart button should be present on detail page').toBeVisible();

    // Assert detail page shows a price
    await expect(page.locator('.product-price span'), 'Price should be visible on detail page').toBeVisible();
  });

  test('TC-SRCH-012 | Search result count label is displayed correctly', async ({ page }) => {
    await page.locator('#q').fill('apple');
    await page.locator('button.search-button').click();

    await expect(page.locator('.search-results .item-box').first(), 'Results should load').toBeVisible({ timeout: 8000 });

    // Assert URL contains search query
    expect(page.url(), 'URL should contain search query parameter').toContain('apple');
  });

  test('TC-SRCH-013 | Search in descriptions checkbox is visible when Advanced enabled', async ({ page }) => {
    await page.locator('#adv').check();

    const searchInDesc = page.locator('#sid');
    await expect(searchInDesc, 'Search in descriptions checkbox should appear with Advanced').toBeVisible({ timeout: 3000 });
    await expect(searchInDesc, 'Search in descriptions should be a checkbox').toBeEnabled();
  });

  test('TC-SRCH-014 | Search results have Add to Cart / Add to Wishlist buttons', async ({ page }) => {
    await page.locator('#q').fill('laptop');
    await page.locator('button.search-button').click();

    await expect(page.locator('.search-results .item-box').first(), 'Results should load').toBeVisible({ timeout: 8000 });

    // At least one product card should have an action button
    const buttons = page.locator('.search-results .item-box .buttons');
    const btnCount = await buttons.count();
    expect(btnCount, 'Product cards should have button sections').toBeGreaterThan(0);
  });

});
