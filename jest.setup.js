// Mock environment variables for tests
process.env.NODE_ENV = 'test';

// Suppress console logs during tests unless needed for debugging
if (!process.env.DEBUG_TESTS) {
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'warn').mockImplementation();
}

// Set default timeout for async tests
jest.setTimeout(30000); 