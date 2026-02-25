// Global setup for Jest tests
// This file runs before all tests

// Suppress console warnings during tests (optional)
global.console = {
    ...console,
    // Uncomment to suppress warnings
    // warn: jest.fn(),
};

// Set test timeout
jest.setTimeout(30000);

// Set environment variables for tests
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
