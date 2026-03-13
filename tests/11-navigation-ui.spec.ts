// tests/11-navigation-ui.spec.ts
// Each test has multiple specific expect() assertions.

import { test, expect } from '@playwright/test';

const BASE = 'https://demo.nopcommerce.com';

const CATEGORIES = [
  { href: '/computers',          heading: 'Computers'         },
  { href: '/electronics',        heading: 'Electronics'       },
  { href: '/apparel',            heading: 'Apparel'           },
  { href: '/digital-downloads',  heading: 'Digital downloads' },
  { href: '/books',              heading: 'Books'             },
  { href: '/jewelry',            heading: 'Jewelry'           },
  { href: '/gift-cards',         heading: 'Gift Cards'        },
];

test.describe('Top Navigation – All Category Links', () => {

  for (const { href, heading } of CATEGORIES) {
    test(`TC-NAV | "${heading}" link navigates correctly and shows matching heading`, async ({ page }) => {
      await page.goto(BASE + '/');

      const link = page.locator(`.top-menu a[href="${href}"]`);
      await expect(link, `"${heading}" nav link should be visible`).toBeVisible();

      const linkHref = await link.getAttribute('href');
      expect(linkHref, `Nav link href should be "${href}"`).toBe(href);

      await link.click();

      await expect(page, `URL should change to ${href}`).toHaveURL(new RegExp(href.replace('/', '\\/')));
      await expect(page.locator('.page-title h1'), `Heading should say "${heading}"`).toContainText(heading, { ignoreCase: true });

      // Assert breadcrumb contains the category name
      await expect(page.locator('.breadcrumb'), `Breadcrumb should contain "${heading}"`).toContainText(heading, { ignoreCase: true });
    });
  }

});

test.describe('Breadcrumb Navigation', () => {

  test('TC-BREAD-001 | Home breadcrumb link on Desktops page navigates to homepage', async ({ page }) => {
    await page.goto(BASE + '/desktops');

    const homeLink = page.locator('.breadcrumb a[href="/"]');
    await expect(homeLink, 'Home link in breadcrumb should be visible').toBeVisible();
    await expect(homeLink, 'Home link text should say "Home"').toContainText('Home');

    await homeLink.click();
    await expect(page, 'Clicking breadcrumb Home should navigate to /').toHaveURL(/demo\.nopcommerce\.com\/?$/);
    await expect(page.locator('.header-logo'), 'Homepage logo should be visible after breadcrumb Home click').toBeVisible();
  });

  test('TC-BREAD-002 | Computers breadcrumb on Desktops page navigates to /computers', async ({ page }) => {
    await page.goto(BASE + '/desktops');

    const computersLink = page.locator('.breadcrumb a[href="/computers"]');
    await expect(computersLink, 'Computers breadcrumb link should be visible').toBeVisible();
    await expect(computersLink, 'Computers breadcrumb text').toContainText('Computers');

    await computersLink.click();
    await expect(page, 'Clicking Computers breadcrumb should go to /computers').toHaveURL(/\/computers$/);
    await expect(page.locator('.page-title h1'), 'Computers heading should be visible').toContainText('Computers');
  });

  test('TC-BREAD-003 | Product detail page breadcrumb shows full hierarchy', async ({ page }) => {
    await page.goto(BASE + '/apple-macbook-pro-13-inch');

    const breadcrumb = page.locator('.breadcrumb');
    await expect(breadcrumb, 'Breadcrumb should be visible on product detail page').toBeVisible();
    await expect(breadcrumb, 'Breadcrumb should contain Home').toContainText('Home');

    // Assert breadcrumb has at least 2 levels
    const crumbLinks = breadcrumb.locator('a');
    const crumbCount = await crumbLinks.count();
    expect(crumbCount, 'Product detail breadcrumb should have at least 2 links').toBeGreaterThanOrEqual(2);
  });

});

test.describe('Footer Navigation', () => {

  test('TC-FOOT-001 | Footer is present and contains expected links', async ({ page }) => {
    await page.goto(BASE + '/');

    const footer = page.locator('.footer');
    await expect(footer, 'Footer should be visible').toBeVisible();

    const contactLink = footer.locator('a[href="/contactus"]');
    await expect(contactLink, 'Contact Us link should be in footer').toBeVisible();
    await expect(contactLink, 'Contact Us footer link text').toContainText(/contact/i);
  });

  test('TC-FOOT-002 | Footer "Contact us" link navigates correctly', async ({ page }) => {
    await page.goto(BASE + '/');

    await page.locator('.footer a[href="/contactus"]').first().click();

    await expect(page, 'Should navigate to /contactus').toHaveURL(/\/contactus$/);
    await expect(page.locator('.page-title h1'), 'Contact Us heading should be visible').toContainText('Contact us');
  });

  test('TC-FOOT-003 | Footer is visible on multiple category pages', async ({ page }) => {
    for (const { href } of CATEGORIES.slice(0, 4)) {
      await page.goto(BASE + href);
      await expect(page.locator('.footer'), `Footer should be visible on ${href}`).toBeVisible();
    }
  });

  test('TC-FOOT-004 | Footer social media icons are present', async ({ page }) => {
    await page.goto(BASE + '/');

    const socialLinks = page.locator('.footer .social ul li a');
    const count = await socialLinks.count();
    expect(count, 'Footer should have at least 1 social media link').toBeGreaterThan(0);
  });

});

test.describe('Page Titles & Meta', () => {

  test('TC-META-001 | Homepage has the correct brand title', async ({ page }) => {
    await page.goto(BASE + '/');
    await expect(page, 'Homepage title should match brand').toHaveTitle(/nopCommerce demo store/i);
  });

  test('TC-META-002 | Each category page has a unique, non-empty title', async ({ page }) => {
    const titles = new Set<string>();
    for (const { href } of CATEGORIES) {
      await page.goto(BASE + href);
      const title = await page.title();
      expect(title.trim().length, `Title on ${href} should not be empty`).toBeGreaterThan(0);
      titles.add(title);
    }
    expect(titles.size, 'All category pages should have unique titles').toBe(CATEGORIES.length);
  });

  test('TC-META-003 | Login page title contains "Login" or "Sign"', async ({ page }) => {
    await page.goto(BASE + '/login');
    const title = await page.title();
    expect(title.toLowerCase(), 'Login page title should include login/sign indicator').toMatch(/login|sign/i);
  });

  test('TC-META-004 | Register page title contains "Register"', async ({ page }) => {
    await page.goto(BASE + '/register');
    const title = await page.title();
    expect(title.toLowerCase(), 'Register page title should include "register"').toContain('register');
  });

});

test.describe('Responsive Layout', () => {

  test('TC-RESP-001 | Mobile viewport (375×812) – header and footer visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/');

    await expect(page.locator('.header-logo'), 'Logo should be visible on mobile').toBeVisible();
    await expect(page.locator('.footer'),      'Footer should be visible on mobile').toBeVisible();

    // Assert page is not blank
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length, 'Mobile page body should not be empty').toBeGreaterThan(50);
  });

  test('TC-RESP-002 | Tablet viewport (768×1024) – header and navigation visible', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE + '/');

    await expect(page.locator('.header-logo'), 'Logo should be visible on tablet').toBeVisible();
    await expect(page.locator('.footer'),      'Footer should be visible on tablet').toBeVisible();
  });

  test('TC-RESP-003 | Desktop viewport (1280×800) – full navigation bar visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE + '/');

    const topMenu = page.locator('.top-menu');
    await expect(topMenu, 'Top navigation menu should be visible on desktop').toBeVisible();

    const navLinks = topMenu.locator('a');
    const count = await navLinks.count();
    expect(count, 'Navigation should have multiple links on desktop').toBeGreaterThan(5);
  });

});

test.describe('Cross-Page Consistency', () => {

  test('TC-CONS-001 | Header structure is identical on homepage and product category page', async ({ page }) => {
    await page.goto(BASE + '/');
    const homeCartHref = await page.locator('.header-links a[href="/cart"]').getAttribute('href');

    await page.goto(BASE + '/computers');
    const catCartHref  = await page.locator('.header-links a[href="/cart"]').getAttribute('href');

    expect(homeCartHref, 'Cart link href should be /cart on homepage').toBe('/cart');
    expect(catCartHref,  'Cart link href should be /cart on category page').toBe('/cart');
    expect(homeCartHref, 'Cart link href should match between homepage and category page').toBe(catCartHref);
  });

  test('TC-CONS-002 | Search bar is present on every top-level category page', async ({ page }) => {
    for (const { href } of CATEGORIES) {
      await page.goto(BASE + href);
      await expect(page.locator('#small-searchterms'), `Search input should be on ${href}`).toBeVisible();
    }
  });

  test('TC-CONS-003 | Back button returns to the previous page correctly', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.goto(BASE + '/computers');
    await expect(page, 'Should be on /computers').toHaveURL(/\/computers/);

    await page.goBack();
    await expect(page, 'Back button should return to homepage').toHaveURL(/demo\.nopcommerce\.com\/?$/);
    await expect(page.locator('.header-logo'), 'Logo should be visible after back navigation').toBeVisible();
  });

});
