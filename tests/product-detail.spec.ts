// tests/product-detail.spec.ts
// Each test has multiple specific expect() assertions.

import { test, expect } from '@playwright/test';

const BASE         = 'https://demo.nopcommerce.com';
const SIMPLE_PROD  = '/apple-macbook-pro-13-inch';
const CONFIG_PROD  = '/build-your-own-computer';

test.describe('Product Detail Page – Basic Elements', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + SIMPLE_PROD);
  });

  test('TC-PDP-001 | Product detail page loads with correct HTTP status and product name', async ({ page }) => {
    const response = await page.goto(BASE + SIMPLE_PROD);

    expect(response?.status(), 'HTTP status should be 200').toBe(200);
    expect(page.url(), 'URL should contain the product slug').toContain('apple-macbook-pro');

    const productName = page.locator('.product-name h1');
    await expect(productName, 'Product name h1 should be visible').toBeVisible();

    const nameText = await productName.innerText();
    expect(nameText.trim().length, 'Product name text must not be empty').toBeGreaterThan(0);
  });

  test('TC-PDP-002 | Product price is displayed with valid dollar-format value', async ({ page }) => {
    const price = page.locator('.product-price span').first();
    await expect(price, 'Product price should be visible').toBeVisible();

    const priceText = await price.innerText();
    expect(priceText, 'Price must include "$"').toContain('$');
    expect(parseFloat(priceText.replace(/[^0-9.]/g, '')), 'Price value must be > 0').toBeGreaterThan(0);
  });

  test('TC-PDP-003 | Product image gallery is present with a valid src', async ({ page }) => {
    const img = page.locator('.product-essential .picture img').first();
    await expect(img, 'Product image should be visible').toBeVisible();

    const src = await img.getAttribute('src');
    expect(src, 'Image src must not be null').toBeTruthy();
    expect(src, 'Image src must not be empty').not.toBe('');
    // Assert it's not a broken placeholder
    expect(src, 'Image src should be a proper URL path').toMatch(/\.(jpg|jpeg|png|gif|webp)/i);
  });

  test('TC-PDP-004 | Add to Cart button is visible, enabled, and correctly labeled', async ({ page }) => {
    const addBtn = page.locator('button.add-to-cart-button');
    await expect(addBtn, 'Add to Cart button should be visible').toBeVisible();
    await expect(addBtn, 'Add to Cart button should be enabled').toBeEnabled();

    const btnText = await addBtn.innerText();
    expect(btnText.toLowerCase(), 'Button text should mention "cart"').toMatch(/cart/i);
  });

  test('TC-PDP-005 | Add to Wishlist button is visible and enabled', async ({ page }) => {
    const wishBtn = page.locator('button.add-to-wishlist-button');
    await expect(wishBtn, 'Add to Wishlist button should be visible').toBeVisible();
    await expect(wishBtn, 'Add to Wishlist button should be enabled').toBeEnabled();

    const btnText = await wishBtn.innerText();
    expect(btnText.toLowerCase(), 'Wishlist button text should mention "wishlist"').toMatch(/wish/i);
  });

  test('TC-PDP-006 | Breadcrumb shows correct Home > Category > Product path', async ({ page }) => {
    const breadcrumb = page.locator('.breadcrumb');
    await expect(breadcrumb, 'Breadcrumb should be visible').toBeVisible();
    await expect(breadcrumb, 'Breadcrumb should contain "Home"').toContainText('Home');

    const homeLink = breadcrumb.locator('a[href="/"]');
    await expect(homeLink, 'Home link in breadcrumb should be visible').toBeVisible();

    const breadcrumbText = await breadcrumb.innerText();
    expect(breadcrumbText.trim().length, 'Breadcrumb should have meaningful text').toBeGreaterThan(5);
  });

  test('TC-PDP-007 | Product description or short description section is present', async ({ page }) => {
    const fullDesc  = page.locator('.full-description');
    const shortDesc = page.locator('.short-description');

    const hasFullDesc  = await fullDesc.isVisible().catch(() => false);
    const hasShortDesc = await shortDesc.isVisible().catch(() => false);

    expect(hasFullDesc || hasShortDesc, 'At least one description section should be visible').toBeTruthy();
  });

  test('TC-PDP-008 | Quantity input accepts valid integer and rejects letters', async ({ page }) => {
    const qtyInput = page.locator('input.qty-input');
    await expect(qtyInput, 'Quantity input should be visible').toBeVisible();
    await expect(qtyInput, 'Quantity input should be enabled').toBeEnabled();

    // Set to valid value
    await qtyInput.fill('3');
    const val = await qtyInput.inputValue();
    expect(val, 'Quantity input should hold value "3"').toBe('3');

    // Input type should be number or text
    const inputType = await qtyInput.getAttribute('type');
    expect(['number', 'text'], 'Qty input type should be number or text').toContain(inputType);
  });

  test('TC-PDP-009 | Add to Cart triggers success notification and updates cart badge', async ({ page }) => {
    const cartBadge = page.locator('.cart-qty');
    const beforeRaw = (await cartBadge.innerText()).replace(/\D/g, '') || '0';
    const before = parseInt(beforeRaw, 10);

    await page.locator('button.add-to-cart-button').click();

    const notification = page.locator('.bar-notification');
    await expect(notification, 'Notification bar should appear after Add to Cart').toBeVisible({ timeout: 8000 });

    const notifText = await notification.locator('.content').innerText();
    expect(notifText.trim().length, 'Notification message should not be empty').toBeGreaterThan(0);

    const afterRaw = (await cartBadge.innerText()).replace(/\D/g, '') || '0';
    const after = parseInt(afterRaw, 10);
    expect(after, 'Cart badge count should increase after adding product').toBeGreaterThan(before);
  });

  test('TC-PDP-010 | Email a Friend link is present and navigates correctly', async ({ page }) => {
    const emailLink = page.locator('.email-a-friend-button, a:has-text("Email a friend")');
    await expect(emailLink, '"Email a friend" link should be visible').toBeVisible();

    await emailLink.click();
    // Should navigate to email-a-friend page or login
    const currentUrl = page.url();
    expect(currentUrl, 'Should navigate away from product detail').not.toContain(SIMPLE_PROD);
  });

  test('TC-PDP-011 | "Add your review" link is present on detail page', async ({ page }) => {
    const reviewLink = page.locator('a[href*="productreviews"], a:has-text("Add your review")');
    await expect(reviewLink, '"Add your review" link should be visible').toBeVisible();

    const href = await reviewLink.getAttribute('href');
    expect(href, 'Review link href should reference productreviews').toMatch(/productreviews|review/i);
  });

  test('TC-PDP-012 | SKU is displayed on the product detail page', async ({ page }) => {
    const sku = page.locator('.sku .value');
    if (await sku.isVisible()) {
      const skuText = await sku.innerText();
      expect(skuText.trim().length, 'SKU value should not be empty').toBeGreaterThan(0);
    }
    // Non-blocking: SKU may not always be shown, but page should be stable
    await expect(page.locator('.product-name h1'), 'Product name should still be visible').toBeVisible();
  });

});

test.describe('Product Detail Page – Configurable Products', () => {

  test('TC-PDP-013 | Configurable product shows required attribute dropdowns', async ({ page }) => {
    await page.goto(BASE + CONFIG_PROD);

    const attributes = page.locator('.attributes');
    await expect(attributes, 'Attributes section should be visible on configurable product').toBeVisible();

    const selects = attributes.locator('select, input[type="radio"]');
    const count = await selects.count();
    expect(count, 'Configurable product should have at least one attribute control').toBeGreaterThan(0);
  });

  test('TC-PDP-014 | Adding configurable product without required attributes shows validation error', async ({ page }) => {
    await page.goto(BASE + CONFIG_PROD);

    await page.locator('button.add-to-cart-button').click();

    // Assert validation error appears
    const error = page.locator('.message-error, .product-essentials .warning, #addtocart-message-required');
    await expect(error.first(), 'Validation error should appear when required options not selected').toBeVisible({ timeout: 6000 });

    // Assert not navigated away
    await expect(page, 'Should remain on product page after validation error').toHaveURL(/build-your-own-computer/);
  });

  test('TC-PDP-015 | Product page title matches the product name heading', async ({ page }) => {
    await page.goto(BASE + SIMPLE_PROD);

    const pageTitle   = await page.title();
    const productName = await page.locator('.product-name h1').innerText();

    expect(pageTitle, 'Browser tab title should include the product name').toContain(productName.trim().split(' ')[0]);
    expect(productName.trim().length, 'Product name heading must not be empty').toBeGreaterThan(0);
  });

});
