// utils/test-data.ts
// Central store for all test constants and data used across test suites

export const BASE_URL = 'https://demo.nopcommerce.com';

// ── Registered test account (pre-existing demo account) ─────────────────────
export const TEST_USER = {
  email: 'demo_playwright@nopcommerce.com',
  password: 'Playwright@123',
  firstName: 'Playwright',
  lastName: 'Tester',
};

// ── Registration data ────────────────────────────────────────────────────────
export const NEW_USER = {
  firstName: 'Test',
  lastName: 'Automation',
  email: `testuser_${Date.now()}@mailtest.com`,
  password: 'Automation@123!',
};

// ── Search terms ─────────────────────────────────────────────────────────────
export const SEARCH = {
  validTerm: 'laptop',
  partialTerm: 'note',
  noResultTerm: 'xyzabc999notfound',
  shortTerm: 'a',        // below minimum length
  specialChars: '<script>alert(1)</script>',
};

// ── URLs ─────────────────────────────────────────────────────────────────────
export const URLS = {
  home: '/',
  login: '/login',
  register: '/register',
  computers: '/computers',
  desktops: '/desktops',
  notebooks: '/notebooks',
  electronics: '/electronics',
  apparel: '/apparel',
  digitalDownloads: '/digital-downloads',
  jewelry: '/jewelry',
  giftCards: '/gift-cards',
  cart: '/cart',
  wishlist: '/wishlist',
  compareProducts: '/compareproducts',
  contactUs: '/contactus',
  search: '/search',
  myAccount: '/customer/info',
  orders: '/order/history',
  addresses: '/customer/addresses',
  changePassword: '/customer/changepassword',
};

// ── Coupon codes ─────────────────────────────────────────────────────────────
export const COUPONS = {
  valid: 'DISCT',
  invalid: 'FAKECOUPON123',
};

// ── Expected page titles ─────────────────────────────────────────────────────
export const PAGE_TITLES = {
  home: 'nopCommerce demo store',
  login: 'nopCommerce demo store. Login',
  register: 'nopCommerce demo store. Register',
  computers: 'nopCommerce demo store. Computers',
  desktops: 'nopCommerce demo store. Desktops',
  notebooks: 'nopCommerce demo store. Notebooks',
  cart: 'nopCommerce demo store. Shopping Cart',
  wishlist: 'nopCommerce demo store. Wishlist',
  contactUs: 'nopCommerce demo store. Contact us',
  search: 'nopCommerce demo store. Search',
};
