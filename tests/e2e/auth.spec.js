const { test, expect } = require('@playwright/test');
const { PASSWORD, KARIM, LEILA, uniqueEmail, login, loginViaUi, registerUser } = require('./helpers');

test.describe('Authentication', () => {
    test('registers a new account, then logs in', async ({ page }) => {
        const email = uniqueEmail('register');

        await page.goto('/register');
        await page.fill('input[placeholder="Mohamed Ben Ali"]', 'Nouvel Utilisateur');
        await page.fill('input[type="email"]', email);
        // '#' is a legitimate special character: the old rule wrongly rejected it
        const password = 'Abcdefgh#12345';
        const passwordFields = page.locator('input[type="password"]');
        await passwordFields.nth(0).fill(password);
        await passwordFields.nth(1).fill(password);
        await page.click('button[type="submit"]');

        await expect(page.getByText('Compte créé avec succès')).toBeVisible();
        await expect(page).toHaveURL(/\/login/);

        await loginViaUi(page, email, password);
        await expect(page).toHaveURL(/\/dashboard/);
        await expect(page.getByRole('heading', { name: /Dashboard de Nouvel Utilisateur/ })).toBeVisible();
    });

    test('explains a weak password in French', async ({ page }) => {
        await page.goto('/register');
        await page.fill('input[placeholder="Mohamed Ben Ali"]', 'Faible');
        await page.fill('input[type="email"]', uniqueEmail('weak'));
        const passwordFields = page.locator('input[type="password"]');
        await passwordFields.nth(0).fill('short');
        await passwordFields.nth(1).fill('short');
        await page.click('button[type="submit"]');

        await expect(page.getByText(/au moins 12 caractères/).first()).toBeVisible();
        await expect(page).toHaveURL(/\/register/);
    });

    test('rejects wrong credentials', async ({ page }) => {
        await page.goto('/login');
        await loginViaUi(page, KARIM.email, 'Wrong@Password123');

        await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible();
        await expect(page).toHaveURL(/\/login/);
    });

    test('sends anonymous visitors to login and back to the page they wanted', async ({ page }) => {
        await page.goto('/poster-annonce?type=request');
        await expect(page).toHaveURL(/\/login\?redirect=/);

        await loginViaUi(page, KARIM.email);

        await expect(page).toHaveURL(/\/poster-annonce\?type=request/);
    });

    test('ignores a post-login redirect to another site', async ({ page }) => {
        await page.goto('/login?redirect=//evil.example/phish');
        await loginViaUi(page, KARIM.email);
        await expect(page).toHaveURL(/localhost:3100\/dashboard/);
    });

    test('logout ends the session for good', async ({ page, context }) => {
        await login(page, LEILA.email);

        await page.getByRole('button', { name: LEILA.name }).click();
        await page.getByRole('button', { name: 'Déconnexion' }).click();
        await expect(page.getByRole('link', { name: 'Connexion' })).toBeVisible();

        await expect.poll(async () => (await context.cookies()).map((c) => c.name)).toEqual([]);

        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/login/);
        await expect(page.locator('input[type="email"]')).toBeVisible();
    });
});

test.describe('Session expiry', () => {
    test('an expired access token is renewed without a redirect loop', async ({ page, context }) => {
        await login(page, KARIM.email);

        // The 15-minute access cookie has run out, the 30-day refresh cookie has not
        await context.clearCookies({ name: 'access_token' });
        await page.goto('/dashboard');

        await expect(page).toHaveURL(/\/dashboard/);
        await expect(page.getByRole('heading', { name: /Dashboard de/ })).toBeVisible();
        await expect(page.getByText(/Lyon/).first()).toBeVisible();
    });

    test('a request made while the access token is expired still succeeds', async ({ page, context }) => {
        const user = await registerUser(context.request, 'Session Longue');
        await login(page, user.email);
        await page.goto('/poster-annonce?type=request');

        await context.clearCookies({ name: 'access_token' });

        await page.fill('input[placeholder^="Ex: Médicaments"]', 'Objet après expiration');
        await page.fill('textarea[placeholder^="Décrivez"]', 'Petit colis.');
        await page.fill('input[placeholder^="Ex: Tunis"]', 'Tunis');
        await page.locator('button[type="submit"]').click();

        await expect(page.getByText('Annonce publiée avec succès')).toBeVisible();
    });

    test('a fully expired session lands on the login form without looping', async ({ page, context }) => {
        await login(page, KARIM.email);

        await context.clearCookies();
        await page.goto('/dashboard');

        await expect(page).toHaveURL(/\/login/);
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect.poll(() => page.evaluate(() => localStorage.getItem('jibli_logged_in'))).toBeNull();
        await expect(page).toHaveURL(/\/login/);
    });
});

test.describe('Password change', () => {
    test('really changes the password', async ({ page, context, browser }) => {
        const user = await registerUser(context.request, 'Change Password');
        await login(page, user.email);
        await page.goto('/profile');
        await page.getByRole('button', { name: /Sécurité/ }).click();

        const fields = page.locator('input[type="password"]');
        const submit = page.getByRole('button', { name: 'Mettre à jour' });

        await fields.nth(0).fill('Not@TheRightOne123');
        await fields.nth(1).fill('New@Password12345');
        await submit.click();
        await expect(page.getByText("L'ancien mot de passe est incorrect")).toBeVisible();

        await fields.nth(0).fill(PASSWORD);
        await fields.nth(1).fill('New@Password12345');
        await submit.click();
        await expect(page.getByText('Mot de passe mis à jour avec succès')).toBeVisible();

        const fresh = await browser.newContext({ baseURL: 'http://localhost:3100' });
        const freshPage = await fresh.newPage();
        await freshPage.goto('/login');
        await loginViaUi(freshPage, user.email, PASSWORD);
        await expect(freshPage.getByText('Email ou mot de passe incorrect')).toBeVisible();

        await loginViaUi(freshPage, user.email, 'New@Password12345');
        await expect(freshPage).toHaveURL(/\/dashboard/);
        await fresh.close();
    });
});
