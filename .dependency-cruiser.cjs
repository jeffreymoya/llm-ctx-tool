module.exports = {
  forbidden: [
    {
      name: 'core-no-adapters',
      comment: 'Core should not depend on adapters',
      severity: 'error',
      from: { path: '^packages/core' },
      to: { path: '^packages/(adapters|cli)' }
    },
    {
      name: 'core-no-externals',
      comment: 'Core should not depend on external libraries except ports',
      severity: 'error',
      from: { path: '^packages/core' },
      to: { 
        path: '^node_modules',
        pathNot: '^node_modules/(reflect-metadata)'
      }
    },
    {
      name: 'app-no-adapters',
      comment: 'App should not depend on specific adapters',
      severity: 'error',
      from: { path: '^packages/app' },
      to: { path: '^packages/adapters' }
    },
    {
      name: 'adapters-no-core',
      comment: 'Adapters should not depend on core directly',
      severity: 'error',
      from: { path: '^packages/adapters' },
      to: { path: '^packages/core' }
    }
  ],
  options: {
    baseDir: '.',
    includeOnly: '^packages',
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    }
  }
}; 