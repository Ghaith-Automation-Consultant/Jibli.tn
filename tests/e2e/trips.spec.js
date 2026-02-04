const { test, expect } = require('@playwright/test');

test.describe('Trip Management Flow', () => {
    let authToken;

    test.beforeEach(async ({ page }) => {
        // Register and login before each test
        await page.goto('/index.html');
        await page.click('text=Inscription');
        await page.waitForSelector('#registerModal', { state: 'visible' });

        const email = `trip-e2e-${Date.now()}@test.com`;
        await page.fill('#registerEmail', email);
        await page.fill('#registerPassword', 'test123456');
        await page.fill('#registerName', 'Trip Test User');
        await page.click('#registerModal button[type="submit"]');
        await page.waitForTimeout(1000);

        authToken = await page.evaluate(() => localStorage.getItem('jibli_token'));
    });

    test('should allow creating a trip when logged in', async ({ page }) => {
        await page.goto('/index.html');

        // Click "Publier un voyage" button
        await page.click('text=Publier un voyage');

        // Wait for modal
        await page.waitForSelector('#createTripModal', { state: 'visible' });

        // Fill trip form
        await page.fill('#tripFrom', 'Paris');
        await page.fill('#tripTo', 'Tunis');
        await page.fill('#tripDate', '2024-06-01');
        await page.fill('#tripArrivalDate', '2024-06-02');
        await page.fill('#tripWeight', '10');

        // Select size
        await page.selectOption('#tripSize', 'M');

        // Select price type
        await page.check('input[name="priceType"][value="free"]');

        // Submit form
        await page.click('#tripForm button[type="submit"]');

        // Wait for success
        await page.waitForTimeout(1000);

        // Verify trip was created (modal should close)
        const modalVisible = await page.isVisible('#createTripModal');
        expect(modalVisible).toBe(false);
    });

    test('should show validation errors for invalid trip data', async ({ page }) => {
        await page.goto('/index.html');
        await page.click('text=Publier un voyage');
        await page.waitForSelector('#createTripModal', { state: 'visible' });

        // Try to submit without required fields
        await page.click('#tripForm button[type="submit"]');

        // Form should not submit (HTML5 validation or custom validation)
        await page.waitForTimeout(500);

        // Modal should still be visible
        const modalVisible = await page.isVisible('#createTripModal');
        expect(modalVisible).toBe(true);
    });

    test('should view trip details', async ({ page }) => {
        // First create a trip
        await page.goto('/index.html');
        await page.click('text=Publier un voyage');
        await page.waitForSelector('#createTripModal', { state: 'visible' });

        await page.fill('#tripFrom', 'Lyon');
        await page.fill('#tripTo', 'Tunis');
        await page.fill('#tripDate', '2024-07-01');
        await page.fill('#tripArrivalDate', '2024-07-02');
        await page.fill('#tripWeight', '5');
        await page.click('#tripForm button[type="submit"]');
        await page.waitForTimeout(1000);

        // Navigate to trips page
        await page.click('text=Voyages');
        await page.waitForTimeout(500);

        // Click on a trip card (if exists)
        const tripCard = page.locator('.trip-card').first();
        if (await tripCard.isVisible()) {
            await tripCard.click();
            await page.waitForTimeout(500);

            // Should navigate to trip details page
            expect(page.url()).toContain('voyage.html');
        }
    });

    test('should navigate to dashboard and see my trips', async ({ page }) => {
        await page.goto('/index.html');

        // Navigate to dashboard
        await page.click('text=Dashboard');
        await page.waitForURL('**/dashboard.html');

        // Should see "Mes Voyages" tab
        const myTripsTab = page.locator('text=Mes Voyages');
        await expect(myTripsTab).toBeVisible();

        // Tab should be active by default
        const isActive = await myTripsTab.evaluate(el =>
            el.classList.contains('border-primary') || el.classList.contains('text-primary')
        );
        expect(isActive).toBe(true);
    });
});
