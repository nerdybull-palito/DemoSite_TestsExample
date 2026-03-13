// utils/pages/cart.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly cartItemNames: Locator;
  readonly cartItemPrices: Locator;
  readonly cartItemQtyInputs: Locator;
  readonly cartItemSubtotals: Locator;
  readonly removeButtons: Locator;
  readonly updateCartButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly couponInput: Locator;
  readonly applyCouponButton: Locator;
  readonly couponMessage: Locator;
  readonly giftCardInput: Locator;
  readonly applyGiftCardButton: Locator;
  readonly estimateShipping: Locator;
  readonly orderSubtotal: Locator;
  readonly orderTotal: Locator;
  readonly termsCheckbox: Locator;
  readonly checkoutButton: Locator;
  readonly emptyCartMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems            = page.locator('.cart-item-row');
    this.cartItemNames        = page.locator('.cart-item-row .product-name a');
    this.cartItemPrices       = page.locator('.cart-item-row .unit-price .product-unit-price');
    this.cartItemQtyInputs    = page.locator('.cart-item-row input.qty-input');
    this.cartItemSubtotals    = page.locator('.cart-item-row .subtotal .product-subtotal');
    this.removeButtons        = page.locator('.cart-item-row button.remove-btn');
    this.updateCartButton     = page.locator('button[name="updatecart"]');
    this.continueShoppingButton = page.locator('button[name="continueshopping"]');
    this.couponInput          = page.locator('#couponcode');
    this.applyCouponButton    = page.locator('button[id="applydiscountcouponcode"]');
    this.couponMessage        = page.locator('.coupon-box .message');
    this.giftCardInput        = page.locator('#giftcardcouponcode');
    this.applyGiftCardButton  = page.locator('button[id="applygiftcardcouponcode"]');
    this.orderSubtotal        = page.locator('.order-subtotal .value-summary');
    this.orderTotal           = page.locator('.order-total .value-summary');
    this.termsCheckbox        = page.locator('#termsofservice');
    this.checkoutButton       = page.locator('button#checkout');
    this.emptyCartMessage     = page.locator('.no-data');
  }

  async goto() {
    await this.navigate('/cart');
  }

  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async updateQuantity(index: number, qty: number) {
    await this.cartItemQtyInputs.nth(index).fill(String(qty));
    await this.updateCartButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async removeItem(index: number) {
    await this.removeButtons.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }

  async applyCoupon(code: string) {
    await this.couponInput.fill(code);
    await this.applyCouponButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async proceedToCheckout() {
    await this.termsCheckbox.check();
    await this.checkoutButton.click();
  }
}

export class CheckoutPage extends BasePage {
  // Billing
  readonly billingFirstName: Locator;
  readonly billingLastName: Locator;
  readonly billingEmail: Locator;
  readonly billingCountry: Locator;
  readonly billingState: Locator;
  readonly billingCity: Locator;
  readonly billingAddress1: Locator;
  readonly billingZip: Locator;
  readonly billingPhone: Locator;
  readonly billingContinueButton: Locator;

  // Shipping method
  readonly shippingContinueButton: Locator;

  // Payment method
  readonly paymentContinueButton: Locator;

  // Payment info
  readonly paymentInfoContinueButton: Locator;

  // Confirm
  readonly confirmOrderButton: Locator;
  readonly orderSuccessMessage: Locator;
  readonly orderNumber: Locator;

  // Guest checkout
  readonly guestCheckoutRadio: Locator;
  readonly checkoutAsGuestButton: Locator;

  constructor(page: Page) {
    super(page);
    this.billingFirstName     = page.locator('#BillingNewAddress_FirstName');
    this.billingLastName      = page.locator('#BillingNewAddress_LastName');
    this.billingEmail         = page.locator('#BillingNewAddress_Email');
    this.billingCountry       = page.locator('#BillingNewAddress_CountryId');
    this.billingState         = page.locator('#BillingNewAddress_StateProvinceId');
    this.billingCity          = page.locator('#BillingNewAddress_City');
    this.billingAddress1      = page.locator('#BillingNewAddress_Address1');
    this.billingZip           = page.locator('#BillingNewAddress_ZipPostalCode');
    this.billingPhone         = page.locator('#BillingNewAddress_PhoneNumber');
    this.billingContinueButton = page.locator('button.new-address-next-step-button').first();
    this.shippingContinueButton = page.locator('#shipping-method-buttons-container button');
    this.paymentContinueButton  = page.locator('#payment-method-buttons-container button');
    this.paymentInfoContinueButton = page.locator('#payment-info-buttons-container button');
    this.confirmOrderButton    = page.locator('button.confirm-order-next-step-button');
    this.orderSuccessMessage   = page.locator('.order-completed .title');
    this.orderNumber           = page.locator('.order-number strong');
    this.guestCheckoutRadio    = page.locator('#checkout_as_guest_or_register_guest_radio');
    this.checkoutAsGuestButton = page.locator('button.checkout-as-guest-button');
  }

  async fillBillingAddress(data: {
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    city: string;
    address1: string;
    zip: string;
    phone: string;
  }) {
    await this.billingFirstName.fill(data.firstName);
    await this.billingLastName.fill(data.lastName);
    await this.billingEmail.fill(data.email);
    await this.billingCountry.selectOption(data.country);
    await this.page.waitForTimeout(500);
    await this.billingCity.fill(data.city);
    await this.billingAddress1.fill(data.address1);
    await this.billingZip.fill(data.zip);
    await this.billingPhone.fill(data.phone);
  }
}
