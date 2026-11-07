const { test, expect } = require('@playwright/test');
const { KARIM, login, registerUser } = require('./helpers');

const inTenDays = () => new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);

test.describe('Listings', () => {
    test('dashboard lists only my own listings', async ({ page }) => {
        await login(page, KARIM.email);

        await expect(page.getByRole('button', { name: /Mes voyages \([1-9]/ })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Supprimer' }).first()).toBeVisible();
        // Paris -> Sfax belongs to another seeded user
        await expect(page.getByText('Sfax')).toHaveCount(0);
    });

    test('publishes a trip, sees it on the dashboard, then deletes it', async ({ page, context }) => {
        const user = await registerUser(context.request, 'Publie Voyage');
        await login(page, user.email);
        await expect(page.getByRole('button', { name: 'Mes voyages (0)' })).toBeVisible();

        await page.goto('/poster-annonce?type=trip');
        await page.getByPlaceholder('Ex: Paris').fill('Bordeaux');
        await page.getByPlaceholder('Ex: Tunis').fill('Djerba');
        await page.locator('input[type="date"]').fill(inTenDays());
        await page.getByPlaceholder('Ex: 10').fill('12');
        await page.locator('button[type="submit"]').click();
        await expect(page.getByText('Annonce publiée avec succès')).toBeVisible();

        await expect(page).toHaveURL(/\/dashboard/);
        await expect(page.getByRole('button', { name: 'Mes voyages (1)' })).toBeVisible();
        await expect(page.getByText('Djerba')).toBeVisible();

        page.on('dialog', (dialog) => dialog.accept());
        await page.getByRole('button', { name: 'Supprimer' }).click();
        await expect(page.getByRole('button', { name: 'Mes voyages (0)' })).toBeVisible();

        await page.reload();
        await expect(page.getByRole('button', { name: 'Mes voyages (0)' })).toBeVisible();
    });

    test('publishes a request with the optional weight left blank', async ({ page, context }) => {
        const user = await registerUser(context.request, 'Publie Demande');
        await login(page, user.email);

        await page.goto('/poster-annonce?type=request');
        await page.getByPlaceholder(/^Ex: Médicaments/).fill('Livre rare');
        await page.getByPlaceholder(/^Décrivez l'objet/).fill('Un livre de poche, emballé.');
        await page.getByPlaceholder(/^Ex: Tunis/).fill('Sousse');
        await page.locator('button[type="submit"]').click();

        await expect(page.getByText('Annonce publiée avec succès')).toBeVisible();
        await expect(page).toHaveURL(/\/dashboard/);
        await page.getByRole('button', { name: 'Mes demandes (1)' }).click();
        await expect(page.getByText('Livre rare')).toBeVisible();
    });

    test('explains why a past departure date is refused', async ({ page, context }) => {
        const user = await registerUser(context.request, 'Date Passee');
        await login(page, user.email);

        await page.goto('/poster-annonce?type=trip');
        await page.getByPlaceholder('Ex: Paris').fill('Nice');
        await page.getByPlaceholder('Ex: Tunis').fill('Tunis');
        await page.locator('input[type="date"]').fill('2020-01-01');
        await page.getByPlaceholder('Ex: 10').fill('5');
        await page.locator('button[type="submit"]').click();

        await expect(page.getByText('La date de départ ne peut pas être dans le passé')).toBeVisible();
    });
});

test.describe('Messaging and profile', () => {
    test('a brand new user can send a first message from a listing', async ({ page, context, request }) => {
        const trips = (await (await request.get('/api/trips?limit=50')).json()).data;
        const trip = trips[0];

        const user = await registerUser(context.request, 'Premier Contact');
        await login(page, user.email);

        await page.goto(`/voyage/${trip._id}`);
        await page.getByRole('link', { name: `Contacter ${trip.user.name}` }).click();
        await expect(page).toHaveURL(/\/messages\?userId=/);
        await expect(page.getByRole('heading', { name: trip.user.name })).toBeVisible();

        const box = page.getByPlaceholder('Écrivez votre message...');
        await box.fill('Bonjour, reste-t-il de la place ?');
        await box.press('Enter');

        const bubble = page.locator('.bg-primary.text-white', { hasText: 'Bonjour, reste-t-il de la place ?' });
        await expect(bubble).toBeVisible();
        // Shown on my side of the thread, and the input was cleared
        await expect(page.locator('.ml-auto', { hasText: 'Bonjour, reste-t-il' })).toBeVisible();
        await expect(box).toHaveValue('');

        await page.reload();
        await expect(page.locator('.ml-auto', { hasText: 'Bonjour, reste-t-il' })).toBeVisible();
    });

    test('profile edits are saved', async ({ page, context }) => {
        const user = await registerUser(context.request, 'Profil Modifie');
        await login(page, user.email);

        await page.goto('/profile');
        await expect(page.getByRole('heading', { name: 'Profil Modifie' })).toBeVisible();
        await expect(page.locator(`input[value="${user.email}"]`)).toBeVisible();

        const bio = page.locator('textarea').first();
        await bio.fill('Je voyage souvent entre Lyon et Tunis.');
        await page.getByRole('button', { name: 'Sauvegarder' }).click();
        await expect(page.getByText('Votre profil a été mis à jour')).toBeVisible();

        await page.reload();
        await expect(page.locator('textarea').first()).toHaveValue('Je voyage souvent entre Lyon et Tunis.');
    });
});
