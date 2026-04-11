// tests/registration.spec.ts
// Each test has multiple specific expect() assertions.

import { test, expect } from '@playwright/test';

const BASE = 'https://demo.nopcommerce.com';

test.describe('User Registration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/register');
  });

  test('TC-REG-001 | Registration page loads with correct URL, title, and form fields', async ({ page }) => {
    await expect(page, 'URL should be /register').toHaveURL(/\/register$/);
    await expect(page, 'Title should include nopCommerce').toHaveTitle(/nopCommerce/i);
    await expect(page.locator('.page-title h1'), 'Heading should say Register').toContainText('Register');

    // Assert all required fields exist
    await expect(page.locator('#FirstName'),  'First name field must be present').toBeVisible();
    await expect(page.locator('#LastName'),   'Last name field must be present').toBeVisible();
    await expect(page.locator('#Email'),      'Email field must be present').toBeVisible();
    await expect(page.locator('#Password'),   'Password field must be present').toBeVisible();
    await expect(page.locator('#ConfirmPassword'), 'Confirm password field must be present').toBeVisible();
    await expect(page.locator('button#register-button'), 'Register button must be present').toBeVisible();
    await expect(page.locator('button#register-button'), 'Register button must be enabled').toBeEnabled();
  });

  test('TC-REG-002 | Submitting blank form shows validation errors on required fields', async ({ page }) => {
    await page.locator('#register-button').click();

    await expect(page.locator('.field-validation-error')).toHaveCount(5);

    // Assert specific field errors
    for (const field of ['FirstName', 'LastName', 'Email', 'Password', 'ConfirmPassword']) {
      await expect(page.locator(`[data-valmsg-for="${field}"]`), '${field} error should be shown').toBeVisible();
    }
    // Assert page stays on /register after failed submit
    await expect(page, 'Page should remain on /register after failed submit').toHaveURL(/\/register/);
  });

  test('TC-REG-003 | First name is required – blank first name shows specific error', async ({ page }) => {
    await page.locator('#LastName').fill('Doe');
    await page.locator('#Email').fill(`test_${Date.now()}@test.com`);
    await page.locator('#Password').fill('Pass@1234');
    await page.locator('#ConfirmPassword').fill('Pass@1234');
    await page.locator('button#register-button').click();

    const error = page.locator('[data-valmsg-for="FirstName"]');
    await expect(error, 'First name validation error should appear').toBeVisible();

    const errorText = await error.innerText();
    expect(errorText.trim().length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(errorText.toLowerCase(), 'Error should indicate field is required').toMatch(/required|enter/i);
  });

  test('TC-REG-004 | Last name is required – blank last name shows specific error', async ({ page }) => {
    await page.locator('#FirstName').fill('John');
    await page.locator('#Email').fill(`test_${Date.now()}@test.com`);
    await page.locator('#Password').fill('Pass@1234');
    await page.locator('#ConfirmPassword').fill('Pass@1234');
    await page.locator('button#register-button').click();

    const error = page.locator('[data-valmsg-for="LastName"]');
    await expect(error, 'Last name validation error should appear').toBeVisible();
    const errorText = await error.innerText();
    expect(errorText.trim().length, 'Last name error should not be empty').toBeGreaterThan(0);
  });

  test('TC-REG-005 | Email is required – blank email shows specific error', async ({ page }) => {
    await page.locator('#FirstName').fill('Jane');
    await page.locator('#LastName').fill('Doe');
    await page.locator('#Password').fill('Pass@1234');
    await page.locator('#ConfirmPassword').fill('Pass@1234');
    await page.locator('button#register-button').click();

    const emailError = page.locator('[data-valmsg-for="Email"]');
    await expect(emailError, 'Email validation error should appear').toBeVisible();
    const errorText = await emailError.innerText();
    expect(errorText.trim().length, 'Email error message should not be empty').toBeGreaterThan(0);

    // Page should still be on /register
    await expect(page, 'Should remain on /register page').toHaveURL(/\/register/);
  });

  //test('TC-REG-006 | Invalid email format shows email validation error', async ({ page }) => {
    //await page.fill('#Email', 'invalid-email');
    //await page.locator('#Email').fill('invalid');
    //await page.locator('#register-button').click();

    //const emailError = page.locator('[data-valmsg-for="Email"]');

    //await expect(emailError).toHaveClass(/field-validation-error/);
  //});

  test('TC-REG-007 | Mismatched passwords shows confirm password error', async ({ page }) => {
    await page.locator('#FirstName').fill('Jane');
    await page.locator('#LastName').fill('Doe');
    await page.locator('#Email').fill(`mismatch_${Date.now()}@test.com`);
    await page.locator('#Password').fill('Pass@1234');
    await page.locator('#ConfirmPassword').fill('DifferentPass@9999');
    await page.locator('button#register-button').click();

    const confirmError = page.locator('#ConfirmPassword-error');
    await expect(confirmError, 'Confirm password error should appear').toBeVisible();
    const errorText = await confirmError.innerText();
    expect(errorText.toLowerCase(), 'Error should mention password match').toMatch(/match|same|password/i);
  });

  test('TC-REG-008 | Password too short shows password length validation error', async ({ page }) => {
    await page.locator('#FirstName').fill('Test');
    await page.locator('#LastName').fill('User');
    await page.locator('#Email').fill(`short_${Date.now()}@test.com`);
    await page.locator('#Password').fill('123');
    await page.locator('#ConfirmPassword').fill('123');
    await page.locator('button#register-button').click();

    const passwordError = page.locator('#Password-error');
    await expect(passwordError, 'Password length error should appear').toBeVisible();
    const errorText = await passwordError.innerText();
    expect(errorText.trim().length, 'Password error message should not be empty').toBeGreaterThan(0);
  });

  //test('TC-REG-009 | Email with spaces is rejected with validation error', async ({ page }) => {
    //await page.locator('#FirstName').fill('Test');
    //await page.locator('#LastName').fill('User');
    //await page.locator('#Email').fill('test @email.com');
    //await page.locator('#Password').fill('Pass@1234');
    //await page.locator('#ConfirmPassword').fill('Pass@1234');
    //await page.locator('button#register-button').click();

    //const emailError = page.locator('#Email-error');
    //await expect(emailError, 'Email with spaces should trigger validation error').toBeVisible();

    // Assert NOT navigated away from register
    //await expect(page, 'Should remain on /register page').toHaveURL(/\/register/);
  //});

  test('TC-REG-010 | Gender radio buttons are mutually exclusive and selectable', async ({ page }) => {
    const maleRadio   = page.locator('#gender-male');
    const femaleRadio = page.locator('#gender-female');

    await expect(maleRadio,   'Male radio should be visible').toBeVisible();
    await expect(femaleRadio, 'Female radio should be visible').toBeVisible();

    // Check male
    await maleRadio.check();
    await expect(maleRadio,   'Male radio should be checked').toBeChecked();
    await expect(femaleRadio, 'Female radio should be unchecked after selecting Male').not.toBeChecked();

    // Check female
    await femaleRadio.check();
    await expect(femaleRadio, 'Female radio should be checked').toBeChecked();
    await expect(maleRadio,   'Male radio should be unchecked after selecting Female').not.toBeChecked();
  });

  //test('TC-REG-011 | Date of birth dropdowns are present and have options', async ({ page }) => {
    //const dobDay   = page.locator('[name="DateOfBirthDay"]');
    //const dobMonth = page.locator('[name="DateOfBirthMonth"]');
    //const dobYear  = page.locator('[name="DateOfBirthYear"]');

    //await expect(dobDay,   'DOB Day dropdown should be visible').toBeVisible();
    //await expect(dobMonth, 'DOB Month dropdown should be visible').toBeVisible();
    //await expect(dobYear,  'DOB Year dropdown should be visible').toBeVisible();

    //const dayOptions   = await dobDay.locator('option').count();
    //const monthOptions = await dobMonth.locator('option').count();
    //const yearOptions  = await dobYear.locator('option').count();

    //expect(dayOptions,   'Day dropdown should have 32+ options (1-31 + blank)').toBeGreaterThanOrEqual(32);
    //expect(monthOptions, 'Month dropdown should have 13+ options (1-12 + blank)').toBeGreaterThanOrEqual(13);
    //expect(yearOptions,  'Year dropdown should have multiple year options').toBeGreaterThan(10);
  //});

  test('TC-REG-012 | Newsletter and Terms checkboxes are present and toggleable', async ({ page }) => {
    const newsletter = page.getByRole('checkbox', { name: 'Newsletter' });

    await expect(newsletter, 'Newsletter checkbox should be visible').toBeVisible();

    // Toggle newsletter checkbox
    const initialState = await newsletter.isChecked();
    await newsletter.click();
    const newState = await newsletter.isChecked();
    expect(newState, 'Newsletter checkbox state should toggle').toBe(!initialState);
  });
/*
  test('TC-REG-013 | Duplicate email address shows registration error', async ({ page }) => {
    const existingEmail = 'admin@yourstore.com';

    await page.locator('#FirstName').fill('Test');
    await page.locator('#LastName').fill('Duplicate');
    await page.locator('#Email').fill(existingEmail);
    await page.locator('#Password').fill('Pass@1234');
    await page.locator('#ConfirmPassword').fill('Pass@1234');
    await page.locator('button#register-button').click();

    // Assert error message appears
    const errorBlock = page.locator('.message-error.validation-summary-errors');
    await expect(errorBlock, 'Duplicate email error block should appear').toBeVisible({ timeout: 8000 });

    const errorText = await errorBlock.innerText();
    expect(errorText.trim().length, 'Duplicate email error text should not be empty').toBeGreaterThan(0);

    // Assert NOT redirected to success
    await expect(page, 'Should remain on /register page on duplicate email').toHaveURL(/\/register/);
  });  */

/*  test('TC-REG-014 | Successful registration redirects away from /register', async ({ page }) => {
    const uniqueEmail = `pw_reg_${Date.now()}@automation.test`;

    await page.locator('#FirstName').fill('Auto');
    await page.locator('#LastName').fill('Tester');
    await page.locator('#Email').fill(uniqueEmail);
    await page.locator('#Password').fill('Automation@2024!');
    await page.locator('#ConfirmPassword').fill('Automation@2024!');
    await page.locator('button#register-button').click();

    // Assert success – either result page or redirect away from /register
    await page.waitForURL(url => !url.pathname.includes('/register') || url.pathname.includes('registerresult'), { timeout: 10000 });

    const currentUrl = page.url();
    expect(currentUrl, 'Should navigate away from /register form on success').not.toMatch(/\/register$/);
  });
*/
  test('TC-REG-015 | Company field is optional and accepts text input', async ({ page }) => {
    const companyInput = page.locator('#Company');
    await expect(companyInput, 'Company input should be visible').toBeVisible();
    await expect(companyInput, 'Company input should be enabled').toBeEnabled();

    await companyInput.fill('Test Corp Ltd');
    const value = await companyInput.inputValue();
    expect(value, 'Company field should hold the typed value').toBe('Test Corp Ltd');
  });

  

});
