// tests/homepage.spec.ts
// Each test contains multiple specific expect() assertions covering:
// URL, HTTP status, element visibility, text content, attributes, counts, and state.

import { test, expect } from '@playwright/test';

const BASE = 'https://demo.nopcommerce.com';

test.describe('Homepage – Page Load & Layout', () => {

  test('TC-HP-001 | Page loads with HTTP 200 and correct title', async ({ page }) => {
    const response = await page.goto(BASE + '/');

    expect(response?.status(), 'HTTP response status should be 200').toBe(200);
    expect(page.url(), 'Final URL should be the nopCommerce domain').toContain('demo.nopcommerce.com');
    await expect(page, 'Browser tab title should contain brand name').toHaveTitle(/nopCommerce demo store/i);

    // const bodyText = await page.locator('body').innerText();
    // expect(bodyText.trim().length, 'Page body text should not be empty').toBeGreaterThan(100);

    const mainText = await page.locator('main').innerText();
    expect(mainText.trim().length,  'Page main text should not be empty').toBeGreaterThan(100);


  });

  test('TC-HP-002 | Logo is visible, has alt text, and href points to homepage', async ({ page }) => {
    await page.goto(BASE + '/');

    const logoImg  = page.locator('.header-logo img');
    const logoLink = page.locator('.header-logo a');

    await expect(logoImg,  'Logo <img> should be visible').toBeVisible();
    await expect(logoLink, 'Logo <a> wrapper should be visible').toBeVisible();

    const alt  = await logoImg.getAttribute('alt');
    const href = await logoLink.getAttribute('href');

    expect(alt,  'Logo alt attribute must not be empty').toBeTruthy();
    expect(href, 'Logo href should point to /').toMatch(/^\/$/);
  });

  
  test('TC-HP-003 | Header has Register, Login, Cart and Wishlist links for guest users', async ({ page }) => {
  await page.goto(BASE + '/');

  await expect(page.getByRole("link", { name: "Register" }),'Register link must be visible').toBeVisible();
  await expect(page.getByRole("link", { name: "Log in" }), 'Login link must be visible').toBeVisible();
  await expect(page.locator('header').getByRole("link", { name: "Wishlist" }), 'Wishlist link must be visible').toBeVisible();
  await expect(page.locator('header').getByRole("link", { name: /Shopping cart/ }), 'Cart link must be visible').toBeVisible();
  });

  test('TC-HP-004 | Top navigation has all 7 category links with correct text and hrefs', async ({ page }) => {
    await page.goto(BASE + '/');

    const categories = [
      { href: '/computers',         text: 'Computers'         },
      { href: '/electronics',       text: 'Electronics'       },
      { href: '/apparel',           text: 'Apparel'           },
      { href: '/digital-downloads', text: 'Digital downloads' },
      { href: '/books',             text: 'Books'             },
      { href: '/jewelry',           text: 'Jewelry'           },
      { href: '/gift-cards',        text: 'Gift Cards'        },
    ];

    for (const { href, text } of categories) {
      const link = page.getByRole('button', { name: text });
      await expect(link, `Nav link for "${text}" should be visible`).toBeVisible();
      await expect(link, `Nav link text should be "${text}"`).toContainText(text, { ignoreCase: true });

      const hrefAttr = await link.getAttribute('href');
      expect(hrefAttr, `Nav link href should be "${href}"`).toBe(href);
    }

    const navItems = page.getByRole('menuitem');
    const navCount = await navItems.count();
    expect(navCount, 'Top-level nav items count should be at least 7').toBeGreaterThanOrEqual(7);
  });


  test('TC-HP-005 | Featured products are listed with image, title, and price', async ({ page }) => {
    await page.goto(BASE + '/');

    const products = page.locator('.product-grid .item-box');
    const count = await products.count();
    expect(count, 'At least one featured product should be displayed').toBeGreaterThan(0);

    const first = products.first();

    await expect(first.locator('.picture img'),   'First product image should be visible').toBeVisible();
    await expect(first.locator('.product-title'), 'First product title should be visible').toBeVisible();
    await expect(first.locator('.price'),         'First product price should be visible').toBeVisible();

    const titleText = await first.locator('.product-title').innerText();
    expect(titleText.trim().length, 'Product title text must not be empty').toBeGreaterThan(0);

    const priceText = await first.locator('.price').innerText();
    expect(priceText, 'Product price must include "$"').toContain('$');
    expect(parseFloat(priceText.replace(/[^0-9.]/g, '')), 'Product price value must be > 0').toBeGreaterThan(0);
  });


  test('TC-HP-005a | Featured products are listed with image, title, and price', async ({ page }) => {
    await page.goto(BASE + '/');

    const products = page.locator('.product-grid .item-box');
    const count = await products.count();
    expect(count, 'At least one featured product should be displayed').toBeGreaterThan(0);

    const first = products.first();

    await expect(first.locator('.picture img'),   'First product image should be visible').toBeVisible();
    await expect(first.locator('.product-title'), 'First product title should be visible').toBeVisible();
    await expect(first.locator('.price'),         'First product price should be visible').toBeVisible();

    const titleText = await first.locator('.product-title').innerText();
    expect(titleText.trim().length, 'Product title text must not be empty').toBeGreaterThan(0);

    const priceText = await first.locator('.price').innerText();
    expect(priceText, 'Product price must include "$"').toContain('$');
    expect(parseFloat(priceText.replace(/[^0-9.]/g, '')), 'Product price value must be > 0').toBeGreaterThan(0);
  });





  test('TC-HP-006 | Footer is visible and contains informational for one link', async ({ page }) => {
    await page.goto(BASE + '/');

    const footer = page.locator('.footer');
    await expect(footer, 'Footer should be visible').toBeVisible();

    const linkCount = await footer.locator('a').count();
    expect(linkCount, 'Footer should contain more than 5 links').toBeGreaterThan(5);

    await expect(footer.locator('a[href="/contactus"]'), 'Contact Us footer link should be visible').toBeVisible();
  });



  test('TC-HP-006a | Footer is visible and contains informational for one set of links', async ({ page }) => {
    await page.goto(BASE + '/');

    const footer = page.locator('.footer');
    await expect(footer, 'Footer should be visible').toBeVisible();

    const linkCount = await footer.locator('a').count();
    expect(linkCount, 'Footer should contain more than 5 links').toBeGreaterThan(5);

    const expectedLinks = [
      { href: '/sitemap',           text: 'Sitemap'},
      { href: '/shipping-returns',  text: 'Shipping & returns'},
      { href: '/privacy-notice',    text: 'Privacy notice'},
      { href: '/conditions-of-use', text: 'Conditions of Use'},
      { href: '/about-us',          text: 'About Us'},
      { href: '/contactus',         text: 'Contact us'},
    ];

    for (const {href, text } of expectedLinks){
      const link = footer.locator('a[herf="${href}"]');
      await expect(link, '"${text}" link should be visible in footer').toBeVisible();
      await expect(link, '"${text}" link should contain correct text').toContainText(text, { ignoreCase: true });
    }
  });

  
  test('TC-HP-006b | Footer is visible and contains informational for all links', async ({ page }) => {
    await page.goto(BASE + '/');

    const footer = page.locator('.footer');
    await expect(footer, 'Footer should be visible').toBeVisible();

    const linkCount = await footer.locator('a').count();
    expect(linkCount, 'Footer should contain more than 5 links').toBeGreaterThan(5);

    const footerMenus = [
      {
        id: 'footer_list_3',
        name: 'Information',
        links: [
          { href: '/sitemap',           text: 'Sitemap'},
          { href: '/shipping-returns',  text: 'Shipping & returns'},
          { href: '/privacy-notice',    text: 'Privacy notice'},
          { href: '/conditions-of-use', text: 'Conditions of Use'},
          { href: '/about-us',          text: 'About Us'},
          { href: '/contactus',         text: 'Contact us'},
        ]
      },
      {
        id: 'footer_list_4',
        name: 'Customer service',
        links: [
          { href: '/search',                  text: 'Search'},
          { href: '/news',                    text: 'News'},
          { href: '/blog',                    text: 'Blog'},
          { href: '/recentlyviewedproducts',  text: 'Recently viewed products'},
          { href: '/compareproducts',         text: 'Compare products list'},
          { href: '/newproducts',             text: 'New products'},
        ]
      },
      {
        id: 'footer_list_5',
        name: 'My account',
        links: [
          { href: '/customer/info',         text: 'My account'},
          { href: '/order/history',         text: 'Orders'},
          { href: '/customer/addresses',    text: 'Addresses'},
          { href: '/cart',                  text: 'Shopping cart'},
          { href: '/wishlist',              text: 'Wishlist'},
          { href: '/vendor/apply',          text: 'Apply for vendor account'},
        ]
      },
    ];

    for (const { id, name, links } of footerMenus) {
      const section = page.locator('#${id}');
      await expect(section, '"${name}" section should be visible').toBeVisible();

      for (const { href, text } of links) {
        const link = section.locator('a[href="${href}"]');
        await expect(link, '"${text}" link should be visible in "${name}"').toBeVisible();
        await expect(link, '"${text}" link should contain correct text').toContainText(text, {ignoreCase: true});
      }
    }
  });



  test('TC-HP-007 | Newsletter section has functional input and subscribe button', async ({ page }) => {
    await page.goto(BASE + '/');

    const input  = page.locator('#newsletter-email');
    const button = page.locator('#newsletter-subscribe-button');

    await expect(input,  'Newsletter email input should be visible').toBeVisible();
    await expect(button, 'Subscribe button should be visible').toBeVisible();
    await expect(button, 'Subscribe button should be enabled').toBeEnabled();

    const inputType = await input.getAttribute('type');
    expect(['email', 'text'], 'Input type should be "email" or "text"').toContain(inputType);

    // Assert placeholder or aria-label exists for accessibility
    const placeholder = await input.getAttribute('placeholder');
    const ariaLabel   = await input.getAttribute('aria-label');
    expect(placeholder || ariaLabel, 'Newsletter input should have placeholder or aria-label').toBeTruthy();
  });

  // test('TC-HP-008 | Valid newsletter subscription shows success message', async ({ page }) => {
  //  await page.goto(BASE + '/');
  //
  //  const email = `pw_${Date.now()}@testmail.dev`;
  //  await page.locator('#newsletter-email').fill(email);

  //  const inputValue = await page.locator('#newsletter-email').inputValue();
  // expect(inputValue, 'Email input should hold the typed value').toBe(email);

  //  await page.locator('#newsletter-subscribe-button').click();

  //  const result = page.locator('#newsletter-result-block');
  //  await expect(result, 'Result block should appear after submit').toBeVisible({ timeout: 8000 });

  //  const text = await result.innerText();
  //  expect(text.trim().length, 'Result text should not be empty').toBeGreaterThan(0);
  //  expect(text.toLowerCase(), 'Success message should include "thank you"').toContain('thank you');

  //});

  //test('TC-HP-009 | Invalid email newsletter subscription shows error (not success)', async ({ page }) => {
  //  await page.goto(BASE + '/');

  //  await page.locator('#newsletter-email').fill('invalid@@email');
  //  await page.locator('#newsletter-subscribe-button').click();

  //  const result = page.locator('#newsletter-result-block');
  //  await expect(result, 'Result block should appear for invalid email').toBeVisible({ timeout: 6000 });

  //  const text = await result.innerText();
  //  expect(text.toLowerCase(), 'Error result must NOT say "thank you"').not.toContain('thank you');
  //  expect(text.trim().length, 'Error message should not be empty').toBeGreaterThan(0);
  //});

  test('TC-HP-010 | Hovering Computers nav reveals Desktops and Notebooks submenu', async ({ page }) => {
    await page.goto(BASE + '/');

    const computersMenu = page.getByRole('button', { name: 'Computers' });
    await computersMenu.hover();

    const desktops  = page.locator('.top-menu a[href="/desktops"]');
    const notebooks = page.locator('.top-menu a[href="/notebooks"]');

    await expect(desktops,  'Desktops dropdown item should appear').toBeVisible({ timeout: 9000 });
    await expect(notebooks, 'Notebooks dropdown item should appear').toBeVisible({ timeout: 9000 });
    await expect(desktops,  'Desktops link text should be correct').toContainText('Desktops');
    await expect(notebooks, 'Notebooks link text should be correct').toContainText('Notebooks');

    const desktopsHref  = await desktops.getAttribute('href');
    const notebooksHref = await notebooks.getAttribute('href');
    expect(desktopsHref,  'Desktops href should be /desktops').toBe('/desktops');
    expect(notebooksHref, 'Notebooks href should be /notebooks').toBe('/notebooks');
  });

  test('TC-HP-011 | Register link navigates to registration page with correct form', async ({ page }) => {
    await page.goto(BASE + '/');

    await page.locator('.header-links a[href="/register"]').click();

    await expect(page, 'URL should be /register').toHaveURL(/\/register$/);
    await expect(page.locator('.page-title h1'), 'Heading should say Register').toContainText('Register');
    await expect(page.locator('#FirstName'),     'First name field must be present').toBeVisible();
    await expect(page.locator('#LastName'),      'Last name field must be present').toBeVisible();
    await expect(page.locator('#Email'),         'Email field must be present').toBeVisible();
    await expect(page.locator('#Password'),      'Password field must be present').toBeVisible();
    await expect(page.locator('button#register-button'), 'Register button must be present').toBeVisible();
  });

  test('TC-HP-012 | Login link navigates to login page with correct form', async ({ page }) => {
    await page.goto(BASE + '/');

    await page.locator('.header-links a[href="/login"]').click();

    await expect(page, 'URL should be /login').toHaveURL(/\/login$/);
    await expect(page.locator('#Email'),    'Email input must be present on login page').toBeVisible();
    await expect(page.locator('#Password'), 'Password input must be present on login page').toBeVisible();
    await expect(page.locator('button[value="login"]'), 'Login button must be present').toBeVisible();
  });

  test('TC-HP-013 | Electronics nav link navigates to electronics category page', async ({ page }) => {
    await page.goto(BASE + '/');

    await page.locator('.top-menu a[href="/electronics"]').click();

    await expect(page, 'URL should change to /electronics').toHaveURL(/\/electronics$/);
    await expect(page.locator('.page-title h1'), 'Heading should say Electronics').toContainText('Electronics');

    const breadcrumb = page.locator('.breadcrumb');
    await expect(breadcrumb, 'Breadcrumb must be visible').toBeVisible();
    await expect(breadcrumb, 'Breadcrumb must contain "Electronics"').toContainText('Electronics');
    await expect(breadcrumb.locator('a[href="/"]'), 'Breadcrumb should contain Home link').toBeVisible();
  });

  test('TC-HP-014 | Clicking a featured product opens product detail page', async ({ page }) => {
    await page.goto(BASE + '/');

    const firstLink = page.locator('.product-grid .item-box').first().locator('.product-title a');
    const productNameText = await firstLink.innerText();

    await firstLink.click();

    expect(page.url(), 'URL must change away from homepage').not.toBe(BASE + '/');
    await expect(page.locator('.product-name h1'),          'Product name heading should be visible').toBeVisible();
    await expect(page.locator('button.add-to-cart-button'), 'Add to Cart button must be present').toBeVisible();
    await expect(page.locator('.product-price span'),        'Product price must be visible on detail page').toBeVisible();

    const detailName = await page.locator('.product-name h1').innerText();
    expect(detailName.trim().length, 'Product name on detail page should not be empty').toBeGreaterThan(0);
  });

  test('TC-HP-015 | Search bar input and submit triggers results page', async ({ page }) => {
    await page.goto(BASE + '/');

    const searchInput = page.locator('#small-searchterms');
    await searchInput.fill('laptop');

    expect(await searchInput.inputValue(), 'Input value should be "laptop"').toBe('laptop');

    await page.locator('.search-box button[type="submit"]').click();

    await expect(page, 'Should navigate to /search').toHaveURL(/\/search/);
    await expect(page.locator('.search-results, .page-title'), 'Search results page should load').toBeVisible({ timeout: 8000 });
  });

});
