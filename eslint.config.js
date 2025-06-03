// ============================================================================
// eslint.config.js - Modern flat config style
// ============================================================================
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginImport from 'eslint-plugin-import';
import prettierRecommended from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '*.log',
      '.DS_Store',
      '*.env*',
    ],
  },

  // Base TypeScript configuration
  {
    files: ['packages/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022, // Aligned with tsconfig
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.es2022, // Add ES2022 globals
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // TypeScript recommended rules
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // Import plugin configuration
  {
    files: ['packages/**/*.{ts,tsx}'],
    plugins: {
      import: eslintPluginImport,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
    rules: {
      // Import rules aligned with TypeScript setup
      'import/no-unresolved': 'off', // Let TypeScript handle resolution
      'import/extensions': [
        'error',
        'always',
        {
          ignorePackages: true,
        },
      ],
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.ts',
            '**/*.spec.ts',
            '**/test/**',
            '**/tests/**',
          ],
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },

  // TypeScript-specific rules
  {
    files: ['packages/**/*.{ts,tsx}'],
    rules: {
      // Align with strict TypeScript config
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },

  // Test files configuration
  {
    files: ['**/*.{test,spec}.{ts,tsx}', '**/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Prettier integration (must be last)
  {
    files: ['packages/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...prettierRecommended.rules,
      'prettier/prettier': 'error',
    },
  },

  // JavaScript files (config files, etc.)
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  }
);