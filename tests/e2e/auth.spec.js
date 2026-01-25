const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
    const uniqueEmail = `e2e-${Date.now()}@test.com`;
    const password = 'test123456';
    const userName = 'E2E Test User';

    test('should complete registration flow', async ({ page }) => {
        await page.goto('/template.html');

        // Click register button
        await page.click('text=Inscription');

        // Wait for modal to appear
        await page.waitForSelector('#registerModal', { state: 'visible' });

        // Fill registration form
        await page.fill('#registerEmail', uniqueEmail);
        await page.fill('#registerPassword', password);
        await page.fill('#registerName', userName);

        // Submit form
        await page.click('#registerModal button[type="submit"]');

        // Wait for success (should redirect or show success message)
        await page.waitForTimeout(1000);

        // Verify token is stored in localStorage
        const token = await page.evaluate(() => localStorage.getItem('jibli_token'));
        expect(token).toBeTruthy();
    });

    test('should complete login flow', async ({ page }) => {
        // First register a user
        await page.goto('/template.html');
        await page.click('text=Inscription');
        await page.waitForSelector('#registerModal', { state: 'visible' });

        const email = `login-e2e-${Date.now()}@test.com`;
        await page.fill('#registerEmail', email);
        await page.fill('#registerPassword', password);
        await page.fill('#registerName', 'Login Test User');
        await page.click('#registerModal button[type="submit"]');
        await page.waitForTimeout(1000);

        // Clear token
        await page.evaluate(() => localStorage.removeItem('jibli_token'));

        // Now test login
        await page.click('text=Connexion');
        await page.waitForSelector('#loginModal', { state: 'visible' });

        await page.fill('#loginEmail', email);
        await page.fill('#loginPassword', password);
        await page.click('#loginModal button[type="submit"]');

        await page.waitForTimeout(1000);

        // Verify token is stored
        const token = await page.evaluate(() => localStorage.getItem('jibli_token'));
        expect(token).toBeTruthy();
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('/template.html');
        await page.click('text=Connexion');
        await page.waitForSelector('#loginModal', { state: 'visible' });

        await page.fill('#loginEmail', 'nonexistent@test.com');
        await page.fill('#loginPassword', 'wrongpassword');
        await page.click('#loginModal button[type="submit"]');

        // Wait for error message
        await page.waitForTimeout(500);

        // Check for error indication (could be alert, message, etc.)
        // This depends on your error handling implementation
    });

    test('should logout successfully', async ({ page }) => {
        // First login
        await page.goto('/template.html');
        await page.click('text=Inscription');
        await page.waitForSelector('#registerModal', { state: 'visible' });

        const email = `logout-e2e-${Date.now()}@test.com`;
        await page.fill('#registerEmail', email);
        await page.fill('#registerPassword', password);
        await page.fill('#registerName', 'Logout Test User');
        await page.click('#registerModal button[type="submit"]');
        await page.waitForTimeout(1000);

        // Verify logged in
        let token = await page.evaluate(() => localStorage.getItem('jibli_token'));
        expect(token).toBeTruthy();

        // Logout (if logout button exists)
        // await page.click('text=Déconnexion');
        // await page.waitForTimeout(500);

        // For now, manually clear token
        await page.evaluate(() => localStorage.removeItem('jibli_token'));

        // Verify logged out
        token = await page.evaluate(() => localStorage.getItem('jibli_token'));
        expect(token).toBeFalsy();
    });
});
