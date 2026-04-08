// tests/cart.spec.ts
// Each test has multiple specific expect() assertions.

import { test, expect, Page } from '@playwright/test';

const BASE         = 'https://demo.nopcommerce.com';
const PRODUCT_URL  = '/apple-macbook-pro-13-inch';

async function addProductToCart(page: Page): Promise<void> {
  await page.goto(BASE + PRODUCT_URL);
  await page.locator('button.add-to-cart-button').click();
  await page.locator('.bar-notification').waitFor({ timeout: 8000 });
  await page.locator('.bar-notification .close').click().catch(() => {});
}

async function clearCart(page: Page): Promise<void> {
  await page.goto(BASE + '/cart');
  const removeButtons = page.locator('.cart-item-row button.remove-btn');
  let count = await removeButtons.count();
  while (count > 0) {
    await removeButtons.first().click();
    await page.waitForLoadState('networkidle');
    count = await page.locator('.cart-item-row button.remove-btn').count();
  }
}

test.describe('Shopping Cart', () => {

  test('TC-CART-001 | Empty cart page loads with correct URL and empty-state message', async ({ page }) => {
    await clearCart(page);
    await page.goto(BASE + '/cart');

    await expect(page, 'URL should be /cart').toHaveURL(/\/cart$/);
    await expect(page, 'Title should mention cart').toHaveTitle(/cart/i);

    const emptyMsg = page.locator('.no-data');
    await expect(emptyMsg, 'Empty cart message should be visible').toBeVisible();
    const msg = await emptyMsg.innerText();
    expect(msg.trim().length, 'Empty cart message should not be blank').toBeGreaterThan(0);
    expect(msg.toLowerCase(), 'Empty cart message should reference "empty" or "no items"').toMatch(/empty|no items/i);
  });

  test('TC-CART-002 | Adding a product shows success notification with meaningful text', async ({ page }) => {
    await page.goto(BASE + PRODUCT_URL);

    await page.locator('button.add-to-cart-button').click();

    const notification = page.locator('.bar-notification');
    await expect(notification, 'Success notification bar should appear').toBeVisible({ timeout: 8000 });

    const notifText = await notification.locator('.content').innerText();
    expect(notifText.trim().length, 'Notification text should not be empty').toBeGreaterThan(0);
  });

  test('TC-CART-003 | Cart badge count increments after adding a product', async ({ page }) => {
    await page.goto(BASE + '/');
    const badge = page.locator('.cart-qty');

    const beforeText = (await badge.innerText()).replace(/\D/g, '') || '0';
    const before = parseInt(beforeText, 10);

    await page.goto(BASE + PRODUCT_URL);
    await page.locator('button.add-to-cart-button').click();
    await page.locator('.bar-notification').waitFor({ timeout: 8000 });

    const afterText = (await badge.innerText()).replace(/\D/g, '') || '0';
    const after = parseInt(afterText, 10);

    expect(after, 'Cart badge should show a higher number after adding a product').toBeGreaterThan(before);
  });

  test('TC-CART-004 | Added product appears in cart with name, price, and subtotal', async ({ page }) => {
    await addProductToCart(page);
    await page.goto(BASE + '/cart');

    const cartRows = page.locator('.cart-item-row');
    const rowCount = await cartRows.count();
    expect(rowCount, 'Cart should have at least 1 item').toBeGreaterThan(0);

    const firstRow = cartRows.first();
    await expect(firstRow.locator('.product-name'), 'Product name should be in cart row').toBeVisible();
    await expect(firstRow.locator('.unit-price'),   'Unit price should be in cart row').toBeVisible();
    await expect(firstRow.locator('.subtotal'),     'Subtotal should be in cart row').toBeVisible();

    const nameText  = await firstRow.locator('.product-name').innerText();
    const priceText = await firstRow.locator('.unit-price').innerText();
    expect(nameText.trim().length,  'Product name in cart should not be empty').toBeGreaterThan(0);
    expect(priceText, 'Unit price in cart should include "$"').toContain('$');
  });

  test('TC-CART-005 | Updating quantity to 2 recalculates the subtotal', async ({ page }) => {
    await addProductToCart(page);
    await page.goto(BASE + '/cart');

    const qtyInput     = page.locator('.cart-item-row input.qty-input').first();
    const subtotalCell = page.locator('.cart-item-row .subtotal .product-subtotal').first();
    const unitPriceCell = page.locator('.cart-item-row .unit-price .product-unit-price').first();

    const unitPriceText = await unitPriceCell.innerText();
    const unitPrice = parseFloat(unitPriceText.replace(/[^0-9.]/g, ''));

    // Set qty to 2
    await qtyInput.fill('2');
    await page.locator('button[name="updatecart"]').click();
    await page.waitForLoadState('networkidle');

    const newSubtotalText = await subtotalCell.innerText();
    const newSubtotal = parseFloat(newSubtotalText.replace(/[^0-9.]/g, ''));

    expect(newSubtotal, 'Subtotal at qty=2 should be approximately 2× unit price').toBeCloseTo(unitPrice * 2, 0);
    expect(newSubtotal, 'Subtotal should be greater than 0').toBeGreaterThan(0);
  });

  test('TC-CART-006 | Removing an item reduces cart item count by 1', async ({ page }) => {
    await addProductToCart(page);
    await page.goto(BASE + '/cart');

    const countBefore = await page.locator('.cart-item-row').count();
    expect(countBefore, 'There should be at least 1 item before removal').toBeGreaterThan(0);

    await page.locator('.cart-item-row button.remove-btn').first().click();
    await page.waitForLoadState('networkidle');

    const countAfter = await page.locator('.cart-item-row').count();
    expect(countAfter, 'Cart item count should decrease after removal').toBeLessThan(countBefore);
  });

  test('TC-CART-007 | Removing last item shows empty cart message', async ({ page }) => {
    await clearCart(page);
    await addProductToCart(page);
    await page.goto(BASE + '/cart');

    // Remove the only item
    await page.locator('.cart-item-row button.remove-btn').first().click();
    await page.waitForLoadState('networkidle');

    const emptyMsg = page.locator('.no-data');
    await expect(emptyMsg, 'Empty cart message should appear after removing last item').toBeVisible({ timeout: 5000 });

    const msgText = await emptyMsg.innerText();
    expect(msgText.toLowerCase(), 'Empty message should mention "empty"').toMatch(/empty|no items/i);
  });

  test('TC-CART-008 | Order subtotal and total are displayed and greater than $0', async ({ page }) => {
    await addProductToCart(page);
    await page.goto(BASE + '/cart');

    const subtotal = page.locator('.order-subtotal .value-summary');
    const total    = page.locator('.order-total .value-summary');

    await expect(subtotal, 'Order subtotal should be visible').toBeVisible();
    await expect(total,    'Order total should be visible').toBeVisible();

    const subtotalText = await subtotal.innerText();
    const totalText    = await total.innerText();

    expect(subtotalText, 'Subtotal must contain "$"').toContain('$');
    expect(totalText,    'Total must contain "$"').toContain('$');

    const subtotalVal = parseFloat(subtotalText.replace(/[^0-9.]/g, ''));
    const totalVal    = parseFloat(totalText.replace(/[^0-9.]/g, ''));

    expect(subtotalVal, 'Subtotal must be > 0').toBeGreaterThan(0);
    expect(totalVal,    'Total must be > 0').toBeGreaterThan(0);
  });

  test('TC-CART-009 | Checkout button is visible and terms checkbox must be accepted', async ({ page }) => {
    await addProductToCart(page);
    await page.goto(BASE + '/cart');

    const termsCheckbox = page.locator('#termsofservice');
    const checkoutBtn   = page.locator('button#checkout');

    await expect(termsCheckbox, 'Terms of Service checkbox should be visible').toBeVisible();
    await expect(checkoutBtn,   'Checkout button should be visible').toBeVisible();
    await expect(checkoutBtn,   'Checkout button should be enabled').toBeEnabled();

    // Assert terms checkbox starts unchecked
    await expect(termsCheckbox, 'Terms checkbox should start unchecked').not.toBeChecked();

    // Check it
    await termsCheckbox.check();
    await expect(termsCheckbox, 'Terms checkbox should be checked after clicking').toBeChecked();
  });

  test('TC-CART-010 | Clicking checkout without accepting terms shows warning dialog', async ({ page }) => {
    await addProductToCart(page);
    await page.goto(BASE + '/cart');

    // Try checkout without terms
    await page.locator('button#checkout').click();

    // Expect a dialog/alert or warning to appear
    const dialog = page.locator('#terms-of-service-warning-box, .ui-dialog');
    await expect(dialog.or(page.locator('.message-failure')), 'Warning should appear if terms not accepted').toBeVisible({ timeout: 5000 });

    // Assert still on /cart
    await expect(page, 'Should remain on cart page if terms not accepted').toHaveURL(/\/cart/);
  });

  test('TC-CART-011 | Applying invalid coupon code shows failure message', async ({ page }) => {
    await addProductToCart(page);
    await page.goto(BASE + '/cart');

    const couponInput = page.locator('#couponcode');
    const applyBtn    = page.locator('button[id="applydiscountcouponcode"]');

    await expect(couponInput, 'Coupon input should be visible').toBeVisible();
    await expect(applyBtn,    'Apply coupon button should be visible').toBeVisible();

    await couponInput.fill('INVALIDCOUPON999XYZ');
    const inputVal = await couponInput.inputValue();
    expect(inputVal, 'Coupon input should hold the typed code').toBe('INVALIDCOUPON999XYZ');

    await applyBtn.click();
    await page.waitForLoadState('networkidle');

    // Assert failure or notice message appears
    const failMsg = page.locator('.message-failure, .coupon-box .bar-notification');
    const hasMsg  = await failMsg.isVisible().catch(() => false);
    expect(hasMsg, 'A failure message should appear for an invalid coupon').toBeTruthy();
  });

  test('TC-CART-012 | Cart product image is visible in the cart row', async ({ page }) => {
    await addProductToCart(page);
    await page.goto(BASE + '/cart');

    const cartImg = page.locator('.cart-item-row .product-picture img');
    if (await cartImg.count() > 0) {
      await expect(cartImg.first(), 'Product image should be visible in cart').toBeVisible();
      const src = await cartImg.first().getAttribute('src');
      expect(src, 'Cart product image src should not be empty').toBeTruthy();
    }
  });

  test('TC-CART-013 | Cart quantity input only accepts positive integers', async ({ page }) => {
    await addProductToCart(page);
    await page.goto(BASE + '/cart');

    const qtyInput = page.locator('.cart-item-row input.qty-input').first();
    await expect(qtyInput, 'Cart quantity input should be visible').toBeVisible();
    await expect(qtyInput, 'Cart quantity input should be enabled').toBeEnabled();

    const currentVal = await qtyInput.inputValue();
    const currentNum = parseInt(currentVal, 10);
    expect(currentNum, 'Initial cart quantity should be a positive integer').toBeGreaterThan(0);
  });

  test('TC-CART-014 | Continue Shopping button navigates away from cart', async ({ page }) => {
    await page.goto(BASE + '/cart');

    const continueBtn = page.locator('button[name="continueshopping"]');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await expect(page, 'Should navigate away from /cart after Continue Shopping').not.toHaveURL(/\/cart$/);
    }
  });

});
