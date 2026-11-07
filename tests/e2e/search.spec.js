const { test, expect } = require('@playwright/test');

test.describe('Browsing without an account', () => {
    test('home page shows live listings that link to their detail pages', async ({ page }) => {
        await page.goto('/');

        const tripLink = page.locator('a[href^="/voyage/"]').first();
        await expect(tripLink).toBeVisible();
        await expect(page.locator('a[href^="/demande/"]').first()).toBeVisible();

        await tripLink.click();
        await expect(page).toHaveURL(/\/voyage\/[0-9a-f]{24}/);
        await expect(page.getByRole('heading', { name: 'Détails logistiques' })).toBeVisible();
    });

    test('search lists upcoming trips and hides completed ones', async ({ page }) => {
        await page.goto('/recherche?type=trips');

        await expect(page.getByRole('heading', { name: /voyages trouvés/ })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Contacter le Voyageur' }).first()).toBeVisible();
        // The seed's only completed trip is Marseille -> Tunis, departed 10 days ago
        await expect(page.getByText('Marseille')).toHaveCount(0);
    });

    test('filters trips by departure city', async ({ page }) => {
        await page.goto('/recherche?type=trips');
        await page.getByRole('link', { name: 'Contacter le Voyageur' }).first().waitFor();

        await page.getByPlaceholder('Ville ou Pays').first().fill('Sfax');
        await page.getByPlaceholder('Ville ou Pays').first().press('Enter');
        await expect(page.getByRole('heading', { name: /^0 voyages trouvés/ })).toBeVisible();
    });

    test('special characters in a search do not break it', async ({ page }) => {
        await page.goto('/recherche?type=trips');
        await page.getByRole('link', { name: 'Contacter le Voyageur' }).first().waitFor();

        await page.getByPlaceholder('Ville ou Pays').first().fill('(*');
        await page.getByPlaceholder('Ville ou Pays').first().press('Enter');

        await expect(page.getByText('Aucun résultat correspondant')).toBeVisible();
    });

    test('switches to the requests tab', async ({ page }) => {
        await page.goto('/recherche?type=trips');
        await page.getByRole('button', { name: 'Rechercher une demande' }).click();

        await expect(page.getByRole('heading', { name: /demandes trouvées/ })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Proposer mon trajet' }).first()).toBeVisible();
    });

    test('detail pages show the real owner rather than placeholder data', async ({ page, request }) => {
        const trips = (await (await request.get('/api/trips?limit=50')).json()).data;
        const notKarim = trips.find((trip) => !trip.user.name.startsWith('Karim'));

        await page.goto(`/voyage/${notKarim._id}`);

        await expect(page.getByRole('link', { name: `Contacter ${notKarim.user.name}` })).toBeVisible();
        await expect(page.getByText('Karim')).toHaveCount(0);
        await expect(page.getByText('Voyageur Vérifié')).toHaveCount(0);
    });

    test('public profiles are readable and hide contact details', async ({ page, request }) => {
        const trips = (await (await request.get('/api/trips?limit=1')).json()).data;
        const owner = trips[0].user;

        await page.goto(`/profile/${owner._id}`);

        await expect(page).toHaveURL(new RegExp(`/profile/${owner._id}`));
        await expect(page.getByRole('heading', { name: owner.name })).toBeVisible();
        await expect(page.getByText('@test.com')).toHaveCount(0);
    });

    test('unknown listings show a French 404 page', async ({ page }) => {
        const res = await page.goto('/voyage/000000000000000000000000');
        expect(res.status()).toBe(404);
        await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();
    });

    test('share button copies the listing link', async ({ page, context, request }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        const trips = (await (await request.get('/api/trips?limit=1')).json()).data;
        await page.goto(`/voyage/${trips[0]._id}`);
        // Force the clipboard fallback: headless desktop browsers have no share sheet
        await page.evaluate(() => { delete Navigator.prototype.share; });

        await page.getByRole('button', { name: 'Partager' }).click();

        await expect(page.getByRole('button', { name: 'Lien copié' })).toBeVisible();
        expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());
    });

    test('form fields are reachable by their labels', async ({ page }) => {
        await page.goto('/register');
        await page.getByLabel('Email').fill('label@test.com');
        await expect(page.getByLabel('Email')).toHaveValue('label@test.com');
    });

    for (const [path, heading] of [
        ['/conditions', "Conditions Générales d'Utilisation"],
        ['/confidentialite', 'Politique de Confidentialité'],
        ['/securite', 'Confiance & Sécurité'],
    ]) {
        test(`footer link ${path} opens its page`, async ({ page }) => {
            await page.goto('/');
            await page.locator(`footer a[href="${path}"]`).click();

            await expect(page).toHaveURL(new RegExp(`${path}$`));
            await expect(page.getByRole('heading', { name: heading })).toBeVisible();
        });
    }
});
