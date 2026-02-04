module.exports = {
    projects: [
        {
            displayName: 'backend',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/tests/integration/**/*.test.js',
                '<rootDir>/backend/**/*.test.js', // Assuming potential colocated tests
                '<rootDir>/tests/unit/backend/**/*.test.js', // If they exist
                '<rootDir>/tests/sample.test.js'
            ],
            setupFilesAfterEnv: ['<rootDir>/tests/setup.js', '<rootDir>/tests/db-setup.js'],
        },
        {
            displayName: 'frontend',
            testEnvironment: 'jsdom',
            testMatch: [
                '<rootDir>/tests/unit/frontend/**/*.test.js'
            ],
            setupFilesAfterEnv: ['<rootDir>/tests/setup.js'], // No DB setup
        }
    ],

    // Global coverage config (aggregated)
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'backend/**/*.js',
        'js/**/*.js',
        '!**/node_modules/**',
        '!**/tests/e2e/**',
        '!**/coverage/**',
        '!backend/data.json'
    ],
    verbose: true,
    clearMocks: true,
    restoreMocks: true
};
