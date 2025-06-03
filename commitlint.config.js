module.exports = {
  extends: ['@conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New features
        'fix',      // Bug fixes
        'docs',     // Documentation changes
        'style',    // Code style changes
        'refactor', // Code refactoring
        'test',     // Test-related changes
        'chore',    // Maintenance tasks
        'ci',       // CI/CD changes
        'perf',     // Performance improvements
        'revert'    // Reverts
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'core',     // packages/core
        'ports',    // packages/ports
        'app',      // packages/app
        'adapters', // packages/adapters
        'cli',      // packages/cli
        'docs',     // Documentation
        'config',   // Configuration files
        'deps'      // Dependencies
      ]
    ]
  }
}; 