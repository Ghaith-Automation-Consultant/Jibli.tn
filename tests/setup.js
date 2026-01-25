// Global setup for Jest tests
// This file runs before all tests

// Suppress console warnings during tests (optional)
global.console = {
    ...console,
    // Uncomment to suppress warnings
    // warn: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);
