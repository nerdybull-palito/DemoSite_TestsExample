// utils/pages/catalog.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CatalogPage extends BasePage {
  readonly pageTitle: Locator;
  readonly breadcrumb: Locator;
  readonly productItems: Locator;
  readonly sortByDropdown: Locator;
  readonly itemsPerPageDropdown: Locator;
  readonly listViewButton: Locator;
  readonly gridViewButton: Locator;
  readonly paginationNext: Locator;
  readonly paginationPages: Locator;
  readonly subcategoryItems: Locator;
  readonly noResultsMsg: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle           = page.locator('.page-title h1');
    this.breadcrumb          = page.locator('.breadcrumb');
    this.productItems        = page.locator('.product-item');
    this.sortByDropdown      = page.locator('#products-orderby');
    this.itemsPerPageDropdown = page.locator('#products-pagesize');
    this.listViewButton      = page.locator('.product-viewmode a.list');
    this.gridViewButton      = page.locator('.product-viewmode a.grid');
    this.paginationNext      = page.locator('.pager li.next-page a');
    this.paginationPages     = page.locator('.pager li a');
    this.subcategoryItems    = page.locator('.sub-category-item');
    this.noResultsMsg        = page.locator('.no-result');
  }

  async sortBy(value: string) {
    await this.sortByDropdown.selectOption(value);
    await this.page.waitForLoadState('networkidle');
  }

  async setItemsPerPage(value: string) {
    await this.itemsPerPageDropdown.selectOption(value);
    await this.page.waitForLoadState('networkidle');
  }

  async switchToListView() {
    await this.listViewButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async switchToGridView() {
    await this.gridViewButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getProductCount(): Promise<number> {
    return this.productItems.count();
  }

  async getProductPrices(): Promise<number[]> {
    const priceLocators = this.productItems.locator('.price.actual-price');
    const count = await priceLocators.count();
    const prices: number[] = [];
    for (let i = 0; i < count; i++) {
      const text = await priceLocators.nth(i).innerText();
      prices.push(parseFloat(text.replace(/[^0-9.]/g, '')));
    }
    return prices;
  }

  async getProductNames(): Promise<string[]> {
    const nameLocators = this.productItems.locator('.product-title a');
    const count = await nameLocators.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      names.push((await nameLocators.nth(i).innerText()).trim());
    }
    return names;
  }

  async clickProductByIndex(index: number) {
    await this.productItems.nth(index).locator('.product-title a').click();
  }

  async addToCartByIndex(index: number) {
    await this.productItems.nth(index).locator('button.button-2.product-box-add-to-cart-button').click();
  }

  async addToWishlistByIndex(index: number) {
    await this.productItems.nth(index).locator('button.add-to-wishlist-button').click();
  }

  async addToCompareByIndex(index: number) {
    await this.productItems.nth(index).locator('button.add-to-compare-list-button').click();
  }
}

export class SearchPage extends BasePage {
  readonly searchInput: Locator;
  readonly advancedSearchCheckbox: Locator;
  readonly categoryDropdown: Locator;
  readonly searchInSubcategories: Locator;
  readonly searchInDescriptions: Locator;
  readonly searchButton: Locator;
  readonly results: Locator;
  readonly noResultsMsg: Locator;
  readonly validationError: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput           = page.locator('#q');
    this.advancedSearchCheckbox = page.locator('#adv');
    this.categoryDropdown      = page.locator('#cid');
    this.searchInSubcategories = page.locator('#isc');
    this.searchInDescriptions  = page.locator('#sid');
    this.searchButton          = page.locator('button.search-button');
    this.results               = page.locator('.search-results .item-box');
    this.noResultsMsg          = page.locator('.search-results .no-result');
    this.validationError       = page.locator('.search-results .warning');
  }

  async goto() {
    await this.navigate('/search');
  }

  async searchFor(term: string) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async getResultCount(): Promise<number> {
    return this.results.count();
  }
}

export class ProductDetailPage extends BasePage {
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly productSku: Locator;
  readonly productDescription: Locator;
  readonly productImages: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly addToWishlistButton: Locator;
  readonly emailFriendLink: Locator;
  readonly writeReviewLink: Locator;
  readonly reviewTitle: Locator;
  readonly reviewText: Locator;
  readonly ratingInputs: Locator;
  readonly submitReviewButton: Locator;
  readonly reviewResult: Locator;
  readonly breadcrumb: Locator;
  readonly shareLinks: Locator;
  readonly stockInfo: Locator;

  constructor(page: Page) {
    super(page);
    this.productName       = page.locator('.product-name h1');
    this.productPrice      = page.locator('.product-price span');
    this.productSku        = page.locator('.sku .value');
    this.productDescription = page.locator('.full-description');
    this.productImages     = page.locator('.picture img');
    this.quantityInput     = page.locator('#product_enteredQuantity_\\d+').or(page.locator('input.qty-input'));
    this.addToCartButton   = page.locator('button.add-to-cart-button');
    this.addToWishlistButton = page.locator('button.add-to-wishlist-button');
    this.emailFriendLink   = page.locator('.email-a-friend-button');
    this.writeReviewLink   = page.locator('a[href*="productreviews"]');
    this.reviewTitle       = page.locator('#AddProductReview_Title');
    this.reviewText        = page.locator('#AddProductReview_ReviewText');
    this.ratingInputs      = page.locator('.rating-options input[type="radio"]');
    this.submitReviewButton = page.locator('button.write-product-review-button');
    this.reviewResult      = page.locator('.result');
    this.breadcrumb        = page.locator('.breadcrumb');
    this.shareLinks        = page.locator('.share-button');
    this.stockInfo         = page.locator('.stock .value');
  }

  async setQuantity(qty: number) {
    await this.quantityInput.fill(String(qty));
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async addToWishlist() {
    await this.addToWishlistButton.click();
  }
}
