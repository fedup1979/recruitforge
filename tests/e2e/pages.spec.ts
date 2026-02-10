import { test, expect } from '@playwright/test';

// ============================================================
// Public pages — load, title, key content
// ============================================================

test.describe('Public pages', () => {
  test('homepage loads with correct title and hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AMBITIA/);
    await expect(page.locator('h1')).toContainText('Trouvez le poste qui vous correspond');
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about/');
    await expect(page).toHaveTitle(/À propos/);
    await expect(page.locator('h1')).toContainText("À propos d'AMBITIA");
  });

  test('jobs page loads', async ({ page }) => {
    await page.goto('/jobs/');
    await expect(page).toHaveTitle(/Postes ouverts/);
    await expect(page.locator('h1')).toContainText('Postes ouverts');
  });

  test('login page loads with form', async ({ page }) => {
    await page.goto('/login/');
    await expect(page).toHaveTitle(/Connexion/);
    await expect(page.locator('h1')).toContainText('Connexion');
    await expect(page.locator('#login-form')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('signup page loads with form', async ({ page }) => {
    await page.goto('/signup/');
    await expect(page).toHaveTitle(/Créer un compte/);
    await expect(page.locator('#signup-form')).toBeVisible();
    await expect(page.locator('#full_name')).toBeVisible();
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy/');
    await expect(page).toHaveTitle(/confidentialité/i);
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms/');
    await expect(page).toHaveTitle(/Conditions/);
  });

  test('forgot-password page loads', async ({ page }) => {
    await page.goto('/forgot-password/');
    await expect(page).toHaveTitle(/Mot de passe oublié/);
    await expect(page.locator('#reset-form')).toBeVisible();
  });

  test('confirm-email page loads', async ({ page }) => {
    await page.goto('/confirm-email/');
    await expect(page).toHaveTitle(/Confirmez votre email/);
    await expect(page.locator('h1')).toContainText('Vérifiez votre email');
  });

  test('404 page for unknown routes', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-xyz');
    // serve returns 404 for missing routes
    expect(response?.status()).toBe(404);
  });
});

// ============================================================
// Navigation (use desktop viewport to see nav links)
// ============================================================

test.describe('Navigation', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('navbar contains correct links', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    // Links exist in DOM (mobile menu or desktop menu)
    await expect(nav.locator('a[href="/"]').first()).toBeAttached();
    await expect(nav.locator('a[href="/jobs"]').first()).toBeAttached();
    await expect(nav.locator('a[href="/about"]').first()).toBeAttached();
    // AMBITIA brand is visible
    await expect(nav.locator('text=AMBITIA').first()).toBeVisible();
  });

  test('footer has correct links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.locator('a[href="/about"]')).toBeVisible();
    await expect(footer.locator('a[href="/jobs"]')).toBeVisible();
    await expect(footer.locator('a[href="/privacy"]')).toBeVisible();
    await expect(footer.locator('a[href="/terms"]')).toBeVisible();
  });

  test('clicking "Voir les postes" CTA navigates to jobs', async ({ page }) => {
    await page.goto('/');
    // Use the hero CTA button (btn-primary btn-lg), not the nav link
    await page.locator('a.btn-primary[href="/jobs"]').first().click();
    await expect(page).toHaveURL(/\/jobs/);
  });

  test('AMBITIA logo links to homepage', async ({ page }) => {
    await page.goto('/about/');
    await page.locator('nav a:has-text("AMBITIA")').first().click();
    await expect(page).toHaveURL('/');
  });
});

// ============================================================
// SEO & Meta
// ============================================================

test.describe('SEO & Meta', () => {
  test('homepage has meta description', async ({ page }) => {
    await page.goto('/');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc).toContain('AMBITIA');
  });

  test('homepage has OG tags', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toContain('AMBITIA');
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(ogType).toBe('website');
  });

  test('homepage has canonical URL', async ({ page }) => {
    await page.goto('/');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('ambitia.io');
  });

  test('pages have lang="fr"', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('fr');
  });
});

// ============================================================
// Accessibility basics
// ============================================================

test.describe('Accessibility', () => {
  test('homepage has skip-to-content link', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('homepage has main landmark', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });

  test('navbar has aria-label', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label]');
    await expect(nav.first()).toBeAttached();
  });

  test('login error alert has role="alert"', async ({ page }) => {
    await page.goto('/login/');
    // The element is in the DOM but hidden — check its attribute
    const errorAlert = page.locator('#auth-error');
    await expect(errorAlert).toBeAttached();
    const role = await errorAlert.getAttribute('role');
    expect(role).toBe('alert');
  });
});

// ============================================================
// ESSR incognito — content guard
// ============================================================

test.describe('ESSR Incognito Guard', () => {
  const pages = ['/', '/about/', '/jobs/', '/login/', '/signup/', '/privacy/', '/terms/'];

  for (const url of pages) {
    test(`${url} has no ESSR/confidential mentions`, async ({ page }) => {
      await page.goto(url);
      const body = await page.locator('body').textContent();
      const text = body?.toLowerCase() || '';
      expect(text).not.toContain('essr');
      expect(text).not.toContain('secrétaire médicale');
      expect(text).not.toContain('secretaire medicale');
      expect(text).not.toContain('françois dupuis');
      expect(text).not.toContain('laura escariz');
      expect(text).not.toContain('yasmine');
    });
  }
});
