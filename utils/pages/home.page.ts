// utils/pages/home.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly featuredProducts: Locator;
  readonly newsletterEmail: Locator;
  readonly newsletterSubmit: Locator;
  readonly newsletterResult: Locator;
  readonly sliderItems: Locator;
  readonly footer: Locator;
  readonly footerLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.featuredProducts  = page.locator('.product-grid .item-box');
    this.newsletterEmail   = page.locator('#newsletter-email');
    this.newsletterSubmit  = page.locator('#newsletter-subscribe-button');
    this.newsletterResult  = page.locator('#newsletter-result-block');
    this.sliderItems       = page.locator('.nivo-slider .slide');
    this.footer            = page.locator('.footer');
    this.footerLinks       = page.locator('.footer a');
  }

  async goto() {
    await this.navigate('/');
  }

  async subscribeNewsletter(email: string) {
    await this.newsletterEmail.fill(email);
    await this.newsletterSubmit.click();
  }

  async getFeaturedProductCount(): Promise<number> {
    return this.featuredProducts.count();
  }

  async clickFeaturedProduct(index: number = 0) {
    await this.featuredProducts.nth(index).locator('h2 a').click();
  }
}
