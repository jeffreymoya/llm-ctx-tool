module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        verbatimModuleSyntax: false
      }
    }]
  },
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'packages/**/*.ts',
    '!packages/**/*.d.ts',
    '!packages/**/index.ts',
    '!packages/**/__tests__/**',
    '!packages/**/dist/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/packages/$1/src',
    '^@config/(.*)$': '<rootDir>/packages/config/$1',
    '^@core/(.*)$': '<rootDir>/packages/core/$1',
    '^@app/(.*)$': '<rootDir>/packages/app/$1',
    '^@ports/(.*)$': '<rootDir>/packages/ports/$1',
    '^@adapters/(.*)$': '<rootDir>/packages/adapters/$1',
    '^@cli/(.*)$': '<rootDir>/packages/cli/$1'
  }
}; 