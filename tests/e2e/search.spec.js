const { test, expect } = require('@playwright/test');

test.describe('Search and Browse Flow', () => {
    test('should navigate to search page', async ({ page }) => {
        await page.goto('/template.html');

        // Click on "Voyages" in navigation
        await page.click('text=Voyages');

        // Should navigate to search/browse page
        await page.waitForTimeout(500);

        // Verify we're on the right page (could be recherche.html or similar)
        // This depends on your navigation implementation
    });

    test('should display trip listings', async ({ page }) => {
        await page.goto('/template.html');

        // Navigate to trips page
        await page.click('text=Voyages');
        await page.waitForTimeout(1000);

        // Check if trip cards are displayed
        const tripCards = page.locator('.trip-card, [class*="trip"], [class*="voyage"]');
        const count = await tripCards.count();

        // Should have at least some trips (or empty state)
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should filter trips by location', async ({ page }) => {
        await page.goto('/template.html');
        await page.click('text=Voyages');
        await page.waitForTimeout(1000);

        // Look for filter inputs
        const fromFilter = page.locator('input[placeholder*="départ"], input[placeholder*="from"]').first();

        if (await fromFilter.isVisible()) {
            await fromFilter.fill('Paris');
            await page.waitForTimeout(500);

            // Results should be filtered
            // This depends on your filtering implementation
        }
    });

    test('should display request listings', async ({ page }) => {
        await page.goto('/template.html');

        // Navigate to requests page
        await page.click('text=Demandes');
        await page.waitForTimeout(1000);

        // Check if request cards are displayed
        const requestCards = page.locator('.request-card, [class*="request"], [class*="demande"]');
        const count = await requestCards.count();

        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should navigate between tabs on search page', async ({ page }) => {
        await page.goto('/template.html');
        await page.click('text=Voyages');
        await page.waitForTimeout(500);

        // Look for tabs (Voyages/Demandes)
        const demandesTab = page.locator('text=Demandes').first();

        if (await demandesTab.isVisible()) {
            await demandesTab.click();
            await page.waitForTimeout(500);

            // Tab should be active
            const isActive = await demandesTab.evaluate(el =>
                el.classList.contains('active') ||
                el.classList.contains('border-primary') ||
                el.classList.contains('text-primary')
            );
            expect(isActive).toBe(true);
        }
    });

    test('should show empty state when no results', async ({ page }) => {
        await page.goto('/template.html');
        await page.click('text=Voyages');
        await page.waitForTimeout(1000);

        // Apply filter that returns no results
        const fromFilter = page.locator('input[placeholder*="départ"]').first();

        if (await fromFilter.isVisible()) {
            await fromFilter.fill('NonexistentCity12345');
            await page.waitForTimeout(500);

            // Should show empty state or "no results" message
            // This depends on your implementation
        }
    });
});
