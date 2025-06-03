module.exports = {
  forbidden: [
    {
      name: 'core-layer-purity',
      comment: 'Core layer must remain pure - no external dependencies except reflect-metadata',
      severity: 'error',
      from: { path: '^packages/core' },
      to: {
        path: '^node_modules',
        pathNot: '^node_modules/(reflect-metadata)'
      }
    },
    {
      name: 'no-core-to-adapters',
      comment: 'Core should never depend on adapters',
      severity: 'error',
      from: { path: '^packages/core' },
      to: { path: '^packages/(adapters|cli)' }
    },
    {
      name: 'no-app-to-adapters',
      comment: 'App should not depend on specific adapter implementations',
      severity: 'error',
      from: { path: '^packages/app' },
      to: { path: '^packages/adapters' }
    },
    {
      name: 'no-adapters-to-core',
      comment: 'Adapters should only depend on ports, not core directly',
      severity: 'error',
      from: { path: '^packages/adapters' },
      to: { path: '^packages/(core|app)' }
    },
    {
      name: 'no-ports-dependencies',
      comment: 'Ports should be pure interfaces with no dependencies',
      severity: 'error',
      from: { path: '^packages/ports' },
      to: {
        path: '^packages',
        pathNot: '^packages/ports'
      }
    },
    {
      name: 'no-circular-deps',
      comment: 'No circular dependencies allowed',
      severity: 'error',
      from: {},
      to: { circular: true }
    }
  ],
  options: {
    baseDir: '.',
    includeOnly: '^packages',
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
        theme: {
          graph: {
            splines: 'ortho'
          }
        }
      }
    }
  }
}; 