import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginNode from 'eslint-plugin-node';
import prettierRecommended from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import { fileURLToPath } from 'url';
import path from 'path';
import { fixupPluginRules } from '@eslint/compat';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = __dirname;

export default tseslint.config(
  { // Global ignores
    ignores: [
      'node_modules',
      'dist',
      'coverage',
      '*.log',
      '.DS_Store',
      '*.env',
      // Add any other ignore patterns from .eslintignore
      // TODO: Consolidate ignore patterns from .eslintignore into this file.
    ],
  },
  { // Language options and recommended rules for packages
    files: ['packages/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: path.resolve(projectDir, 'tsconfig.json'),
        tsconfigRootDir: projectDir,
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        // jest: true, // Assuming jest is used for testing
      },
    },
    // Apply recommended ESLint and TypeScript ESLint rules
    rules: {
      // Add other core rules or overrides here
      // e.g., 'no-console': 'warn',
    },
  },
  ...tseslint.configs.recommended, // Include recommended configs as separate objects
  { // Configuration for test files
    files: ["**/*.test.ts", "**/__tests__/**/*.ts"],
    languageOptions: {
      globals: {
        jest: true,
      },
    },
  },
  { // Import plugin configuration for packages
    files: ['packages/**/*.ts'],
    plugins: { import: eslintPluginImport },
    rules: {
      ...eslintPluginImport.configs.recommended.rules,
      ...eslintPluginImport.configs.typescript.rules,
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      // Add or override import rules
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
  { // Node plugin configuration for packages
    files: ['packages/**/*.ts'],
    plugins: { 
      node: fixupPluginRules(eslintPluginNode),
    },
    rules: {
      ...eslintPluginNode.configs.recommended.rules,
      'node/no-unsupported-features/es-syntax': ['error', { ignores: ['modules'] }],
      'node/no-missing-import': [
        'error',
        {
          tryExtensions: ['.js', '.json', '.node', '.ts', '.d.ts'],
        },
      ],
      // Add or override node rules
    },
  },
  { // Prettier integration for packages (place last)
    files: ['packages/**/*.ts'],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    ...prettierRecommended,
    rules: {
      // Prettier conflicts are handled by eslint-config-prettier
      'prettier/prettier': 'error',
    },
  },
  { // Handle overrides for .js files
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'node/no-unpublished-require': 'off' // Allow require of devDependencies in JS files like config files
    },
  }
);

/*
Note on Architectural Layer Rules:
The project enforces hexagonal architecture layer dependencies (core -> ports, app -> core/ports, adapters -> ports/external, cli -> app) primarily using `dependency-cruiser`. While ESLint could potentially contribute with plugins like `eslint-plugin-import`'s `no-restricted-paths`, the primary enforcement mechanism is `dependency-cruiser`. Further ESLint integration for architectural rules can be considered if needed.
*/ 