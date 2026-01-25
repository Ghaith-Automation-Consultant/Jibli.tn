module.exports = {
    // Test environment
    testEnvironment: 'node',

    // Coverage configuration
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'backend/**/*.js',
        'js/**/*.js',
        '!**/node_modules/**',
        '!**/tests/**',
        '!**/coverage/**',
        '!backend/data.json'
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },

    // Test match patterns
    testMatch: [
        '**/__tests__/**/*.js',
        '**/?(*.)+(spec|test).js'
    ],

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Verbose output
    verbose: true,

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks between tests
    restoreMocks: true
};
