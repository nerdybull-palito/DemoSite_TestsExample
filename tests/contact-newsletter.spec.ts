// tests/contact-newsletter.spec.ts
// Each test has multiple specific expect() assertions.

import { test, expect } from '@playwright/test';

const BASE = 'https://demo.nopcommerce.com';

test.describe('Contact Us Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/contactus');
  });

  test('TC-CONT-001 | Contact Us page loads with correct URL, title, and heading', async ({ page }) => {
    await expect(page, 'URL should be /contactus').toHaveURL(/\/contactus$/);
    await expect(page, 'Title should include brand name').toHaveTitle(/nopCommerce/i);
    await expect(page.locator('.page-title h1'), 'Heading should say "Contact us"').toContainText('Contact us');

    const breadcrumb = page.locator('.breadcrumb');
    await expect(breadcrumb, 'Breadcrumb should be visible').toBeVisible();
    await expect(breadcrumb, 'Breadcrumb should contain Home').toContainText('Home');
    await expect(breadcrumb, 'Breadcrumb should contain Contact us').toContainText('Contact us');
  });

  test('TC-CONT-002 | Contact form has all required fields visible and enabled', async ({ page }) => {
    const nameField    = page.locator('#FullName');
    const emailField   = page.locator('#Email');
    const messageField = page.locator('#Enquiry');
    const submitBtn    = page.locator('button.contact-us-button');

    await expect(nameField,    'Full name field should be visible').toBeVisible();
    await expect(emailField,   'Email field should be visible').toBeVisible();
    await expect(messageField, 'Enquiry/message field should be visible').toBeVisible();
    await expect(submitBtn,    'Submit button should be visible').toBeVisible();

    await expect(nameField,    'Full name field should be enabled').toBeEnabled();
    await expect(emailField,   'Email field should be enabled').toBeEnabled();
    await expect(messageField, 'Message field should be enabled').toBeEnabled();
    await expect(submitBtn,    'Submit button should be enabled').toBeEnabled();

    const submitText = await submitBtn.innerText();
    expect(submitText.trim().length, 'Submit button should have text').toBeGreaterThan(0);
  });

  test('TC-CONT-003 | Submitting blank form shows validation errors on all required fields', async ({ page }) => {
    await page.locator('button.contact-us-button').click();

    await expect(page.locator('#FullName-error'), 'Full name error should appear').toBeVisible({ timeout: 5000 });
    await expect(page.locator('#Email-error'),    'Email error should appear').toBeVisible();
    await expect(page.locator('#Enquiry-error'),  'Enquiry error should appear').toBeVisible();

    // Assert page remains on /contactus
    await expect(page, 'Should remain on /contactus after failed submit').toHaveURL(/\/contactus/);
  });

  test('TC-CONT-004 | Blank full name shows name-specific validation error', async ({ page }) => {
    await page.locator('#Email').fill('test@test.com');
    await page.locator('#Enquiry').fill('Test message body that is long enough.');
    await page.locator('button.contact-us-button').click();

    const nameError = page.locator('#FullName-error');
    await expect(nameError, 'Full name error should appear when name is blank').toBeVisible();
    const errorText = await nameError.innerText();
    expect(errorText.trim().length, 'Name error message should not be empty').toBeGreaterThan(0);
  });

  test('TC-CONT-005 | Invalid email format shows email validation error', async ({ page }) => {
    await page.locator('#FullName').fill('Test User');
    await page.locator('#Email').fill('notvalid@@email');
    await page.locator('#Enquiry').fill('Test message body.');
    await page.locator('button.contact-us-button').click();

    const emailError = page.locator('#Email-error');
    await expect(emailError, 'Email format error should appear').toBeVisible();
    const errorText = await emailError.innerText();
    expect(errorText.trim().length, 'Email error text should not be empty').toBeGreaterThan(0);

    await expect(page, 'Should remain on /contactus').toHaveURL(/\/contactus/);
  });

  test('TC-CONT-006 | Blank message field shows enquiry validation error', async ({ page }) => {
    await page.locator('#FullName').fill('Test User');
    await page.locator('#Email').fill('test@test.com');
    // Leave #Enquiry blank
    await page.locator('button.contact-us-button').click();

    const enquiryError = page.locator('#Enquiry-error');
    await expect(enquiryError, 'Enquiry/message error should appear when blank').toBeVisible();
    const errorText = await enquiryError.innerText();
    expect(errorText.trim().length, 'Enquiry error text should not be empty').toBeGreaterThan(0);
  });

  test('TC-CONT-007 | Valid submission shows success result message', async ({ page }) => {
    await page.locator('#FullName').fill('Playwright AutoTester');
    await page.locator('#Email').fill('autotest@playwright.com');
    await page.locator('#Enquiry').fill('This is an automated test enquiry submitted via Playwright. Please disregard this message.');

    await page.locator('button.contact-us-button').click();

    const result = page.locator('.result');
    await expect(result, 'Result/success message should appear').toBeVisible({ timeout: 10000 });

    const resultText = await result.innerText();
    expect(resultText.trim().length, 'Success message should not be empty').toBeGreaterThan(0);
    expect(resultText.toLowerCase(), 'Success message should confirm enquiry was sent').toMatch(/sent|submitted|success|enquiry/i);
  });

  test('TC-CONT-008 | Form fields accept and retain long input values', async ({ page }) => {
    const longName    = 'A'.repeat(100);
    const longMessage = 'B'.repeat(500);

    await page.locator('#FullName').fill(longName);
    await page.locator('#Enquiry').fill(longMessage);

    const nameVal    = await page.locator('#FullName').inputValue();
    const messageVal = await page.locator('#Enquiry').inputValue();

    expect(nameVal.length,    'Long name should be retained in the input').toBeGreaterThan(50);
    expect(messageVal.length, 'Long message should be retained in the textarea').toBeGreaterThan(100);
  });

  test('TC-CONT-009 | Email field has correct input type for browser validation', async ({ page }) => {
    const emailType = await page.locator('#Email').getAttribute('type');
    expect(['email', 'text'], 'Email field type should be "email" or "text"').toContain(emailType);
  });

});

test.describe('Newsletter Subscription (Footer)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/');
  });

  test('TC-NEWS-001 | Newsletter section is present with visible input and button', async ({ page }) => {
    const input  = page.locator('#newsletter-email');
    const button = page.locator('#newsletter-subscribe-button');

    await expect(input,  'Newsletter email input should be visible').toBeVisible();
    await expect(button, 'Subscribe button should be visible').toBeVisible();
    await expect(button, 'Subscribe button should be enabled').toBeEnabled();

    const btnText = await button.innerText();
    expect(btnText.trim().length, 'Subscribe button should have label text').toBeGreaterThan(0);
  });

  test('TC-NEWS-002 | Valid email subscription returns success message', async ({ page }) => {
    const uniqueEmail = `pw_news_${Date.now()}@autotest.dev`;

    await page.locator('#newsletter-email').fill(uniqueEmail);
    const filledValue = await page.locator('#newsletter-email').inputValue();
    expect(filledValue, 'Newsletter input should hold the typed email').toBe(uniqueEmail);

    await page.locator('#newsletter-subscribe-button').click();

    const result = page.locator('#newsletter-result-block');
    await expect(result, 'Result block should appear').toBeVisible({ timeout: 8000 });

    const resultText = await result.innerText();
    expect(resultText.trim().length, 'Result text should not be empty').toBeGreaterThan(0);
    expect(resultText.toLowerCase(), 'Success result should say "thank you"').toContain('thank you');
  });

  test('TC-NEWS-003 | Invalid email shows error and does NOT say "thank you"', async ({ page }) => {
    await page.locator('#newsletter-email').fill('bademail@@nohost');
    await page.locator('#newsletter-subscribe-button').click();

    const result = page.locator('#newsletter-result-block');
    await expect(result, 'Result block should appear for invalid email').toBeVisible({ timeout: 6000 });

    const resultText = await result.innerText();
    expect(resultText.trim().length, 'Error result text should not be empty').toBeGreaterThan(0);
    expect(resultText.toLowerCase(), 'Error result should NOT say "thank you"').not.toContain('thank you');
  });

  test('TC-NEWS-004 | Empty email submission shows error message', async ({ page }) => {
    await page.locator('#newsletter-email').fill('');
    await page.locator('#newsletter-subscribe-button').click();

    const result = page.locator('#newsletter-result-block');
    await expect(result, 'Result block should appear for empty email submission').toBeVisible({ timeout: 6000 });

    const resultText = await result.innerText();
    expect(resultText.trim().length, 'Empty-submit error text should not be blank').toBeGreaterThan(0);
    expect(resultText.toLowerCase(), 'Empty-submit should NOT show "thank you"').not.toContain('thank you');
  });

});
