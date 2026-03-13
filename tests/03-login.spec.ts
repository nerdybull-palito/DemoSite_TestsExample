// tests/03-login.spec.ts
// Each test has multiple specific expect() assertions.

import { test, expect } from '@playwright/test';

const BASE           = 'https://demo.nopcommerce.com';
const VALID_EMAIL    = 'admin@yourstore.com';
const VALID_PASSWORD = 'admin';

test.describe('User Login & Logout', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/login');
  });

  test('TC-LOGIN-001 | Login page loads with correct URL, title, and form', async ({ page }) => {
    await expect(page, 'URL should be /login').toHaveURL(/\/login$/);
    await expect(page, 'Title should include nopCommerce').toHaveTitle(/nopCommerce/i);

    await expect(page.locator('#Email'),              'Email input should be visible').toBeVisible();
    await expect(page.locator('#Password'),           'Password input should be visible').toBeVisible();
    await expect(page.locator('button[value="login"]'), 'Login button should be visible').toBeVisible();
    await expect(page.locator('button[value="login"]'), 'Login button should be enabled').toBeEnabled();

    // Assert password field is of type password (masks input)
    const pwType = await page.locator('#Password').getAttribute('type');
    expect(pwType, 'Password field type should be "password"').toBe('password');
  });

  test('TC-LOGIN-002 | Valid credentials log user in and redirect away from /login', async ({ page }) => {
    await page.locator('#Email').fill(VALID_EMAIL);
    await page.locator('#Password').fill(VALID_PASSWORD);
    await page.locator('button[value="login"]').click();

    // Assert redirect away from login
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
    expect(page.url(), 'Should not be on /login after successful login').not.toContain('/login');

    // Assert authenticated state (logout or my account link appears)
    const logoutVisible    = await page.locator('a[href="/logout"]').isVisible().catch(() => false);
    const myAccountVisible = await page.locator('a[href="/customer/info"]').isVisible().catch(() => false);
    expect(logoutVisible || myAccountVisible, 'Logout or My Account link should be visible after login').toBeTruthy();
  });

  test('TC-LOGIN-003 | Wrong password shows credential error message', async ({ page }) => {
    await page.locator('#Email').fill(VALID_EMAIL);
    await page.locator('#Password').fill('totallyWrongPassword999!');
    await page.locator('button[value="login"]').click();

    const errorBlock = page.locator('.message-error.validation-summary-errors');
    await expect(errorBlock, 'Error block should appear for wrong password').toBeVisible({ timeout: 6000 });

    const errorText = await errorBlock.innerText();
    expect(errorText.trim().length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(errorText.toLowerCase(), 'Error should indicate invalid credentials').toMatch(/credentials|incorrect|no customer/i);

    // Assert still on /login
    await expect(page, 'Should remain on /login page after failed login').toHaveURL(/\/login/);
  });

  test('TC-LOGIN-004 | Unregistered email shows credential error', async ({ page }) => {
    await page.locator('#Email').fill('nobody_exists_here_xyz@fake.com');
    await page.locator('#Password').fill('SomePass@123');
    await page.locator('button[value="login"]').click();

    const errorBlock = page.locator('.message-error.validation-summary-errors');
    await expect(errorBlock, 'Error block should appear for unregistered email').toBeVisible({ timeout: 6000 });

    const errorText = await errorBlock.innerText();
    expect(errorText.trim().length, 'Error message should not be empty').toBeGreaterThan(0);

    await expect(page, 'Should remain on /login').toHaveURL(/\/login/);
  });

  test('TC-LOGIN-005 | Blank email field shows validation error', async ({ page }) => {
    await page.locator('#Password').fill('SomePass@123');
    await page.locator('button[value="login"]').click();

    const emailError = page.locator('#Email-error');
    await expect(emailError, 'Email validation error should appear').toBeVisible();
    const errorText = await emailError.innerText();
    expect(errorText.trim().length, 'Email error text should not be empty').toBeGreaterThan(0);
  });

  test('TC-LOGIN-006 | Blank password field shows validation error', async ({ page }) => {
    await page.locator('#Email').fill(VALID_EMAIL);
    await page.locator('button[value="login"]').click();

    const passwordError = page.locator('#Password-error');
    await expect(passwordError, 'Password validation error should appear').toBeVisible();
    const errorText = await passwordError.innerText();
    expect(errorText.trim().length, 'Password error text should not be empty').toBeGreaterThan(0);
  });

  test('TC-LOGIN-007 | Invalid email format shows validation error', async ({ page }) => {
    await page.locator('#Email').fill('notanemail!!');
    await page.locator('#Password').fill('SomePass@123');
    await page.locator('button[value="login"]').click();

    const emailError = page.locator('#Email-error');
    await expect(emailError, 'Email format validation error should appear').toBeVisible();
    await expect(page, 'Should remain on /login page').toHaveURL(/\/login/);
  });

  test('TC-LOGIN-008 | Blank login form shows errors on both required fields', async ({ page }) => {
    await page.locator('button[value="login"]').click();

    const emailError = page.locator('#Email-error');
    await expect(emailError, 'Email error should appear when both fields blank').toBeVisible();

    // Assert page stays on login
    await expect(page, 'Should remain on /login').toHaveURL(/\/login/);
  });

  test('TC-LOGIN-009 | Remember Me checkbox is visible and checkable', async ({ page }) => {
    const rememberMe = page.locator('#RememberMe');
    await expect(rememberMe, 'Remember Me checkbox should be visible').toBeVisible();

    await rememberMe.check();
    await expect(rememberMe, 'Remember Me should be checked after clicking').toBeChecked();

    await rememberMe.uncheck();
    await expect(rememberMe, 'Remember Me should be unchecked after unchecking').not.toBeChecked();
  });

  test('TC-LOGIN-010 | Forgot password link navigates to password recovery page', async ({ page }) => {
    const forgotLink = page.locator('.forgot-password a');
    await expect(forgotLink, 'Forgot password link should be visible').toBeVisible();

    await forgotLink.click();
    await expect(page, 'Should navigate to /passwordrecovery').toHaveURL(/\/passwordrecovery/);
    await expect(page.locator('#Email'), 'Email field should appear on recovery page').toBeVisible();
  });

  test('TC-LOGIN-011 | Password recovery accepts valid email and shows confirmation', async ({ page }) => {
    await page.goto(BASE + '/passwordrecovery');

    await expect(page.locator('#Email'), 'Email field should be on recovery page').toBeVisible();
    await page.locator('#Email').fill(VALID_EMAIL);
    await page.locator('button.password-recovery-button').click();

    const result = page.locator('.result');
    await expect(result, 'Recovery result/confirmation should appear').toBeVisible({ timeout: 8000 });
    const resultText = await result.innerText();
    expect(resultText.trim().length, 'Recovery confirmation text should not be empty').toBeGreaterThan(0);
  });

  test('TC-LOGIN-012 | Login page has a link back to Register page', async ({ page }) => {
    const registerLinks = page.locator('a[href="/register"]');
    const count = await registerLinks.count();
    expect(count, 'At least one Register link should exist on login page').toBeGreaterThan(0);

    await registerLinks.first().click();
    await expect(page, 'Should navigate to /register from login page').toHaveURL(/\/register$/);
  });

  test('TC-LOGIN-013 | Successful login and logout restores guest header state', async ({ page }) => {
    // Login
    await page.locator('#Email').fill(VALID_EMAIL);
    await page.locator('#Password').fill(VALID_PASSWORD);
    await page.locator('button[value="login"]').click();
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });

    // Logout
    const logoutLink = page.locator('a[href="/logout"]');
    if (await logoutLink.isVisible()) {
      await logoutLink.click();
      await expect(page, 'After logout URL should be homepage').toHaveURL(/demo\.nopcommerce\.com\/?$/);

      // Assert Register and Login links are back (guest state)
      await expect(page.locator('.header-links a[href="/register"]'), 'Register link should reappear after logout').toBeVisible();
      await expect(page.locator('.header-links a[href="/login"]'),    'Login link should reappear after logout').toBeVisible();

      // Assert Logout link is gone
      await expect(page.locator('a[href="/logout"]'), 'Logout link should be gone after logout').not.toBeVisible();
    }
  });

  test('TC-LOGIN-014 | Login with correct credentials allows cart access', async ({ page }) => {
    await page.locator('#Email').fill(VALID_EMAIL);
    await page.locator('#Password').fill(VALID_PASSWORD);
    await page.locator('button[value="login"]').click();
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });

    // Navigate to cart — should NOT redirect back to login
    await page.goto(BASE + '/cart');
    await expect(page, 'Logged-in user should be able to access /cart').toHaveURL(/\/cart$/);
    await expect(page.locator('.page-title, .order-summary-content'), 'Cart page content should be visible').toBeVisible();
  });

});
