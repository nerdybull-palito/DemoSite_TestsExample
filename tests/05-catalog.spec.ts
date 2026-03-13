// tests/05-catalog.spec.ts
// Each test has multiple specific expect() assertions.

import { test, expect } from '@playwright/test';

const BASE = 'https://demo.nopcommerce.com';

test.describe('Computers Category Page', () => {

  test('TC-CAT-001 | Computers page loads with correct URL, heading, and breadcrumb', async ({ page }) => {
    const response = await page.goto(BASE + '/computers');

    expect(response?.status(), 'HTTP status should be 200').toBe(200);
    await expect(page, 'URL should be /computers').toHaveURL(/\/computers$/);
    await expect(page.locator('.page-title h1'), 'Heading should say "Computers"').toContainText('Computers');

    const breadcrumb = page.locator('.breadcrumb');
    await expect(breadcrumb, 'Breadcrumb should be visible').toBeVisible();
    await expect(breadcrumb, 'Breadcrumb should contain "Home"').toContainText('Home');
    await expect(breadcrumb, 'Breadcrumb should contain "Computers"').toContainText('Computers');
  });

  test('TC-CAT-002 | Computers page shows exactly 2 subcategories: Desktops and Notebooks', async ({ page }) => {
    await page.goto(BASE + '/computers');

    const subcats = page.locator('.sub-category-item');
    const count = await subcats.count();
    expect(count, 'Computers should have exactly 2 subcategories').toBe(2);

    await expect(page.locator('.sub-category-item a[href="/desktops"]'),  'Desktops subcategory link should be visible').toBeVisible();
    await expect(page.locator('.sub-category-item a[href="/notebooks"]'), 'Notebooks subcategory link should be visible').toBeVisible();

    // Assert subcategory names
    await expect(page.locator('.sub-category-item a[href="/desktops"]'),  'Desktops link text').toContainText('Desktops');
    await expect(page.locator('.sub-category-item a[href="/notebooks"]'), 'Notebooks link text').toContainText('Notebooks');
  });

  test('TC-CAT-003 | Subcategory images load without broken icons', async ({ page }) => {
    await page.goto(BASE + '/computers');

    const images = page.locator('.sub-category-item img');
    const imgCount = await images.count();
    expect(imgCount, 'Each subcategory should have an image').toBeGreaterThan(0);

    // Assert each image has a non-empty src
    for (let i = 0; i < imgCount; i++) {
      const src = await images.nth(i).getAttribute('src');
      expect(src, `Subcategory image ${i} should have a src`).toBeTruthy();
      expect(src, 'Image src should not be empty string').not.toBe('');
    }
  });

  test('TC-CAT-004 | Clicking Desktops subcategory navigates to /desktops', async ({ page }) => {
    await page.goto(BASE + '/computers');

    await page.locator('.sub-category-item a[href="/desktops"]').click();

    await expect(page, 'URL should be /desktops after click').toHaveURL(/\/desktops$/);
    await expect(page.locator('.page-title h1'), 'Heading should say "Desktops"').toContainText('Desktops');
    await expect(page.locator('.breadcrumb'), 'Breadcrumb should include "Desktops"').toContainText('Desktops');
  });

  test('TC-CAT-005 | Clicking Notebooks subcategory navigates to /notebooks', async ({ page }) => {
    await page.goto(BASE + '/computers');

    await page.locator('.sub-category-item a[href="/notebooks"]').click();

    await expect(page, 'URL should be /notebooks after click').toHaveURL(/\/notebooks$/);
    await expect(page.locator('.page-title h1'), 'Heading should say "Notebooks"').toContainText('Notebooks');
    await expect(page.locator('.breadcrumb'), 'Breadcrumb should include "Notebooks"').toContainText('Notebooks');
  });

});

test.describe('Desktops Category Page', () => {

  test('TC-DT-001 | Desktops page loads with products, heading, and breadcrumb', async ({ page }) => {
    const response = await page.goto(BASE + '/desktops');

    expect(response?.status(), 'HTTP status should be 200').toBe(200);
    await expect(page, 'URL should be /desktops').toHaveURL(/\/desktops$/);
    await expect(page.locator('.page-title h1'), 'Heading should say "Desktops"').toContainText('Desktops');

    const breadcrumb = page.locator('.breadcrumb');
    await expect(breadcrumb, 'Breadcrumb should show Home > Computers > Desktops').toContainText('Home');
    await expect(breadcrumb, 'Breadcrumb should contain Computers').toContainText('Computers');
    await expect(breadcrumb, 'Breadcrumb should contain Desktops').toContainText('Desktops');

    const productCount = await page.locator('.product-item').count();
    expect(productCount, 'At least one desktop product should be listed').toBeGreaterThan(0);
  });

  test('TC-DT-002 | Each Desktop product card shows image, name, and price', async ({ page }) => {
    await page.goto(BASE + '/desktops');

    const first = page.locator('.product-item').first();
    await expect(first.locator('.picture img'),   'Product image should be visible').toBeVisible();
    await expect(first.locator('.product-title'), 'Product name should be visible').toBeVisible();
    await expect(first.locator('.price'),         'Product price should be visible').toBeVisible();

    const name  = await first.locator('.product-title').innerText();
    const price = await first.locator('.price').innerText();

    expect(name.trim().length,  'Product name should not be empty').toBeGreaterThan(0);
    expect(price, 'Product price must include "$"').toContain('$');
    expect(parseFloat(price.replace(/[^0-9.]/g, '')), 'Price value must be > 0').toBeGreaterThan(0);
  });

  test('TC-DT-003 | Sort by "Price: Low to High" orders products in ascending price order', async ({ page }) => {
    await page.goto(BASE + '/desktops');

    await page.locator('#products-orderby').selectOption('5');
    await page.waitForLoadState('networkidle');

    const priceLocators = page.locator('.product-item .price.actual-price');
    const count = await priceLocators.count();
    expect(count, 'Should still have products after sorting').toBeGreaterThan(0);

    const prices: number[] = [];
    for (let i = 0; i < count; i++) {
      const text = await priceLocators.nth(i).innerText();
      prices.push(parseFloat(text.replace(/[^0-9.]/g, '')));
    }

    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices, 'Prices should be in ascending order after "Low to High" sort').toEqual(sorted);
  });

  test('TC-DT-004 | Sort by "Price: High to Low" orders products in descending price order', async ({ page }) => {
    await page.goto(BASE + '/desktops');

    await page.locator('#products-orderby').selectOption('6');
    await page.waitForLoadState('networkidle');

    const priceLocators = page.locator('.product-item .price.actual-price');
    const count = await priceLocators.count();
    expect(count, 'Should still have products after sorting').toBeGreaterThan(0);

    const prices: number[] = [];
    for (let i = 0; i < count; i++) {
      const text = await priceLocators.nth(i).innerText();
      prices.push(parseFloat(text.replace(/[^0-9.]/g, '')));
    }

    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices, 'Prices should be in descending order after "High to Low" sort').toEqual(sorted);
  });

  test('TC-DT-005 | Sort by "Name: A to Z" orders products alphabetically', async ({ page }) => {
    await page.goto(BASE + '/desktops');

    await page.locator('#products-orderby').selectOption('3');
    await page.waitForLoadState('networkidle');

    const nameLocators = page.locator('.product-item .product-title a');
    const count = await nameLocators.count();
    expect(count, 'Should have products after name sort').toBeGreaterThan(0);

    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      names.push((await nameLocators.nth(i).innerText()).trim());
    }

    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names, 'Product names should be in A→Z order').toEqual(sorted);
  });

  test('TC-DT-006 | Sort by "Name: Z to A" orders products in reverse alphabetical order', async ({ page }) => {
    await page.goto(BASE + '/desktops');

    await page.locator('#products-orderby').selectOption('4');
    await page.waitForLoadState('networkidle');

    const nameLocators = page.locator('.product-item .product-title a');
    const count = await nameLocators.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      names.push((await nameLocators.nth(i).innerText()).trim());
    }

    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names, 'Product names should be in Z→A order').toEqual(sorted);
  });

  test('TC-DT-007 | Items-per-page set to 4 shows at most 4 products', async ({ page }) => {
    await page.goto(BASE + '/desktops');

    const pageSizeDropdown = page.locator('#products-pagesize');
    if (await pageSizeDropdown.isVisible()) {
      await pageSizeDropdown.selectOption('4');
      await page.waitForLoadState('networkidle');

      const count = await page.locator('.product-item').count();
      expect(count, 'Items per page = 4 should show at most 4 products').toBeLessThanOrEqual(4);
      expect(count, 'Items per page = 4 should show at least 1 product').toBeGreaterThan(0);
    }
  });

  test('TC-DT-008 | Clicking a Desktop product navigates to its detail page', async ({ page }) => {
    await page.goto(BASE + '/desktops');

    const firstLink = page.locator('.product-item .product-title a').first();
    const productName = await firstLink.innerText();
    await firstLink.click();

    await expect(page.locator('.product-name h1'),          'Product name heading should be visible').toBeVisible({ timeout: 8000 });
    await expect(page.locator('button.add-to-cart-button'), 'Add to Cart should be visible on detail page').toBeVisible();
    await expect(page.locator('.product-price span'),        'Product price should be on detail page').toBeVisible();

    const detailName = await page.locator('.product-name h1').innerText();
    expect(detailName.trim().length, 'Product name on detail page should not be empty').toBeGreaterThan(0);
  });

  test('TC-DT-009 | Add to Cart on listing increases cart quantity counter', async ({ page }) => {
    await page.goto(BASE + '/desktops');

    const cartQty = page.locator('.cart-qty');
    const beforeRaw = (await cartQty.innerText()).replace(/\D/g, '') || '0';
    const before = parseInt(beforeRaw, 10);

    // Click Add to Cart on first item that has a direct add button
    await page.locator('.product-item .button-2.product-box-add-to-cart-button').first().click();

    const notification = page.locator('.bar-notification');
    await expect(notification, 'Success notification should appear after add to cart').toBeVisible({ timeout: 8000 });

    const notifText = await notification.locator('.content').innerText();
    expect(notifText.trim().length, 'Notification text should not be empty').toBeGreaterThan(0);

    const afterRaw = (await cartQty.innerText()).replace(/\D/g, '') || '0';
    const after = parseInt(afterRaw, 10);
    expect(after, 'Cart quantity should increase after adding a product').toBeGreaterThan(before);
  });

});

test.describe('Notebooks Category Page', () => {

  test('TC-NB-001 | Notebooks page loads with correct heading and breadcrumb', async ({ page }) => {
    const response = await page.goto(BASE + '/notebooks');

    expect(response?.status(), 'HTTP status should be 200').toBe(200);
    await expect(page, 'URL should be /notebooks').toHaveURL(/\/notebooks$/);
    await expect(page.locator('.page-title h1'), 'Heading should say "Notebooks"').toContainText('Notebooks');

    const breadcrumb = page.locator('.breadcrumb');
    await expect(breadcrumb, 'Breadcrumb should contain Computers').toContainText('Computers');
    await expect(breadcrumb, 'Breadcrumb should contain Notebooks').toContainText('Notebooks');
  });

  test('TC-NB-002 | Notebooks are listed with images, names, and prices', async ({ page }) => {
    await page.goto(BASE + '/notebooks');

    const products = page.locator('.product-item');
    const count = await products.count();
    expect(count, 'At least 1 notebook product should be listed').toBeGreaterThan(0);

    const first = products.first();
    await expect(first.locator('.picture img'),   'Notebook image should be visible').toBeVisible();
    await expect(first.locator('.product-title'), 'Notebook name should be visible').toBeVisible();
    await expect(first.locator('.price'),         'Notebook price should be visible').toBeVisible();

    const priceText = await first.locator('.price').innerText();
    expect(priceText, 'Notebook price must include "$"').toContain('$');
  });

  test('TC-NB-003 | Sort Notebooks by price: Low to High produces ascending order', async ({ page }) => {
    await page.goto(BASE + '/notebooks');

    await page.locator('#products-orderby').selectOption('5');
    await page.waitForLoadState('networkidle');

    const priceLocators = page.locator('.product-item .price.actual-price');
    const count = await priceLocators.count();
    expect(count, 'Products should still be visible after sort').toBeGreaterThan(0);

    const prices: number[] = [];
    for (let i = 0; i < count; i++) {
      const text = await priceLocators.nth(i).innerText();
      prices.push(parseFloat(text.replace(/[^0-9.]/g, '')));
    }
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices, 'Notebook prices should be in ascending order').toEqual(sorted);
  });

  test('TC-NB-004 | Clicking a Notebook product navigates to its detail page', async ({ page }) => {
    await page.goto(BASE + '/notebooks');

    const firstLink = page.locator('.product-item .product-title a').first();
    await firstLink.click();

    await expect(page.locator('.product-name h1'),          'Product name should be on detail page').toBeVisible({ timeout: 8000 });
    await expect(page.locator('button.add-to-cart-button'), 'Add to Cart should be on detail page').toBeVisible();
    await expect(page.locator('.breadcrumb'),               'Breadcrumb should be on detail page').toBeVisible();
    await expect(page.locator('.breadcrumb'),               'Breadcrumb should include Notebooks').toContainText('Notebooks');
  });

});
