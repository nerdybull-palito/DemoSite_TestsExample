// utils/pages/auth.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly validationErrors: Locator;
  readonly loginError: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput         = page.locator('#Email');
    this.passwordInput      = page.locator('#Password');
    this.rememberMeCheckbox = page.locator('#RememberMe');
    this.loginButton        = page.locator('button[value="login"]');
    this.forgotPasswordLink = page.locator('.forgot-password a');
    this.validationErrors   = page.locator('.field-validation-error');
    this.loginError         = page.locator('.message-error.validation-summary-errors');
  }

  async goto() {
    await this.navigate('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginWithRememberMe(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.rememberMeCheckbox.check();
    await this.loginButton.click();
  }

  async getErrorText(): Promise<string> {
    return this.loginError.innerText();
  }
}

export class RegisterPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly genderMaleRadio: Locator;
  readonly genderFemaleRadio: Locator;
  readonly dobDay: Locator;
  readonly dobMonth: Locator;
  readonly dobYear: Locator;
  readonly companyInput: Locator;
  readonly newsletterCheckbox: Locator;
  readonly registerButton: Locator;
  readonly validationErrors: Locator;
  readonly registerError: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput       = page.locator('#FirstName');
    this.lastNameInput        = page.locator('#LastName');
    this.emailInput           = page.locator('#Email');
    this.passwordInput        = page.locator('#Password');
    this.confirmPasswordInput = page.locator('#ConfirmPassword');
    this.genderMaleRadio      = page.locator('#gender-male');
    this.genderFemaleRadio    = page.locator('#gender-female');
    this.dobDay               = page.locator('[name="DateOfBirthDay"]');
    this.dobMonth             = page.locator('[name="DateOfBirthMonth"]');
    this.dobYear              = page.locator('[name="DateOfBirthYear"]');
    this.companyInput         = page.locator('#Company');
    this.newsletterCheckbox   = page.locator('#Newsletter');
    this.registerButton       = page.locator('button#register-button');
    this.validationErrors     = page.locator('.field-validation-error');
    this.registerError        = page.locator('.message-error.validation-summary-errors');
    this.successMessage       = page.locator('.result');
  }

  async goto() {
    await this.navigate('/register');
  }

  async fillForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword ?? data.password);
  }

  async submit() {
    await this.registerButton.click();
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) {
    await this.fillForm(data);
    await this.submit();
  }
}
