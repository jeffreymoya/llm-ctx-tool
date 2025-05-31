module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'packages/**/*.ts',
    '!packages/**/*.d.ts',
    '!packages/**/index.ts'
  ],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/packages/core/$1',
    '^@ports/(.*)$': '<rootDir>/packages/ports/$1',
    '^@app/(.*)$': '<rootDir>/packages/app/$1',
    '^@adapters/(.*)$': '<rootDir>/packages/adapters/$1',
    '^@cli/(.*)$': '<rootDir>/packages/cli/$1'
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}; 