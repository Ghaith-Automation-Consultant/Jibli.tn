const { expect } = require('@playwright/test');

// Accounts created by backend/seed.js
const PASSWORD = 'Test@123456789';
const KARIM = { email: 'karim@test.com', name: 'Karim Voyageur' };
const LEILA = { email: 'leila@test.com', name: 'Leila Urgent' };

let counter = 0;
const uniqueEmail = (prefix = 'e2e') => `${prefix}-${Date.now()}-${process.pid}-${counter++}@test.com`;

async function loginViaUi(page, email, password = PASSWORD) {
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
}

/** Logs in on the login page and waits for the post-login redirect to the dashboard. */
async function login(page, email, password = PASSWORD) {
    await page.goto('/login');
    await loginViaUi(page, email, password);
    await expect(page).toHaveURL(/\/dashboard/);
}

/** Creates a brand new account through the API and returns its credentials. */
async function registerUser(request, name = 'E2E User') {
    const email = uniqueEmail();
    const res = await request.post('/api/auth/register', { data: { email, password: PASSWORD, name } });
    expect(res.status()).toBe(201);
    return { email, name };
}

module.exports = { PASSWORD, KARIM, LEILA, uniqueEmail, login, loginViaUi, registerUser };
