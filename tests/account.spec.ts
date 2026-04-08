// tests/account.spec.ts
// Each test has multiple specific expect() assertions.

import { test, expect, Page } from '@playwright/test';

const BASE           = 'https://demo.nopcommerce.com';
const VALID_EMAIL    = 'admin@yourstore.com';
const VALID_PASSWORD = 'admin';

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto(BASE + '/login');
  await page.locator('#Email').fill(VALID_EMAIL);
  await page.locator('#Password').fill(VALID_PASSWORD);
  await page.locator('button[value="login"]').click();
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
}

test.describe('User Account – Guest Redirect Behaviour', () => {

  test('TC-ACC-001 | Accessing /customer/info without login redirects to /login', async ({ page }) => {
    await page.goto(BASE + '/customer/info');

    await expect(page, 'Guest should be redirected to /login').toHaveURL(/\/login/);
    await expect(page.locator('#Email'),    'Login form email field should be present').toBeVisible();
    await expect(page.locator('#Password'), 'Login form password field should be present').toBeVisible();
  });

  test('TC-ACC-002 | Accessing /order/history without login redirects to /login', async ({ page }) => {
    await page.goto(BASE + '/order/history');

    await expect(page, 'Guest should be redirected to /login for order history').toHaveURL(/\/login/);
    await expect(page.locator('button[value="login"]'), 'Login button should be visible').toBeVisible();
  });

  test('TC-ACC-003 | Accessing /customer/addresses without login redirects to /login', async ({ page }) => {
    await page.goto(BASE + '/customer/addresses');

    await expect(page, 'Guest should be redirected to /login for addresses').toHaveURL(/\/login/);
    await expect(page.locator('#Email'), 'Email field should be visible on login page').toBeVisible();
  });

  test('TC-ACC-004 | Accessing /customer/changepassword without login redirects to /login', async ({ page }) => {
    await page.goto(BASE + '/customer/changepassword');

    await expect(page, 'Guest should be redirected to /login for password change').toHaveURL(/\/login/);
  });

});

test.describe('User Account – Authenticated', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('TC-ACC-005 | My Account page loads with correct URL and sidebar navigation', async ({ page }) => {
    await page.goto(BASE + '/customer/info');

    await expect(page, 'URL should be /customer/info').toHaveURL(/\/customer\/info$/);

    const sidebar = page.locator('.block-account-navigation');
    await expect(sidebar, 'Account sidebar navigation should be visible').toBeVisible();

    // Assert key sidebar links exist
    await expect(sidebar.locator('a[href="/customer/info"]'),    'Customer Info sidebar link').toBeVisible();
    await expect(sidebar.locator('a[href="/order/history"]'),    'Orders sidebar link').toBeVisible();
    await expect(sidebar.locator('a[href="/customer/addresses"]'), 'Addresses sidebar link').toBeVisible();
  });

  test('TC-ACC-006 | Customer info form fields are pre-filled and editable', async ({ page }) => {
    await page.goto(BASE + '/customer/info');

    const firstName = page.locator('#FirstName');
    const lastName  = page.locator('#LastName');
    const email     = page.locator('#Email');

    await expect(firstName, 'First name field should be visible').toBeVisible();
    await expect(lastName,  'Last name field should be visible').toBeVisible();
    await expect(email,     'Email field should be visible').toBeVisible();

    await expect(firstName, 'First name should be enabled/editable').toBeEnabled();
    await expect(lastName,  'Last name should be enabled/editable').toBeEnabled();

    // Assert fields are pre-filled (admin user should have a name)
    const firstVal = await firstName.inputValue();
    const lastVal  = await lastName.inputValue();
    expect(firstVal.trim().length, 'First name should be pre-filled for admin').toBeGreaterThan(0);
    expect(lastVal.trim().length,  'Last name should be pre-filled for admin').toBeGreaterThan(0);
  });

  test('TC-ACC-007 | Saving customer info with empty first name shows validation error', async ({ page }) => {
    await page.goto(BASE + '/customer/info');

    await page.locator('#FirstName').fill('');
    await page.locator('button.save-customer-info-button').click();

    const error = page.locator('#FirstName-error');
    await expect(error, 'First name validation error should appear').toBeVisible({ timeout: 6000 });
    const errorText = await error.innerText();
    expect(errorText.trim().length, 'Error text should not be empty').toBeGreaterThan(0);
  });

  test('TC-ACC-008 | Save customer info with valid data shows success notification', async ({ page }) => {
    await page.goto(BASE + '/customer/info');

    // Read current value and re-save as-is
    const currentFirst = await page.locator('#FirstName').inputValue();
    expect(currentFirst.trim().length, 'First name should have a value before saving').toBeGreaterThan(0);

    await page.locator('button.save-customer-info-button').click();

    const notification = page.locator('.bar-notification, .result');
    await expect(notification.first(), 'Success notification should appear after save').toBeVisible({ timeout: 8000 });

    const notifText = await notification.first().innerText();
    expect(notifText.trim().length, 'Notification text should not be empty').toBeGreaterThan(0);
  });

  test('TC-ACC-009 | Order history page loads and shows orders or empty state', async ({ page }) => {
    await page.goto(BASE + '/order/history');

    await expect(page, 'URL should be /order/history').toHaveURL(/\/order\/history$/);
    await expect(page.locator('.page-title'), 'Order history page title should be visible').toBeVisible();

    const hasOrders = (await page.locator('.order-item').count()) > 0;
    const hasEmpty  = await page.locator('.no-data').isVisible().catch(() => false);

    expect(hasOrders || hasEmpty, 'Order history should show orders or empty state message').toBeTruthy();
  });

  test('TC-ACC-010 | Addresses page loads with correct URL and add-new option', async ({ page }) => {
    await page.goto(BASE + '/customer/addresses');

    await expect(page, 'URL should be /customer/addresses').toHaveURL(/\/customer\/addresses$/);
    await expect(page.locator('.page-title'), 'Addresses page title should be visible').toBeVisible();

    const addNewBtn = page.locator('a[href="/customer/addresses/add"], .add-address-button');
    await expect(addNewBtn, 'Add new address button/link should be visible').toBeVisible();
  });

  test('TC-ACC-011 | Add new address form has all required fields', async ({ page }) => {
    await page.goto(BASE + '/customer/addresses/add');

    await expect(page.locator('#Address_FirstName'),   'Address first name field').toBeVisible({ timeout: 8000 });
    await expect(page.locator('#Address_LastName'),    'Address last name field').toBeVisible();
    await expect(page.locator('#Address_Email'),       'Address email field').toBeVisible();
    await expect(page.locator('#Address_CountryId'),   'Country dropdown').toBeVisible();
    await expect(page.locator('#Address_City'),        'City field').toBeVisible();
    await expect(page.locator('#Address_Address1'),    'Address line 1 field').toBeVisible();
    await expect(page.locator('#Address_ZipPostalCode'), 'ZIP/Postal code field').toBeVisible();
    await expect(page.locator('#Address_PhoneNumber'), 'Phone number field').toBeVisible();
  });

  test('TC-ACC-012 | Change password page has correct fields and submit button', async ({ page }) => {
    await page.goto(BASE + '/customer/changepassword');

    await expect(page, 'URL should be /customer/changepassword').toHaveURL(/\/customer\/changepassword$/);

    const oldPwField    = page.locator('#OldPassword');
    const newPwField    = page.locator('#NewPassword');
    const confirmPwField = page.locator('#ConfirmNewPassword');
    const submitBtn      = page.locator('button.change-password-button');

    await expect(oldPwField,    'Old password field should be visible').toBeVisible();
    await expect(newPwField,    'New password field should be visible').toBeVisible();
    await expect(confirmPwField,'Confirm new password field should be visible').toBeVisible();
    await expect(submitBtn,     'Change password submit button should be visible').toBeVisible();
    await expect(submitBtn,     'Change password button should be enabled').toBeEnabled();

    // Assert all password fields are of type "password"
    expect(await oldPwField.getAttribute('type'),     'Old password type should be "password"').toBe('password');
    expect(await newPwField.getAttribute('type'),     'New password type should be "password"').toBe('password');
    expect(await confirmPwField.getAttribute('type'), 'Confirm password type should be "password"').toBe('password');
  });

  test('TC-ACC-013 | Change password with mismatched new passwords shows validation error', async ({ page }) => {
    await page.goto(BASE + '/customer/changepassword');

    await page.locator('#OldPassword').fill(VALID_PASSWORD);
    await page.locator('#NewPassword').fill('NewPass@2024!');
    await page.locator('#ConfirmNewPassword').fill('DifferentPass@9999!');
    await page.locator('button.change-password-button').click();

    const error = page.locator('#ConfirmNewPassword-error');
    await expect(error, 'Confirm password mismatch error should appear').toBeVisible({ timeout: 6000 });
    const errorText = await error.innerText();
    expect(errorText.toLowerCase(), 'Error should mention password match').toMatch(/match|same/i);

    await expect(page, 'Should remain on change-password page').toHaveURL(/\/changepassword/);
  });

  test('TC-ACC-014 | Downloadable products page is accessible', async ({ page }) => {
    await page.goto(BASE + '/customer/downloadableproducts');

    await expect(page, 'URL should be /customer/downloadableproducts').toHaveURL(/\/downloadableproducts/);
    await expect(page.locator('.page-title'), 'Page title should be visible').toBeVisible();
  });

  test('TC-ACC-015 | Logged-in header shows My Account and Logout (not Register/Login)', async ({ page }) => {
    await page.goto(BASE + '/');

    const logoutLink   = page.locator('a[href="/logout"]');
    const myAcctLink   = page.locator('a[href="/customer/info"]');
    const registerLink = page.locator('.header-links a[href="/register"]');
    const loginLink    = page.locator('.header-links a[href="/login"]');

    // Logged-in state
    const hasLogout  = await logoutLink.isVisible().catch(() => false);
    const hasMyAcct  = await myAcctLink.isVisible().catch(() => false);
    expect(hasLogout || hasMyAcct, 'Logout or My Account link should be visible when logged in').toBeTruthy();

    // Guest-only links should NOT be visible
    await expect(registerLink, 'Register link should NOT be visible when logged in').not.toBeVisible();
    await expect(loginLink,    'Login link should NOT be visible when logged in').not.toBeVisible();
  });

});
