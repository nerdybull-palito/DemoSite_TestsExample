// utils/pages/base.page.ts
import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage – shared selectors and helpers inherited by all page objects.
 */
export class BasePage {
  readonly page: Page;

  // ── Header ─────────────────────────────────────────────────────────────────
  readonly logo: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly registerLink: Locator;
  readonly loginLink: Locator;
  readonly logoutLink: Locator;
  readonly myAccountLink: Locator;
  readonly cartLink: Locator;
  readonly wishlistLink: Locator;
  readonly cartQty: Locator;

  // ── Navigation ──────────────────────────────────────────────────────────────
  readonly navComputers: Locator;
  readonly navElectronics: Locator;
  readonly navApparel: Locator;

  constructor(page: Page) {
    this.page = page;

    this.logo        = page.locator('.header-logo');
    this.searchInput = page.locator('#small-searchterms');
    this.searchButton = page.locator('.search-box button[type="submit"]');
    this.registerLink = page.locator('.header-links a[href="/register"]');
    this.loginLink    = page.locator('.header-links a[href="/login"]');
    this.logoutLink   = page.locator('.header-links a[href="/logout"]');
    this.myAccountLink = page.locator('.header-links a[href="/customer/info"]');
    this.cartLink     = page.locator('.header-links a[href="/cart"]');
    this.wishlistLink = page.locator('.header-links a[href="/wishlist"]');
    this.cartQty      = page.locator('.cart-qty');

    this.navComputers  = page.locator('.top-menu a[href="/computers"]');
    this.navElectronics = page.locator('.top-menu a[href="/electronics"]');
    this.navApparel    = page.locator('.top-menu a[href="/apparel"]');
  }

  async navigate(path: string = '/') {
    await this.page.goto(path);
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async isLoggedIn(): Promise<boolean> {
    return this.myAccountLink.isVisible();
  }

  async getNotificationBar(): Promise<string> {
    const bar = this.page.locator('.bar-notification .content');
    await bar.waitFor({ timeout: 5000 });
    return bar.innerText();
  }
}
