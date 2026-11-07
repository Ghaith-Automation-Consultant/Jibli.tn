const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/e2e',

    // Maximum time one test can run
    timeout: 30 * 1000,

    // Test configuration
    expect: {
        timeout: 5000
    },

    // Spec files run in parallel; tests within a file run in order
    fullyParallel: false,

    // Fail the build on CI if you accidentally left test.only
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Each login hashes with Argon2 (64 MB), so keep concurrency modest
    workers: process.env.CI ? 1 : 2,

    // Reporter to use
    reporter: 'html',

    // Shared settings for all projects
    use: {
        // Base URL to use in actions like `await page.goto('/')`
        baseURL: 'http://localhost:3100',

        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Video on failure
        video: 'retain-on-failure',
    },

    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        // Add firefox/webkit here after `npx playwright install firefox webkit`.
    ],

    // Builds and starts the Next.js app against a disposable in-memory database
    webServer: {
        command: 'node tests/e2e/test-server.js',
        url: 'http://localhost:3100/api/stats',
        reuseExistingServer: false,
        timeout: 300 * 1000,
    },
});
